use super::{state, types};
use crate::error::{LuxDesktopError, Result};
use base64::Engine;
use enigo::{Axis, Button, Coordinate, Direction, Key, Keyboard, Mouse};
use image::{DynamicImage, ImageFormat, codecs::jpeg::JpegEncoder, imageops::FilterType};
use rust_socketio::{Payload, asynchronous::Client};
use serde_json::json;
use std::{io::Cursor, sync::Arc, time::Duration};
use tauri::{AppHandle, Emitter};
use tauri_plugin_http::reqwest;
use tokio::{
  sync::{Mutex, MutexGuard},
  time::sleep,
};

type AutomationState = Arc<Mutex<state::AutomationState>>;
type Enigo = Arc<Mutex<enigo::Enigo>>;

pub fn from_payload<T: serde::de::DeserializeOwned>(payload: Payload) -> Result<T> {
  if let Payload::Text(mut payload) = payload {
    if payload.len() != 1 {
      Err(LuxDesktopError::InvalidPayload(format!(
        "Expected 1 payload, got {}",
        payload.len()
      )))
    } else {
      serde_json::from_value::<T>(payload.pop().unwrap())
        .map_err(|err| LuxDesktopError::InvalidPayload(format!("Error parsing payload: {err:?}")))
    }
  } else {
    Err(LuxDesktopError::InvalidPayload(format!(
      "Expected `Payload::Text`, got {payload:?}"
    )))
  }
}

pub fn on_state_update(app: &AppHandle, state: MutexGuard<state::AutomationState>) -> Result<()> {
  app
    .emit("stateUpdated", serde_json::to_value(state.clone())?)
    .map_err(Into::into)
}

async fn on_automation_error(app: &AppHandle, state: &AutomationState, err: &LuxDesktopError) {
  let mut state = state.lock().await;
  if !matches!(state.status, state::AutomationStatus::Cancelled) {
    state.status = state::AutomationStatus::Failed;
    state.error = Some(format!("{err:?}"));
    on_state_update(app, state).unwrap();
  }
}

async fn result_wrapper(
  app: &AppHandle,
  state: &AutomationState,
  client: Client,
  ack: i32,
  result: Result<()>,
) {
  let resp = match result {
    Ok(_) => json!({ "success": true }),
    Err(err) => {
      on_automation_error(app, state, &err).await;
      json!({ "error": format!("{err:?}") })
    }
  };
  if let Err(err) = client
    .ack(ack, resp)
    .await
    .map_err(Into::<LuxDesktopError>::into)
  {
    on_automation_error(app, state, &err).await;
  }
}

async fn on_open_inner(client: Client, init: types::InitEventData) -> Result<()> {
  client
    .emit("init", serde_json::to_value(&init)?)
    .await
    .map_err(Into::<LuxDesktopError>::into)
}
pub async fn on_open(
  app: AppHandle,
  state: AutomationState,
  client: Client,
  instruction: String,
  mode: String,
  model: String,
  temperature: Option<f64>,
) {
  let init = types::InitEventData {
    instruction: instruction,
    mode: Some(mode),
    model: Some(model),
    temperature,
  };
  if let Err(err) = on_open_inner(client, init).await {
    println!("on open error {err:?}");
    on_automation_error(&app, &state, &err).await;
  }
}

async fn on_request_screenshot_inner(
  app: &AppHandle,
  state: &AutomationState,
  payload: Payload,
  x: f64,
  y: f64,
) -> Result<()> {
  let data = from_payload::<types::ScreenshotRequestData>(payload)?;
  // `xcap::Monitor` is not `Send` on windows, so dynamicly get monitor is needed here.
  let screenshot: DynamicImage = xcap::Monitor::all()?
    .into_iter()
    .find(|m| (m.x().unwrap() as f64 - x).powi(2) + (m.y().unwrap() as f64 - y).powi(2) < 1.0)
    .ok_or_else(LuxDesktopError::error_current_monitor)?
    .capture_image()?
    .into();
  let mut state = state.lock().await;
  state.history.push(state::Action::Screenshot {
    screenshot: {
      let mut buf: Vec<u8> = vec![];
      screenshot.write_to(&mut Cursor::new(&mut buf), ImageFormat::Jpeg)?;
      base64::engine::general_purpose::STANDARD.encode(&buf)
    },
  });
  on_state_update(app, state)?;
  reqwest::Client::new()
    .put(data.presigned_url)
    .body({
      let mut buf: Vec<u8> = vec![];
      screenshot.resize_exact(1260, 700, FilterType::Lanczos3)
        .write_with_encoder(JpegEncoder::new_with_quality(
          &mut Cursor::new(&mut buf),
          95,
        ))?;
      buf
    })
    .send()
    .await?;
  Ok(())
}
pub async fn on_request_screenshot(
  app: AppHandle,
  state: AutomationState,
  payload: Payload,
  client: Client,
  ack: i32,
  x: f64,
  y: f64,
) {
  let result = on_request_screenshot_inner(&app, &state, payload, x, y).await;
  result_wrapper(&app, &state, client, ack, result).await;
}

fn move_mouse<F>(
  get_coordinate: &F,
  enigo: &mut MutexGuard<enigo::Enigo>,
  x: usize,
  y: usize,
) -> Result<()>
where
  F: Fn(usize, usize) -> (i32, i32),
{
  let (x, y) = get_coordinate(x, y);
  enigo.move_mouse(x, y, Coordinate::Abs).map_err(Into::into)
}

async fn on_click_inner<F>(
  app: &AppHandle,
  state: &AutomationState,
  get_coordinate: F,
  enigo: Enigo,
  payload: Payload,
  button: Button,
  times: usize,
) -> Result<()>
where
  F: Fn(usize, usize) -> (i32, i32),
{
  let data = from_payload::<types::ClickEventData>(payload)?;
  let mut state = state.lock().await;
  state.history.push(state::Action::Click(data.clone()));
  on_state_update(app, state)?;
  let mut enigo = enigo.lock().await;
  move_mouse(&get_coordinate, &mut enigo, data.x, data.y)?;
  sleep(Duration::from_secs(1)).await;
  for _ in 0..times {
    enigo.button(button, Direction::Click)?;
    sleep(Duration::from_millis(100)).await;
  }
  Ok(())
}
pub async fn on_click<F>(
  app: AppHandle,
  state: AutomationState,
  get_coordinate: F,
  enigo: Enigo,
  payload: Payload,
  button: Button,
  times: usize,
  client: Client,
  ack: i32,
) where
  F: Fn(usize, usize) -> (i32, i32),
{
  let result = on_click_inner(&app, &state, get_coordinate, enigo, payload, button, times).await;
  result_wrapper(&app, &state, client, ack, result).await;
}

async fn on_drag_inner<F>(
  app: &AppHandle,
  state: &AutomationState,
  get_coordinate: F,
  enigo: Enigo,
  payload: Payload,
) -> Result<()>
where
  F: Fn(usize, usize) -> (i32, i32),
{
  let data = from_payload::<types::DragEventData>(payload)?;
  let mut state = state.lock().await;
  state.history.push(state::Action::Drag(data.clone()));
  on_state_update(app, state)?;
  let mut enigo = enigo.lock().await;
  move_mouse(&get_coordinate, &mut enigo, data.x1, data.y1)?;
  sleep(Duration::from_millis(500)).await;
  enigo.button(Button::Left, Direction::Press)?;
  sleep(Duration::from_millis(500)).await;
  move_mouse(&get_coordinate, &mut enigo, data.x2, data.y2)?;
  sleep(Duration::from_millis(500)).await;
  enigo.button(Button::Left, Direction::Release)?;
  Ok(())
}
pub async fn on_drag<F>(
  app: AppHandle,
  state: AutomationState,
  get_coordinate: F,
  enigo: Enigo,
  payload: Payload,
  client: Client,
  ack: i32,
) where
  F: Fn(usize, usize) -> (i32, i32),
{
  let result = on_drag_inner(&app, &state, get_coordinate, enigo, payload).await;
  result_wrapper(&app, &state, client, ack, result).await;
}

async fn on_hotkey_inner(
  app: &AppHandle,
  state: &AutomationState,
  enigo: Enigo,
  payload: Payload,
) -> Result<()> {
  let data = from_payload::<types::HotkeyEventData>(payload)?;
  let mut state = state.lock().await;
  state.history.push(state::Action::Hotkey(data.clone()));
  on_state_update(app, state)?;
  let keys = data
    .combo
    .to_lowercase()
    .split("+")
    .map(|key| match key.trim() {
      #[cfg(target_os = "windows")]
      "accept" => Key::Accept,
      "add" => Key::Add,
      "alt" | "altleft" | "altright" => Key::Alt,
      #[cfg(target_os = "windows")]
      "apps" => Key::Apps,
      "backspace" => Key::Backspace,
      #[cfg(target_os = "windows")]
      "browserback" => Key::BrowserBack,
      #[cfg(target_os = "windows")]
      "browserfavorites" => Key::BrowserFavorites,
      #[cfg(target_os = "windows")]
      "browserforward" => Key::BrowserForward,
      #[cfg(target_os = "windows")]
      "browserhome" => Key::BrowserHome,
      #[cfg(target_os = "windows")]
      "browserrefresh" => Key::BrowserRefresh,
      #[cfg(target_os = "windows")]
      "browsersearch" => Key::BrowserSearch,
      #[cfg(target_os = "windows")]
      "browserstop" => Key::BrowserStop,
      "caps_lock" => Key::CapsLock,
      #[cfg(any(target_os = "windows", all(unix, not(target_os = "macos"))))]
      "clear" => Key::Clear,
      "command" | "win" | "winleft" | "winright" => Key::Meta,
      #[cfg(target_os = "windows")]
      "convert" => Key::Convert,
      #[cfg(target_os = "macos")]
      "ctrl" | "ctrlleft" | "ctrlright" => Key::Meta,
      #[cfg(not(target_os = "macos"))]
      "ctrl" => Key::Control,
      #[cfg(not(target_os = "macos"))]
      "ctrlleft" => Key::LControl,
      #[cfg(not(target_os = "macos"))]
      "ctrlright" => Key::RControl,
      "decimal" => Key::Decimal,
      "del" | "delete" => Key::Delete,
      "divide" => Key::Divide,
      "down" => Key::DownArrow,
      "end" => Key::End,
      "enter" | "return" => Key::Return,
      "esc" | "escape" => Key::Escape,
      #[cfg(any(target_os = "windows", all(unix, not(target_os = "macos"))))]
      "execute" => Key::Execute,
      "f1" => Key::F1,
      "f2" => Key::F2,
      "f3" => Key::F3,
      "f4" => Key::F4,
      "f5" => Key::F5,
      "f6" => Key::F6,
      "f7" => Key::F7,
      "f8" => Key::F8,
      "f9" => Key::F9,
      "f10" => Key::F10,
      "f11" => Key::F11,
      "f12" => Key::F12,
      "f13" => Key::F13,
      "f14" => Key::F14,
      "f15" => Key::F15,
      "f16" => Key::F16,
      "f17" => Key::F17,
      "f18" => Key::F18,
      "f19" => Key::F19,
      "f20" => Key::F20,
      #[cfg(any(target_os = "windows", all(unix, not(target_os = "macos"))))]
      "f21" => Key::F21,
      #[cfg(any(target_os = "windows", all(unix, not(target_os = "macos"))))]
      "f22" => Key::F22,
      #[cfg(any(target_os = "windows", all(unix, not(target_os = "macos"))))]
      "f23" => Key::F23,
      #[cfg(any(target_os = "windows", all(unix, not(target_os = "macos"))))]
      "f24" => Key::F24,
      #[cfg(target_os = "windows")]
      "final" => Key::Final,
      #[cfg(target_os = "macos")]
      "fn" => Key::Function,
      #[cfg(target_os = "windows")]
      "hangeul" => Key::Hangeul,
      #[cfg(any(target_os = "windows", all(unix, not(target_os = "macos"))))]
      "hangul" => Key::Hangul,
      #[cfg(any(target_os = "windows", all(unix, not(target_os = "macos"))))]
      "hanja" => Key::Hanja,
      "help" => Key::Help,
      "home" => Key::Home,
      #[cfg(any(target_os = "windows", all(unix, not(target_os = "macos"))))]
      "insert" => Key::Insert,
      #[cfg(target_os = "windows")]
      "junja" => Key::Junja,
      #[cfg(target_os = "windows")]
      "kana" => Key::Kana,
      #[cfg(any(target_os = "windows", all(unix, not(target_os = "macos"))))]
      "kanji" => Key::Kanji,
      #[cfg(target_os = "windows")]
      "launchapp1" => Key::LaunchApp1,
      #[cfg(target_os = "windows")]
      "launchapp2" => Key::LaunchApp2,
      #[cfg(target_os = "windows")]
      "launchmail" => Key::LaunchMail,
      #[cfg(target_os = "windows")]
      "launchmediaselect" => Key::LaunchMediaSelect,
      "left" => Key::LeftArrow,
      #[cfg(any(target_os = "windows", all(unix, not(target_os = "macos"))))]
      "modechange" => Key::ModeChange,
      "multiply" => Key::Multiply,
      "nexttrack" => Key::MediaNextTrack,
      #[cfg(target_os = "windows")]
      "nonconvert" => Key::NonConvert,
      "num0" => Key::Numpad0,
      "num1" => Key::Numpad1,
      "num2" => Key::Numpad2,
      "num3" => Key::Numpad3,
      "num4" => Key::Numpad4,
      "num5" => Key::Numpad5,
      "num6" => Key::Numpad6,
      "num7" => Key::Numpad7,
      "num8" => Key::Numpad8,
      "num9" => Key::Numpad9,
      #[cfg(any(target_os = "windows", all(unix, not(target_os = "macos"))))]
      "numlock" => Key::Numlock,
      "option" | "optionleft" => Key::Option,
      #[cfg(target_os = "macos")]
      "optionright" => Key::ROption,
      "pagedown" | "pgdn" => Key::PageDown,
      "pageup" | "pgup" => Key::PageUp,
      #[cfg(any(target_os = "windows", all(unix, not(target_os = "macos"))))]
      "pause" => Key::Pause,
      "playpause" => Key::MediaPlayPause,
      "prevtrack" => Key::MediaPrevTrack,
      #[cfg(any(target_os = "windows", all(unix, not(target_os = "macos"))))]
      "print" | "printscreen" | "prntscrn" | "prtsc" | "prtscr" => Key::PrintScr,
      "right" => Key::RightArrow,
      #[cfg(all(unix, not(target_os = "macos")))]
      "scrolllock" => Key::ScrollLock,
      #[cfg(any(target_os = "windows", all(unix, not(target_os = "macos"))))]
      "select" => Key::Select,
      "shift" => Key::Shift,
      "shiftleft" => Key::LShift,
      "shiftright" => Key::RShift,
      #[cfg(target_os = "windows")]
      "sleep" => Key::Sleep,
      "space" => Key::Space,
      #[cfg(any(target_os = "windows", all(unix, not(target_os = "macos"))))]
      "stop" => Key::MediaStop,
      "subtract" => Key::Subtract,
      "tab" => Key::Tab,
      "up" => Key::UpArrow,
      "volumedown" => Key::VolumeDown,
      "volumemute" => Key::VolumeMute,
      "volumeup" => Key::VolumeUp,
      // Missing: separator, yen
      key => Key::Unicode(*key.as_bytes().get(0).unwrap() as char),
    })
    .collect::<Vec<_>>();
  let mut enigo = enigo.lock().await;
  for _ in 0..data.count {
    for key in keys.iter() {
      enigo.key(*key, Direction::Press)?;
      sleep(Duration::from_millis(10)).await;
    }
    for key in keys.iter().rev() {
      enigo.key(*key, Direction::Release)?;
      sleep(Duration::from_millis(10)).await;
    }
    sleep(Duration::from_millis(100)).await;
  }
  Ok(())
}
pub async fn on_hotkey(
  app: AppHandle,
  state: AutomationState,
  enigo: Enigo,
  payload: Payload,
  client: Client,
  ack: i32,
) {
  let result = on_hotkey_inner(&app, &state, enigo, payload).await;
  result_wrapper(&app, &state, client, ack, result).await;
}

async fn on_type_inner(
  app: &AppHandle,
  state: &AutomationState,
  enigo: Enigo,
  payload: Payload,
) -> Result<()> {
  let data = from_payload::<types::TypeEventData>(payload)?;
  let mut state = state.lock().await;
  state.history.push(state::Action::Type(data.clone()));
  on_state_update(app, state)?;
  let mut enigo = enigo.lock().await;
  enigo.text(&data.text)?;
  Ok(())
}
pub async fn on_type(
  app: AppHandle,
  state: AutomationState,
  enigo: Enigo,
  payload: Payload,
  client: Client,
  ack: i32,
) {
  let result = on_type_inner(&app, &state, enigo, payload).await;
  result_wrapper(&app, &state, client, ack, result).await;
}

async fn on_scroll_inner<F>(
  app: &AppHandle,
  state: &AutomationState,
  get_coordinate: F,
  enigo: Enigo,
  payload: Payload,
) -> Result<()>
where
  F: Fn(usize, usize) -> (i32, i32),
{
  let data = from_payload::<types::ScrollEventData>(payload)?;
  let mut state = state.lock().await;
  state.history.push(state::Action::Scroll(data.clone()));
  on_state_update(app, state)?;
  let length = data.count as i32;
  let length = match data.direction {
    types::ScrollDirection::Down => length,
    types::ScrollDirection::Up => -length,
  };
  let mut enigo = enigo.lock().await;
  move_mouse(&get_coordinate, &mut enigo, data.x, data.y)?;
  enigo.scroll(length, Axis::Vertical)?;
  Ok(())
}
pub async fn on_scroll<F>(
  app: AppHandle,
  state: AutomationState,
  get_coordinate: F,
  enigo: Enigo,
  payload: Payload,
  client: Client,
  ack: i32,
) where
  F: Fn(usize, usize) -> (i32, i32),
{
  let result = on_scroll_inner(&app, &state, get_coordinate, enigo, payload).await;
  result_wrapper(&app, &state, client, ack, result).await;
}

async fn on_wait_inner(app: &AppHandle, state: &AutomationState, payload: Payload) -> Result<()> {
  let data = from_payload::<types::WaitEventData>(payload).unwrap();
  let mut state = state.lock().await;
  state.history.push(state::Action::Wait(data.clone()));
  on_state_update(app, state)?;
  sleep(Duration::from_millis(data.duration_ms as u64)).await;
  Ok(())
}
pub async fn on_wait(
  app: AppHandle,
  state: AutomationState,
  payload: Payload,
  client: Client,
  ack: i32,
) {
  let result = on_wait_inner(&app, &state, payload).await;
  result_wrapper(&app, &state, client, ack, result).await;
}

pub async fn on_finish(app: AppHandle, state: AutomationState) {
  let mut state = state.lock().await;
  state.status = state::AutomationStatus::Completed;
  on_state_update(&app, state).unwrap()
}

pub async fn on_error(app: AppHandle, state: AutomationState, payload: Payload) {
  let msg = from_payload::<types::ErrorEventData>(payload).unwrap();
  eprintln!("Get error from agent framework {msg:?}");
  let mut state = state.lock().await;
  state.status = state::AutomationStatus::Failed;
  state.error = Some(msg.message);
  on_state_update(&app, state).unwrap()
}

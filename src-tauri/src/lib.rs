mod automation;
mod commands;
mod error;

use tokio::sync::Mutex;

fn require_permission() {
  use enigo::{Coordinate, Enigo, Mouse};
  let _ = xcap::Monitor::all()
    .ok()
    .and_then(|mut monitors| monitors.pop())
    .and_then(|monitor| monitor.capture_image().ok());
  let _ = Enigo::new(&enigo::Settings::default())
    .ok()
    .and_then(|mut enigo| enigo.move_mouse(0, 0, Coordinate::Rel).ok());
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_http::init())
    .plugin(tauri_plugin_store::Builder::new().build())
    .plugin(tauri_plugin_opener::init())
    .manage(Mutex::new(automation::AutomationEngine::default()))
    .invoke_handler(tauri::generate_handler![
      commands::automation::get_state,
      commands::automation::start_session,
      commands::automation::stop_session,
      commands::settings::set_base_url,
      commands::window::open_floating_window,
      commands::window::open_image_preview,
    ])
    .setup(|app| {
      require_permission();
      tauri::WebviewWindowBuilder::new(
        app,
        "main",
        tauri::WebviewUrl::App("windows/main.html".into()),
      )
      .title("Lux Desktop")
      .inner_size(600.0, 500.0)
      .build()?;
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

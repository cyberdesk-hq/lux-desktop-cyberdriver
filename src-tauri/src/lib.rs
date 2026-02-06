mod cyberdriver;
mod commands;
mod error;

use tauri::Manager;
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
    .invoke_handler(tauri::generate_handler![
      commands::cyberdriver::get_cyberdriver_status,
      commands::cyberdriver::start_local_api,
      commands::cyberdriver::stop_local_api,
      commands::cyberdriver::connect_tunnel,
      commands::cyberdriver::disconnect_tunnel,
      commands::cyberdriver::update_cyberdriver_settings,
      commands::cyberdriver::get_cyberdriver_settings,
      commands::cyberdriver::clear_cyberdriver_config,
      commands::cyberdriver::install_persistent_display,
      commands::cyberdriver::get_cyberdriver_log_dir,
      commands::cyberdriver::get_recent_logs,
      commands::window::open_floating_window,
      commands::window::open_image_preview,
      commands::window::open_coord_capture,
    ])
    .setup(|app| {
      app.manage(Mutex::new(cyberdriver::CyberdriverRuntime::new(app.handle().clone())?));
      require_permission();
      tauri::WebviewWindowBuilder::new(
        app,
        "main",
        tauri::WebviewUrl::App("windows/main.html".into()),
      )
      .title("Cyberdriver")
      .inner_size(600.0, 500.0)
      .build()?;
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

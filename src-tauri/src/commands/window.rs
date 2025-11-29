use tauri::{AppHandle, Manager, WebviewWindowBuilder, Window};

#[tauri::command]
pub async fn open_floating_window(app: AppHandle) -> Result<(), String> {
  let label = "floating-window".to_string();

  if let Some(existing_window) = app.get_webview_window(&label) {
    if let Err(e) = existing_window.set_focus() {
      println!("Error focusing the floating window: {:?}", e);
    }
  } else {
    WebviewWindowBuilder::new(
      &app,
      &label,
      tauri::WebviewUrl::App("windows/floating.html".into()),
    )
    .title("Floating Window")
    .transparent(true)
    .decorations(false)
    .always_on_top(true)
    .inner_size(100.0, 100.0)
    .min_inner_size(100.0, 100.0)
    .content_protected(true)
    .center()
    .build()
    .unwrap();
  }
  Ok(())
}

#[tauri::command]
pub async fn open_image_preview(app: AppHandle, window: Window, idx: usize) -> Result<(), String> {
  let label = "image-preview".to_string();

  if let Some(existing_window) = app.get_webview_window(&label) {
    if let Err(e) = existing_window.set_focus() {
      println!("Error focusing the floating window: {:?}", e);
    }
  } else {
    let monitor = window.current_monitor().unwrap().unwrap();
    let size = monitor.size();
    WebviewWindowBuilder::new(
      &app,
      &label,
      tauri::WebviewUrl::App(format!("windows/image-preview.html?idx={idx}").into()),
    )
    .title("Image Preview")
    .transparent(true)
    .decorations(false)
    .always_on_top(true)
    .inner_size(size.width as f64, size.height as f64)
    .center()
    .build()
    .unwrap();
  }
  Ok(())
}

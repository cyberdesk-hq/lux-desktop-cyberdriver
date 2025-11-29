use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

use crate::error::LuxDesktopError;

#[tauri::command]
pub async fn set_base_url(app: AppHandle, url: String) -> Result<(), String> {
  let store = app
    .store("settings.json")
    .map_err(Into::<LuxDesktopError>::into)?;
  store.set("baseUrl", url);
  Ok(())
}

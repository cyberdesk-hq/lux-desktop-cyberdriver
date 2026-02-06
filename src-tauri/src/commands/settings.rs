use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

use crate::error::CyberdriverError;

#[tauri::command]
#[allow(dead_code)]
pub async fn set_base_url(app: AppHandle, url: String) -> Result<(), String> {
  let store = app
    .store("settings.json")
    .map_err(Into::<CyberdriverError>::into)?;
  store.set("baseUrl", url);
  Ok(())
}

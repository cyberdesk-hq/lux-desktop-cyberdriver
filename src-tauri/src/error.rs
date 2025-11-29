#[derive(Debug)]
pub enum LuxDesktopError {
  AgentFrameworkError(String),
  EnigoError(enigo::NewConError),
  ImageError(image::ImageError),
  InputError(enigo::InputError),
  InvalidPayload(String),
  PoisonError,
  ReqwestError(tauri_plugin_http::reqwest::Error),
  RuntimeError(String),
  SerdeJsonError(serde_json::Error),
  SocketIoError(rust_socketio::Error),
  TauriError(tauri::Error),
  TauriStoreError(tauri_plugin_store::Error),
  TokioOneshotRecvError(tokio::sync::oneshot::error::RecvError),
  XCapError(xcap::XCapError),
}

impl std::fmt::Display for LuxDesktopError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "{self:?}")
  }
}

impl std::error::Error for LuxDesktopError {}

impl From<enigo::NewConError> for LuxDesktopError {
  fn from(err: enigo::NewConError) -> Self {
    Self::EnigoError(err)
  }
}

impl From<image::ImageError> for LuxDesktopError {
  fn from(err: image::ImageError) -> Self {
    Self::ImageError(err)
  }
}

impl From<enigo::InputError> for LuxDesktopError {
  fn from(err: enigo::InputError) -> Self {
    Self::InputError(err)
  }
}

impl<T> From<std::sync::PoisonError<T>> for LuxDesktopError {
  fn from(_: std::sync::PoisonError<T>) -> Self {
    Self::PoisonError
  }
}

impl From<tauri_plugin_http::reqwest::Error> for LuxDesktopError {
  fn from(err: tauri_plugin_http::reqwest::Error) -> Self {
    Self::ReqwestError(err)
  }
}

impl From<serde_json::Error> for LuxDesktopError {
  fn from(err: serde_json::Error) -> Self {
    Self::SerdeJsonError(err)
  }
}

impl From<rust_socketio::Error> for LuxDesktopError {
  fn from(err: rust_socketio::Error) -> Self {
    Self::SocketIoError(err)
  }
}

impl From<tauri::Error> for LuxDesktopError {
  fn from(err: tauri::Error) -> Self {
    Self::TauriError(err)
  }
}

impl From<tauri_plugin_store::Error> for LuxDesktopError {
  fn from(err: tauri_plugin_store::Error) -> Self {
    Self::TauriStoreError(err)
  }
}

impl From<tokio::sync::oneshot::error::RecvError> for LuxDesktopError {
  fn from(err: tokio::sync::oneshot::error::RecvError) -> Self {
    Self::TokioOneshotRecvError(err)
  }
}

impl From<xcap::XCapError> for LuxDesktopError {
  fn from(err: xcap::XCapError) -> Self {
    Self::XCapError(err)
  }
}

impl From<LuxDesktopError> for String {
  fn from(err: LuxDesktopError) -> Self {
    format!("{err:?}")
  }
}

impl LuxDesktopError {
  pub fn agent_framework_error(err: String) -> Self {
    Self::AgentFrameworkError(err)
  }

  pub fn error_current_monitor() -> Self {
    Self::RuntimeError("Unable to find the monitor where app is running in".into())
  }

  pub fn missing_settings(field: &str) -> Self {
    Self::RuntimeError(format!("Missing `{field}` in settings"))
  }

  pub fn invalid_settings<T: std::fmt::Debug>(field: &str, expect: &str, actual: T) -> Self {
    Self::RuntimeError(format!(
      "Invalid value for `{field}` in settings, expecting {expect}, actually {actual:?}"
    ))
  }
}

pub type Result<T> = std::result::Result<T, LuxDesktopError>;

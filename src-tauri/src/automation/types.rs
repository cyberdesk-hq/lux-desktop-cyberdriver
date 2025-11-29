use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[serde(default)]
pub struct InitEventData {
  pub instruction: String,
  pub mode: Option<String>,
  pub model: Option<String>,
  pub temperature: Option<f64>,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[serde(default)]
pub struct ClickEventData {
  pub index: usize,
  pub total: usize,
  pub x: usize,
  pub y: usize,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[serde(default)]
pub struct DragEventData {
  pub index: usize,
  pub total: usize,
  pub x1: usize,
  pub y1: usize,
  pub x2: usize,
  pub y2: usize,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[serde(default)]
pub struct HotkeyEventData {
  pub index: usize,
  pub total: usize,
  pub combo: String,
  pub count: usize,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[serde(default)]
pub struct TypeEventData {
  pub index: usize,
  pub total: usize,
  pub text: String,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum ScrollDirection {
  #[default]
  Up,
  Down,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[serde(default)]
pub struct ScrollEventData {
  pub index: usize,
  pub total: usize,
  pub x: usize,
  pub y: usize,
  pub direction: ScrollDirection,
  pub count: usize,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[serde(default)]
pub struct WaitEventData {
  pub index: usize,
  pub total: usize,
  pub duration_ms: usize,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[serde(default)]
pub struct FinishEventData {
  pub index: usize,
  pub total: usize,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[serde(default)]
pub struct ScreenshotRequestData {
  pub presigned_url: String,
  pub uuid: String,
  pub expires_at: String,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum SessionStatus {
  #[default]
  Initialized,
  Running,
  Completed,
  Failed,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[serde(default)]
pub struct SessionStatusData {
  pub session_id: String,
  pub status: SessionStatus,
  pub instruction: String,
  pub created_at: String,
  pub actions_executed: usize,
  pub last_activity: String,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[serde(default)]
pub struct ErrorEventData {
  pub message: String,
  pub code: Option<String>,
  pub details: Option<serde_json::Value>,
}

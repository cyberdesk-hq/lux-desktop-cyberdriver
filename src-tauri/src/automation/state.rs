use super::types;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
pub enum AutomationStatus {
  #[default]
  Idle,
  Initializing,
  Running,
  Paused,
  Completed,
  Failed,
  Cancelled,
  Error,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(tag = "action")]
pub enum Action {
  Click(types::ClickEventData),
  Drag(types::DragEventData),
  Hotkey(types::HotkeyEventData),
  Type(types::TypeEventData),
  Scroll(types::ScrollEventData),
  Wait(types::WaitEventData),
  Screenshot { screenshot: String },
}

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
pub struct AutomationState {
  pub session_id: String,
  pub created_at: chrono::DateTime<chrono::Local>,
  pub instruction: String,
  pub status: AutomationStatus,
  pub history: Vec<Action>,
  pub error: Option<String>,
}

impl AutomationState {
  pub fn new(session_id: String, instruction: String) -> Self {
    Self {
      session_id,
      created_at: chrono::Local::now(),
      instruction,
      status: AutomationStatus::Running,
      ..Default::default()
    }
  }
}

use std::{
  fs,
  net::{SocketAddr, TcpListener},
  path::PathBuf,
};

use serde::{Deserialize, Serialize};

use crate::error::{CyberdriverError, Result};

const CONFIG_DIR: &str = ".cyberdriver";
const CONFIG_FILE: &str = "config.json";
const PID_FILE: &str = "cyberdriver.pid.json";
const VERSION: &str = "0.0.39";

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Config {
  pub version: String,
  pub fingerprint: String,
}

impl Config {
  pub fn to_dict(&self) -> serde_json::Value {
    serde_json::json!({
      "version": self.version,
      "fingerprint": self.fingerprint,
    })
  }
}

#[derive(Clone, Debug, Default)]
pub struct ConnectionInfo {
  pub host: Option<String>,
  pub port: Option<u16>,
  pub connected: bool,
  pub last_error: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RuntimePidInfo {
  pub pid: u32,
  pub command: String,
  pub local_port: Option<u16>,
  pub cloud_host: String,
  pub cloud_port: u16,
  pub version: Option<String>,
  pub started_at: Option<String>,
  pub frozen: Option<bool>,
  pub argv: Option<Vec<String>>,
}

pub fn get_config_dir() -> PathBuf {
  let base = if cfg!(windows) {
    std::env::var("LOCALAPPDATA").ok().unwrap_or_else(|| {
      std::env::var("USERPROFILE").unwrap_or_else(|_| ".".into())
    })
  } else {
    std::env::var("XDG_CONFIG_HOME").ok().unwrap_or_else(|| {
      let home = std::env::var("HOME").unwrap_or_else(|_| ".".into());
      format!("{home}/.config")
    })
  };
  PathBuf::from(base).join(CONFIG_DIR)
}

pub fn get_config() -> Result<Config> {
  let config_dir = get_config_dir();
  let config_path = config_dir.join(CONFIG_FILE);
  let mut existing_fingerprint: Option<String> = None;

  if config_path.exists() {
    if let Ok(content) = fs::read_to_string(&config_path) {
      if let Ok(data) = serde_json::from_str::<serde_json::Value>(&content) {
        let version = data.get("version").and_then(|v| v.as_str());
        let fingerprint = data.get("fingerprint").and_then(|v| v.as_str());
        if version == Some(VERSION) {
          if let (Some(v), Some(fp)) = (version, fingerprint) {
            return Ok(Config {
              version: v.to_string(),
              fingerprint: fp.to_string(),
            });
          }
        }
        if let Some(fp) = fingerprint {
          existing_fingerprint = Some(fp.to_string());
        }
      }
    }
  }

  fs::create_dir_all(&config_dir)?;
  let fingerprint = existing_fingerprint.unwrap_or_else(|| uuid::Uuid::new_v4().to_string());
  let config = Config {
    version: VERSION.to_string(),
    fingerprint,
  };
  fs::write(&config_path, serde_json::to_vec_pretty(&config.to_dict())?)?;
  Ok(config)
}

pub fn get_pid_file_path() -> PathBuf {
  get_config_dir().join(PID_FILE)
}

pub fn write_pid_info(info: RuntimePidInfo) -> Result<()> {
  let path = get_pid_file_path();
  fs::create_dir_all(get_config_dir())?;
  let mut payload = info;
  if payload.pid == 0 {
    payload.pid = std::process::id();
  }
  if payload.version.is_none() {
    payload.version = Some(VERSION.to_string());
  }
  if payload.started_at.is_none() {
    payload.started_at = Some(chrono::Local::now().to_rfc3339());
  }
  if payload.frozen.is_none() {
    payload.frozen = Some(cfg!(not(debug_assertions)));
  }
  if payload.argv.is_none() {
    payload.argv = Some(std::env::args().collect());
  }
  fs::write(path, serde_json::to_vec_pretty(&payload)?)?;
  Ok(())
}

#[allow(dead_code)]
pub fn remove_pid_file() -> Result<()> {
  let path = get_pid_file_path();
  if path.exists() {
    fs::remove_file(path).map_err(|err| CyberdriverError::RuntimeError(err.to_string()))?;
  }
  Ok(())
}

pub fn find_available_port(host: &str, start_port: u16) -> Option<u16> {
  let max_tries = 100;
  for i in 0..max_tries {
    let port = start_port.saturating_add(i);
    let addr: SocketAddr = format!("{host}:{port}").parse().ok()?;
    if TcpListener::bind(addr).is_ok() {
      return Some(port);
    }
  }
  None
}

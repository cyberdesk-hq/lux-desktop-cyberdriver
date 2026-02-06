use crate::error::{CyberdriverError, Result};
use tauri::AppHandle;

#[cfg(windows)]
use windows::core::w;
#[cfg(windows)]
use windows::Win32::UI::Input::KeyboardAndMouse::{
  GetKeyState, SendInput, INPUT, INPUT_0, INPUT_KEYBOARD, KEYBDINPUT, KEYEVENTF_EXTENDEDKEY,
  KEYEVENTF_KEYUP, KEYEVENTF_SCANCODE, VK_CAPITAL, VK_SPACE,
};

#[cfg(windows)]
use windows::Win32::UI::Shell::{ShellExecuteExW, SEE_MASK_NOCLOSEPROCESS, SHELLEXECUTEINFOW};

#[cfg(windows)]
use windows::Win32::UI::WindowsAndMessaging::SW_SHOWNORMAL;

#[cfg(windows)]
use std::path::PathBuf;

pub async fn install_persistent_display(
  app: &AppHandle,
  driver_path: Option<String>,
) -> Result<()> {
  if !cfg!(windows) {
    return Err(CyberdriverError::RuntimeError(
      "Persistent display is only supported on Windows".into(),
    ));
  }

  #[cfg(windows)]
  {
    let driver_dir = resolve_driver_path(app, driver_path)?;
    let is_64bit = cfg!(target_pointer_width = "64");
    let installer_name = if is_64bit {
      "deviceinstaller64.exe"
    } else {
      "deviceinstaller.exe"
    };
    let installer = driver_dir.join(installer_name);
    let inf_path = driver_dir.join("usbmmidd.inf");
    if !installer.exists() || !inf_path.exists() {
      return Err(CyberdriverError::RuntimeError(
        "Amyuni driver files not found".into(),
      ));
    }

    run_elevated(
      installer.clone(),
      format!("install \"{}\" usbmmidd", inf_path.display()),
    )?;
    run_elevated(installer.clone(), "enableidd 1".to_string())?;
    Ok(())
  }

  #[cfg(not(windows))]
  {
    let _ = app;
    let _ = driver_path;
    Err(CyberdriverError::RuntimeError(
      "Persistent display is only supported on Windows".into(),
    ))
  }
}

#[cfg(windows)]
fn resolve_driver_path(app: &AppHandle, driver_path: Option<String>) -> Result<PathBuf> {
  if let Some(path) = driver_path {
    let candidate = PathBuf::from(path);
    if candidate.exists() {
      return Ok(candidate);
    }
  }
  if let Ok(resource_dir) = app.path().resource_dir() {
    let candidate = resource_dir.join("amyuni_driver");
    if candidate.exists() {
      return Ok(candidate);
    }
    let nested = resource_dir.join("src-tauri").join("resources").join("amyuni_driver");
    if nested.exists() {
      return Ok(nested);
    }
  }
  Err(CyberdriverError::RuntimeError(
    "Amyuni driver resources not found".into(),
  ))
}

#[cfg(windows)]
fn run_elevated(exe: PathBuf, args: String) -> Result<()> {
  use std::os::windows::ffi::OsStrExt;
  use windows::core::PCWSTR;

  let exe_wide: Vec<u16> = exe.as_os_str().encode_wide().chain(Some(0)).collect();
  let args_wide: Vec<u16> = std::ffi::OsStr::new(&args).encode_wide().chain(Some(0)).collect();
  let mut info = SHELLEXECUTEINFOW::default();
  info.cbSize = std::mem::size_of::<SHELLEXECUTEINFOW>() as u32;
  info.fMask = SEE_MASK_NOCLOSEPROCESS;
  info.lpVerb = w!("runas");
  info.lpFile = PCWSTR(exe_wide.as_ptr());
  info.lpParameters = PCWSTR(args_wide.as_ptr());
  info.nShow = SW_SHOWNORMAL.0 as i32;
  unsafe {
    ShellExecuteExW(&mut info).map_err(|err| CyberdriverError::RuntimeError(err.to_string()))?;
  }
  Ok(())
}

#[cfg(windows)]
pub fn caps_lock_is_on() -> bool {
  unsafe { (GetKeyState(VK_CAPITAL.0 as i32) & 0x0001) != 0 }
}

#[cfg(windows)]
pub fn send_scancode(scan_code: u16, key_up: bool) {
  let mut flags = KEYEVENTF_SCANCODE;
  let mut sc = scan_code;
  if sc > 0xFF {
    flags |= KEYEVENTF_EXTENDEDKEY;
    sc &= 0xFF;
  }
  if key_up {
    flags |= KEYEVENTF_KEYUP;
  }
  let input = INPUT {
    r#type: INPUT_KEYBOARD,
    Anonymous: INPUT_0 {
      ki: KEYBDINPUT {
        wVk: 0,
        wScan: sc,
        dwFlags: flags,
        time: 0,
        dwExtraInfo: 0,
      },
    },
  };
  unsafe {
    let _ = SendInput(&[input], std::mem::size_of::<INPUT>() as i32);
  }
}

#[cfg(windows)]
pub fn send_vk_space(key_up: bool) {
  let mut flags = 0;
  if key_up {
    flags |= KEYEVENTF_KEYUP;
  }
  let input = INPUT {
    r#type: INPUT_KEYBOARD,
    Anonymous: INPUT_0 {
      ki: KEYBDINPUT {
        wVk: VK_SPACE.0 as u16,
        wScan: 0,
        dwFlags: flags,
        time: 0,
        dwExtraInfo: 0,
      },
    },
  };
  unsafe {
    let _ = SendInput(&[input], std::mem::size_of::<INPUT>() as i32);
  }
}

#[cfg(not(windows))]
#[allow(dead_code)]
pub fn caps_lock_is_on() -> bool {
  false
}

#[cfg(not(windows))]
pub fn send_scancode(_scan_code: u16, _key_up: bool) {}

#[cfg(not(windows))]
pub fn send_vk_space(_key_up: bool) {}

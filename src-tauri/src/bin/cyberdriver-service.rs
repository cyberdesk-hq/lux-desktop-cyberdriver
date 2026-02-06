#[cfg(windows)]
use std::{
  ffi::OsString,
  io::{Read, Write},
  net::TcpListener,
  sync::{
    atomic::{AtomicBool, Ordering},
    Arc,
  },
  thread,
  time::Duration,
};

#[cfg(windows)]
use cyberdriver_lib::cyberdriver::{headless::HeadlessRuntime, logger::DebugLogger};

#[cfg(windows)]
use windows_service::{
  define_windows_service,
  service::{
    ServiceControl, ServiceControlAccept, ServiceExitCode, ServiceState, ServiceStatus, ServiceType,
  },
  service_control_handler::{self, ServiceControlHandlerResult},
  service_dispatcher,
};


#[cfg(windows)]
const SERVICE_NAME: &str = "CyberdriverService";
#[cfg(windows)]
const CONTROL_PORT: u16 = 3415;

#[cfg(windows)]
define_windows_service!(ffi_service_main, service_main);

#[cfg(windows)]
fn main() -> Result<(), windows_service::Error> {
  if std::env::args().any(|arg| arg == "--console") {
    let logger = DebugLogger::new(true).unwrap_or_else(|_| DebugLogger::new(false).unwrap());
    service_worker(Arc::new(AtomicBool::new(true)), logger);
    return Ok(());
  }
  service_dispatcher::start(SERVICE_NAME, ffi_service_main)?;
  Ok(())
}

#[cfg(not(windows))]
fn main() {
  eprintln!("Cyberdriver service is only supported on Windows.");
}

#[cfg(windows)]
fn service_main(_args: Vec<OsString>) {
  if let Err(err) = run_service() {
    eprintln!("Service error: {err:?}");
  }
}

#[cfg(windows)]
fn run_service() -> Result<(), windows_service::Error> {
  let running = Arc::new(AtomicBool::new(true));
  let running_flag = running.clone();
  let logger = DebugLogger::new(true).unwrap_or_else(|_| DebugLogger::new(false).unwrap());

  let status_handle = service_control_handler::register(SERVICE_NAME, move |control| {
    match control {
      ServiceControl::Stop | ServiceControl::Shutdown => {
        running_flag.store(false, Ordering::SeqCst);
        ServiceControlHandlerResult::NoError
      }
      _ => ServiceControlHandlerResult::NotImplemented,
    }
  })?;

  status_handle.set_service_status(ServiceStatus {
    service_type: ServiceType::OWN_PROCESS,
    current_state: ServiceState::StartPending,
    controls_accepted: ServiceControlAccept::STOP | ServiceControlAccept::SHUTDOWN,
    exit_code: ServiceExitCode::Win32(0),
    checkpoint: 0,
    wait_hint: Duration::from_secs(2),
    process_id: None,
  })?;

  logger.info("SERVICE", "Cyberdriver service starting");

  let worker_logger = logger.clone();
  let worker_running = running.clone();
  let worker = thread::spawn(move || service_worker(worker_running, worker_logger));

  status_handle.set_service_status(ServiceStatus {
    service_type: ServiceType::OWN_PROCESS,
    current_state: ServiceState::Running,
    controls_accepted: ServiceControlAccept::STOP | ServiceControlAccept::SHUTDOWN,
    exit_code: ServiceExitCode::Win32(0),
    checkpoint: 0,
    wait_hint: Duration::from_secs(0),
    process_id: None,
  })?;

  while running.load(Ordering::SeqCst) {
    thread::sleep(Duration::from_millis(250));
  }

  status_handle.set_service_status(ServiceStatus {
    service_type: ServiceType::OWN_PROCESS,
    current_state: ServiceState::StopPending,
    controls_accepted: ServiceControlAccept::empty(),
    exit_code: ServiceExitCode::Win32(0),
    checkpoint: 0,
    wait_hint: Duration::from_secs(2),
    process_id: None,
  })?;

  let _ = worker.join();
  logger.info("SERVICE", "Cyberdriver service stopped");

  status_handle.set_service_status(ServiceStatus {
    service_type: ServiceType::OWN_PROCESS,
    current_state: ServiceState::Stopped,
    controls_accepted: ServiceControlAccept::empty(),
    exit_code: ServiceExitCode::Win32(0),
    checkpoint: 0,
    wait_hint: Duration::from_secs(0),
    process_id: None,
  })?;

  Ok(())
}

#[cfg(windows)]
fn service_worker(running: Arc<AtomicBool>, logger: DebugLogger) {
  logger.info("SERVICE", "Service worker started");
  start_control_server(running.clone(), logger.clone());
  let mut runtime = match HeadlessRuntime::new() {
    Ok(runtime) => runtime,
    Err(err) => {
      logger.log("SERVICE", "Failed to initialize runtime", &[("error", err.to_string())]);
      return;
    }
  };
  if let Err(err) = tauri::async_runtime::block_on(runtime.start()) {
    logger.log("SERVICE", "Failed to start runtime", &[("error", err.to_string())]);
  }
  while running.load(Ordering::SeqCst) {
    let _ = tauri::async_runtime::block_on(runtime.refresh_settings_if_changed());
    thread::sleep(Duration::from_secs(5));
  }
  let _ = tauri::async_runtime::block_on(runtime.stop());
}

#[cfg(windows)]
fn start_control_server(running: Arc<AtomicBool>, logger: DebugLogger) {
  thread::spawn(move || {
    let listener = match TcpListener::bind(("127.0.0.1", CONTROL_PORT)) {
      Ok(listener) => listener,
      Err(err) => {
        logger.log("SERVICE", "Control server bind failed", &[("error", err.to_string())]);
        return;
      }
    };
    logger.log(
      "SERVICE",
      "Control server listening",
      &[("addr", format!("127.0.0.1:{CONTROL_PORT}"))],
    );

    for stream in listener.incoming() {
      if !running.load(Ordering::SeqCst) {
        break;
      }
      let mut stream = match stream {
        Ok(stream) => stream,
        Err(err) => {
          logger.log("SERVICE", "Control accept failed", &[("error", err.to_string())]);
          continue;
        }
      };
      let mut buf = [0u8; 2048];
      let read = match stream.read(&mut buf) {
        Ok(read) => read,
        Err(err) => {
          logger.log("SERVICE", "Control read failed", &[("error", err.to_string())]);
          continue;
        }
      };
      let request = String::from_utf8_lossy(&buf[..read]);
      if request.starts_with("POST /stop") {
        running.store(false, Ordering::SeqCst);
        logger.info("SERVICE", "Stop requested via control server");
      }
      let body = if running.load(Ordering::SeqCst) {
        "{\"running\":true}"
      } else {
        "{\"running\":false}"
      };
      let response = format!(
        "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: {}\r\n\r\n{}",
        body.len(),
        body
      );
      let _ = stream.write_all(response.as_bytes());
    }
  });
}

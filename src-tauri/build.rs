fn main() {
  let is_macos = std::env::var("CARGO_CFG_TARGET_OS")
    .map(|value| value == "macos")
    .unwrap_or(false);
  let has_sck = std::env::var("CARGO_FEATURE_SCREENCAPTUREKIT").is_ok();

  if is_macos && has_sck {
    let system_swift = "/usr/lib/swift";

    if std::path::Path::new(system_swift).is_dir() {
      println!("cargo:rustc-link-arg=-Wl,-rpath,{}", system_swift);
    } else {
      let candidates = [
        "/Library/Developer/CommandLineTools/usr/lib/swift-5.5/macosx",
        "/Library/Developer/CommandLineTools/usr/lib/swift/macosx",
        "/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift-5.5/macosx",
        "/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift/macosx",
      ];

      for path in candidates {
        if std::path::Path::new(path).is_dir() {
          println!("cargo:rustc-link-arg=-Wl,-rpath,{}", path);
        }
      }
    }
  }

  tauri_build::build()
}

import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const explicitVersion = args.find(arg => !arg.startsWith('--'));
const shouldTag = args.includes('--tag');

function readCurrentVersion() {
  const raw = readFileSync('src-tauri/tauri.conf.json', 'utf8');
  const data = JSON.parse(raw);
  return data.version;
}

function bumpPatch(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) {
    throw new Error(`Invalid version format: ${version}`);
  }
  const major = Number.parseInt(match[1], 10);
  const minor = Number.parseInt(match[2], 10);
  const patch = Number.parseInt(match[3], 10) + 1;
  return `${major}.${minor}.${patch}`;
}

const currentVersion = readCurrentVersion();
const newVersion = explicitVersion ?? bumpPatch(currentVersion);
if (!newVersion) {
  console.error('Usage: node bump-version.mjs [version] [--tag]');
  process.exit(1);
}

const jsonFiles = [
  'src-tauri/tauri.conf.json',
  'package.json',
  'package-lock.json',
];

function writeJson(filePath, updater) {
  const raw = readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  const next = updater(data);
  writeFileSync(filePath, `${JSON.stringify(next, null, 2)}\n`);
}

for (const file of jsonFiles) {
  writeJson(file, data => {
    data.version = newVersion;
    if (file === 'package-lock.json' && data.packages?.['']) {
      data.packages[''].version = newVersion;
    }
    return data;
  });
}

const cargoTomlPath = 'src-tauri/Cargo.toml';
{
  const raw = readFileSync(cargoTomlPath, 'utf8');
  const idx = raw.indexOf('[package]');
  if (idx === -1) {
    throw new Error('Failed to find [package] section in Cargo.toml');
  }
  const before = raw.slice(0, idx);
  const after = raw.slice(idx);
  const updatedAfter = after.replace(
    /(^version\s*=\s*")[^"]+(")/m,
    `$1${newVersion}$2`,
  );
  if (updatedAfter === after) {
    throw new Error('Failed to update Cargo.toml version');
  }
  writeFileSync(cargoTomlPath, `${before}${updatedAfter}`);
}

const configPath = 'src-tauri/src/cyberdriver/config.rs';
{
  const raw = readFileSync(configPath, 'utf8');
  const updated = raw.replace(
    /const VERSION: &str = "[^"]+";/,
    `const VERSION: &str = "${newVersion}";`,
  );
  if (updated === raw) {
    throw new Error('Failed to update config.rs version');
  }
  writeFileSync(configPath, updated);
}

if (shouldTag) {
  execSync(`git tag v${newVersion}`, { stdio: 'inherit' });
}

console.log(`Version bumped to ${newVersion}`);

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { openPath } from '@tauri-apps/plugin-opener';

type CyberdriverStatus = {
  local_server_running: boolean;
  local_server_port?: number | null;
  tunnel_connected: boolean;
  keepalive_enabled: boolean;
  black_screen_recovery: boolean;
  debug_enabled: boolean;
  last_error?: string | null;
  machine_uuid: string;
  version: string;
};

type CyberdriverSettings = {
  host: string;
  port: number;
  secret: string;
  target_port: number;
  keepalive_enabled: boolean;
  keepalive_threshold_minutes: number;
  keepalive_click_x: number | null;
  keepalive_click_y: number | null;
  black_screen_recovery: boolean;
  black_screen_check_interval: number;
  debug: boolean;
  register_as_keepalive_for: string | null;
  experimental_space: boolean;
  driver_path: string | null;
};

const defaultSettings: CyberdriverSettings = {
  host: 'api.cyberdesk.io',
  port: 443,
  secret: '',
  target_port: 3000,
  keepalive_enabled: false,
  keepalive_threshold_minutes: 3,
  keepalive_click_x: null,
  keepalive_click_y: null,
  black_screen_recovery: false,
  black_screen_check_interval: 30,
  debug: true,
  register_as_keepalive_for: null,
  experimental_space: false,
  driver_path: null,
};

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const App: React.FC = () => {
  const [status, setStatus] = useState<CyberdriverStatus | null>(null);
  const [settings, setSettings] = useState<CyberdriverSettings>(defaultSettings);
  const [logDir, setLogDir] = useState<string>('');
  const [logs, setLogs] = useState<string>('');
  const [logsError, setLogsError] = useState<string>('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [error, setError] = useState<string>('');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [action, setAction] = useState<'join' | 'stop' | null>(null);
  const hydrated = useRef(false);
  const saveTimer = useRef<number | null>(null);
  const logBoxRef = useRef<HTMLPreElement | null>(null);

  const parsedSettings = useMemo(() => {
    return {
      ...settings,
      keepalive_click_x:
        settings.keepalive_click_x === null || Number.isNaN(settings.keepalive_click_x)
          ? null
          : Number(settings.keepalive_click_x),
      keepalive_click_y:
        settings.keepalive_click_y === null || Number.isNaN(settings.keepalive_click_y)
          ? null
          : Number(settings.keepalive_click_y),
      register_as_keepalive_for:
        settings.register_as_keepalive_for && settings.register_as_keepalive_for.length > 0
          ? settings.register_as_keepalive_for
          : null,
      driver_path: settings.driver_path && settings.driver_path.length > 0 ? settings.driver_path : null,
    };
  }, [settings]);

  const refreshStatus = useCallback(async () => {
    try {
      const next = (await invoke('get_cyberdriver_status')) as CyberdriverStatus;
      setStatus(next);
    } catch (err) {
      setError(String(err));
    }
  }, []);

  useEffect(() => {
    void refreshStatus();
    const timer = window.setInterval(refreshStatus, 2000);
    return () => window.clearInterval(timer);
  }, [refreshStatus]);

  useEffect(() => {
    void (async () => {
      try {
        const loaded = (await invoke('get_cyberdriver_settings')) as CyberdriverSettings;
        setSettings({ ...defaultSettings, ...loaded });
        const dir = (await invoke('get_cyberdriver_log_dir')) as string;
        setLogDir(dir);
        hydrated.current = true;
        setSaveState('saved');
      } catch (err) {
        setError(String(err));
      }
    })();
  }, []);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    void (async () => {
      unlisten = await listen('coordCaptured', event => {
        const payload = event.payload as { x: number; y: number };
        setSettings(prev => ({
          ...prev,
          keepalive_click_x: payload.x,
          keepalive_click_y: payload.y,
        }));
      });
    })();
    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  useEffect(() => {
    if (!hydrated.current) {
      return;
    }
    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current);
    }
    setSaveState('saving');
    saveTimer.current = window.setTimeout(async () => {
      try {
        await invoke('update_cyberdriver_settings', { settings: parsedSettings });
        setSaveState('saved');
      } catch (err) {
        setSaveState('error');
        setError(String(err));
      }
    }, 400);
    return () => {
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current);
      }
    };
  }, [parsedSettings]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const next = (await invoke('get_recent_logs', { lines: 500 })) as string;
        setLogs(next);
        setLogsError('');
      } catch (err) {
        setLogsError(String(err));
      }
    };
    void fetchLogs();
    const timer = window.setInterval(fetchLogs, 1500);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!autoScroll || !logBoxRef.current) {
      return;
    }
    logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
  }, [logs, autoScroll]);

  const updateField = <K extends keyof CyberdriverSettings>(
    key: K,
    value: CyberdriverSettings[K],
  ) => setSettings(prev => ({ ...prev, [key]: value }));

  const saveSettingsNow = useCallback(async () => {
    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current);
    }
    try {
      setSaveState('saving');
      await invoke('update_cyberdriver_settings', { settings: parsedSettings });
      setSaveState('saved');
      return true;
    } catch (err) {
      setSaveState('error');
      setError(String(err));
      return false;
    }
  }, [parsedSettings]);

  const handleJoin = async () => {
    if (!parsedSettings.secret.trim()) {
      setError('API key is required to join.');
      return;
    }
    setError('');
    setAction('join');
    const saved = await saveSettingsNow();
    if (!saved) {
      setAction(null);
      return;
    }
    try {
      await invoke('connect_tunnel');
      await refreshStatus();
    } catch (err) {
      setError(String(err));
    } finally {
      setAction(null);
    }
  };

  const handleStop = async () => {
    setError('');
    setAction('stop');
    try {
      await invoke('disconnect_tunnel');
      await invoke('stop_local_api');
      await refreshStatus();
    } catch (err) {
      setError(String(err));
    } finally {
      setAction(null);
    }
  };

  const handleClearConfig = async () => {
    if (!window.confirm('Clear config file and generate a new machine UUID?')) {
      return;
    }
    setError('');
    try {
      await invoke('clear_cyberdriver_config');
      await refreshStatus();
    } catch (err) {
      setError(String(err));
    }
  };

  const copyLogs = async () => {
    if (!logs) {
      return;
    }
    try {
      await navigator.clipboard.writeText(logs);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = logs;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  };

  const connectionLabel = status?.tunnel_connected ? 'Connected' : 'Disconnected';
  const localLabel = status?.local_server_running ? 'Running' : 'Stopped';

  return (
    <div className="min-h-screen bg-accent-b text-accent-c">
      <div className="mx-auto max-w-5xl px-8 py-8 space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-2xl font-semibold">Cyberdriver</div>
            <div className="text-sm text-accent-b-0">
              Machine UUID {status?.machine_uuid ?? 'Loading...'} · v{status?.version ?? '--'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                status?.tunnel_connected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {connectionLabel}
            </span>
            <button
              className="rounded-lg bg-primary-DEFAULT text-white px-4 py-2 text-sm font-semibold"
              onClick={handleJoin}
              disabled={action === 'join'}
            >
              {action === 'join' ? 'Joining…' : 'Join'}
            </button>
            <button
              className="rounded-lg border border-accent-b-2 bg-white px-4 py-2 text-sm font-semibold"
              onClick={handleStop}
              disabled={action === 'stop'}
            >
              {action === 'stop' ? 'Stopping…' : 'Stop'}
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-accent-b-2 bg-white p-4">
            <div className="text-xs uppercase text-accent-b-0">Tunnel</div>
            <div className="text-lg font-semibold">{connectionLabel}</div>
            <div className="text-sm text-accent-b-0">{settings.host}:{settings.port}</div>
          </div>
          <div className="rounded-xl border border-accent-b-2 bg-white p-4">
            <div className="text-xs uppercase text-accent-b-0">Local API</div>
            <div className="text-lg font-semibold">{localLabel}</div>
            <div className="text-sm text-accent-b-0">
              {status?.local_server_port ? `Port ${status.local_server_port}` : `Port ${settings.target_port}`}
            </div>
          </div>
          <div className="rounded-xl border border-accent-b-2 bg-white p-4">
            <div className="text-xs uppercase text-accent-b-0">Keepalive</div>
            <div className="text-lg font-semibold">
              {status?.keepalive_enabled ? 'Enabled' : 'Disabled'}
            </div>
            <div className="text-sm text-accent-b-0">Threshold {settings.keepalive_threshold_minutes} min</div>
          </div>
        </section>

        <section className="rounded-xl border border-accent-b-2 bg-white p-6 space-y-4">
          <div>
            <div className="text-lg font-semibold">Quick Setup</div>
            <div className="text-sm text-accent-b-0">
              Enter your API key and click Join. Changes save automatically.
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              API Key
              <input
                className="rounded-lg border border-accent-b-2 px-3 py-2"
                type="password"
                value={settings.secret}
                onChange={e => updateField('secret', e.target.value)}
                placeholder="Paste your API key"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Host
              <input
                className="rounded-lg border border-accent-b-2 px-3 py-2"
                value={settings.host}
                onChange={e => updateField('host', e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Port
              <input
                className="rounded-lg border border-accent-b-2 px-3 py-2"
                type="number"
                value={settings.port}
                onChange={e => updateField('port', Number(e.target.value))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Local API Port
              <input
                className="rounded-lg border border-accent-b-2 px-3 py-2"
                type="number"
                value={settings.target_port}
                onChange={e => updateField('target_port', Number(e.target.value))}
              />
            </label>
          </div>

          <div className="text-xs text-accent-b-0">
            {saveState === 'saving' && 'Saving changes…'}
            {saveState === 'saved' && 'All changes saved'}
            {saveState === 'error' && 'Could not save settings'}
          </div>
        </section>

        <details className="rounded-xl border border-accent-b-2 bg-white p-6">
          <summary className="cursor-pointer text-sm font-semibold text-accent-b-neg-1">
            Advanced Settings
          </summary>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.keepalive_enabled}
                onChange={e => updateField('keepalive_enabled', e.target.checked)}
              />
              Enable Keepalive
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.black_screen_recovery}
                onChange={e => updateField('black_screen_recovery', e.target.checked)}
              />
              Black Screen Recovery (Windows)
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Keepalive Threshold (minutes)
              <input
                className="rounded-lg border border-accent-b-2 px-3 py-2"
                type="number"
                value={settings.keepalive_threshold_minutes}
                onChange={e =>
                  updateField('keepalive_threshold_minutes', Number(e.target.value))
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Black Screen Interval (seconds)
              <input
                className="rounded-lg border border-accent-b-2 px-3 py-2"
                type="number"
                value={settings.black_screen_check_interval}
                onChange={e =>
                  updateField('black_screen_check_interval', Number(e.target.value))
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Keepalive Click X
              <input
                className="rounded-lg border border-accent-b-2 px-3 py-2"
                type="number"
                value={settings.keepalive_click_x ?? ''}
                onChange={e =>
                  updateField(
                    'keepalive_click_x',
                    e.target.value === '' ? null : Number(e.target.value),
                  )
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Keepalive Click Y
              <input
                className="rounded-lg border border-accent-b-2 px-3 py-2"
                type="number"
                value={settings.keepalive_click_y ?? ''}
                onChange={e =>
                  updateField(
                    'keepalive_click_y',
                    e.target.value === '' ? null : Number(e.target.value),
                  )
                }
              />
            </label>
            <button
              className="rounded-lg border border-accent-b-2 bg-white px-4 py-2 text-sm font-semibold"
              onClick={() => invoke('open_coord_capture')}
            >
              Capture Coordinates
            </button>
            <button
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
              onClick={handleClearConfig}
            >
              Clear Config File
            </button>
            <label className="flex flex-col gap-1 text-sm">
              Amyuni Driver Path (Windows)
              <input
                className="rounded-lg border border-accent-b-2 px-3 py-2"
                value={settings.driver_path ?? ''}
                onChange={e => updateField('driver_path', e.target.value)}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.experimental_space}
                onChange={e => updateField('experimental_space', e.target.checked)}
              />
              Experimental Space Key (Windows)
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="rounded-lg border border-accent-b-2 bg-white px-4 py-2 text-sm font-semibold"
              onClick={() => invoke('start_local_api')}
            >
              Start Local API
            </button>
            <button
              className="rounded-lg border border-accent-b-2 bg-white px-4 py-2 text-sm font-semibold"
              onClick={() => invoke('stop_local_api')}
            >
              Stop Local API
            </button>
            <button
              className="rounded-lg border border-accent-b-2 bg-white px-4 py-2 text-sm font-semibold"
              onClick={() => invoke('install_persistent_display')}
            >
              Install Persistent Display (Windows)
            </button>
          </div>
        </details>

        <section className="rounded-xl border border-accent-b-2 bg-white p-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-lg font-semibold">Live Logs</div>
              <div className="text-sm text-accent-b-0">
                Real-time view of Cyberdriver activity. Copy and paste for debugging.
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.debug}
                  onChange={e => updateField('debug', e.target.checked)}
                />
                Verbose logging
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={e => setAutoScroll(e.target.checked)}
                />
                Auto-scroll
              </label>
              <button
                className="rounded-md border border-accent-b-2 bg-white px-3 py-2 text-xs font-semibold"
                onClick={copyLogs}
              >
                Copy logs
              </button>
              <button
                className="rounded-md border border-accent-b-2 bg-white px-3 py-2 text-xs font-semibold"
                onClick={() => logDir && openPath(logDir).catch(err => setLogsError(String(err)))}
                disabled={!logDir}
              >
                Open logs folder
              </button>
            </div>
          </div>
          {logsError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {logsError}
            </div>
          )}
          <pre
            ref={logBoxRef}
            className="h-64 overflow-auto rounded-lg border border-accent-b-2 bg-[#0f172a] text-[#e2e8f0] text-xs leading-5 p-4"
          >
            {logs || 'No logs yet. Click Join to start activity.'}
          </pre>
        </section>
      </div>
    </div>
  );
};

export default App;

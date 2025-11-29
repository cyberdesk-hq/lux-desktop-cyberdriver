export enum Mode {
  Actor = 'actor',
  Thinker = 'thinker',
  Tasker = 'tasker',
}

export enum AutomationStatus {
  Idle = 'Idle',
  Initializing = 'Initializing',
  Running = 'Running',
  Paused = 'Paused',
  Completed = 'Completed',
  Failed = 'Failed',
  Cancelled = 'Cancelled',
  Error = 'Error',
}

export type Action =
  | {
      action: 'Click';
      x: number;
      y: number;
    }
  | {
      action: 'Drag';
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }
  | {
      action: 'Hotkey';
      combo: string;
      count: number;
    }
  | {
      action: 'Type';
      text: string;
    }
  | {
      action: 'Scroll';
      x: number;
      y: number;
      direction: 'Up' | 'Down';
      count: number;
    }
  | {
      action: 'Wait';
      duration_ms: number;
    }
  | {
      action: 'Screenshot';
      screenshot: string;
    };

export interface AutomationState {
  session_id: string;
  created_at: string;
  instruction: string;
  status: AutomationStatus;
  history: Action[];
  error?: string;
}

import type { Action } from './types';

export const formatAction = (action: Action) => {
  switch (action.action) {
    case 'Click':
      return `Click (${action.x}, ${action.y})`;
    case 'Drag':
      return `Drag (${action.x1}, ${action.y1}) -> (${action.x2}, ${action.y2})`;
    case 'Hotkey':
      return `Hotkey (${action.combo})`;
    case 'Type':
      return `Type ${JSON.stringify(action.text)}`;
    case 'Scroll':
      return `Scroll ${action.direction}`;
    case 'Wait':
      return `Wait for ${action.duration_ms / 1000}s`;
    case 'Screenshot':
      return 'Screenshot';
    default:
      return action satisfies never;
  }
};

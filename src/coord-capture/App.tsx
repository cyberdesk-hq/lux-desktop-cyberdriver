import React, { useEffect } from 'react';
import { emit } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';

const App: React.FC = () => {
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const scale = window.devicePixelRatio || 1;
      emit('coordCaptured', {
        x: Math.round(event.clientX * scale),
        y: Math.round(event.clientY * scale),
      });
      getCurrentWindow().close();
    };
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        getCurrentWindow().close();
      }
    };
    window.addEventListener('click', handler);
    window.addEventListener('keydown', keyHandler);
    return () => {
      window.removeEventListener('click', handler);
      window.removeEventListener('keydown', keyHandler);
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-black/40 flex items-center justify-center text-white">
      <div className="rounded-xl bg-black/70 px-6 py-4 text-center">
        <div className="text-lg font-semibold">Capture Coordinates</div>
        <div className="text-sm opacity-80 mt-2">
          Click anywhere to record X/Y. Press Esc to cancel.
        </div>
      </div>
    </div>
  );
};

export default App;

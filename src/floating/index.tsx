import React from 'react';
import { createRoot } from 'react-dom/client';
import { Window } from '@tauri-apps/api/window';
import App from './App';
import './index.css';

const appWindow = new Window('floating-window');
window.addEventListener('mousedown', async e => {
  if (e.button === 0) {
    await appWindow.startDragging();
  }
});

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

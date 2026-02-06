import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '../main/styles.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

import React, { useEffect, useState } from 'react';
import { Image } from 'antd';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { processHistory } from '../common';
import type { AutomationState } from '../common';

type History = Awaited<ReturnType<typeof processHistory>>;
const initIdx = Number(new URLSearchParams(location.search).get('idx')) || 0;

const App: React.FC = () => {
  const [current, setCurrent] = useState(initIdx);
  const [history, setHistory] = useState<History>();

  useEffect(() => {
    invoke<AutomationState>('get_state')
      .then(state => {
        if (!state?.history) {
          getCurrentWebviewWindow().close();
          return;
        }
        return processHistory(state.history);
      })
      .then(setHistory);
  }, []);

  return (
    history && (
      <Image.PreviewGroup
        preview={{
          visible: true,
          minScale: 0.1,
          current,
          onVisibleChange: visible => {
            if (!visible) {
              getCurrentWebviewWindow().close();
            }
          },
          onChange: setCurrent,
        }}
      >
        {history.map(action => (
          <Image src={action.src} style={{ display: 'none' }} />
        ))}
      </Image.PreviewGroup>
    )
  );
};

export default App;

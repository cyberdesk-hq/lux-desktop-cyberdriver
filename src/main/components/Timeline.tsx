import React, { useEffect, useState } from 'react';
import { Timeline, TimelineItemProps } from 'antd';
import { invoke } from '@tauri-apps/api/core';
import { processHistory } from '../../common';
import type { Action } from '../../common';

export interface TaskTimelineProps {
  history?: Action[];
  open: boolean;
}

const TaskTimeline: React.FC<TaskTimelineProps> = ({ history, open }) => {
  const [items, setItems] = useState<TimelineItemProps[]>();

  useEffect(() => {
    history &&
      processHistory(history).then(actions =>
        setItems(
          actions.map((action, idx) => ({
            color: 'gray',
            children: (
              <div>
                <p>{action.title}</p>
                <img
                  src={action.src}
                  onClick={e => {
                    e.preventDefault();
                    invoke('open_image_preview', { idx });
                  }}
                />
              </div>
            ),
          })),
        ),
      );
  }, [history]);

  return open && <Timeline items={items} />;
};

export default TaskTimeline;

import { formatAction } from './utils';
import type { Action } from './types';

export const processScreenshot = (screenshot: string, next?: Action) =>
  new Promise<string>(res => {
    switch (next?.action) {
      case 'Click':
      case 'Drag': {
        const image = new window.Image();
        image.src = screenshot;
        image.onload = () => {
          const getCoordinate = (x: number, y: number) =>
            [(x / 1000) * image.width, (y / 1000) * image.height] as const;
          const canvas = document.createElement('canvas');
          canvas.width = image.width;
          canvas.height = image.height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(image, 0, 0);
          if (next.action === 'Click') {
            ctx.beginPath();
            ctx.arc(...getCoordinate(next.x, next.y), 5, 0, 2 * Math.PI);
            ctx.fillStyle = 'red';
            ctx.fill();
          } else {
            const [x1, y1] = getCoordinate(next.x1, next.y1);
            const [x2, y2] = getCoordinate(next.x2, next.y2);
            ctx.beginPath();
            ctx.arc(x1, y1, 5, 0, 2 * Math.PI);
            ctx.fillStyle = 'red';
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            const angle = Math.atan2(y2 - y1, x2 - x1);
            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.lineTo(
              x2 - 10 * Math.cos(angle - Math.PI / 6),
              y2 - 10 * Math.sin(angle - Math.PI / 6),
            );
            ctx.moveTo(x2, y2);
            ctx.lineTo(
              x2 - 10 * Math.cos(angle + Math.PI / 6),
              y2 - 10 * Math.sin(angle + Math.PI / 6),
            );
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(x2, y2, 5, 0, 2 * Math.PI);
            ctx.fillStyle = 'red';
            ctx.fill();
          }
          res(canvas.toDataURL('image/jpeg'));
        };
        break;
      }
      default:
        res(screenshot);
    }
  });

export const processHistory = async (history: Action[]) => {
  const items: { title: string; src: string }[] = [];
  for (let i = 0; i < history.length; ++i) {
    const action = history[i];
    if (action.action === 'Screenshot') {
      const src = `data:image/jpeg;base64,${action.screenshot}`;
      if (i === history.length - 1 || history[i + 1].action === 'Screenshot') {
        items.push({
          title: formatAction(action),
          src,
        });
      } else {
        for (
          let j = i + 1;
          j < history.length && history[j].action !== 'Screenshot';
          ++j
        ) {
          const next = history[j];
          items.push({
            title: formatAction(history[j]),
            src: await processScreenshot(src, next),
          });
        }
      }
    }
  }
  return items;
};

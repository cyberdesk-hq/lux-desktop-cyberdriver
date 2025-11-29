import React from 'react';
import classnames from 'classnames';

export interface ArrowIconProps {
  className?: string;
  direction: 'up' | 'down' | 'left' | 'right';
}

const PATH: Record<ArrowIconProps['direction'], string> = {
  up: 'M20.625 18L15 12.375L9.375 18',
  down: 'M20.625 12L15 17.625L9.375 12',
  left: 'M18 20.625L12.375 15L18 9.375',
  right: 'M12 20.625L17.625 15L12 9.375',
};

const ArrowIcon: React.FC<ArrowIconProps> = ({ className, direction }) => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 30 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={classnames('shrink-0', className)}
  >
    <path
      d={PATH[direction]}
      stroke="#525252"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default ArrowIcon;

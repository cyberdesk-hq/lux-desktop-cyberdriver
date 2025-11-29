import React from 'react';
import classnames from 'classnames';

export interface RunningIconProps {
  className?: string;
}

const RunningIcon: React.FC<RunningIconProps> = ({ className }) => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 30 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={classnames('shrink-0', className)}
  >
    <circle cx="6" cy="15" r="3" fill="#939DB4" />
    <circle cx="14" cy="15" r="3" fill="#939DB4" />
    <circle cx="22" cy="15" r="3" fill="#939DB4" />
  </svg>
);

export default RunningIcon;

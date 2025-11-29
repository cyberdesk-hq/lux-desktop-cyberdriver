import React from 'react';
import classnames from 'classnames';

export interface OptionsIconProps {
  className?: string;
}

const OptionsIcon: React.FC<OptionsIconProps> = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={classnames('shrink-0', className)}
  >
    <path
      d="M18.1663 13.8104C17.2582 13.8104 16.522 13.0743 16.522 12.1662C16.522 11.2581 17.2582 10.522 18.1663 10.522C19.0743 10.522 19.8105 11.2581 19.8105 12.1662C19.8105 13.0743 19.0743 13.8104 18.1663 13.8104Z"
      stroke="#525252"
      strokeLinecap="round"
    />
    <path
      d="M6.12225 13.8105C5.21417 13.8105 4.47802 13.0743 4.47802 12.1663C4.47802 11.2582 5.21417 10.522 6.12225 10.522C7.03034 10.522 7.76647 11.2582 7.76647 12.1663C7.76647 13.0743 7.03034 13.8105 6.12225 13.8105Z"
      stroke="#525252"
      strokeLinecap="round"
    />
    <path
      d="M12.1223 13.8104C11.2142 13.8104 10.478 13.0743 10.478 12.1662C10.478 11.2581 11.2142 10.522 12.1223 10.522C13.0303 10.522 13.7665 11.2581 13.7665 12.1662C13.7665 13.0743 13.0303 13.8104 12.1223 13.8104Z"
      stroke="#525252"
      strokeLinecap="round"
    />
  </svg>
);

export default OptionsIcon;

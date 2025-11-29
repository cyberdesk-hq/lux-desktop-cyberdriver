import React from 'react';
import classnames from 'classnames';
import styles from './StopIcon.module.less';

export interface StopIconProps {
  className?: string;
}

const StopIcon: React.FC<StopIconProps> = ({ className }) => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 30 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={classnames('shrink-0 shadow-lg', styles.stopicon, className)}
  >
    <use href="#stop-normal" className={styles.normal} />
    <use href="#stop-hover" className={styles.hover} />
    <use href="#stop-active" className={styles.active} />
    <symbol id="stop-normal" viewBox="0 0 30 30">
      <g filter="url(#filter0_ddd_54_584)">
        <rect width="30" height="30" rx="15" fill="white" />
        <rect x="10" y="10" width="10" height="10" rx="1" fill="#4EACDB" />
      </g>
      <defs>
        <filter
          id="filter0_ddd_54_584"
          x="-4"
          y="-4"
          width="78"
          height="110"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="0.5" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_54_584"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology
            radius="8"
            operator="erode"
            in="SourceAlpha"
            result="effect2_dropShadow_54_584"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="16" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_54_584"
            result="effect2_dropShadow_54_584"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology
            radius="8"
            operator="erode"
            in="SourceAlpha"
            result="effect3_dropShadow_54_584"
          />
          <feOffset dy="32" />
          <feGaussianBlur stdDeviation="16" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0"
          />
          <feBlend
            mode="normal"
            in2="effect2_dropShadow_54_584"
            result="effect3_dropShadow_54_584"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect3_dropShadow_54_584"
            result="shape"
          />
        </filter>
      </defs>
    </symbol>
    <symbol id="stop-hover" viewBox="0 0 30 30">
      <g filter="url(#filter0_ddd_54_586)">
        <rect width="30" height="30" rx="15" fill="#EEF7FC" />
        <rect x="10" y="10" width="10" height="10" rx="1" fill="#4EACDB" />
      </g>
      <defs>
        <filter
          id="filter0_ddd_54_586"
          x="-4"
          y="0"
          width="78"
          height="110"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="0.5" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_54_586"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology
            radius="8"
            operator="erode"
            in="SourceAlpha"
            result="effect2_dropShadow_54_586"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="16" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_54_586"
            result="effect2_dropShadow_54_586"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology
            radius="8"
            operator="erode"
            in="SourceAlpha"
            result="effect3_dropShadow_54_586"
          />
          <feOffset dy="32" />
          <feGaussianBlur stdDeviation="16" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0"
          />
          <feBlend
            mode="normal"
            in2="effect2_dropShadow_54_586"
            result="effect3_dropShadow_54_586"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect3_dropShadow_54_586"
            result="shape"
          />
        </filter>
      </defs>
    </symbol>
    <symbol id="stop-active" viewBox="0 0 30 30">
      <g filter="url(#filter0_di_54_588)">
        <rect
          width="30"
          height="30"
          rx="15"
          fill="#EEF7FC"
          shapeRendering="crispEdges"
        />
        <rect x="11" y="11" width="8" height="8" rx="1" fill="#4EACDB" />
      </g>
      <defs>
        <filter
          id="filter0_di_54_588"
          x="0"
          y="0"
          width="30"
          height="33"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology
            radius="6"
            operator="erode"
            in="SourceAlpha"
            result="effect1_dropShadow_54_588"
          />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="3" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_54_588"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_54_588"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="3" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.795848 0 0 0 0 0.819563 0 0 0 0 0.861065 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect2_innerShadow_54_588"
          />
        </filter>
      </defs>
    </symbol>
  </svg>
);

export default StopIcon;

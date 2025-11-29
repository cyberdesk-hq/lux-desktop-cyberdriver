import React from 'react';
import classnames from 'classnames';
import styles from './SendIcon.module.less';

export interface SendIconProps {
  className?: string;
  disabled?: boolean;
}

const SendIcon: React.FC<SendIconProps> = ({ className, disabled }) => (
  <svg
    width="61"
    height="38"
    viewBox="0 0 61 38"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={classnames(
      'shrink-0 shadow-lg',
      styles.sendicon,
      disabled && styles.disabled,
      className,
    )}
  >
    <use href="#send-disabled" className={styles.disabled} />
    <use href="#send-idle" className={styles.idle} />
    <use href="#send-hover" className={styles.hover} />
    <use href="#send-active" className={styles.active} />
    <symbol id="send-disabled" viewBox="0 0 61 38">
      <path
        d="M0 8C0 3.58172 3.58172 0 8 0H53.0036C57.4218 0 61.0036 3.58172 61.0036 8V30C61.0036 34.4183 57.4218 38 53.0036 38H8C3.58173 38 0 34.4183 0 30V8Z"
        fill="#DBDFE6"
      />
      <path
        d="M9.32 20.168V18.904H12.328C12.9787 18.904 13.48 18.7387 13.832 18.408C14.184 18.0773 14.36 17.6293 14.36 17.064C14.36 16.5307 14.184 16.088 13.832 15.736C13.4907 15.384 12.9947 15.208 12.344 15.208H9.32V13.896H12.392C13.096 13.896 13.7093 14.0347 14.232 14.312C14.7547 14.5787 15.1547 14.9467 15.432 15.416C15.72 15.8853 15.864 16.424 15.864 17.032C15.864 17.6613 15.72 18.2107 15.432 18.68C15.1547 19.1493 14.7547 19.5173 14.232 19.784C13.7093 20.04 13.096 20.168 12.392 20.168H9.32ZM8.312 25V13.896H9.816V25H8.312ZM14.712 25L10.68 20.024L12.104 19.528L16.616 25H14.712ZM20.6358 25.16C20.0171 25.16 19.4571 25.0213 18.9558 24.744C18.4651 24.456 18.0811 24.0613 17.8038 23.56C17.5264 23.0587 17.3878 22.4773 17.3878 21.816V17.4H18.8278V21.752C18.8278 22.168 18.8971 22.5307 19.0358 22.84C19.1851 23.1387 19.3984 23.368 19.6758 23.528C19.9531 23.688 20.2784 23.768 20.6518 23.768C21.2171 23.768 21.6598 23.592 21.9798 23.24C22.2998 22.8773 22.4598 22.3813 22.4598 21.752V17.4H23.8998V21.816C23.8998 22.4773 23.7611 23.0587 23.4838 23.56C23.2064 24.0613 22.8224 24.456 22.3318 24.744C21.8518 25.0213 21.2864 25.16 20.6358 25.16ZM30.8858 25V20.568C30.8858 19.992 30.7044 19.5173 30.3418 19.144C29.9791 18.7707 29.5098 18.584 28.9338 18.584C28.5498 18.584 28.2084 18.6693 27.9098 18.84C27.6111 19.0107 27.3764 19.2453 27.2058 19.544C27.0351 19.8427 26.9498 20.184 26.9498 20.568L26.3578 20.232C26.3578 19.656 26.4858 19.144 26.7418 18.696C26.9978 18.248 27.3551 17.896 27.8138 17.64C28.2724 17.3733 28.7898 17.24 29.3658 17.24C29.9418 17.24 30.4484 17.384 30.8858 17.672C31.3338 17.96 31.6858 18.3387 31.9418 18.808C32.1978 19.2667 32.3258 19.7573 32.3258 20.28V25H30.8858ZM25.5098 25V17.4H26.9498V25H25.5098Z"
        fill="white"
      />
      <path
        d="M44 19.0009L54.0036 18.999M54.0036 18.999L51.3103 16.3057M54.0036 18.999L51.3103 21.6923"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </symbol>
    <symbol id="send-idle" viewBox="0 0 61 38">
      <g filter="url(#filter0_di_22_892)">
        <rect
          width="61.0036"
          height="38"
          rx="8"
          fill="#4EACDB"
          shapeRendering="crispEdges"
        />
        <path
          d="M10.32 20.168V18.904H13.328C13.9787 18.904 14.48 18.7387 14.832 18.408C15.184 18.0773 15.36 17.6293 15.36 17.064C15.36 16.5307 15.184 16.088 14.832 15.736C14.4907 15.384 13.9947 15.208 13.344 15.208H10.32V13.896H13.392C14.096 13.896 14.7093 14.0347 15.232 14.312C15.7547 14.5787 16.1547 14.9467 16.432 15.416C16.72 15.8853 16.864 16.424 16.864 17.032C16.864 17.6613 16.72 18.2107 16.432 18.68C16.1547 19.1493 15.7547 19.5173 15.232 19.784C14.7093 20.04 14.096 20.168 13.392 20.168H10.32ZM9.312 25V13.896H10.816V25H9.312ZM15.712 25L11.68 20.024L13.104 19.528L17.616 25H15.712ZM21.6358 25.16C21.0171 25.16 20.4571 25.0213 19.9558 24.744C19.4651 24.456 19.0811 24.0613 18.8038 23.56C18.5264 23.0587 18.3878 22.4773 18.3878 21.816V17.4H19.8278V21.752C19.8278 22.168 19.8971 22.5307 20.0358 22.84C20.1851 23.1387 20.3984 23.368 20.6758 23.528C20.9531 23.688 21.2784 23.768 21.6518 23.768C22.2171 23.768 22.6598 23.592 22.9798 23.24C23.2998 22.8773 23.4598 22.3813 23.4598 21.752V17.4H24.8998V21.816C24.8998 22.4773 24.7611 23.0587 24.4838 23.56C24.2064 24.0613 23.8224 24.456 23.3318 24.744C22.8518 25.0213 22.2864 25.16 21.6358 25.16ZM31.8858 25V20.568C31.8858 19.992 31.7044 19.5173 31.3418 19.144C30.9791 18.7707 30.5098 18.584 29.9338 18.584C29.5498 18.584 29.2084 18.6693 28.9098 18.84C28.6111 19.0107 28.3764 19.2453 28.2058 19.544C28.0351 19.8427 27.9498 20.184 27.9498 20.568L27.3578 20.232C27.3578 19.656 27.4858 19.144 27.7418 18.696C27.9978 18.248 28.3551 17.896 28.8138 17.64C29.2724 17.3733 29.7898 17.24 30.3658 17.24C30.9418 17.24 31.4484 17.384 31.8858 17.672C32.3338 17.96 32.6858 18.3387 32.9418 18.808C33.1978 19.2667 33.3258 19.7573 33.3258 20.28V25H31.8858ZM26.5098 25V17.4H27.9498V25H26.5098Z"
          fill="white"
        />
        <path
          d="M43 19.0009L53.0036 18.999M53.0036 18.999L50.3103 16.3057M53.0036 18.999L50.3103 21.6923"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <filter
          id="filter0_di_22_892"
          x="0"
          y="0"
          width="61.0036"
          height="44"
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
            result="effect1_dropShadow_22_892"
          />
          <feOffset dy="6" />
          <feGaussianBlur stdDeviation="3" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_22_892"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_22_892"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect2_innerShadow_22_892"
          />
        </filter>
      </defs>
    </symbol>
    <symbol id="send-hover" viewBox="0 0 61 38">
      <g filter="url(#filter0_di_22_896)">
        <path
          d="M0 8C0 3.58172 3.58172 0 8 0H53.0036C57.4218 0 61.0036 3.58172 61.0036 8V30C61.0036 34.4183 57.4218 38 53.0036 38H8C3.58173 38 0 34.4183 0 30V8Z"
          fill="#2A95CB"
          shapeRendering="crispEdges"
        />
        <path
          d="M8 0.5H53.0039C57.1459 0.500183 60.5039 3.85798 60.5039 8V30C60.5039 34.142 57.1459 37.4998 53.0039 37.5H8C3.85787 37.5 0.5 34.1421 0.5 30V8C0.5 3.85786 3.85786 0.5 8 0.5Z"
          stroke="#686868"
          strokeOpacity="0.32"
          shapeRendering="crispEdges"
        />
        <path
          d="M9.32 20.168V18.904H12.328C12.9787 18.904 13.48 18.7387 13.832 18.408C14.184 18.0773 14.36 17.6293 14.36 17.064C14.36 16.5307 14.184 16.088 13.832 15.736C13.4907 15.384 12.9947 15.208 12.344 15.208H9.32V13.896H12.392C13.096 13.896 13.7093 14.0347 14.232 14.312C14.7547 14.5787 15.1547 14.9467 15.432 15.416C15.72 15.8853 15.864 16.424 15.864 17.032C15.864 17.6613 15.72 18.2107 15.432 18.68C15.1547 19.1493 14.7547 19.5173 14.232 19.784C13.7093 20.04 13.096 20.168 12.392 20.168H9.32ZM8.312 25V13.896H9.816V25H8.312ZM14.712 25L10.68 20.024L12.104 19.528L16.616 25H14.712ZM20.6358 25.16C20.0171 25.16 19.4571 25.0213 18.9558 24.744C18.4651 24.456 18.0811 24.0613 17.8038 23.56C17.5264 23.0587 17.3878 22.4773 17.3878 21.816V17.4H18.8278V21.752C18.8278 22.168 18.8971 22.5307 19.0358 22.84C19.1851 23.1387 19.3984 23.368 19.6758 23.528C19.9531 23.688 20.2784 23.768 20.6518 23.768C21.2171 23.768 21.6598 23.592 21.9798 23.24C22.2998 22.8773 22.4598 22.3813 22.4598 21.752V17.4H23.8998V21.816C23.8998 22.4773 23.7611 23.0587 23.4838 23.56C23.2064 24.0613 22.8224 24.456 22.3318 24.744C21.8518 25.0213 21.2864 25.16 20.6358 25.16ZM30.8858 25V20.568C30.8858 19.992 30.7044 19.5173 30.3418 19.144C29.9791 18.7707 29.5098 18.584 28.9338 18.584C28.5498 18.584 28.2084 18.6693 27.9098 18.84C27.6111 19.0107 27.3764 19.2453 27.2058 19.544C27.0351 19.8427 26.9498 20.184 26.9498 20.568L26.3578 20.232C26.3578 19.656 26.4858 19.144 26.7418 18.696C26.9978 18.248 27.3551 17.896 27.8138 17.64C28.2724 17.3733 28.7898 17.24 29.3658 17.24C29.9418 17.24 30.4484 17.384 30.8858 17.672C31.3338 17.96 31.6858 18.3387 31.9418 18.808C32.1978 19.2667 32.3258 19.7573 32.3258 20.28V25H30.8858ZM25.5098 25V17.4H26.9498V25H25.5098Z"
          fill="white"
        />
        <path
          d="M44 19.0009L54.0036 18.999M54.0036 18.999L51.3103 16.3057M54.0036 18.999L51.3103 21.6923"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <filter
          id="filter0_di_22_896"
          x="0"
          y="0"
          width="61.0036"
          height="44"
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
            result="effect1_dropShadow_22_896"
          />
          <feOffset dy="6" />
          <feGaussianBlur stdDeviation="3" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_22_896"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_22_896"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect2_innerShadow_22_896"
          />
        </filter>
      </defs>
    </symbol>
    <symbol id="send-active" viewBox="0 0 61 38">
      <g filter="url(#filter0_di_22_900)">
        <path
          d="M0 8C0 3.58172 3.58172 0 8 0H53.0036C57.4218 0 61.0036 3.58172 61.0036 8V30C61.0036 34.4183 57.4218 38 53.0036 38H8C3.58173 38 0 34.4183 0 30V8Z"
          fill="#2A95CB"
          shapeRendering="crispEdges"
        />
        <path
          d="M8 0.5H53.0039C57.1459 0.500183 60.5039 3.85798 60.5039 8V30C60.5039 34.142 57.1459 37.4998 53.0039 37.5H8C3.85787 37.5 0.5 34.1421 0.5 30V8C0.5 3.85786 3.85786 0.5 8 0.5Z"
          stroke="#686868"
          strokeOpacity="0.32"
          shapeRendering="crispEdges"
        />
        <path
          d="M9.32 20.168V18.904H12.328C12.9787 18.904 13.48 18.7387 13.832 18.408C14.184 18.0773 14.36 17.6293 14.36 17.064C14.36 16.5307 14.184 16.088 13.832 15.736C13.4907 15.384 12.9947 15.208 12.344 15.208H9.32V13.896H12.392C13.096 13.896 13.7093 14.0347 14.232 14.312C14.7547 14.5787 15.1547 14.9467 15.432 15.416C15.72 15.8853 15.864 16.424 15.864 17.032C15.864 17.6613 15.72 18.2107 15.432 18.68C15.1547 19.1493 14.7547 19.5173 14.232 19.784C13.7093 20.04 13.096 20.168 12.392 20.168H9.32ZM8.312 25V13.896H9.816V25H8.312ZM14.712 25L10.68 20.024L12.104 19.528L16.616 25H14.712ZM20.6358 25.16C20.0171 25.16 19.4571 25.0213 18.9558 24.744C18.4651 24.456 18.0811 24.0613 17.8038 23.56C17.5264 23.0587 17.3878 22.4773 17.3878 21.816V17.4H18.8278V21.752C18.8278 22.168 18.8971 22.5307 19.0358 22.84C19.1851 23.1387 19.3984 23.368 19.6758 23.528C19.9531 23.688 20.2784 23.768 20.6518 23.768C21.2171 23.768 21.6598 23.592 21.9798 23.24C22.2998 22.8773 22.4598 22.3813 22.4598 21.752V17.4H23.8998V21.816C23.8998 22.4773 23.7611 23.0587 23.4838 23.56C23.2064 24.0613 22.8224 24.456 22.3318 24.744C21.8518 25.0213 21.2864 25.16 20.6358 25.16ZM30.8858 25V20.568C30.8858 19.992 30.7044 19.5173 30.3418 19.144C29.9791 18.7707 29.5098 18.584 28.9338 18.584C28.5498 18.584 28.2084 18.6693 27.9098 18.84C27.6111 19.0107 27.3764 19.2453 27.2058 19.544C27.0351 19.8427 26.9498 20.184 26.9498 20.568L26.3578 20.232C26.3578 19.656 26.4858 19.144 26.7418 18.696C26.9978 18.248 27.3551 17.896 27.8138 17.64C28.2724 17.3733 28.7898 17.24 29.3658 17.24C29.9418 17.24 30.4484 17.384 30.8858 17.672C31.3338 17.96 31.6858 18.3387 31.9418 18.808C32.1978 19.2667 32.3258 19.7573 32.3258 20.28V25H30.8858ZM25.5098 25V17.4H26.9498V25H25.5098Z"
          fill="white"
        />
        <path
          d="M44 19.0009L54.0036 18.999M54.0036 18.999L51.3103 16.3057M54.0036 18.999L51.3103 21.6923"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <filter
          id="filter0_di_22_900"
          x="0"
          y="0"
          width="61.0036"
          height="44"
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
            result="effect1_dropShadow_22_900"
          />
          <feOffset dy="6" />
          <feGaussianBlur stdDeviation="3" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_22_900"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_22_900"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="1.65" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.234562 0 0 0 0 0.55071 0 0 0 0 0.710261 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect2_innerShadow_22_900"
          />
        </filter>
      </defs>
    </symbol>
  </svg>
);

export default SendIcon;

import React from 'react';

const ConnectSphereLogo = ({ width = 100, height = 100 }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff6ec4" />
          <stop offset="100%" stopColor="#7873f5" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="55" fill="url(#grad)" />
      <circle cx="40" cy="40" r="8" fill="#fff" />
      <circle cx="80" cy="40" r="8" fill="#fff" />
      <circle cx="60" cy="75" r="8" fill="#fff" />
      <line x1="40" y1="40" x2="80" y2="40" stroke="#fff" strokeWidth="3" />
      <line x1="40" y1="40" x2="60" y2="75" stroke="#fff" strokeWidth="3" />
      <line x1="80" y1="40" x2="60" y2="75" stroke="#fff" strokeWidth="3" />
      <text
        x="60"
        y="115"
        fontFamily="Arial, sans-serif"
        fontSize="16"
        fill="#444"
        textAnchor="middle"
        fontWeight="bold"
      >
        ConnectSphere
      </text>
    </svg>
  );
};

export default ConnectSphereLogo;

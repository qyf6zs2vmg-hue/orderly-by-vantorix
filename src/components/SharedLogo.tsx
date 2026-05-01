import React from 'react';

export const LogoSVG = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 20L4 6H9L12 14L15 6H20L12 20Z" fill="url(#brandGrad)"/>
    <defs>
      <linearGradient id="brandGrad" x1="4" y1="6" x2="20" y2="20" gradientUnits="userSpaceOnUse">
        <stop stopColor="#8B5E34"/>
        <stop offset="1" stopColor="#D9B08C"/>
      </linearGradient>
    </defs>
  </svg>
);

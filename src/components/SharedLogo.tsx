import React from 'react';

interface LogoProps {
  className?: string;
  showTitle?: boolean;
  showSlogan?: boolean;
  showIcon?: boolean;
  horizontal?: boolean;
}

export const LogoSVG = ({ 
  className = "w-6 h-6", 
  showTitle = false, 
  showSlogan = false, 
  showIcon = true,
  horizontal = false 
}: LogoProps) => (
  <div className={`flex ${horizontal ? 'flex-row items-center gap-5' : 'flex-col items-center'}`}>
    {showIcon && (
      <div className={`${className} flex items-center justify-center overflow-hidden`}>
        <img 
          src="https://lh3.googleusercontent.com/d/1sUV6QEE_PV4M8p0fNq132JddevCDasqs" 
          alt="Vantorix Logo" 
          className="w-full h-full object-contain brightness-105 contrast-110 drop-shadow-sm" 
          referrerPolicy="no-referrer"
          style={{ imageRendering: 'high-quality' as any }}
        />
      </div>
    )}
    {(showTitle || showSlogan) && (
      <div className={`flex flex-col ${horizontal ? 'items-start' : 'items-center'} animate-in fade-in slide-in-from-bottom-3 duration-1000`}>
        {showTitle && (
          <h1 className={`${horizontal ? 'text-xl' : 'text-3xl'} font-black tracking-[0.25em] text-text-main uppercase`}>
            Vantorix Orders
          </h1>
        )}
        {showSlogan && (
          <span className={`${horizontal ? 'text-[11px]' : 'text-[12px] sm:text-[14px]'} font-black tracking-[0.5em] bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent bg-clip-text text-transparent uppercase mt-2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]`}>
            Make it possible
          </span>
        )}
      </div>
    )}
  </div>
);

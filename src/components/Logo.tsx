import React from 'react';

interface LogoProps {
  className?: string;
  light?: boolean;
}

export default function Logo({ className = '', light = false }: LogoProps) {
  const textColor = light ? 'text-[#F4EBD7]' : 'text-[#1A1108]';
  const strokeColor = light ? '#1A1108' : '#F4EBD7';
  const accentColor = '#C9A227'; // Gold brand accent

  return (
    <div id="swipemates-logo" className={`flex items-center gap-3 select-none ${className}`}>
      {/* Premium SVG Icon mirroring the uploaded image */}
      <div className="relative w-12 h-12 flex-shrink-0 drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)]">
        <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Dark blue container matching the uploaded image */}
          <rect width="100" height="100" rx="22" fill="#132338" />
          
          {/* Coral left side of the heart */}
          <path 
            d="M 50 78 C 30 68, 20 50, 20 37 C 20 26, 29 18, 39 18 C 46 18, 50 22, 50 27" 
            stroke="#FA6D5E" 
            strokeWidth="9" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          
          {/* Mint green right side of the heart looping into arrow */}
          <path 
            d="M 50 78 C 70 68, 80 50, 80 37 C 80 26, 71 18, 61 18 C 51 18, 47 26, 51 36 C 54 42, 62 43, 67 37" 
            stroke="#3CD070" 
            strokeWidth="9" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          
          {/* Arrow head on green path pointing up-right */}
          <path 
            d="M 56 36 L 68 37 L 67 25" 
            stroke="#3CD070" 
            strokeWidth="9" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col items-start leading-none">
        <span 
          className={`font-display text-2.5xl sm:text-3xl ${textColor} tracking-tight font-black uppercase`}
          style={{
            textShadow: `3px 3px 0px ${accentColor}, -1px -1px 0px ${strokeColor}, 1px -1px 0px ${strokeColor}, -1px 1px 0px ${strokeColor}, 1px 1px 0px ${strokeColor}`
          }}
        >
          SwipeMates
        </span>
        <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#C9A227] mt-1 font-bold">
          Match &bull; Meet &bull; Vibe
        </span>
      </div>
    </div>
  );
}

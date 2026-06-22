import React from 'react';

interface LogoProps {
  className?: string;
  light?: boolean;
}

export default function Logo({ className = '', light = false }: LogoProps) {
  // Use exact styling from the uploaded image: thick blocky font, lowercase, bottom shifted right.
  const textColor = light ? 'text-[#F4EBD7]' : 'text-[#1A1108]';
  const strokeColor = light ? '#1A1108' : '#F4EBD7';
  const accentColor = '#C9A227'; // Gold brand accent

  return (
    <div id="campus-connect-logo" className={`relative flex flex-col items-center leading-none select-none ${className}`}>
      <div className="flex flex-col items-start">
        {/* campus */}
        <span 
          className={`font-display text-4xl sm:text-5xl md:text-6xl ${textColor} tracking-normal`}
          style={{
            textShadow: `4px 4px 0px ${accentColor}, -1.5px -1.5px 0px ${strokeColor}, 1.5px -1.5px 0px ${strokeColor}, -1.5px 1.5px 0px ${strokeColor}, 1.5px 1.5px 0px ${strokeColor}`
          }}
        >
          campus
        </span>
        {/* connect */}
        <span 
          className={`font-display text-2xl sm:text-3xl md:text-4xl ${textColor} tracking-normal ml-12 sm:ml-16 md:ml-20 -mt-2 sm:-mt-3`}
          style={{
            textShadow: `3px 3px 0px ${accentColor}, -1.5px -1.5px 0px ${strokeColor}, 1.5px -1.5px 0px ${strokeColor}, -1.5px 1.5px 0px ${strokeColor}, 1.5px 1.5px 0px ${strokeColor}`
          }}
        >
          connect
        </span>
      </div>
    </div>
  );
}

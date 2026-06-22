import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Compass, Sparkles, Navigation } from 'lucide-react';

interface IndiaMapProps {
  selectedCampus: 'all' | 'du' | 'iitb' | 'ashoka' | 'christ';
  onSelectCampus: (campus: 'all' | 'du' | 'iitb' | 'ashoka' | 'christ') => void;
}

export default function IndiaMap({ selectedCampus, onSelectCampus }: IndiaMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  // Region outline geometries mapped to 300x350 viewport of India map
  const regions = [
    {
      id: 'north',
      name: 'North Region (DU & Ashoka)',
      path: 'M 140 30 L 155 20 L 155 45 L 170 60 L 160 80 L 180 95 L 200 95 L 165 130 L 130 130 L 105 100 L 125 75 Z',
      campusId: 'du' as const,
      alternateCampusId: 'ashoka' as const,
      description: 'Host of Delhi University circles (Hindu, Hansraj, SRCC) and Ashoka University liberal arts campus.',
      color: 'fill-amber-500/10 stroke-amber-550/40 hover:fill-amber-500/20',
      activeColor: 'fill-[#C9A227]/30 stroke-[#C9A227] stroke-[2px]',
      isActive: selectedCampus === 'du' || selectedCampus === 'ashoka',
    },
    {
      id: 'west',
      name: 'West Region (IIT Bombay)',
      path: 'M 105 130 L 130 130 L 150 170 L 130 200 L 105 190 L 95 165 L 75 160 L 70 135 L 85 120 Z',
      campusId: 'iitb' as const,
      description: 'The premier technical hub of IIT Bombay, including host hostel GC leagues and startup wings.',
      color: 'fill-indigo-500/10 stroke-indigo-550/40 hover:fill-indigo-500/20',
      activeColor: 'fill-indigo-500/35 stroke-indigo-600 stroke-[2px]',
      isActive: selectedCampus === 'iitb',
    },
    {
      id: 'south',
      name: 'South Region (Christ Uni)',
      path: 'M 130 200 L 165 190 L 160 215 L 150 215 L 145 285 L 140 285 L 115 210 L 120 185 L 105 190 Z',
      campusId: 'christ' as const,
      description: 'The green hub of Christ University in Bangalore. Fast transit pools and department fest squads.',
      color: 'fill-emerald-500/10 stroke-emerald-550/40 hover:fill-emerald-500/20',
      activeColor: 'fill-emerald-500/30 stroke-emerald-600 stroke-[2px]',
      isActive: selectedCampus === 'christ',
    },
    {
      id: 'central',
      name: 'East & Central Region (General Hub)',
      path: 'M 155 45 L 200 95 L 215 105 L 265 105 L 275 110 L 275 125 L 255 130 L 245 120 L 235 120 L 225 135 L 215 135 L 210 115 L 200 115 L 195 135 L 215 170 L 190 190 L 165 190 L 150 170 Z',
      campusId: 'all' as const,
      description: 'Bengal, Bihar, Central MP, and Northeast. Gateway to all regional circles and broad student pools.',
      color: 'fill-[#1A1108]/5 stroke-[#1A1108]/15 hover:fill-[#1A1108]/10',
      activeColor: 'fill-[#1A1108]/15 stroke-[#1A1108] stroke-[2.5px]',
      isActive: selectedCampus === 'all',
    }
  ];

  // Specific Coordinate Pins
  const pins = [
    { name: 'DU Circle', norm: 'du', x: 145, y: 95, campusId: 'du' as const },
    { name: 'Ashoka Uni', norm: 'ashoka', x: 135, y: 110, campusId: 'ashoka' as const },
    { name: 'IIT Bombay', norm: 'iitb', x: 105, y: 175, campusId: 'iitb' as const },
    { name: 'Christ Uni', norm: 'christ', x: 135, y: 245, campusId: 'christ' as const },
  ];

  const handleRegionClick = (region: typeof regions[number]) => {
    if (region.id === 'north') {
      // Toggle between DU and Ashoka
      if (selectedCampus === 'du') {
        onSelectCampus('ashoka');
      } else {
        onSelectCampus('du');
      }
    } else {
      onSelectCampus(region.campusId);
    }
  };

  const getRegionDetails = () => {
    if (hoveredRegion) {
      return regions.find((r) => r.id === hoveredRegion);
    }
    const active = regions.find((r) => r.isActive);
    return active || regions[3];
  };

  const activeDetails = getRegionDetails();

  return (
    <div id="interactive-india-map" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#1A1108]/5 p-6 rounded-3xl border border-[#1A1108]/15 max-w-4xl mx-auto w-full mb-14">
      
      {/* Column 1: Interactive SVG Map (7 Cols) */}
      <div className="lg:col-span-7 flex justify-center relative select-none">
        <div className="w-full max-w-[340px] aspect-[300/350] relative bg-white/45 backdrop-blur-sm border border-[#1A1108]/10 p-4 rounded-2xl shadow-inner overflow-hidden">
          
          <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[#1A1108]/50 text-[10px] uppercase font-bold tracking-wider font-mono">
            <Compass className="w-3.5 h-3.5 animate-spin" />
            <span>GEO ENGINE BETA</span>
          </div>

          <svg 
            viewBox="0 0 300 350" 
            className="w-full h-full filter drop-shadow-sm transition-all"
          >
            {/* Base Outline Silhouette of India for recognizable backdrop */}
            <path
              d="M 120 50 L 145 20 L 155 20 L 155 45 L 170 60 L 160 80 L 180 95 L 200 95 L 215 105 L 265 105 L 275 110 L 275 125 L 255 130 L 245 120 L 235 120 L 225 135 L 215 135 L 210 115 L 200 115 L 195 135 L 215 170 L 190 190 L 175 190 L 160 215 L 150 215 L 145 285 L 140 285 L 115 210 L 120 185 L 110 185 L 100 165 L 75 160 L 70 135 L 85 120 L 105 130 L 115 115 L 105 100 Z"
              className="fill-neutral-100 stroke-[#1A1108]/20 stroke-[1.5px] transition-colors"
            />

            {/* Clickable region paths */}
            {regions.map((region) => (
              <path
                key={region.id}
                d={region.path}
                className={`cursor-pointer transition-all duration-300 ${
                  region.isActive ? region.activeColor : region.color
                }`}
                onMouseEnter={() => setHoveredRegion(region.id)}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={() => handleRegionClick(region)}
              />
            ))}

            {/* Glowing coordinate nodes with pulsating ripple circles */}
            {pins.map((pin) => {
              const isPinActive = selectedCampus === pin.campusId;
              return (
                <g 
                  key={pin.name} 
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCampus(pin.campusId);
                  }}
                >
                  {/* pulsating ripple */}
                  <circle
                    cx={pin.x}
                    cy={pin.y}
                    r="8"
                    className={`animate-ping fill-current opacity-30 ${
                      isPinActive ? 'text-[#C9A227]' : 'text-[#1A1108]/60'
                    }`}
                  />
                  {/* main outer center point */}
                  <circle
                    cx={pin.x}
                    cy={pin.y}
                    r="4"
                    className={`stroke-white stroke-[1px] transition-colors duration-300 ${
                      isPinActive ? 'fill-[#C9A227]' : 'fill-[#1A1108]'
                    }`}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Column 2: Dashboard Info Panel (5 Cols) */}
      <div className="lg:col-span-5 text-left flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center gap-1.5 text-[9px] uppercase font-black text-[#C9A227] tracking-widest mb-1.5 font-sans">
            <Sparkles className="w-3.5 h-3.5 fill-transparent" />
            <span>Region Highlight</span>
          </div>

          <h3 className="font-display text-lg sm:text-xl text-[#1A1108] leading-tight uppercase tracking-tight font-black mb-2 flex items-center gap-2">
            <span>{activeDetails.name}</span>
          </h3>

          <p className="text-xs text-[#1A1108]/75 leading-relaxed font-sans mb-4 min-h-[50px]">
            {activeDetails.description}
          </p>
        </div>

        <div className="border-t border-[#1A1108]/10 pt-4 mt-2 flex flex-col gap-3">
          <div className="text-[10px] text-[#1A1108]/50 uppercase font-black tracking-widest">Active Campus Nodes</div>
          
          <div className="flex flex-wrap gap-2">
            {activeDetails.id === 'north' && (
              <>
                <button
                  type="button"
                  onClick={() => onSelectCampus('du')}
                  className={`text-[10px] px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider border leading-none transition-all ${
                    selectedCampus === 'du'
                      ? 'bg-[#1A1108] text-white border-[#1A1108]'
                      : 'bg-white text-[#1A1108] border-[#1A1108]/15 hover:border-[#1A1108]'
                  }`}
                >
                  Delhi University
                </button>
                <button
                  type="button"
                  onClick={() => onSelectCampus('ashoka')}
                  className={`text-[10px] px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider border leading-none transition-all ${
                    selectedCampus === 'ashoka'
                      ? 'bg-[#1A1108] text-white border-[#1A1108]'
                      : 'bg-white text-[#1A1108] border-[#1A1108]/15 hover:border-[#1A1108]'
                  }`}
                >
                  Ashoka Uni
                </button>
              </>
            )}

            {activeDetails.id === 'west' && (
              <button
                type="button"
                onClick={() => onSelectCampus('iitb')}
                className={`text-[10px] px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider border leading-none transition-all ${
                  selectedCampus === 'iitb'
                    ? 'bg-[#1A1108] text-white border-[#1A1108]'
                    : 'bg-white text-[#1A1108] border-[#1A1108]/15 hover:border-[#1A1108]'
                }`}
              >
                IIT Bombay
              </button>
            )}

            {activeDetails.id === 'south' && (
              <button
                type="button"
                onClick={() => onSelectCampus('christ')}
                className={`text-[10px] px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider border leading-none transition-all ${
                  selectedCampus === 'christ'
                    ? 'bg-[#1A1108] text-white border-[#1A1108]'
                    : 'bg-white text-[#1A1108] border-[#1A1108]/15 hover:border-[#1A1108]'
                }`}
              >
                Christ Uni
              </button>
            )}

            {activeDetails.id === 'central' && (
              <button
                type="button"
                onClick={() => onSelectCampus('all')}
                className="text-[10px] px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider bg-white text-[#1A1108] border border-[#1A1108]/15 hover:border-[#1A1108]"
              >
                View General Circles
              </button>
            )}
          </div>

          <p className="text-[10px] text-[#1A1108]/50 leading-relaxed font-semibold italic flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-[#C9A227] fill-current" />
            <span>Click any region or point node on the map to filter.</span>
          </p>
        </div>
      </div>

    </div>
  );
}

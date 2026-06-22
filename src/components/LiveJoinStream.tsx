import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MapPin, Zap, Flame, Compass } from 'lucide-react';

interface RealtimeJoin {
  id: string;
  name: string;
  college: string;
  city: string;
  major: string;
  timeSecsAgo: number;
  badge: string;
}

const INDIAN_COLLEGES = [
  { name: 'IIT Bombay', city: 'Mumbai' },
  { name: 'BITS Pilani', city: 'Rajasthan' },
  { name: 'SRCC Delhi', city: 'New Delhi' },
  { name: 'IIT Delhi', city: 'New Delhi' },
  { name: 'Ashoka University', city: 'Sonepat' },
  { name: 'Christ University', city: 'Bangalore' },
  { name: 'IIT Madras', city: 'Chennai' },
  { name: 'RV College of Engineering', city: 'Bangalore' },
  { name: 'St. Xavier\'s College', city: 'Mumbai' },
  { name: 'Symbiosis Pune', city: 'Pune' },
  { name: 'Delhi Technological University', city: 'New Delhi' },
  { name: 'LSR Delhi', city: 'New Delhi' },
  { name: 'COEP Technological University', city: 'Pune' },
];

const EN_MAJORS = [
  'Computer Science',
  'Economics',
  'Business Administration',
  'English Literature',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Psychology',
  'Product Design',
  'Finance & Investment',
  'Data Science',
];

const FIRST_NAMES = [
  'Aarav', 'Ananya', 'Rahul', 'Aditya', 'Riya', 'Ishaan', 'Kabir', 'Meera', 'Tanvi', 'Dev',
  'Karan', 'Sneha', 'Zara', 'Siddharth', 'Nikhil', 'Pooja', 'Rohan', 'Kriti', 'Abhishek', 'Prisha'
];

const BADGES = ['✨ Skip Position', '🎒 Verified', '⚡ Early Access', '🔥 Streak Verified', '🌟 Active Scholar'];

export default function LiveJoinStream() {
  const [activeJoins, setActiveJoins] = useState<RealtimeJoin[]>([]);
  const [activeCount, setActiveCount] = useState(48);

  // Generate initial list of past events
  useEffect(() => {
    const initialList: RealtimeJoin[] = [];
    for (let i = 0; i < 3; i++) {
      const colIdx = Math.floor(Math.random() * INDIAN_COLLEGES.length);
      const majIdx = Math.floor(Math.random() * EN_MAJORS.length);
      const nameIdx = Math.floor(Math.random() * FIRST_NAMES.length);
      const badgeIdx = Math.floor(Math.random() * BADGES.length);
      const col = INDIAN_COLLEGES[colIdx];

      initialList.push({
        id: `prev-${i}-${Math.random()}`,
        name: FIRST_NAMES[nameIdx],
        college: col.name,
        city: col.city,
        major: EN_MAJORS[majIdx],
        timeSecsAgo: (i + 1) * 12,
        badge: BADGES[badgeIdx],
      });
    }
    setActiveJoins(initialList);
  }, []);

  // Set up periodic simulated signups to trigger exciting dynamic feed updates
  useEffect(() => {
    const interval = setInterval(() => {
      const colIdx = Math.floor(Math.random() * INDIAN_COLLEGES.length);
      const majIdx = Math.floor(Math.random() * EN_MAJORS.length);
      const nameIdx = Math.floor(Math.random() * FIRST_NAMES.length);
      const badgeIdx = Math.floor(Math.random() * BADGES.length);
      const col = INDIAN_COLLEGES[colIdx];

      const newJoin: RealtimeJoin = {
        id: `join-${Date.now()}-${Math.random()}`,
        name: FIRST_NAMES[nameIdx],
        college: col.name,
        city: col.city,
        major: EN_MAJORS[majIdx],
        timeSecsAgo: 0,
        badge: BADGES[badgeIdx],
      };

      // Add new, drop last if list exceeds size 3 to keep UI compact and beautiful
      setActiveJoins((prev) => {
        const updated = [newJoin, ...prev.map(j => ({ ...j, timeSecsAgo: j.timeSecsAgo + 7 }))];
        return updated.slice(0, 3);
      });

      // Drifting user activity counts
      setActiveCount(prev => {
        const drift = Math.random() > 0.5 ? 1 : -1;
        return Math.max(38, Math.min(84, prev + drift));
      });

    }, 7000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-lg mb-8 mx-auto text-left">
      <div className="flex items-center justify-between mb-3.5 px-1">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] sm:text-xs font-black tracking-widest text-[#1A1108]/70 uppercase font-sans">
            INDIA REGISTRATIONS LIVE
          </span>
        </div>
        <div className="flex items-center gap-1 bg-[#C9A227]/25 px-2 py-0.5 rounded-full border border-[#C9A227]/40 text-[#1A1108]">
          <Flame className="w-3 h-3 text-[#C9A227]" />
          <span className="font-mono text-[10px] font-bold">{activeCount} online now</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {activeJoins.map((join) => (
            <motion.div
              layout
              key={join.id}
              initial={{ opacity: 0, y: 15, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              className="bg-white/70 backdrop-blur-sm border border-[#1A1108]/10 rounded-2xl p-4 flex items-center justify-between transition-all duration-300 hover:border-[#C9A227]/40 hover:bg-white/90 shadow-sm"
            >
              <div className="flex items-center gap-3">
                {/* Visual Avatar Placeholder with warm tone */}
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1A1108] to-[#C9A227] flex items-center justify-center text-[#F4EBD7] font-display text-sm font-bold shadow-md select-none">
                  {join.name[0]}
                </div>

                <div className="text-left leading-tight">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-xs text-[#1A1108]">{join.name}</span>
                    <span className="text-[9px] font-sans text-neutral-500">• {join.major}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-[#1A1108]/75 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#C9A227] flex-shrink-0" />
                    <span className="font-semibold">{join.college}</span>
                    <span className="text-[9px] text-neutral-400 font-mono">({join.city})</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-[8px] font-black tracking-wider text-[#C9A227] bg-[#C9A227]/10 border border-[#C9A227]/25 px-2 py-0.5 rounded-md uppercase font-sans select-none">
                  {join.badge}
                </span>
                <span className="font-mono text-[9px] text-neutral-400">
                  {join.timeSecsAgo === 0 ? 'just now' : `${join.timeSecsAgo}s ago`}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-2.5 px-1.5 flex items-center gap-1.5 text-[10px] text-[#1A1108]/55 font-mono">
        <Compass className="w-3.5 h-3.5" />
        <span>Syncing to verified satellites across 45+ universities in India</span>
      </div>
    </div>
  );
}

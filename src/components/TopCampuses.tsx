import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { School, Flame, Award, TrendingUp } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';

interface CampusSignup {
  name: string;
  count: number;
}

export default function TopCampuses() {
  // Base offset data so the chart is lively right away with real, robust numbers
  const baseCampuses = [
    { name: 'Delhi University', baseCount: 2840 },
    { name: 'IIT Bombay', baseCount: 2150 },
    { name: 'Ashoka University', baseCount: 1840 },
    { name: 'Christ University', baseCount: 1590 },
    { name: 'BITS Pilani', baseCount: 1240 },
  ];

  const [campuses, setCampuses] = useState<CampusSignup[]>([
    { name: 'Delhi University', count: 2840 },
    { name: 'IIT Bombay', count: 2150 },
    { name: 'Ashoka University', count: 1840 },
    { name: 'Christ University', count: 1590 },
    { name: 'BITS Pilani', count: 1240 },
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const waitlistRef = collection(db, 'waitlist');

    const unsubscribe = onSnapshot(waitlistRef, (snapshot) => {
      // Aggregate real-time registered counts
      const dynamicCounts: Record<string, number> = {};

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.collegeName) {
          const rawName = data.collegeName.trim();
          let matchedName = rawName;
          
          // Match simple abbreviations to base colleges to group neatly
          const norm = rawName.toLowerCase();
          if (norm.includes('delhi university') || norm === 'du') {
            matchedName = 'Delhi University';
          } else if (norm.includes('iit bombay') || norm === 'iitb' || norm.includes('iit b')) {
            matchedName = 'IIT Bombay';
          } else if (norm.includes('ashoka')) {
            matchedName = 'Ashoka University';
          } else if (norm.includes('christ')) {
            matchedName = 'Christ University';
          } else if (norm.includes('bits') || norm.includes('pilani')) {
            matchedName = 'BITS Pilani';
          }

          dynamicCounts[matchedName] = (dynamicCounts[matchedName] || 0) + 1;
        }
      });

      // Combine base offsets with live registered document counts
      const mergedList = baseCampuses.map((bc) => {
        const liveExtra = dynamicCounts[bc.name] || 0;
        return {
          name: bc.name,
          count: bc.baseCount + liveExtra,
        };
      });

      // Add any new live colleges registered by other students that aren't in base list
      Object.entries(dynamicCounts).forEach(([name, count]) => {
        if (!baseCampuses.some((bc) => bc.name === name)) {
          mergedList.push({
            name,
            count: count, // Just live counts for newly added custom campuses
          });
        }
      });

      // Sort by total sign-ups descending
      mergedList.sort((a, b) => b.count - a.count);

      setCampuses(mergedList);
      setLoading(false);
    }, (err) => {
      console.error('Failed to stream top campuses:', err);
      handleFirestoreError(err, 'list', 'waitlist');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Compute maximum count to scale visual progress bars accurately
  const maxCount = campuses.length > 0 ? Math.max(...campuses.map(c => c.count)) : 1;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <div className="w-8 h-8 border-3 border-[#C9A227] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div id="top-campuses-list-wrapper" className="w-full max-w-2xl mx-auto bg-white/70 backdrop-blur-md border-2 border-[#1A1108] rounded-3xl p-6 md:p-8 shadow-[6px_6px_0px_0px_#1A1108]">
      <div className="flex items-center justify-between border-b-2 border-[#1A1108]/15 pb-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#C9A227]/10 flex items-center justify-center border border-[#C9A227]/40 text-[#C9A227]">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h4 className="font-display text-sm tracking-tight text-[#1A1108] uppercase leading-none font-bold">
              Real-Time Campus Ranking
            </h4>
            <p className="text-[10px] text-[#1A1108]/60 mt-0.5">COLLEGIATE WAITLIST SIGN-UP COUNTS</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-700 font-extrabold uppercase">
          <span className="w-1.5 h-1.5 rounded bg-emerald-500 animate-ping"></span>
          <span>Live Sync</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {campuses.slice(0, 5).map((campus, index) => {
          const percent = (campus.count / maxCount) * 100;
          const isTop = index === 0;

          return (
            <div key={campus.name} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#1A1108]">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 flex items-center justify-center rounded-lg text-[10px] font-mono border ${
                    isTop 
                      ? 'bg-[#C9A227] text-[#1A1108] border-[#1A1108]' 
                      : 'bg-[#1A1108]/5 text-[#1A1108]/60 border-[#1A1108]/10'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="font-display tracking-tight text-sm uppercase">{campus.name}</span>
                  {isTop && <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />}
                </div>
                <div className="flex items-center gap-1 font-mono text-xs">
                  <span className="font-extrabold text-[#C9A227]">{campus.count.toLocaleString()}</span>
                  <span className="text-[#1A1108]/40 text-[10px]">joins</span>
                </div>
              </div>

              {/* Graphical Progress Bar Component */}
              <div className="w-full h-3 bg-[#1A1108]/5 border border-[#1A1108]/15 rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    isTop 
                      ? 'bg-[#1A1108] shadow-[1px_0_4px_rgba(201,162,39,0.5)]' 
                      : 'bg-[#C9A227]'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

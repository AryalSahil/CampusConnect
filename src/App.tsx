import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { 
  ShieldCheck, 
  MessageSquare, 
  Sparkles, 
  Zap, 
  ArrowRight, 
  HelpCircle, 
  Plus, 
  Minus, 
  Star, 
  CheckCircle, 
  Compass, 
  Share2, 
  Heart, 
  Tv, 
  Smile, 
  Flame, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Send,
  Lock,
  Volume2,
  VolumeX,
  School,
  MapPin,
  X
} from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError } from './lib/firebase';
import Logo from './components/Logo';
import StudentCardsMockup from './components/StudentCardsMockup';
import LiveCounters from './components/LiveCounters';
import WaitlistForm from './components/WaitlistForm';
import LiveJoinStream from './components/LiveJoinStream';
import AdminPanel from './components/AdminPanel';
import IndiaMap from './components/IndiaMap';
import TopCampuses from './components/TopCampuses';

import avatarAnanya from './assets/images/indian_student_avatar_1782091046623.jpg';
import avatarAarav from './assets/images/student_mr_fresher_1782092440055.jpg';
import avatarMeera from './assets/images/student_red_cap_1782092477821.jpg';

const defaultAvatarAnanya = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200";
const defaultAvatarAarav = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200";
const defaultAvatarMeera = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200";

const avatarFallbacks: Record<string, string> = {
  ananya: defaultAvatarAnanya,
  aarav: defaultAvatarAarav,
  meera: defaultAvatarMeera
};

export default function App() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [showAdminConsole, setShowAdminConsole] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  
  const handleAvatarLoadError = (e: React.SyntheticEvent<HTMLImageElement, Event>, avatarKey: string) => {
    const backup = avatarFallbacks[avatarKey];
    const target = e.currentTarget;
    if (backup && !target.src.includes('avatar') && !target.src.includes('dicebear')) {
      target.src = backup;
    } else {
      target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarKey}`;
    }
  };
  
  // Custom states for dynamic college filter and lo-fi audio player
  const [selectedCampus, setSelectedCampus] = useState<'all' | 'du' | 'iitb' | 'ashoka' | 'christ'>('all');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isPlaying) {
      if (!audioRef.current) {
        // High quality royalty free lo-fi stream link
        audioRef.current = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3');
        audioRef.current.loop = true;
        audioRef.current.volume = 0.35; // Soft ambient blend
      }
      audioRef.current.play().catch(err => {
        console.log("Autoplay blocked or playback issue:", err);
        setIsPlaying(false);
      });
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Real-time Maintenance Mode states from Firestore
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [targetLaunchDate, setTargetLaunchDate] = useState('2026-07-15T12:00:00.000Z');
  const [launchMessage, setLaunchMessage] = useState('We are polishing controls... SwipeMates launching soon.');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Listen to settings/maintenance document in real-time 24/7
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'maintenance'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMaintenanceMode(data.active ?? false);
        setTargetLaunchDate(data.targetLaunchDate ?? '2026-07-15T12:00:00.000Z');
        setLaunchMessage(data.launchMessage ?? 'SwipeMates is currently under scheduled maintenance.');
      }
    }, (err) => {
      console.error("Failed to sync system configuration in real-time:", err);
      handleFirestoreError(err, 'get', 'settings/maintenance');
    });

    return () => unsub();
  }, []);

  // Launch countdown timer ticker logic
  useEffect(() => {
    const timer = setInterval(() => {
      const targetTime = new Date(targetLaunchDate).getTime();
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetLaunchDate]);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(prev => prev === index ? null : index);
  };

  if (showAdminConsole) {
    return <AdminPanel onBackToLanding={() => setShowAdminConsole(false)} />;
  }

  // Intercept normal rendering if Maintenance Mode is active
  if (maintenanceMode) {
    return (
      <div id="maintenance-root" className="min-h-screen flex flex-col justify-between bg-[#1A1108] text-[#F4EBD7] font-sans relative overflow-hidden p-6 select-none selection:bg-[#C9A227]/30 selection:text-white">
        
        {/* Glow Spheres */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C9A227]/10 blur-[150px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[#C9A227]/5 blur-[120px] pointer-events-none rounded-full" />

        {/* Header Block */}
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center z-10">
          <Logo light className="scale-75 origin-left" />
          <span className="text-[9px] font-black tracking-[0.25em] uppercase text-[#C9A227] bg-[#C9A227]/10 px-3.5 py-1 rounded-full border border-[#C9A227]/20 flex items-center gap-1.5 shadow-sm animate-pulse">
            ⚡ Live Launcher Engine Active
          </span>
        </div>

        {/* Central Counter Visuals */}
        <div className="max-w-3xl mx-auto w-full text-center my-auto py-12 z-10 flex flex-col items-center">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/30 px-4 py-1.5 rounded-full mb-6 shadow-xl"
          >
            <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-ping" />
            <span className="font-condensed font-extrabold tracking-[0.15em] text-[10px] uppercase">
              Maintenance Hold Enabled
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl text-white uppercase tracking-tighter leading-none mb-6 max-w-xl"
          >
            Polishing SwipeMates <br />
            <span className="text-[#C9A227]">Controls</span>
          </motion.h1>

          <p className="text-sm text-neutral-400 font-sans max-w-md mx-auto mb-10 leading-relaxed">
            {launchMessage}
          </p>

          {/* Countdown Clock Squares */}
          <div className="grid grid-cols-4 gap-3 sm:gap-6 w-full max-w-md mb-12">
            {[
              { label: 'DAYS', val: timeLeft.days },
              { label: 'HOURS', val: timeLeft.hours },
              { label: 'MINS', val: timeLeft.minutes },
              { label: 'SECS', val: timeLeft.seconds }
            ].map((ring, idx) => (
              <motion.div 
                key={ring.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="bg-[#241A11] border-2 border-neutral-800 rounded-2xl sm:rounded-3xl p-3 sm:p-5 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden border-t-4 border-t-[#C9A227] group hover:border-[#C9A227]/50 transition-all duration-300"
              >
                <div className="text-2xl sm:text-4xl font-black text-white tracking-widest font-mono select-all">
                  {String(ring.val).padStart(2, '0')}
                </div>
                <div className="text-[8px] sm:text-[9px] font-black tracking-widest text-[#C9A227]/80 uppercase mt-1">
                  {ring.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Informational Cards Form */}
          <div className="bg-[#241A11] border border-neutral-800 rounded-3xl p-6 text-left max-w-md w-full shadow-lg border-l-4 border-l-[#C9A227]">
            <h4 className="font-display text-xs uppercase tracking-tight text-white mb-1.5 flex items-center gap-1.5">
              <span>🎒 Pre-Register Waitlist Node</span>
            </h4>
            <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
              Don't lose your spot! The waitlist database is securely logging new entrants in background threads. Standard testing parameters are running active live.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
              <motion.button 
                onClick={() => {
                  // Direct bypass allows entering waitlist form under maintenance
                  setMaintenanceMode(false);
                  setTimeout(() => {
                    const el = document.getElementById('waitlist-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 200);
                }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -2,
                  boxShadow: "0 8px 16px rgba(18, 11, 4, 0.4)",
                  transition: { type: "spring", stiffness: 400, damping: 12 }
                }}
                whileTap={{ scale: 0.95, y: 0 }}
                className="bg-[#C9A227] text-[#1A1108] text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl hover:bg-white transition-all cursor-pointer text-center font-sans"
              >
                Bypass & Join Waitlist &rarr;
              </motion.button>
              <div className="my-auto text-[10px] text-neutral-500 font-mono text-center sm:text-left">
                Active waitlist slots: <span className="text-[#C9A227] font-bold">8,420+ Joined</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer lock gateway link */}
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center gap-4 z-10 text-[10px] text-neutral-500 font-mono border-t border-neutral-800/60 pt-6">
          <span>&copy; 2026 SwipeMates Inc. System locked.</span>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowAdminConsole(true)}
              className="hover:text-[#C9A227] text-neutral-400 transition-colors uppercase tracking-wider font-bold bg-transparent border-0 cursor-pointer flex items-center gap-1 font-condensed"
            >
              <Lock className="w-3.5 h-3.5" /> Staff Console Gateway
            </button>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div id="landing-page-root" className="min-h-screen flex flex-col bg-[#F4EBD7] text-[#1A1108] relative overflow-hidden">
      
      {/* Gold Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-[#C9A227] origin-left z-50 shadow-[0_2px_12px_rgba(201,162,39,0.6)]"
        style={{ scaleX }}
      />
      
      {/* Background Decorative Glow Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C9A227] blur-[150px] opacity-10 pointer-events-none -mr-48 -mt-48 z-0"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#1A1108] blur-[150px] opacity-5 pointer-events-none -ml-32 -mb-32 z-0"></div>

      {/* 1. BRAND STICKY HEADER - BOLD MULTI-COLUMN LAYOUT */}
      <header className="sticky top-0 z-40 w-full bg-[#F4EBD7]/95 backdrop-blur-md border-b border-[#1A1108]/10 h-20 px-4 md:px-10 flex items-center justify-between">
        <div className="flex-1 hidden md:flex items-center">
          <span className="text-[10px] font-black tracking-[0.2em] uppercase text-[#C9A227] bg-[#C9A227]/10 px-3.5 py-1 rounded-full border border-[#C9A227]/20 shadow-sm animate-pulse">
            Early Access v1.0
          </span>
        </div>
        <div className="flex-none">
          {/* Brand Logo */}
          <Logo className="scale-65 sm:scale-75 md:scale-85 hover:scale-90 transition-transform duration-300" />
        </div>
        <div className="flex-1 flex justify-end items-center gap-3 md:gap-6 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#1A1108]/80">
          <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }} className="hidden sm:inline-block hover:text-[#C9A227] transition-colors">How It Works</a>
          <a href="#features-showcase" onClick={(e) => { e.preventDefault(); scrollToSection('features-showcase'); }} className="hidden lg:inline-block hover:text-[#C9A227] transition-colors">Features</a>
          <a href="#faq-section" onClick={(e) => { e.preventDefault(); scrollToSection('faq-section'); }} className="hidden sm:inline-block hover:text-[#C9A227] transition-colors">FAQ</a>
          <motion.button 
            onClick={() => scrollToSection('waitlist-section')}
            whileHover={{ 
              scale: 1.05, 
              y: -1,
              boxShadow: "0 6px 12px rgba(26, 17, 8, 0.25)",
              transition: { type: "spring", stiffness: 400, damping: 12 }
            }}
            whileTap={{ scale: 0.95, y: 0 }}
            className="bg-[#1A1108] text-[#F4EBD7] font-semibold text-[10px] sm:text-xs hover:bg-[#C9A227] hover:text-[#1A1108] tracking-widest uppercase px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-[#C9A227]/30 transition-all cursor-pointer shadow-[2px_2px_0px_0px_#C9A227]"
          >
            Waitlist ⚡
          </motion.button>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section id="hero-banner" className="relative pt-12 pb-24 md:py-32 px-6 overflow-hidden border-b border-[#1A1108]/10 bg-radial from-[#F4EBD7] via-[#F4EBD7] to-[#EBDCB7]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 text-center lg:text-left flex flex-col items-center lg:items-start">
            
            {/* Launching soon badge */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-[#1A1108] text-[#F4EBD7] px-4 py-1.5 rounded-full border border-[#C9A227] mb-6 shadow-[3px_3px_0px_0px_#C9A227]"
            >
              <Zap className="w-3.5 h-3.5 text-[#C9A227] fill-[#C9A227]" />
              <span className="font-condensed font-extrabold tracking-widest text-[11px] uppercase">
                LAUNCHING FALL 2026
              </span>
            </motion.div>

            {/* Apple level Headline - Extremely bold poster typography */}
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[76px] text-[#1A1108] uppercase leading-[0.85] tracking-tighter mb-6 text-center lg:text-left"
              style={{ textShadow: '2px 2px 0px rgba(255, 255, 255, 0.8)' }}
            >
              Meet Students <br />
              <span className="text-[#C9A227]" style={{ textShadow: '2.5px 2.5px 0px #1A1108' }}>
                Beyond Your
              </span> <br />
              Classroom.
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-[#1A1108]/80 max-w-xl mb-10 leading-relaxed font-sans text-center lg:text-left"
            >
              SwipeMates helps premier Indian students across IIT Bombay, BITS Pilani, Delhi University, Ashoka, and other elite hubs discover like-minded peers, collaborate on events, and build authentic connections beyond college boundaries.
            </motion.p>

            {/* CTA buttons */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
            >
              {/* Join Waitlist Button */}
              <motion.button 
                onClick={() => scrollToSection('waitlist-section')}
                id="hero-join-waitlist-btn"
                whileHover={{ 
                  scale: 1.05, 
                  y: -2,
                  boxShadow: "0 10px 20px rgba(26, 17, 8, 0.25)",
                  transition: { type: "spring", stiffness: 400, damping: 12 }
                }}
                whileTap={{ scale: 0.95, y: 0 }}
                className="w-full sm:w-auto bg-[#1A1108] text-[#F4EBD7] font-semibold text-sm hover:bg-[#1A1108]/90 tracking-wide uppercase px-8 py-4.5 rounded-2xl transition-all shadow-[4px_4px_0px_0px_#C9A227] duration-200 cursor-pointer outline-none"
              >
                Join Waitlist ⚡
              </motion.button>

              {/* Notify Me button */}
              <motion.button 
                onClick={() => scrollToSection('waitlist-section')}
                id="hero-notify-launch-btn"
                whileHover={{ 
                  scale: 1.05, 
                  y: -2,
                  backgroundColor: "rgba(26, 17, 8, 0.05)",
                  transition: { type: "spring", stiffness: 400, damping: 12 }
                }}
                whileTap={{ scale: 0.95, y: 0 }}
                className="w-full sm:w-auto border-2 border-[#1A1108] bg-transparent text-[#1A1108] font-bold text-sm tracking-wide uppercase px-8 py-4 rounded-2xl transition-all outline-none"
              >
                Notify Me at Launch
              </motion.button>
            </motion.div>

            {/* Micro social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex items-center gap-3"
            >
              <div className="flex -space-x-3">
                <img className="w-8 h-8 rounded-full border-2 border-[#1A1108] object-cover" src={avatarAnanya} alt="avatar" onError={(e) => handleAvatarLoadError(e, 'ananya')} />
                <img className="w-8 h-8 rounded-full border-2 border-[#1A1108] object-cover" src={avatarAarav} alt="avatar" onError={(e) => handleAvatarLoadError(e, 'aarav')} />
                <img className="w-8 h-8 rounded-full border-2 border-[#1A1108] object-cover" src={avatarMeera} alt="avatar" onError={(e) => handleAvatarLoadError(e, 'meera')} />
              </div>
              <p className="text-xs font-condensed tracking-wider font-extrabold uppercase text-[#1A1108]/70">
                ⭐ Rated 4.9/5 by 300+ Beta Testers
              </p>
            </motion.div>

          </div>

          {/* Hero Right Visual - Interactive Swipable App mock */}
          <div className="lg:col-span-5 flex items-center justify-center relative mt-8 lg:mt-0">
            {/* Background design accents */}
            <div className="absolute w-72 h-72 rounded-full bg-[#C9A227]/20 blur-3xl -z-10 pointer-events-none"></div>
            
            {/* Swipe Mockup */}
            <StudentCardsMockup />
          </div>

        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-24 px-6 bg-[#1A1108] text-[#F4EBD7] border-b border-[#1A1108]">
        <div className="max-w-7xl mx-auto text-center">
          
          <span className="font-condensed font-bold text-xs tracking-widest text-[#C9A227] uppercase bg-[#C9A227]/10 border border-[#C9A227]/30 px-3.5 py-1 rounded-full mb-4">
            SIMPLE DISCOVERY SYSTEM
          </span>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight mt-3 mb-6">
            How It Works
          </h2>

          <p className="text-neutral-400 max-w-xl mx-auto text-sm sm:text-base font-sans mb-16 leading-relaxed">
            Discovery is simple, student-only, and extremely fun. Connect with verified students around campus in just four quick loops:
          </p>

          {/* Animated Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Create Your Profile",
                desc: "Securely sign in with Google. Showcase your majors, grad year, current hobbies, music playlists, and dorm vibes.",
                accent: "text-rose-400"
              },
              {
                step: "02",
                title: "Discover Students",
                desc: "Explore a dynamic stream of undergraduate students from your college and nearby partner colleges.",
                accent: "text-[#C9A227]"
              },
              {
                step: "03",
                title: "Match & Connect",
                desc: "Double-like to match safely. Our strict algorithm pairs you contextually based on mutual college interests.",
                accent: "text-indigo-400"
              },
              {
                step: "04",
                title: "Start Conversations",
                desc: "Break the ice instantly with custom prompts. Exchange notes, organize coffee dates, or join localized student groups.",
                accent: "text-emerald-400"
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -6 }}
                className="bg-[#241A11] border-2 border-neutral-800 rounded-3xl p-6 text-left relative overflow-hidden flex flex-col justify-between shadow-lg"
              >
                {/* Step indicator */}
                <span className={`font-display text-4xl ${item.accent} leading-none mb-4`}>
                  {item.step}
                </span>

                <div>
                  <h4 className="font-display text-lg uppercase tracking-tight text-white mb-2">
                    {item.title}
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. FEATURES SECTION (Grid of Cards) */}
      <section id="features-showcase" className="py-24 px-6 border-b border-[#1A1108]/10 bg-[#F4EBD7]">
        <div className="max-w-7xl mx-auto text-center">
          
          <span className="font-condensed font-bold text-xs tracking-widest text-[#C9A227] uppercase bg-[#C9A227]/10 border border-[#C9A227]/30 px-3.5 py-1 rounded-full mb-3">
            BUILT FOR CAMPUS DYNAMICS
          </span>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-[#1A1108] uppercase tracking-tight mt-3 mb-6">
            The Campus Engine
          </h2>

          <p className="text-[#1A1108]/75 max-w-xl mx-auto text-sm sm:text-base font-sans mb-12 leading-relaxed">
            Engineered from ground-up to facilitate natural collegiate friendships, peer learning cliques, and local college communities.
          </p>

          {/* Interactive Geo-Engine India Map */}
          <IndiaMap selectedCampus={selectedCampus} onSelectCampus={setSelectedCampus} />

          {/* Dynamic University / College Toggle Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-14 max-w-4xl mx-auto bg-[#1A1108]/5 p-1.5 sm:p-2 rounded-[22px] border border-[#1A1108]/10">
            {[
              { id: 'all', name: 'General Hub', icon: <Compass className="w-3.5 h-3.5" /> },
              { id: 'du', name: 'Delhi University', icon: <School className="w-3.5 h-3.5" /> },
              { id: 'iitb', name: 'IIT Bombay', icon: <School className="w-3.5 h-3.5" /> },
              { id: 'ashoka', name: 'Ashoka Uni', icon: <School className="w-3.5 h-3.5" /> },
              { id: 'christ', name: 'Christ Uni', icon: <School className="w-3.5 h-3.5" /> },
            ].map((campus) => (
              <motion.button
                key={campus.id}
                onClick={() => setSelectedCampus(campus.id as any)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl text-[9px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer border min-h-[44px] ${
                  selectedCampus === campus.id
                    ? 'bg-[#1A1108] text-[#F3ECD8] border-[#1A1108] shadow-[2px_2px_0px_0px_#C9A227]'
                    : 'bg-white/70 text-[#1A1108] border-[#1A1108]/15 hover:bg-white hover:border-[#1A1108]'
                }`}
              >
                {campus.icon}
                <span>{campus.name}</span>
              </motion.button>
            ))}
          </div>

          {/* Cards Bento Grid with dynamic state and Hover Animations */}
          {(() => {
            const displayCards = 
              selectedCampus === 'du' ? [
                {
                  title: "Verified DU Circles",
                  desc: "Secure entry gated by certified college list checks. Hindu, Stephens, SRCC, LSR, and Hansraj are fully live.",
                  icon: <ShieldCheck className="w-6 h-6 text-[#C9A227]" />,
                  color: "bg-[#1A1108]",
                  textColor: "text-[#F4EBD7]"
                },
                {
                  title: "Campus Ride & Metro Pool",
                  desc: "Swipe to pair up with fellow students taking the Yellow Line or sharing auto-rickshaws to South Campus hub points.",
                  icon: <Compass className="w-6 h-6 text-indigo-400" />,
                  color: "bg-white",
                  textColor: "text-[#1A1108]"
                },
                {
                  title: "North Campus Chai-Addas",
                  desc: "Special interest channels setup around Sudama tea point, Patel Chest crash zones, and Kamla Nagar food runs.",
                  icon: <Flame className="w-6 h-6 text-amber-500" />,
                  color: "bg-white",
                  textColor: "text-[#1A1108]"
                },
                {
                  title: "DU Fest & Pass Boards",
                  desc: "Never miss out on Crossroads, Mecca, or Tarang. Find fellow club members, trade passes safely & coordinate spots.",
                  icon: <Sparkles className="w-6 h-6 text-[#C9A227]" />,
                  color: "bg-white",
                  textColor: "text-[#1A1108]"
                },
                {
                  title: "Undergrad Review / Rohan",
                  desc: "💬 'Skip the DU peer-isolation. Hansraj is massive, but using this loop I formed a stellar hackathon core squad in 2 days!'",
                  icon: <Smile className="w-6 h-6 text-pink-500" />,
                  color: "bg-[#F3ECD8]",
                  textColor: "text-[#1A1108]"
                },
                {
                  title: "Societies & Clubs",
                  desc: "Find rehearsals, theater cues, debater loops, or MUN partners across colleges seamlessly in real-time.",
                  icon: <Share2 className="w-6 h-6 text-emerald-500" />,
                  color: "bg-[#241A11]",
                  textColor: "text-[#F4EBD7]"
                }
              ] :
              selectedCampus === 'iitb' ? [
                {
                  title: "LDAP Access Gated",
                  desc: "Authenticates via secure .iitb.ac.in credentials to secure high-trust, student-authoritative interactions.",
                  icon: <ShieldCheck className="w-6 h-6 text-[#C9A227]" />,
                  color: "bg-[#1A1108]",
                  textColor: "text-[#F4EBD7]"
                },
                {
                  title: "H12 vs H15 Banter",
                  desc: "Hostel-specific threads for late-night mess reviews, inter-hostel matches, GC prep, or general insti wing gossip.",
                  icon: <Flame className="w-6 h-6 text-red-500" />,
                  color: "bg-white",
                  textColor: "text-[#1A1108]"
                },
                {
                  title: "Mood Indigo Coordinating",
                  desc: "Assemble teams for Asia's largest college fest. Recruit visual artists, musicians, tech handlers, and street crews.",
                  icon: <Sparkles className="w-6 h-6 text-[#C9A227]" />,
                  color: "bg-white",
                  textColor: "text-[#1A1108]"
                },
                {
                  title: "Insti Wing Hub / Anjali",
                  desc: "💬 'Finally in touch with the wider IITB startup & hack wing. The swipe tool filters on actual dev interests and project repos.'",
                  icon: <Smile className="w-6 h-6 text-violet-500" />,
                  color: "bg-[#F3ECD8]",
                  textColor: "text-[#1A1108]"
                },
                {
                  title: "Tuma Tech Circles",
                  desc: "Collaborate on aerospace club logs, autonomous driver systems, web-dev course reviews, or competitive coding pairs.",
                  icon: <MessageSquare className="w-6 h-6 text-sky-500" />,
                  color: "bg-white",
                  textColor: "text-[#1A1108]"
                },
                {
                  title: "Late-Night Dhaba Runs",
                  desc: "Coordinate midnight burger runs, central library tea sessions, or Vihar lake sunset strolls with verified batchmates.",
                  icon: <Compass className="w-6 h-6 text-emerald-500" />,
                  color: "bg-[#241A11]",
                  textColor: "text-[#F4EBD7]"
                }
              ] :
              selectedCampus === 'ashoka' ? [
                {
                  title: "Verified Ashokans Only",
                  desc: "Gated cleanly via official ashoka.edu.in accounts. Enter a secure network designed around liberal-arts dynamics.",
                  icon: <ShieldCheck className="w-6 h-6 text-[#C9A227]" />,
                  color: "bg-[#1A1108]",
                  textColor: "text-[#F4EBD7]"
                },
                {
                  title: "FC Mess & Dhaba Loops",
                  desc: "Compare daily FC menus, coordinate late-night dhaba sandwiches, or organize car-shares to Delhi or Gurugram fests.",
                  icon: <Compass className="w-6 h-6 text-amber-500" />,
                  color: "bg-white",
                  textColor: "text-[#1A1108]"
                },
                {
                  title: "Liberal Arts Debates",
                  desc: "Establish spontaneous reading clubs or debate panels addressing sociology, media theory, economics & philosophy.",
                  icon: <MessageSquare className="w-6 h-6 text-violet-500" />,
                  color: "bg-white",
                  textColor: "text-[#1A1108]"
                },
                {
                  title: "Dorm Lounge Vibe / Kabir",
                  desc: "💬 'We used this to find local board game enthusiasts and draft a 50-person cinema review group during midterms!'",
                  icon: <Smile className="w-6 h-6 text-rose-500" />,
                  color: "bg-[#F3ECD8]",
                  textColor: "text-[#1A1108]"
                },
                {
                  title: "Late-Night Study Lounges",
                  desc: "Coordinate quiet room sessions, check on AC library spaces, or collaborate on final capstone slides in background tabs.",
                  icon: <Sparkles className="w-6 h-6 text-sky-500" />,
                  color: "bg-white",
                  textColor: "text-[#1A1108]"
                },
                {
                  title: "Shuttle Matcher",
                  desc: "Find shuttles from Jahangirpuri metro station or coordinate shares to the closest cyber hub coffee spots easily.",
                  icon: <Share2 className="w-6 h-6 text-emerald-500" />,
                  color: "bg-[#241A11]",
                  textColor: "text-[#F4EBD7]"
                }
              ] :
              selectedCampus === 'christ' ? [
                {
                  title: "Christ University Loops",
                  desc: "Secured via official christuniversity.in login pools. Bypasses general queues for Bangalore student networks.",
                  icon: <ShieldCheck className="w-6 h-6 text-[#C9A227]" />,
                  color: "bg-[#1A1108]",
                  textColor: "text-[#F4EBD7]"
                },
                {
                  title: "SG Palya Commuters",
                  desc: "Say goodbye to lonely, stressful auto journeys. Instantly peer-up to match coordinate bike pools or share cabs.",
                  icon: <Compass className="w-6 h-6 text-[#C9A227]" />,
                  color: "bg-white",
                  textColor: "text-[#1A1108]"
                },
                {
                  title: "Attendance Rescue Panels",
                  desc: "Share notes, lectures summaries, and team assignment assets to counter the dreaded 85% attendance checkpoints.",
                  icon: <Tv className="w-6 h-6 text-rose-500" />,
                  color: "bg-white",
                  textColor: "text-[#1A1108]"
                },
                {
                  title: "Bangalore Cafe Meetups",
                  desc: "Find spots at Koramangala libraries, check on cozy cafes, and explore local live music shows in reliable squads.",
                  icon: <Sparkles className="w-6 h-6 text-indigo-500" />,
                  color: "bg-white",
                  textColor: "text-[#1A1108]"
                },
                {
                  title: "Collegiate Trust / Sneha",
                  desc: "💬 'The absolute lifesaver for commuting students. We curated a support and study hub of 12 Christ classmates here!'",
                  icon: <Smile className="w-6 h-6 text-emerald-500" />,
                  color: "bg-[#F3ECD8]",
                  textColor: "text-[#1A1108]"
                },
                {
                  title: "Department Fest Channels",
                  desc: "Assemble teams for Daksh, In-Bloom, or department project showcases. Trade tips and coordinate rehearsals.",
                  icon: <Share2 className="w-6 h-6 text-[#C9A227]" />,
                  color: "bg-[#241A11]",
                  textColor: "text-[#F4EBD7]"
                }
              ] : [
                {
                  title: "Student Verified Profiles",
                  desc: "No bots, no fake profiles, no spammers. Academic email gating locks security rules tightly.",
                  icon: <ShieldCheck className="w-6 h-6" />,
                  color: "bg-[#1A1108]",
                  textColor: "text-[#F4EBD7]"
                },
                {
                  title: "Swipe & Match",
                  desc: "An ultra-responsive swiping experience that lets you pair on custom hobbies & class schedules.",
                  icon: <Heart className="w-6 h-6 text-[#C9A227]" />,
                  color: "bg-white",
                  textColor: "text-[#1A1108]"
                },
                {
                  title: "Real-Time Chat",
                  desc: "Instant connection with responsive icebreakers. Say goodbye to awkward silences on launch day.",
                  icon: <MessageSquare className="w-6 h-6 text-indigo-500" />,
                  color: "bg-white",
                  textColor: "text-[#1A1108]"
                },
                {
                  title: "College Communities",
                  desc: "Local campus boards sorted by department interests, dormitory hubs, on-campus clubs, and major studies.",
                  icon: <Compass className="w-6 h-6 text-amber-500" />,
                  color: "bg-white",
                  textColor: "text-[#1A1108]"
                },
                {
                  title: "College Stories",
                  desc: "Share daily snaps, class comments, library loops, or late-night study memes directly on campus timeline.",
                  icon: <Tv className="w-6 h-6 text-pink-500" />,
                  color: "bg-white",
                  textColor: "text-[#1A1108]"
                },
                {
                  title: "Group Chats",
                  desc: "Instantly compile study groups, campus bobsleigh teams, carpools, or gig clusters up to 100 students.",
                  icon: <Share2 className="w-6 h-6 text-emerald-500" />,
                  color: "bg-white",
                  textColor: "text-[#1A1108]"
                },
                {
                  title: "Voice & Video Calls",
                  desc: "Fully encrypted secure voice streams. Dial in safely without exchanging phone indices or socials.",
                  icon: <Sparkles className="w-6 h-6 text-sky-500" />,
                  color: "bg-[#241A11]",
                  textColor: "text-[#F4EBD7]"
                },
                {
                  title: "Campus Feed",
                  desc: "An anonymous real-time bulletin board specifically curated for your inner college campus secrets.",
                  icon: <Flame className="w-6 h-6 text-red-500" />,
                  color: "bg-white",
                  textColor: "text-[#1A1108]"
                }
              ];

            return (
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedCampus}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                >
                  {displayCards.map((card, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.03, y: -4 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className={`border-2 border-[#1A1108] rounded-3xl p-5 sm:p-6 text-left shadow-[4px_4px_0px_0px_#1A1108] ${card.color} ${card.textColor} flex flex-col justify-between min-h-[210px] sm:min-h-[225px]`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center border border-[#1A1108]/15 mb-4 text-[#1A1108]">
                        {card.icon}
                      </div>
                      <div>
                        <h4 className="font-display text-md uppercase tracking-tight leading-none mb-2">
                          {card.title}
                        </h4>
                        <p className="text-[11px] font-sans opacity-85 leading-relaxed">
                          {card.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            );
          })()}

        </div>
      </section>

      {/* 5. WHY CAMPUS CONNECT (Benefits List Section) */}
      <section id="why-campus-connect" className="py-24 px-6 bg-[#1A1108] text-[#F4EBD7] border-b border-[#1A1108]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Text */}
          <div className="text-left">
            <span className="font-condensed font-bold text-xs tracking-widest text-[#C9A227] uppercase bg-[#C9A227]/10 border border-[#C9A227]/30 px-3.5 py-1 rounded-full mb-4">
              WHY WE DO IT
            </span>

            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight mt-3 mb-6">
              Connect <br />
              Beyond Class.
            </h2>

            <p className="text-neutral-400 max-w-lg text-sm sm:text-base font-sans mb-8 leading-relaxed">
              Dorm rooms and classes can feel incredibly isolating. We build safe channels to discover college networks and unlock social orbits without the usual social media anxieties.
            </p>

            {/* Structured Benes List */}
            <div className="space-y-4">
              {[
                { title: "Meet New People", desc: "Discover students outside your immediate major and residential pods." },
                { title: "Expand Your Network", desc: "Access collaborative loops containing thousands of local campus profiles." },
                { title: "Connect Beyond Your Campus", desc: "Meet neighboring college peers for shared events and note reviews." },
                { title: "Student-Only Environment", desc: "Enforced structural academic gating prevents corporate and spam logins." },
                { title: "Safe & Verified Community", desc: "Constant moderation keeps chats clean, supportive, and completely local." }
              ].map((bene, bIdx) => (
                <div key={bIdx} className="flex gap-4 items-start pb-3 border-b border-neutral-800 last:border-b-0">
                  <div className="bg-[#C9A227] text-[#1A1108] p-1 rounded-lg mt-0.5 flex-shrink-0">
                    <CheckCircle className="w-4 h-4 fill-transparent stroke-2" />
                  </div>
                  <div>
                    <h4 className="font-condensed font-extrabold text-xs tracking-wider uppercase text-white">{bene.title}</h4>
                    <p className="text-xs text-neutral-400 font-sans mt-0.5 leading-relaxed">{bene.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Aesthetic Banner - Venture Vibe Graphic placeholder */}
          <div className="relative flex items-center justify-center min-h-[300px] md:min-h-[400px] bg-[#241A11] border-2 border-neutral-800 rounded-[32px] overflow-hidden p-8 shadow-xl">
            <div className="absolute inset-0 bg-radial from-[#C9A227]/5 to-[#1A1108] opacity-70"></div>
            
            <div className="relative z-10 text-center max-w-sm flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[#C9A227] flex items-center justify-center font-display text-4xl text-[#1A1108] mb-4 shadow-lg animate-pulse">
                c.
              </div>
              <p className="font-display text-lg uppercase tracking-tight text-[#C9A227] mb-2">STUDENT FIRST ETHOS</p>
              <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                "We wanted a social space that felt like walking around campus on a sunny Friday afternoon — spontaneous, completely authentic, and strictly for college students."
              </p>
              
              <div className="mt-6 flex items-center gap-1.5 bg-[#1A1108] border border-neutral-800 py-1.5 px-3.5 rounded-full text-[10px] font-condensed tracking-wider font-extrabold text-white">
                <Lock className="w-3.5 h-3.5 text-[#C9A227]" />
                DATABASE SECURED BY AES-256
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 6. LIVE COUNTER SECTION */}
      <section id="metrics-counter" className="py-20 px-6 border-b border-[#1A1108]/10 bg-[#EBDCB7]">
        <div className="max-w-7xl mx-auto text-center flex flex-col gap-14">
          <LiveCounters />

          <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
            <span className="font-condensed font-bold text-xs tracking-widest text-[#C9A227] uppercase bg-[#C9A227]/10 border border-[#C9A227]/30 px-3.5 py-1 rounded-full mb-3 self-center">
              CAMPUS TRAFFIC
            </span>
            <h3 className="font-display text-2xl sm:text-3xl text-[#1A1108] uppercase tracking-tight mb-8">
              Leadership Board
            </h3>
            <TopCampuses />
          </div>
        </div>
      </section>

      {/* 7. WAITLIST REGISTRATION FORM SECTION */}
      <section id="waitlist-section" className="py-24 px-6 border-b border-[#1A1108]/10 bg-[#F4EBD7]">
        <motion.div 
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className="max-w-7xl mx-auto text-center flex flex-col items-center"
        >
          
          <span className="font-condensed font-bold text-xs tracking-widest text-[#C9A227] uppercase bg-[#C9A227]/10 border border-[#C9A227]/30 px-3.5 py-1 rounded-full mb-3">
            RESERVE SPOT TODAY
          </span>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-[#1A1108] uppercase tracking-tight mt-3 mb-6">
            Join The Waitlist
          </h2>

          <p className="text-[#1A1108]/75 max-w-xl mx-auto text-sm sm:text-base font-sans mb-12 leading-relaxed">
            Spot spots are strictly allocated in sequence of sign-ups. Connect your Google profile securely to secure your priority position inside the launch index.
          </p>

          <LiveJoinStream />

          <WaitlistForm />

        </motion.div>
      </section>

      {/* 8. TESTIMONIALS SECTION */}
      <section id="testimonials-section" className="py-24 px-6 bg-[#1A1108] text-[#F4EBD7] border-b border-neutral-800">
        <div className="max-w-7xl mx-auto text-center">
          
          <span className="font-condensed font-bold text-xs tracking-widest text-[#C9A227] uppercase bg-[#C9A227]/10 border border-[#C9A227]/30 px-3.5 py-1 rounded-full mb-4">
            HEAR THE BETA BUZZ
          </span>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight mt-3 mb-6">
            Student Sentiments
          </h2>

          <p className="text-neutral-400 max-w-xl mx-auto text-sm sm:text-base font-sans mb-16 leading-relaxed">
            Check out feedback from closed-beta undergraduate circles who are currently on-boarded into our platform.
          </p>

          {/* Testimonies Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "SwipeMates bypassed all the standard social noise! The strict verification gave me perfect confidence to coordinate verified partners across IIT Bombay, IIT Delhi, and BITS for hackathons & events.",
                author: "Ananya Sen",
                meta: "IIT Bombay Class of '27 • CS Major",
                image: avatarAnanya
              },
              {
                quote: "Absolutely changed campus life. Verification is bulletproof, meaning zero bots or commercial spam. Discovering shared music & coding circles across collegiate hubs is beautifully seamless.",
                author: "Aarav Mehta",
                meta: "BITS Pilani Class of '26 • Mech Major",
                image: avatarAarav
              },
              {
                quote: "The interface is absolute world class! It's incredibly refreshing to bypass massive public chats and immediately find other college girls sharing my literary & acoustic music passions.",
                author: "Meera Raghavan",
                meta: "Delhi University Class of '28 • Econ & Design Major",
                image: avatarMeera
              }
            ].map((test, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -4 }}
                className="bg-[#241A11] border-2 border-neutral-800 rounded-3xl p-6 text-left flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="flex gap-1 text-[#C9A227] mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#C9A227]" />
                    ))}
                  </div>
                  <p className="text-xs text-neutral-300 italic leading-relaxed font-sans font-medium mb-6">
                    "{test.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-3 border-t border-neutral-800 pt-4">
                  <img
                    src={test.image}
                    alt={test.author}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full border border-neutral-700 object-cover"
                    onError={(e) => handleAvatarLoadError(e, test.author.toLowerCase().includes('ananya') ? 'ananya' : test.author.toLowerCase().includes('aarav') ? 'aarav' : 'meera')}
                  />
                  <div>
                    <h5 className="font-condensed font-extrabold text-xs uppercase text-white tracking-wider">
                      {test.author}
                    </h5>
                    <p className="text-[10px] text-[#C9A227] font-semibold mt-0.5">
                      {test.meta}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 9. FAQ SECTION */}
      <section id="faq-section" className="py-24 px-6 border-b border-[#1A1108]/10 bg-[#F4EBD7]">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-16">
            <span className="font-condensed font-bold text-xs tracking-widest text-[#C9A227] uppercase bg-[#C9A227]/10 border border-[#C9A227]/30 px-3.5 py-1 rounded-full">
              HAVE QUESTIONS?
            </span>

            <h2 className="font-display text-3xl sm:text-4xl text-[#1A1108] uppercase tracking-tight mt-4 mb-3">
              FAQ
            </h2>
            <p className="text-xs font-condensed tracking-wider font-extrabold text-[#1A1108]/60 uppercase">
              Frequently Queried coordinates
            </p>
          </div>

          {/* Accordion Questions */}
          <div className="space-y-4">
            {[
              {
                q: "Is SwipeMates free?",
                a: "Yes, completely! SwipeMates is 100% free to join, search, match, and chat for all verified undergraduate and graduate college students."
              },
              {
                q: "When will it launch?",
                a: "We are currently running closed-beta access across multiple California colleges. The full public app is slated to launch on iOS and Android very soon this fall!"
              },
              {
                q: "Who can join?",
                a: "Any undergraduate or graduate student with an active, verified college email address (.edu or registered university domain) can sign up on our launch directory."
              },
              {
                q: "How does verification work?",
                a: "To ensure a clean, catfish-free, student-only social loop, we verify academic emails using Google Auth and check domain lists before final waitlist clearance."
              },
              {
                q: "Is it a dating app?",
                a: "No! SwipeMates is primarily a social networking platform designed for matching study groups, discovering localized campus feeds, coordinating dorm board events, and building general collegiate friendships."
              }
            ].map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div key={index} className="border-2 border-[#1A1108] rounded-2xl bg-white overflow-hidden shadow-[2px_2px_0px_0px_#1A1108]">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-5 text-left font-display text-xs sm:text-sm uppercase tracking-tight text-[#1A1108] hover:bg-[#1A1108]/5 transition-colors focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <Minus className="w-4 h-4 text-[#C9A227] flex-shrink-0 ml-3" />
                    ) : (
                      <Plus className="w-4 h-4 text-[#1A1108] flex-shrink-0 ml-3" />
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 border-t-2 border-[#1A1108] bg-[#F4EBD7]/30 text-xs text-[#1A1108]/80 leading-relaxed font-sans">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 10. FINAL CTA SECTION */}
      <section id="final-cta" className="py-24 px-6 bg-[#C9A227]/20 border-b border-[#1A1108]/10 text-center relative overflow-hidden">
        {/* Background visual graphics */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#C9A227]/10 blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-xl mx-auto flex flex-col items-center">
          <span className="font-condensed font-bold text-xs tracking-widest text-[#C9A227] uppercase bg-[#C9A227]/20 border border-[#C9A227]/40 px-3.5 py-1 rounded-full mb-4">
            LIMITED CLOSE WINDOW
          </span>

          <h2 className="font-display text-3xl sm:text-4xl text-[#1A1108] uppercase tracking-tight leading-none text-center mb-6">
            Be Among The First <br /> Students To Join
          </h2>

          <p className="text-[#1A1108]/85 text-sm sm:text-base font-sans leading-relaxed mb-10 max-w-sm">
            Don’t get locked out. Grab your class handle and reserve priority waitlist access before closed testing resumes.
          </p>

          <motion.button
            onClick={() => scrollToSection('waitlist-section')}
            id="final-cta-waitlist-trigger"
            whileHover={{ 
              scale: 1.05, 
              y: -2,
              boxShadow: "0 10px 20px rgba(26, 17, 8, 0.25)",
              transition: { type: "spring", stiffness: 400, damping: 12 }
            }}
            whileTap={{ scale: 0.95, y: 0 }}
            className="w-full sm:w-auto bg-[#1A1108] text-[#F4EBD7] font-semibold text-sm hover:bg-[#1A1108]/90 py-4 px-10 rounded-2xl transition-all shadow-[4px_4px_0px_0px_#C9A227] outline-none"
          >
            Join The Waitlist ⚡
          </motion.button>
        </div>
      </section>

      {/* 11. FOOTER SECTION */}
      <footer className="bg-[#1A1108] text-[#F4EBD7] py-16 px-6 border-t-2 border-[#1A1108] mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          
          {/* Footer Logo & Credits */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Logo light className="scale-90" />
            <p className="text-[10px] text-neutral-400 font-sans mt-4 max-w-xs leading-relaxed">
              SwipeMates helps college students discover new friends, match, and construct verified collegiate communities safely.
            </p>
            <p className="text-[10px] text-neutral-300 font-sans mt-2.5">
              📩 Team: <a href="mailto:swipemates.team@proton.me" className="text-[#C9A227] font-semibold hover:underline font-mono">swipemates.team@proton.me</a>
            </p>
            <p className="text-[9px] text-neutral-500 font-mono mt-2">
              © 2026 SwipeMates Inc. All rights reserved. Registered launch database.
            </p>
          </div>

          {/* Nav Links */}
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-wrap items-center justify-center gap-8 text-xs font-condensed tracking-wider font-bold uppercase text-neutral-400">
              <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }} className="hover:text-white transition-colors">About</a>
              <a href="#features-showcase" onClick={(e) => { e.preventDefault(); scrollToSection('features-showcase'); }} className="hover:text-white transition-colors">Features</a>
              <a href="#faq-section" onClick={(e) => { e.preventDefault(); scrollToSection('faq-section'); }} className="hover:text-white transition-colors">FAQ</a>
              <a href="#waitlist-section" onClick={(e) => { e.preventDefault(); scrollToSection('waitlist-section'); }} className="hover:text-white transition-colors">Waitlist</a>
              <span className="text-neutral-600">|</span>
              <button 
                onClick={() => setShowPrivacyModal(true)} 
                className="hover:text-white text-neutral-400 transition-colors uppercase font-bold tracking-wider font-condensed border-none bg-transparent cursor-pointer"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => setShowTermsModal(true)} 
                className="hover:text-white text-neutral-400 transition-colors uppercase font-bold tracking-wider font-condensed border-none bg-transparent cursor-pointer"
              >
                Terms
              </button>
              <span className="text-neutral-600">|</span>
              <button 
                onClick={() => setShowAdminConsole(true)} 
                className="hover:text-[#C9A227] text-neutral-400 transition-colors uppercase tracking-wider font-condensed font-bold border-none bg-transparent cursor-pointer"
              >
                Console 🔒
              </button>
            </div>
          </div>

          {/* Audio Player Card & Social Row */}
          <div className="flex flex-col items-center md:items-end gap-5">
            {/* Ambient Campus Vibes Cassette Loader */}
            <div className="flex flex-col items-center md:items-end">
              <span className="text-[9px] text-neutral-500 font-black tracking-widest uppercase mb-1.5">AMBIE-FI CONTROLS</span>
              <motion.button
                onClick={() => setIsPlaying(!isPlaying)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                id="ambient-vibes-trigger"
                className={`flex items-center gap-3 px-5 py-3 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm select-none ${
                  isPlaying
                    ? 'bg-[#C9A227] text-[#1A1108] border-[#C9A227] shadow-[2px_2px_0px_0px_#FFFFFF/20]'
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white hover:border-neutral-500'
                }`}
              >
                {isPlaying ? (
                  <>
                    <div className="flex gap-0.5 items-end h-3">
                      <span className="w-0.5 h-2 bg-[#1A1108] rounded-full animate-bounce" style={{ animationDelay: '0.1s', animationIterationCount: 'infinite' }} />
                      <span className="w-0.5 h-3.5 bg-[#1A1108] rounded-full animate-bounce" style={{ animationDelay: '0.35s', animationIterationCount: 'infinite' }} />
                      <span className="w-0.5 h-1.5 bg-[#1A1108] rounded-full animate-bounce" style={{ animationDelay: '0.55s', animationIterationCount: 'infinite' }} />
                    </div>
                    <span>Campus Vibes Playing 🎧</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Campus Vibes Lo-Fi</span>
                  </>
                )}
              </motion.button>
            </div>

            <div className="flex items-center gap-4">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Twitter Profile"
                className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center hover:bg-[#C9A227] hover:text-[#1A1108] transition-all"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="LinkedIn Profile"
                className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center hover:bg-[#C9A227] hover:text-[#1A1108] transition-all"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Instagram Profile"
                className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center hover:bg-[#C9A227] hover:text-[#1A1108] transition-all"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>

          </div>

        </div>
      </footer>

      {/* Privacy Policy Modal overlay */}
      <AnimatePresence>
        {showPrivacyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-55 bg-[#1A1108]/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowPrivacyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              transition={{ type: 'spring', damping: 26, stiffness: 380 }}
              className="bg-[#F4EBD7] border-4 border-[#1A1108] p-6 sm:p-8 max-w-2xl w-full rounded-[32px] shadow-[8px_8px_0px_0px_#1A1108] relative text-[#1A1108] max-h-[85vh] overflow-y-auto select-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-white border-2 border-[#1A1108] flex items-center justify-center text-[#1A1108] hover:bg-[#C9A227] transition-all cursor-pointer shadow-[2px_2px_0px_0px_#1A1108] active:translate-y-0.5 outline-none"
                id="close-privacy-modal"
              >
                <X className="w-4 h-4" />
              </button>

              <span className="font-condensed font-black text-[9px] tracking-widest text-[#C9A227] bg-[#1A1108]/10 border border-[#C9A227]/40 px-3 py-1 rounded-full">
                Security & Data Shield • V1.2
              </span>

              <h2 className="font-display text-2xl uppercase tracking-tight mt-4 mb-1">
                Privacy Policy
              </h2>
              <p className="text-[10px] text-neutral-500 font-mono mb-6">Last updated: June 2026</p>

              <div className="space-y-4 font-sans text-[11px] leading-relaxed text-[#1A1108]/85">
                <p className="text-xs text-[#1A1108] font-bold">
                  Trust is the currency of student community. Find below our clear, jargon-free pledge explaining how we protect and gate your campus interactions.
                </p>

                <div className="border-t border-[#1A1108]/10 pt-3">
                  <h3 className="font-display text-xs uppercase font-black text-[#1A1108] mb-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" /> 1. Academic Email Gating
                  </h3>
                  <p>
                    We check your university-assigned email domains (like <strong>.edu</strong> or <strong>.ac.in</strong>) solely to verify current collegiate status. We digest your direct mail records securely so that scrapers, advertisers, or hackers cannot index profile listings.
                  </p>
                </div>

                <div className="border-t border-[#1A1108]/10 pt-3">
                  <h3 className="font-display text-xs uppercase font-black text-[#1A1108] mb-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" /> 2. Zero Advertising & Broker Deals
                  </h3>
                  <p>
                    We have zero tracking components, zero spyware modules, and zero corporate advertising alliances. We do not sell, rent, or trade student chat histories, match vectors, or peer connection records to any market research agencies or commercial brokers.
                  </p>
                </div>

                <div className="border-t border-[#1A1108]/10 pt-3">
                  <h3 className="font-display text-xs uppercase font-black text-[#1A1108] mb-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" /> 3. Instant Deactivation Purges
                  </h3>
                  <p>
                    You maintain ultimate authority over your digital campus records. Whenever you request to leave the waitlist or deactivate your verified profile, our system triggers absolute database commands that completely wipe your records from the live Firestore nodes.
                  </p>
                </div>

                <div className="border-t border-[#1A1108]/10 pt-3">
                  <h3 className="font-display text-xs uppercase font-black text-[#1A1108] mb-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" /> 4. Rigid Firestore Rules
                  </h3>
                  <p>
                    All database objects are guarded by secure Firestore rules. Only matched students can access secure chat streams, and domain validation checks are run continuously on the servers to protect your high-trust college loop.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-[#1A1108]/10">
                <motion.button
                  onClick={() => setShowPrivacyModal(false)}
                  id="accept-privacy"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-[#1A1108] text-[#F4EBD7] font-bold text-[11px] uppercase tracking-wider py-3 px-6 rounded-2xl transition-all shadow-[4px_4px_0px_0px_#C9A227] cursor-pointer outline-none"
                >
                  I Understand & Accept
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terms of Service Modal overlay */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-55 bg-[#1A1108]/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowTermsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              transition={{ type: 'spring', damping: 26, stiffness: 380 }}
              className="bg-[#F4EBD7] border-4 border-[#1A1108] p-6 sm:p-8 max-w-2xl w-full rounded-[32px] shadow-[8px_8px_0px_0px_#1A1108] relative text-[#1A1108] max-h-[85vh] overflow-y-auto select-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowTermsModal(false)}
                className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-white border-2 border-[#1A1108] flex items-center justify-center text-[#1A1108] hover:bg-[#C9A227] transition-all cursor-pointer shadow-[2px_2px_0px_0px_#1A1108] active:translate-y-0.5 outline-none"
                id="close-terms-modal"
              >
                <X className="w-4 h-4" />
              </button>

              <span className="font-condensed font-black text-[9px] tracking-widest text-[#C9A227] bg-[#1A1108]/10 border border-[#C9A227]/40 px-3 py-1 rounded-full">
                Campus Rules Pledge • V2.0
              </span>

              <h2 className="font-display text-2xl uppercase tracking-tight mt-4 mb-1">
                Terms of Service
              </h2>
              <p className="text-[10px] text-neutral-500 font-mono mb-6">Last updated: June 2026</p>

              <div className="space-y-4 font-sans text-[11px] leading-relaxed text-[#1A1108]/85">
                <p className="text-xs text-[#1A1108] font-bold">
                  By joining SwipeMates, you pledge to uphold academic integrity, student safety standards, and collective respect.
                </p>

                <div className="border-t border-[#1A1108]/10 pt-3">
                  <h3 className="font-display text-xs uppercase font-black text-[#1A1108] mb-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" /> 1. Authentic Registration Rules
                  </h3>
                  <p>
                    You must use active academic credentials assigned to your college or university. Bypassing registration barriers with automated scripts, temporal disposable email systems, or fake IDs is strictly forbidden and results in instant, unappealable bans.
                  </p>
                </div>

                <div className="border-t border-[#1A1108]/10 pt-3">
                  <h3 className="font-display text-xs uppercase font-black text-[#1A1108] mb-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" /> 2. Catfish & Impersonation Prohibition
                  </h3>
                  <p>
                    Fabricating profiles, spoofing coursework, or presenting dummy identity pictures commits severe breaches of student trust. We maintain strict compliance with local student guidelines and reserve the right to audit suspicious submissions.
                  </p>
                </div>

                <div className="border-t border-[#1A1108]/10 pt-3">
                  <h3 className="font-display text-xs uppercase font-black text-[#1A1108] mb-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" /> 3. High-Trust Communications
                  </h3>
                  <p>
                    Keep local feeds, board rooms, and match messaging constructive and respectful. Cyberstalking, system spam, or peer intimidation of any kind triggers instantaneous suspension of your academic entry token.
                  </p>
                </div>

                <div className="border-t border-[#1A1108]/10 pt-3">
                  <h3 className="font-display text-xs uppercase font-black text-[#1A1108] mb-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" /> 4. Service Boundaries
                  </h3>
                  <p>
                    SwipeMates is an independent platform built by and for students. We reserve complete authority to moderate waitlist statuses and clear access parameters to ensure the highest standards of safety for university participants.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-[#1A1108]/10">
                <motion.button
                  onClick={() => setShowTermsModal(false)}
                  id="accept-terms"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-[#1A1108] text-[#F4EBD7] font-bold text-[11px] uppercase tracking-wider py-3 px-6 rounded-2xl transition-all shadow-[4px_4px_0px_0px_#C9A227] cursor-pointer outline-none"
                >
                  I Pledge to Uphold the Guidelines
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

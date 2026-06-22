import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Heart, X, MessageSquare, ShieldCheck, Sparkles, Star } from 'lucide-react';

interface Student {
  id: number;
  name: string;
  age: number;
  college: string;
  major: string;
  bio: string;
  image: string;
  interests: string[];
  gradient: string;
}

const mockStudents: Student[] = [
  {
    id: 1,
    name: "Ananya Sen",
    age: 21,
    college: "IIT Bombay",
    major: "Computer Science",
    bio: "CS at IITB. Ready to disrupt the tech space, building late-night compilers & craving sweet cutting chai ☕💻 Let's build something chaotic!",
    image: "/src/assets/images/indian_student_avatar_1782091046623.jpg",
    interests: ["Compilers", "Cutting Chai", "Hackathons", "Product Design"],
    gradient: "from-pink-500 via-purple-500 to-indigo-500"
  },
  {
    id: 2,
    name: "Rohan Kapoor",
    age: 20,
    college: "BITS Pilani",
    major: "Electrical Engineering",
    bio: "Mr. Fresher finalist! Always down for late-night campus walks, garage bands, debating startup pitches, and drinking strong filter coffee! 🎸🚀",
    image: "/src/assets/images/student_mr_fresher_1782092440055.jpg",
    interests: ["Garage Bands", "Startup Pitches", "Filter Coffee", "Investing"],
    gradient: "from-[#C9A227] to-[#1A1108]"
  },
  {
    id: 3,
    name: "Prisha Gupta",
    age: 19,
    college: "Delhi University",
    major: "English Literature",
    bio: "Aspiring journalist & retro poetry slam fan. Let's connect if you love cozy cafes, indie magazines, or exploring local street food joints! 📚✨",
    image: "/src/assets/images/student_red_cap_1782092477821.jpg",
    interests: ["Poetry Slams", "Street Food", "Indie Mags", "Literature"],
    gradient: "from-emerald-400 to-cyan-500"
  },
  {
    id: 4,
    name: "Ishaan Singhal",
    age: 22,
    college: "Ashoka University",
    major: "Economics & Finance",
    bio: "Coffee enthusiast, behavioral econ, film photography, and checking out local indie concerts. Let's trade Spotify playlists! ☕📸",
    image: "/src/assets/images/student_suit_lawn_1782092459732.jpg",
    interests: ["Econ Phil", "Photography", "Playlists", "Espresso"],
    gradient: "from-purple-600 to-pink-500"
  },
  {
    id: 5,
    name: "Kiara Advani",
    age: 21,
    college: "St. Xavier's, Mumbai",
    major: "Media & Design",
    bio: "Style blogger & synth enthusiast. Let's match if you love retro arcades, late-night campus festivals, or deep graphic design talks! 👾🎨",
    image: "/src/assets/images/student_red_jacket_1782092404155.jpg",
    interests: ["Retro Arcades", "Synth", "Design", "Festivals"],
    gradient: "from-red-500 via-orange-400 to-yellow-500"
  },
  {
    id: 6,
    name: "Tanvi Nair",
    age: 19,
    college: "Christ University, Bangalore",
    major: "Psychology",
    bio: "Passionate about behavioral trends, exploring serene indie bookshops, and finding the perfect filter kaapi in Bangalore! ☕📖",
    image: "/src/assets/images/student_california_tee_1782092422864.jpg",
    interests: ["Behaviors", "Indie Books", "Kaapi", "Acoustics"],
    gradient: "from-teal-400 to-blue-500"
  },
  {
    id: 7,
    name: "Nikhil Mehra",
    age: 22,
    college: "Symbiosis, Pune",
    major: "Film & Creative Media",
    bio: "Film photographer & tech tinkerer. Let's discuss cyberpunk aesthetics, indie synth-pop, or organize midnight street photography walks! 📸🌌",
    image: "/src/assets/images/student_leather_jacket_1782092493584.jpg",
    interests: ["Midnight Walk", "Synth-pop", "Photography", "Film"],
    gradient: "from-[#1A1108] to-[#C9A227]"
  }
];

export default function StudentCardsMockup() {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedStudent, setMatchedStudent] = useState<Student | null>(null);

  const activeStudent = students[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (currentIndex >= students.length) return;
    
    if (direction === 'right') {
      // 50% chance of triggering Match for interactivity!
      setMatchedStudent(students[currentIndex]);
      setShowMatch(true);
    }
    
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % students.length);
    }, 200);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setShowMatch(false);
    setMatchedStudent(null);
  };

  return (
    <div className="relative w-full max-w-[340px] md:max-w-[380px] h-[580px] mx-auto flex flex-col items-center justify-center">
      {/* Phone border shell */}
      <div className="absolute inset-0 border-8 border-[#1A1108] rounded-[42px] bg-[#1A1108] shadow-[0_25px_60px_-15px_rgba(26,17,8,0.4)] overflow-hidden">
        {/* Notch / Speaker */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-[#1A1108] rounded-b-2xl z-50 flex items-center justify-center">
          <div className="w-12 h-1 bg-neutral-800 rounded-full mb-1"></div>
        </div>

        {/* Dynamic Screen Area */}
        <div className="relative w-full h-full bg-[#1A1108] pt-8 p-3 flex flex-col justify-between">
          
          {/* Internal App Header */}
          <div className="flex items-center justify-between px-2 pt-1 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-lg text-[#F4EBD7]">c.</span>
              <div className="bg-[#C9A227]/20 border border-[#C9A227]/40 px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227] animate-pulse"></span>
                <span className="font-condensed text-[10px] text-[#C9A227] font-medium tracking-wider">IIT BOMBAY</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white bg-white/10 p-1.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
              </span>
            </div>
          </div>

          {/* Cards Stack */}
          <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden py-1">
            <AnimatePresence mode="popLayout">
              {currentIndex < students.length ? (
                <motion.div
                  key={activeStudent.id}
                  initial={{ scale: 0.9, y: 15, rotate: currentIndex % 2 === 0 ? -1 : 1, opacity: 0.5 }}
                  animate={{ scale: 1, y: 0, rotate: 0, opacity: 1 }}
                  exit={(custom) => ({
                    x: custom === 'left' ? -350 : 3550,
                    rotate: custom === 'left' ? -25 : 25,
                    opacity: 0,
                    transition: { duration: 0.3 }
                  })}
                  className="absolute inset-0 bg-[#F4EBD7] rounded-[28px] overflow-hidden border-2 border-[#1A1108] shadow-[0_8px_16px_rgba(0,0,0,0.3)] flex flex-col justify-between"
                  style={{ y: 0 }}
                >
                  {/* Student Photo */}
                  <div className="relative w-full h-[55%] overflow-hidden bg-neutral-300">
                    <img
                      src={activeStudent.image}
                      alt={activeStudent.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover select-none"
                    />
                    {/* Verified Badge Overlay */}
                    <div className="absolute top-3 left-3 bg-[#1A1108] text-[#F4EBD7] py-1 px-2.5 rounded-full text-[10px] font-condensed tracking-wider flex items-center gap-1 border border-[#C9A227]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#C9A227] fill-[#C9A227]/10" />
                      STUDENT VERIFIED
                    </div>

                    {/* Gradient Fade overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#F4EBD7] to-transparent"></div>
                  </div>

                  {/* Info Panel */}
                  <div className="flex-1 px-4 pb-3 pt-1 flex flex-col justify-between select-none">
                    <div>
                      {/* Name and Age */}
                      <div className="flex items-baseline gap-1.5">
                        <h4 className="font-display text-xl text-[#1A1108] leading-none">{activeStudent.name}</h4>
                        <span className="font-condensed text-base font-bold text-[#1A1108]/70">{activeStudent.age}</span>
                      </div>
                      
                      {/* College & Department */}
                      <p className="font-condensed text-[12px] font-semibold text-[#C9A227] tracking-wider uppercase mt-1">
                        {activeStudent.college} — {activeStudent.major}
                      </p>

                      {/* Snippet Bio */}
                      <p className="text-[11px] text-[#1A1108]/90 leading-relaxed mt-1.5 font-sans italic border-l-2 border-[#C9A227]/40 pl-2">
                        "{activeStudent.bio}"
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {activeStudent.interests.map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] font-sans font-medium text-[#1A1108]/75 bg-[#1A1108]/5 px-2 py-0.5 rounded-full border border-[#1A1108]/10"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center text-[#F4EBD7]/70">
                  <Star className="w-10 h-10 text-[#C9A227] mb-2 animate-bounce" />
                  <p className="font-display text-sm uppercase tracking-wider mb-2">That's everyone nearby!</p>
                  <p className="text-[11px] text-neutral-400 mb-4 max-w-[180px] mx-auto leading-relaxed">
                    Ready to unlock thousands of students across 40+ colleges?
                  </p>
                  <button
                    onClick={handleReset}
                    className="font-condensed font-bold text-xs text-[#1A1108] bg-[#C9A227] px-4 py-1.5 rounded-full hover:bg-[#C9A227]/90 active:scale-95 transition-all outline-none"
                  >
                    SWIPE AGAIN
                  </button>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Action buttons (Swipe controls) */}
          <div className="flex items-center justify-center gap-4 py-2 z-10 select-none">
            {/* Left Pass Button */}
            <button
              onClick={() => handleSwipe('left')}
              className="w-10 h-10 rounded-full border-2 border-[#F4EBD7]/10 flex items-center justify-center bg-white/5 active:scale-90 hover:bg-red-500/10 hover:border-red-500/30 transition-all outline-none"
            >
              <X className="w-5 h-5 text-red-400" />
            </button>
            
            {/* Recenter / Info Middle Badge */}
            <span className="font-condensed text-[10px] tracking-wider font-semibold text-neutral-400 uppercase bg-white/5 px-3 py-1 rounded-full">
              {currentIndex < students.length ? `${currentIndex + 1} of ${students.length}` : 'Done'}
            </span>

            {/* Right Like Button */}
            <button
              onClick={() => handleSwipe('right')}
              className="w-10 h-10 rounded-full border-2 border-[#C9A227]/30 flex items-center justify-center bg-[#C9A227]/10 active:scale-90 hover:bg-[#C9A227]/25 hover:border-[#C9A227]/50 transition-all outline-none"
            >
              <Heart className="w-5 h-5 text-[#C9A227] fill-[#C9A227]/20" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Chat Bubble - Apple UX Feel */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-16 top-1/4 bg-[#1A1108] text-[#F4EBD7] p-3 rounded-2xl shadow-[0_12px_24px_rgba(0,0,0,0.3)] border border-[#C9A227]/40 w-[160px]"
      >
        <div className="flex items-center gap-1.5 mb-1">
          <MessageSquare className="w-3.5 h-3.5 text-[#C9A227]" />
          <span className="font-condensed text-[9px] text-[#C9A227] uppercase tracking-wider font-bold">New Connection</span>
        </div>
        <p className="text-[10px] leading-tight font-sans">
          "Hey Aria! Let's hit the arcade next Tuesday?"
        </p>
      </motion.div>

      {/* Floating Sparkle Card - Gen-Z Feel */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -left-16 bottom-1/4 bg-[#F4EBD7] text-[#1A1108] p-3 rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.15)] border border-[#1A1108] w-[150px]"
      >
        <div className="flex items-center gap-1 text-[#C9A227] mb-1">
          <Sparkles className="w-3.5 h-3.5 fill-[#C9A227]" />
          <span className="font-condensed text-[10px] uppercase font-bold text-[#1A1108]">Spark Match</span>
        </div>
        <p className="text-[10px] text-neutral-600 leading-tight">
          You both share <b className="text-[#1A1108]">Vinyls & Coffee</b>
        </p>
      </motion.div>

      {/* Interactive MATCH POPUP inside Mockup! */}
      <AnimatePresence>
        {showMatch && matchedStudent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-2 bg-[#1A1108]/95 rounded-[38px] z-50 flex flex-col items-center justify-center p-4 text-center border-2 border-[#C9A227]"
          >
            {/* Sparkle Icons */}
            <div className="relative mb-3 animate-bounce">
              <Heart className="w-12 h-12 text-[#C9A227] fill-[#C9A227] absolute top-0 left-0 animate-pulse" />
              <Heart className="w-12 h-12 text-[#C9A227] fill-transparent" />
            </div>

            <h3 className="font-display text-2xl text-[#C9A227] tracking-wider uppercase leading-none mb-1">
              IT'S A MATCH!
            </h3>
            <p className="text-[10px] text-neutral-300 max-w-[200px] mb-4">
              You matched with <b>{matchedStudent.name}</b> from {matchedStudent.college}!
            </p>

            {/* Micro avatars overlapping */}
            <div className="flex items-center -space-x-4 mb-4 select-none">
              <div className="w-12 h-12 rounded-full border-2 border-[#C9A227] overflow-hidden bg-neutral-800">
                <img src={matchedStudent.image} alt="match" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-[#C9A227] overflow-hidden bg-[#C9A227] flex items-center justify-center font-display text-sm text-[#1A1108]">
                YOU
              </div>
            </div>

            <button
              onClick={() => setShowMatch(false)}
              className="text-[#1A1108] bg-[#F4EBD7] hover:bg-[#F4EBD7]/90 px-4 py-1 rounded-full text-[11px] font-condensed font-bold tracking-wider outline-none"
            >
              CONTINUE SWIPING
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

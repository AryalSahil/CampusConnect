import React, { useState, useEffect } from 'react';
import { signInWithPopup, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, LogOut, ArrowRight, CheckCircle2, Copy, Sparkles, Send, Share2, Award, Users } from 'lucide-react';
import { UserProfile, WaitlistRegistration } from '../types';
import confetti from 'canvas-confetti';

interface WaitlistFormProps {
  onSuccessSubmit?: (spotNumber: number) => void;
}

export default function WaitlistForm({ onSuccessSubmit }: WaitlistFormProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbLoading, setDbLoading] = useState(false);
  
  // Registration Form Fields
  const [collegeName, setCollegeName] = useState('');
  const [course, setCourse] = useState('');
  const [graduationYear, setGraduationYear] = useState('2027');
  const [referralEmail, setReferralEmail] = useState('');

  // Additional Referral Fields (for Screen 3)
  const [newReferralEmail, setNewReferralEmail] = useState('');
  const [referralSubmitting, setReferralSubmitting] = useState(false);
  const [referralError, setReferralError] = useState<string | null>(null);
  const [referralFeedback, setReferralFeedback] = useState<string | null>(null);

  // Registration Record (if already on the waitlist)
  const [waitlistRecord, setWaitlistRecord] = useState<WaitlistRegistration | null>(null);
  const [totalRegistrations, setTotalRegistrations] = useState(8420); // Base waitlist number
  const [copied, setCopied] = useState(false);

  // Form Validation and Status
  const [formError, setFormError] = useState<string | null>(null);

  // Real-time listener for user's waitlist record
  const checkWaitlistStatus = (currentUser: User) => {
    setDbLoading(true);
    const path = `waitlist/${currentUser.uid}`;
    const docRef = doc(db, 'waitlist', currentUser.uid);
    
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setWaitlistRecord({
          uid: data.uid,
          fullName: data.fullName,
          email: data.email,
          collegeName: data.collegeName,
          course: data.course,
          graduationYear: data.graduationYear,
          joinedAt: data.joinedAt?.toDate() || new Date(),
          referralCode: data.referralCode,
          referrerUid: data.referrerUid,
          referralEmail: data.referralEmail,
          referralEmails: data.referralEmails || [],
          referralsCount: data.referralsCount || 0,
        });
        if (onSuccessSubmit) onSuccessSubmit(8420);
      } else {
        setWaitlistRecord(null);
      }
      setDbLoading(false);
      setLoading(false);
    }, (err) => {
      console.error("Firestore listening error inside WaitlistForm:", err);
      handleFirestoreError(err, 'get', path);
      setDbLoading(false);
      setLoading(false);
    });
    
    return unsub;
  };

  useEffect(() => {
    let unsubWaitlist: (() => void) | null = null;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        unsubWaitlist = checkWaitlistStatus(currentUser);
      } else {
        if (unsubWaitlist) {
          unsubWaitlist();
          unsubWaitlist = null;
        }
        setWaitlistRecord(null);
        setLoading(false);
      }
    });
    return () => {
      unsubscribe();
      if (unsubWaitlist) unsubWaitlist();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setFormError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const currentUser = result.user;
      
      // Save user profile state securely
      const userPath = `users/${currentUser.uid}`;
      try {
        await setDoc(doc(db, 'users', currentUser.uid), {
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || 'Campus Scholar',
          photoURL: currentUser.photoURL || '',
          createdAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, 'write', userPath);
      }

      await checkWaitlistStatus(currentUser);
    } catch (err: any) {
      console.error('Sign-In Error:', err);
      setFormError(err.message || 'Failed to sign in. Please try again.');
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setWaitlistRecord(null);
    } catch (err) {
      console.error('Sign-Out Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setFormError(null);

    if (!collegeName.trim() || collegeName.trim().length < 2) {
      setFormError('Please enter your full College or University name.');
      return;
    }
    if (!course.trim() || course.trim().length < 2) {
      setFormError('Please enter your major or course of study.');
      return;
    }

    const finalReferralEmail = referralEmail.trim().toLowerCase();
    if (finalReferralEmail) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(finalReferralEmail)) {
        setFormError('Please enter a valid student email address to refer.');
        return;
      }
      if (user.email && finalReferralEmail === user.email.toLowerCase()) {
        setFormError('You cannot refer your own email address.');
        return;
      }
    }

    setDbLoading(true);
    const waitlistId = user.uid;
    const path = `waitlist/${waitlistId}`;
    
    // Extract referral code from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const referrerUid = urlParams.get('ref') || undefined;
    const referralCode = `CC-${user.uid.slice(0, 5).toUpperCase()}`;

    const registrationPayload = {
      uid: user.uid,
      fullName: user.displayName || 'Campus Connect Scholar',
      email: user.email || '',
      collegeName: collegeName.trim(),
      course: course.trim(),
      graduationYear: graduationYear,
      joinedAt: serverTimestamp(),
      referralCode,
      referralEmail: finalReferralEmail || null,
      referralEmails: finalReferralEmail ? [finalReferralEmail] : [],
      referralsCount: finalReferralEmail ? 1 : 0,
      ...(referrerUid ? { referrerUid } : {})
    };

    try {
      await setDoc(doc(db, 'waitlist', waitlistId), registrationPayload);
      
      setWaitlistRecord({
        uid: user.uid,
        fullName: registrationPayload.fullName,
        email: registrationPayload.email,
        collegeName: registrationPayload.collegeName,
        course: registrationPayload.course,
        graduationYear: registrationPayload.graduationYear,
        joinedAt: new Date(),
        referralCode,
        referrerUid,
        referralEmail: finalReferralEmail || undefined,
        referralEmails: finalReferralEmail ? [finalReferralEmail] : [],
        referralsCount: finalReferralEmail ? 1 : 0
      });

      // Trigger a beautiful multi-burst celebratory confetti blast
      try {
        const duration = 2.5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 28, spread: 360, ticks: 60, zIndex: 999 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.4), y: Math.random() - 0.2 } });
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.6, 0.9), y: Math.random() - 0.2 } });
        }, 200);
      } catch (confettiErr) {
        console.warn('Confetti error:', confettiErr);
      }

      if (onSuccessSubmit) onSuccessSubmit(8421);
    } catch (err) {
      handleFirestoreError(err, 'write', path);
    } finally {
      setDbLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!waitlistRecord?.uid) return;
    const referralUrl = `${window.location.origin}?ref=${waitlistRecord.uid}`;
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Safe Waitlist Position generation derived off UI mock increment and referrals!
  const totalReferrals = (waitlistRecord?.referralsCount || 0);
  const myWaitlistNumber = waitlistRecord 
    ? Math.max(1, 8420 + (parseInt(waitlistRecord.uid.charCodeAt(0).toString()) % 150) - (totalReferrals * 500)) 
    : 8420;

  const handleAddReferralEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !waitlistRecord || !newReferralEmail.trim()) return;
    
    const email = newReferralEmail.trim().toLowerCase();
    
    // Simple email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setReferralError('Please enter a valid student email address.');
      return;
    }
    
    if (user.email && email === user.email.toLowerCase()) {
      setReferralError('You cannot refer your own email address.');
      return;
    }

    setReferralSubmitting(true);
    setReferralError(null);
    setReferralFeedback(null);

    const docRef = doc(db, 'waitlist', user.uid);
    try {
      const currentEmails = waitlistRecord.referralEmails || [];
      if (currentEmails.includes(email) || (waitlistRecord.referralEmail && waitlistRecord.referralEmail.toLowerCase() === email)) {
        setReferralError('This friend has already been referred!');
        setReferralSubmitting(false);
        return;
      }

      const updatedEmails = [...currentEmails, email];
      const newCount = (waitlistRecord.referralEmail ? 1 : 0) + updatedEmails.length;

      await setDoc(docRef, {
        referralEmails: updatedEmails,
        referralsCount: newCount
      }, { merge: true });

      setNewReferralEmail('');
      setReferralFeedback('Friend referred! You jumped up 500 spots! 🚀');

      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (cE) {}

    } catch (err) {
      console.error('Failed to submit referral email:', err);
      setReferralError('Could not save referral. Please try again.');
    } finally {
      setReferralSubmitting(false);
    }
  };

  if (loading || dbLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-[#C9A227] border-t-transparent rounded-full animate-spin"></div>
        <p className="font-condensed text-xs font-semibold tracking-wider text-[#1A1108]/60 uppercase mt-4">
          Querying Campus Satellite database...
        </p>
      </div>
    );
  }

  return (
    <div id="waitlist-form-container" className="w-full max-w-lg mx-auto bg-white/55 backdrop-blur-md border border-[#1A1108]/10 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
      <AnimatePresence mode="wait">
        
        {/* State 1: User is NOT authenticated */}
        {!user && (
          <motion.div
            key="unauthenticated"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#C9A227]/10 flex items-center justify-center border-2 border-[#C9A227]/40 mb-4 animate-bounce">
              <ShieldCheck className="w-8 h-8 text-[#C9A227]" />
            </div>

            <h3 className="font-display text-2xl text-[#1A1108] leading-tight uppercase tracking-tight mb-2">
              Connect Securely
            </h3>
            
            <p className="text-sm text-[#1A1108]/80 leading-relaxed mb-6">
              To verify your student credentials and ensure a safe, clean, student-only social environment, we require quick student verification via Google.
            </p>

            {formError && (
              <div className="text-xs bg-red-500/10 border border-red-500/30 text-red-700 font-medium px-4 py-2.5 rounded-lg mb-4 text-left w-full">
                {formError}
              </div>
            )}

            <motion.button
              onClick={handleGoogleSignIn}
              id="google-verification-trigger"
              whileHover={{ 
                scale: 1.05, 
                y: -2,
                boxShadow: "0 10px 20px rgba(26, 17, 8, 0.25)",
                transition: { type: "spring", stiffness: 400, damping: 12 }
              }}
              whileTap={{ scale: 0.95, y: 0 }}
              className="w-full flex items-center justify-center gap-3 bg-[#1A1108] text-[#F4EBD7] font-semibold text-sm hover:bg-[#1A1108]/90 py-3.5 px-6 rounded-2xl transition-all shadow-[4px_4px_0px_0px_#C9A227] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#C9A227] outline-none"
            >
              {/* Custom flat white SVG Google indicator code */}
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.81-2.62-.81-3.01-.03-6.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Verify with Google</span>
            </motion.button>
          </motion.div>
        )}

        {/* State 2: Authenticated but NOT registered yet */}
        {user && !waitlistRecord && (
          <motion.form
            key="authenticated-registration"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmitWaitlist}
            className="flex flex-col gap-5"
          >
            <div className="flex items-center justify-between border-b-2 border-[#1A1108]/15 pb-4">
              <div className="flex items-center gap-2.5">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'student'}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full border-2 border-[#1A1108]"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#C9A227] flex items-center justify-center text-white font-display text-sm">
                    {user.displayName?.[0] || 'S'}
                  </div>
                )}
                <div className="text-left">
                  <p className="text-xs font-condensed tracking-wider font-semibold text-[#1A1108]/50 uppercase">STUDENT VERIFIED</p>
                  <p className="text-sm font-bold text-[#1A1108] leading-tight">{user.displayName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-[#1A1108]/60 hover:text-red-600 transition-colors uppercase font-condensed text-xs font-bold flex items-center gap-1 bg-white/40 border border-[#1A1108]/15 px-2.5 py-1 rounded-full outline-none"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>

            <div className="text-left">
              <h3 className="font-display text-xl text-[#1A1108] uppercase leading-none tracking-tight mb-1">
                Complete Your Spot Reservation
              </h3>
              <p className="text-xs text-[#1A1108]/70">
                You're authenticated as <span className="font-bold">{user.email}</span>. Fill outer campus coordinates to compute your position:
              </p>
            </div>

            {formError && (
              <div className="text-xs bg-red-500/10 border border-red-500/30 text-red-700 font-semibold px-4 py-2.5 rounded-lg text-left">
                {formError}
              </div>
            )}

            {/* Input College */}
            <div className="flex flex-col gap-1 text-left">
              <label htmlFor="collegeName" className="font-condensed text-[10px] font-black tracking-widest text-[#1A1108]/60 uppercase">
                College or University in India *
              </label>
              <input
                id="collegeName"
                type="text"
                placeholder="e.g. IIT Bombay, BITS Pilani, DU, or Ashoka"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                autoComplete="off"
                required
                className="w-full bg-transparent border-b border-[#1A1108]/20 pb-2 text-sm font-medium text-[#1A1108] placeholder-[#1A1108]/30 outline-none focus:border-[#C9A227] transition-all"
              />
            </div>

            {/* Input Major / Course */}
            <div className="flex flex-col gap-1 text-left">
              <label htmlFor="course" className="font-condensed text-[10px] font-black tracking-widest text-[#1A1108]/60 uppercase">
                Course or Major *
              </label>
              <input
                id="course"
                type="text"
                placeholder="e.g. Computer Science, Economics, B.Tech or B.Com"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                autoComplete="off"
                required
                className="w-full bg-transparent border-b border-[#1A1108]/20 pb-2 text-sm font-medium text-[#1A1108] placeholder-[#1A1108]/30 outline-none focus:border-[#C9A227] transition-all"
              />
            </div>

            {/* Input Graduation Year */}
            <div className="flex flex-col gap-1 text-left">
              <label htmlFor="gradYear" className="font-condensed text-[10px] font-black tracking-widest text-[#1A1108]/60 uppercase">
                Graduation Year *
              </label>
              <div className="relative">
                <select
                  id="gradYear"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  className="w-full bg-transparent border-b border-[#1A1108]/20 pb-2 text-sm font-medium text-[#1A1108] outline-none focus:border-[#C9A227] appearance-none cursor-pointer transition-all"
                >
                  <option value="2026">Class of 2026</option>
                  <option value="2027">Class of 2027</option>
                  <option value="2028">Class of 2028</option>
                  <option value="2029">Class of 2029</option>
                  <option value="2030">Class of 2030</option>
                </select>
                <div className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-[#1A1108]/60">
                  ▼
                </div>
              </div>
            </div>

            {/* Refer a Friend Input */}
            <div className="flex flex-col gap-1 text-left">
              <div className="flex justify-between items-center">
                <label htmlFor="referralEmail" className="font-condensed text-[10px] font-black tracking-widest text-[#1A1108]/60 uppercase">
                  Refer a Friend (Email) - Optional
                </label>
                <span className="text-[10px] font-bold text-[#C9A227] uppercase">SKIP 500 SPOTS! 🚀</span>
              </div>
              <input
                id="referralEmail"
                type="email"
                placeholder="friend@college.edu.in"
                value={referralEmail}
                onChange={(e) => setReferralEmail(e.target.value)}
                autoComplete="off"
                className="w-full bg-transparent border-b border-[#1A1108]/20 pb-2 text-sm font-medium text-[#1A1108] placeholder-[#1A1108]/30 outline-none focus:border-[#C9A227] transition-all"
              />
            </div>

            <motion.button
              type="submit"
              id="reserve-spot-trigger"
              whileHover={{ 
                scale: 1.05, 
                y: -1,
                boxShadow: "0 8px 16px rgba(18, 11, 4, 0.4)",
                transition: { type: "spring", stiffness: 400, damping: 12 }
              }}
              whileTap={{ scale: 0.95, y: 0 }}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-[#C9A227] text-[#1A1108] font-bold text-sm tracking-wide uppercase hover:bg-[#C9A227]/90 py-4 px-6 rounded-2xl transition-all shadow-[4px_4px_0px_0px_#1A1108] cursor-pointer outline-none"
            >
              <span>Reserve My Spot on Waitlist</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </motion.button>
          </motion.form>
        )}

        {/* State 3: User already submitted waitlist registration */}
        {user && waitlistRecord && (
          <motion.div
            key="waitlist-registered-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center text-center"
          >
            {/* Checked success circle */}
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-600 mb-4 animate-pulse">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="font-condensed font-bold text-xs tracking-widest text-[#C9A227] uppercase bg-[#C9A227]/10 border border-[#C9A227]/30 px-3.5 py-1 rounded-full mb-3">
              VIP SECURED ACCESS
            </span>

            <h3 className="font-display text-2xl lg:text-3xl text-[#1A1108] uppercase leading-tight mb-2 tracking-tight">
              You’re On the List!
            </h3>

            <p className="text-sm text-[#1A1108]/80 max-w-sm mb-6 leading-relaxed">
              Congratulations! Spot is verified on our launch database. Watch out for exclusive beta test codes in your inbox.
            </p>

            {/* Custom Waitlist Position Ticket Card - Premium Apple UX Vibe */}
            <div className="w-full bg-[#1A1108] text-[#F4EBD7] px-6 py-5 rounded-3xl border-2 border-[#C9A227] relative overflow-hidden mb-6 shadow-lg">
              {/* Background decorative ring */}
              <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-gradient-to-tr from-[#C9A227]/10 to-transparent rounded-full pointer-events-none"></div>

              <div className="flex justify-between items-center border-b border-[#F4EBD7]/10 pb-3 mb-4">
                <div className="text-left">
                  <p className="font-condensed text-[10px] text-[#C9A227] tracking-wider font-extrabold uppercase mb-0.5">MEMBER ID</p>
                  <p className="font-mono text-xs text-white opacity-80">{user.uid.slice(0, 12).toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="font-condensed text-[10px] text-[#C9A227] tracking-wider font-extrabold uppercase mb-0.5">LAUNCH STATUS</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    EARLY ACCESS STAGE-1
                  </span>
                </div>
              </div>

              {/* Waitlist Position */}
              <div className="flex flex-col items-center justify-center mb-4">
                <p className="font-condensed text-xs text-neutral-400 tracking-widest uppercase mb-1">YOUR EXCLUSIVE SPOT</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-3xl sm:text-4xl md:text-5xl text-[#C9A227]">
                    #{myWaitlistNumber.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Verified Scholar attributes */}
              <div className="grid grid-cols-2 gap-4 text-left border-t border-[#F4EBD7]/10 pt-3 md:pt-4 text-xs">
                <div>
                  <p className="text-neutral-400 font-condensed">CLASS OF</p>
                  <p className="font-bold text-white uppercase">{waitlistRecord.graduationYear}</p>
                </div>
                <div>
                  <p className="text-neutral-400 font-condensed">COLLEGE</p>
                  <p className="font-bold text-white uppercase line-clamp-1">{waitlistRecord.collegeName}</p>
                </div>
              </div>
            </div>

            {/* Gen-Z Viral Referrals System */}
            <div className="w-full bg-[#C9A227]/10 border border-[#C9A227]/30 rounded-2xl p-4 text-left mb-6">
              <div className="flex items-center gap-2 text-[#C9A227] mb-2 font-condensed text-xs font-extrabold uppercase tracking-wider">
                <Award className="w-4 h-4" />
                <span>Move Up the Waitlist (Skip 500 spots!)</span>
              </div>
              <p className="text-xs text-[#1A1108]/90 mb-3 leading-relaxed">
                Invite classmates to sign up using your link to instant-unlock **Closed Beta Match Code** and skip to launch list!
              </p>
              
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}?ref=${user.uid}`}
                  className="flex-1 bg-[#F4EBD7] border-2 border-[#1A1108] text-xs font-medium px-3 py-2 rounded-xl text-[#1A1108] select-all outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="bg-[#1A1108] text-[#F4EBD7] hover:bg-[#1A1108]/90 hover:scale-105 active:scale-95 transition-all text-xs font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-1 outline-none"
                >
                  {copied ? (
                    'Copied!'
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>

              {/* Interactive secondary email referral input */}
              <form onSubmit={handleAddReferralEmail} className="pt-3 border-t border-[#C9A227]/30 flex flex-col gap-2">
                <label className="font-condensed text-[10px] font-black tracking-wider text-[#1A1108]/60 uppercase">
                  Refer classmates via Email directly (+500 priority pts each!)
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="classmate@college.edu.in"
                    value={newReferralEmail}
                    onChange={(e) => setNewReferralEmail(e.target.value)}
                    required
                    className="flex-1 bg-white border border-[#1A1108]/15 text-xs px-3 py-2 rounded-xl text-[#1A1108] outline-none focus:border-[#C9A227]"
                  />
                  <button
                    type="submit"
                    disabled={referralSubmitting}
                    className="bg-[#C9A227] hover:scale-105 active:scale-95 text-[#1A1108] text-xs font-extrabold px-3.5 py-2 rounded-xl flex items-center justify-center gap-1 outline-none cursor-pointer"
                  >
                    <span>{referralSubmitting ? '...' : 'Refer'}</span>
                    <Send className="w-3 h-3" />
                  </button>
                </div>
                {referralError && (
                  <p className="text-[10px] text-red-600 font-semibold mt-1">{referralError}</p>
                )}
                {referralFeedback && (
                  <p className="text-[10px] text-emerald-600 font-semibold mt-1">{referralFeedback}</p>
                )}
              </form>

              {/* Referred friends list */}
              {totalReferrals > 0 && (
                <div className="mt-4 pt-3 border-t border-[#C9A227]/30">
                  <p className="font-condensed text-[10px] font-black tracking-wider text-[#1A1108]/60 uppercase mb-2">Referred Friends ({totalReferrals})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {waitlistRecord.referralEmail && (
                      <span className="inline-flex items-center gap-1 bg-white/60 border border-[#1A1108]/10 text-[#1A1108] text-[9px] font-bold px-2.5 py-1 rounded-full font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {waitlistRecord.referralEmail}
                      </span>
                    )}
                    {waitlistRecord.referralEmails?.map((refEmail, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 bg-white/60 border border-[#1A1108]/10 text-[#1A1108] text-[9px] font-bold px-2.5 py-1 rounded-full font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]"></span>
                        {refEmail}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 w-full justify-between">
              <button
                onClick={handleSignOut}
                className="text-[#1A1108]/60 hover:text-red-600 transition-colors uppercase font-condensed text-xs font-bold flex items-center gap-1.5 bg-white/40 border border-[#1A1108]/15 px-4 py-2.5 rounded-2xl outline-none"
              >
                <LogOut className="w-4 h-4" />
                Disconnect Profile
              </button>
              <div className="flex items-center gap-1 text-[10px] text-[#1A1108]/50 font-medium">
                <Users className="w-3.5 h-3.5" />
                <span>{8420 + Math.floor(Math.random() * 5)} registered</span>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

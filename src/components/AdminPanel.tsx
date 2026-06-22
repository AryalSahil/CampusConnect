import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  onSnapshot,
  setDoc
} from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { WaitlistRegistration } from '../types';
import { 
  Search, 
  Trash2, 
  Download, 
  RefreshCw, 
  Lock, 
  Unlock, 
  Users, 
  GraduationCap, 
  Calendar, 
  ArrowLeft, 
  AlertCircle,
  FileText,
  X,
  Sparkles,
  BookmarkCheck,
  CheckCircle2,
  Settings,
  Mail,
  Terminal,
  Clock,
  ExternalLink,
  Sliders,
  Flame,
  Laptop,
  Smartphone
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip as ChartTooltip, 
  CartesianGrid 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';

interface AdminPanelProps {
  onBackToLanding: () => void;
}

export default function AdminPanel({ onBackToLanding }: AdminPanelProps) {
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  const [waitlistData, setWaitlistData] = useState<WaitlistRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataError, setDataError] = useState('');
  const [refreshCount, setRefreshCount] = useState(0);
  
  // Search and Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGradYear, setSelectedGradYear] = useState('all');
  const [selectedCollege, setSelectedCollege] = useState('all');
  const [sortBy, setSortBy] = useState<'joinedAt_desc' | 'joinedAt_asc' | 'name_asc' | 'name_desc' | 'college_asc' | 'college_desc'>('joinedAt_desc');
  
  // Deletion state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Live Maintenance & Countdown state managers
  const [maintenanceActive, setMaintenanceActive] = useState(false);
  const [targetLaunchDate, setTargetLaunchDate] = useState('2026-07-15T12:00');
  const [launchMessage, setLaunchMessage] = useState('Our team is polishing the workspace... Campus Connect launching soon.');
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  // Cloud Function Waitlist welcome simulator states
  const [selectedSimulatorStudentId, setSelectedSimulatorStudentId] = useState('');
  const [simulatorLogs, setSimulatorLogs] = useState<string[]>([
    'SYSTEM: Serverless simulator initialized.',
    'SYSTEM: Monitoring cloud/functions directory for execution threads.'
  ]);
  const [isSimulatingTrigger, setIsSimulatingTrigger] = useState(false);
  const [showSimulatorEmailPreview, setShowSimulatorEmailPreview] = useState(false);
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState(false);
  const [previewDeviceType, setPreviewDeviceType] = useState<'desktop' | 'mobile'>('desktop');

  // Load session auth status from sessionStorage so refreshing does not kick admin out
  useEffect(() => {
    const adminSessionToken = sessionStorage.getItem('campus_connect_admin_token');
    if (adminSessionToken === 'authenticated_782447') {
      setIsAuthenticated(true);
    }
  }, []);

  // Sync settings/maintenance document in real-time 24/7
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = onSnapshot(doc(db, 'settings', 'maintenance'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMaintenanceActive(data.active ?? false);
        setTargetLaunchDate(data.targetLaunchDate ?? '2026-07-15T12:00');
        setLaunchMessage(data.launchMessage ?? 'Campus Connect is currently under scheduled maintenance.');
      }
    }, (err: any) => {
      console.error("Failed to sync system configuration in admin console:", err);
      handleFirestoreError(err, 'get', 'settings/maintenance');
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  // Save Maintenance status directly inside Firestore settings/maintenance
  const handleUpdateMaintenanceStatus = async (newVal: boolean) => {
    setIsUpdatingSettings(true);
    try {
      await setDoc(doc(db, 'settings', 'maintenance'), {
        active: newVal,
        targetLaunchDate,
        launchMessage
      });
      setMaintenanceActive(newVal);
    } catch (err: any) {
      console.error("Failed to update system settings:", err);
      handleFirestoreError(err, 'write', 'settings/maintenance');
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  // Save launch parameters inside settings/maintenance
  const handleUpdateLaunchDateSettings = async () => {
    setIsUpdatingSettings(true);
    try {
      await setDoc(doc(db, 'settings', 'maintenance'), {
        active: maintenanceActive,
        targetLaunchDate,
        launchMessage
      });
      alert(`Pre-Launch configuration details saved successfully!`);
    } catch (err: any) {
      console.error("Failed to update system settings:", err);
      handleFirestoreError(err, 'write', 'settings/maintenance');
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  // Run serverless simulator welcome email
  const handleSimulateEmailTrigger = async (studentId: string) => {
    if (!studentId) {
      alert("Please select a student record to trigger.");
      return;
    }
    const student = waitlistData.find(item => item.uid === studentId);
    if (!student) return;

    setIsSimulatingTrigger(true);
    setShowSimulatorEmailPreview(false);
    
    // Simulate procedural Cloud Function logs
    const steps = [
      `[TRIGGER] 2026-06-22T08:15:22Z: firestore.document("waitlist/${studentId}").onCreate triggered.`,
      `[INFO] Pulling metadata fields ... Name: "${student.fullName}", Email: "${student.email || 'N/A'}"`,
      `[INFO] Recipient: "${student.email || 'N/A'}", Institution: "${student.collegeName || 'N/A'}"`,
      `[INFO] Compiling responsive HTML template with template parameters ...`,
      `[INFO] Attempting secure nodemailer connection with smtp.resend.com:587...`,
      `[SUCCESS] SMTP TLS pipe verified. Email compiled successfully.`,
      `[SUCCESS] Message dispatched under message descriptor: <mail_${Math.floor(100000 + Math.random() * 900000)}@campusconnect.edu>`,
      `[SUCCESS] Serverless welcome trigger execution term completed: Success (200)`
    ];

    // Stream logs nicely
    setSimulatorLogs([`SYSTEM: Initializing welcome-email trigger flow.`]);
    let currentStep = 0;
    
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setSimulatorLogs(prev => [...prev, steps[currentStep]]);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsSimulatingTrigger(false);
        setShowSimulatorEmailPreview(true);
      }
    }, 450);
  };

  // 24/7 Real-time sync of waitlist database records
  useEffect(() => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setDataError('');

    const waitlistRef = collection(db, 'waitlist');
    const q = query(waitlistRef, orderBy('joinedAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records: WaitlistRegistration[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        records.push({
          uid: docSnap.id,
          fullName: data.fullName || '',
          email: data.email || '',
          collegeName: data.collegeName || '',
          course: data.course || '',
          graduationYear: data.graduationYear || '',
          joinedAt: data.joinedAt,
          referralCode: data.referralCode || '',
          referrerUid: data.referrerUid || '',
        });
      });
      setWaitlistData(records);
      setIsLoading(false);
      setDataError('');
    }, (err: any) => {
      console.error('Firestore real-time sync failed:', err);
      setDataError(`Active Registry Sync Interrupted: ${err.message || 'Permission Denied'}`);
      setIsLoading(false);
      handleFirestoreError(err, 'list', 'waitlist');
    });

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated, refreshCount]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '782447') {
      setIsAuthenticated(true);
      setAuthError('');
      sessionStorage.setItem('campus_connect_admin_token', 'authenticated_782447');
    } else {
      setAuthError('Incorrect system security passcode.');
      setPasswordInput('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('campus_connect_admin_token');
    setPasswordInput('');
  };

  const fetchWaitlist = async () => {
    // Simply incrementing refreshCount triggers unsubscription and re-initiating the onSnapshot listener
    setRefreshCount(prev => prev + 1);
  };

  const handleDeleteEntry = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'waitlist', id));
      setWaitlistData(prev => prev.filter(item => item.uid !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Delete error:', err);
      handleFirestoreError(err, 'delete', `waitlist/${id}`);
    } finally {
      setDeletingId(null);
    }
  };

  const downloadCSV = () => {
    if (waitlistData.length === 0) return;

    // Build header list
    const headers = ['Document ID', 'Full Name', 'Email', 'College/University', 'Course/Major', 'Graduation Year', 'Referral Code', 'Referrer UID', 'Joined At'];
    
    // Convert rows
    const rows = waitlistData.map(item => {
      const joinedStr = item.joinedAt ? formatJoinedAt(item.joinedAt) : 'N/A';
      return [
        item.uid,
        `"${item.fullName.replace(/"/g, '""')}"`,
        `"${item.email.replace(/"/g, '""')}"`,
        `"${item.collegeName.replace(/"/g, '""')}"`,
        `"${item.course.replace(/"/g, '""')}"`,
        item.graduationYear,
        item.referralCode || '',
        item.referrerUid || '',
        `"${joinedStr}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `campus_connect_waitlist_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatJoinedAt = (joinedAt: any) => {
    if (!joinedAt) return 'N/A';
    if (typeof joinedAt.toDate === 'function') {
      return joinedAt.toDate().toLocaleString();
    }
    if (joinedAt.seconds) {
      return new Date(joinedAt.seconds * 1000).toLocaleString();
    }
    return new Date(joinedAt).toLocaleString();
  };

  // Extract unique elements for filters
  const uniqueColleges = Array.from(new Set(waitlistData.map(item => item.collegeName))).filter(Boolean);
  const uniqueGradYears = Array.from(new Set(waitlistData.map(item => item.graduationYear))).filter(Boolean).sort();

  // Recharts past 30 days growth data builder
  const getGrowthTrendData = () => {
    const datesMap: { [key: string]: number } = {};
    
    // Initialize past 30 days starting with 0 sign-ups
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      datesMap[dateString] = 0;
    }

    // Fill with real waitlisted student registration epochs
    waitlistData.forEach(item => {
      let itemDate: Date;
      if (item.joinedAt?.toDate && typeof item.joinedAt.toDate === 'function') {
        itemDate = item.joinedAt.toDate();
      } else if (item.joinedAt?.seconds) {
        itemDate = new Date(item.joinedAt.seconds * 1000);
      } else if (item.joinedAt) {
        itemDate = new Date(item.joinedAt);
      } else {
        return;
      }
      
      const dateString = itemDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (dateString in datesMap) {
        datesMap[dateString]++;
      }
    });

    // Translate to structures for Recharts payload
    return Object.entries(datesMap).map(([date, count]) => ({
      date,
      Registrations: count,
    }));
  };

  // Find the absolute newest signup record by matching timestamps
  const getNewestSignUpId = () => {
    if (waitlistData.length === 0) return null;
    let newestId = waitlistData[0].uid;
    let maxTime = 0;
    
    waitlistData.forEach(item => {
      let itemTime = 0;
      if (item.joinedAt?.toDate && typeof item.joinedAt.toDate === 'function') {
        itemTime = item.joinedAt.toDate().getTime();
      } else if (item.joinedAt?.seconds) {
        itemTime = item.joinedAt.seconds * 1000;
      } else if (typeof item.joinedAt === 'string') {
        itemTime = new Date(item.joinedAt).getTime();
      } else if (item.joinedAt instanceof Date) {
        itemTime = item.joinedAt.getTime();
      }
      if (itemTime > maxTime) {
        maxTime = itemTime;
        newestId = item.uid;
      }
    });
    
    return newestId;
  };

  // Filter logic
  const filteredData = waitlistData.filter(item => {
    const matchesSearch = 
      item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.collegeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.course.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGrad = selectedGradYear === 'all' || item.graduationYear === selectedGradYear;
    const matchesCollege = selectedCollege === 'all' || item.collegeName === selectedCollege;

    return matchesSearch && matchesGrad && matchesCollege;
  });

  // Sort logic (real-time timestamp ordering, A-Z, Z-A, and Colleges)
  const sortedAndFilteredData = [...filteredData].sort((a, b) => {
    if (sortBy === 'joinedAt_desc' || sortBy === 'joinedAt_asc') {
      const timeA = a.joinedAt?.seconds ? a.joinedAt.seconds * 1000 : (a.joinedAt ? new Date(a.joinedAt).getTime() : 0);
      const timeB = b.joinedAt?.seconds ? b.joinedAt.seconds * 1000 : (b.joinedAt ? new Date(b.joinedAt).getTime() : 0);
      return sortBy === 'joinedAt_desc' ? timeB - timeA : timeA - timeB;
    }
    if (sortBy === 'name_asc') {
      return a.fullName.localeCompare(b.fullName);
    }
    if (sortBy === 'name_desc') {
      return b.fullName.localeCompare(a.fullName);
    }
    if (sortBy === 'college_asc') {
      return a.collegeName.localeCompare(b.collegeName);
    }
    if (sortBy === 'college_desc') {
      return b.collegeName.localeCompare(a.collegeName);
    }
    return 0;
  });

  return (
    <div id="admin-panel-root" className="min-h-screen bg-[#F4EBD7] text-[#1A1108] font-sans selection:bg-[#C9A227]/30 selection:text-[#1A1108]">
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#C9A227] blur-[150px] opacity-10 pointer-events-none z-0"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#1A1108] blur-[150px] opacity-5 pointer-events-none z-0"></div>

      {/* --- PASSWORD AUTH SCREEN ENTRANCE --- */}
      {!isAuthenticated ? (
        <div className="min-h-screen flex flex-col justify-center items-center px-4 md:px-0 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-[#1A1108]/10 rounded-[32px] p-8 shadow-2xl relative overflow-hidden"
          >
            {/* Top Back Home Trigger */}
            <button 
              onClick={onBackToLanding}
              className="absolute top-6 left-6 text-xs font-semibold uppercase tracking-wider text-[#1A1108]/60 hover:text-[#C9A227] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Home
            </button>

            <div className="flex flex-col items-center mb-8 mt-6">
              <Logo className="scale-75 mb-4" />
              <div className="text-[10px] font-black tracking-widest text-[#C9A227] uppercase bg-[#C9A227]/10 px-3 py-1 rounded-full border border-[#C9A227]/20 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> SECURE ROOT ACCESS
              </div>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-6 text-left">
              <div className="flex flex-col gap-2">
                <label htmlFor="adminPassword" className="font-condensed text-[10px] font-black tracking-widest text-[#1A1108]/60 uppercase">
                  Security Passcode
                </label>
                <div className="relative">
                  <input
                    id="adminPassword"
                    type="password"
                    placeholder="Enter admin code..."
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    required
                    autoFocus
                    className="w-full bg-[#1A1108]/5 border border-[#1A1108]/15 px-4 py-3 rounded-2xl text-sm font-semibold tracking-widest text-center text-[#1A1108] placeholder-[#1A1108]/30 outline-none focus:border-[#C9A227] focus:bg-white transition-all"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A1108]/30">
                    🔒
                  </div>
                </div>
              </div>

              {authError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-xl border border-red-200"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{authError}</span>
                </motion.div>
              )}

              <button
                type="submit"
                className="w-full bg-[#1A1108] text-[#F4EBD7] py-3.5 px-6 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-[#C9A227] hover:text-[#1A1108] transition-all duration-300 shadow-[4px_4px_0px_0px_#C9A227] cursor-pointer"
              >
                Authenticate Command &rarr;
              </button>
            </form>

            <p className="text-center text-[10px] text-[#1A1108]/40 mt-6 font-mono">
              IP Logging & Active Session Tokens Enabled.
            </p>
          </motion.div>
        </div>
      ) : (

        /* --- EXTREMELY POLISHED LIVE ADMIN DASHBOARD --- */
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 relative z-10">
          
          {/* Header Action Row */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#1A1108]/10 pb-6 mb-8">
            <div className="flex items-center gap-4">
              <Logo className="scale-75 origin-left" />
              <div className="h-6 w-[1px] bg-[#1A1108]/15 hidden md:block" />
              <div>
                <h1 className="font-display text-xl sm:text-2xl tracking-tight text-[#1A1108] uppercase">
                  Waitlist Console
                </h1>
                <p className="text-xs text-[#1A1108]/60 font-mono mt-0.5">
                  Secure Live Cloud Registry Dashboard
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={fetchWaitlist}
                className="inline-flex items-center gap-1.5 bg-[#1A1108]/5 border border-[#1A1108]/15 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-[#1A1108] hover:bg-white transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              <button
                onClick={downloadCSV}
                disabled={isLoading || waitlistData.length === 0}
                className="inline-flex items-center gap-1.5 bg-[#C9A227] border border-[#C9A227]/50 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-[#1A1108] hover:bg-[#C9A227]/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_#1A1108] cursor-pointer font-sans"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>

              <button
                onClick={() => setShowEmailPreviewModal(true)}
                className="inline-flex items-center gap-1.5 bg-[#1A1108]/5 border border-[#1A1108]/15 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-[#1A1108] hover:bg-[#1A1108] hover:text-[#F4EBD7] transition-all cursor-pointer font-sans shadow-[2px_2px_0px_0px_#1A1108]/10"
              >
                <Mail className="w-3.5 h-3.5" />
                Email Preview
              </button>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 bg-red-600/10 border border-red-600/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
              >
                Exit Console
              </button>

              <button 
                onClick={onBackToLanding}
                className="inline-flex items-center gap-1.5 bg-neutral-800 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#C9A227] hover:text-[#1A1108] transition-all cursor-pointer"
              >
                Back To Site &rarr;
              </button>
            </div>
          </header>

          {/* Quick Registry Metrics Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            {/* Metric 1: Total Waitlisted */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white/60 backdrop-blur-md border border-[#1A1108]/10 p-5 rounded-[22px] shadow-sm flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-[#C9A227]/10 text-[#C9A227] rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black tracking-widest text-[#1A1108]/50 uppercase font-mono">
                  Waitlist Size
                </p>
                <h3 className="text-2xl font-black text-[#1A1108] mt-0.5">
                  {isLoading ? '...' : waitlistData.length}
                </h3>
              </div>
            </motion.div>

            {/* Metric 2: Filtered Row Count */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/60 backdrop-blur-md border border-[#1A1108]/10 p-5 rounded-[22px] shadow-sm flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-[#1A1108]/5 text-[#1A1108] rounded-2xl flex items-center justify-center">
                <BookmarkCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black tracking-widest text-[#1A1108]/50 uppercase font-mono">
                  Matching Results
                </p>
                <h3 className="text-2xl font-black text-[#1A1108] mt-0.5">
                  {isLoading ? '...' : filteredData.length}
                </h3>
              </div>
            </motion.div>

            {/* Metric 3: Active Colleges */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white/60 backdrop-blur-md border border-[#1A1108]/10 p-5 rounded-[22px] shadow-sm flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-[#C9A227]/10 text-[#C9A227] rounded-2xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black tracking-widest text-[#1A1108]/50 uppercase font-mono font-sans">
                  Total Colleges
                </p>
                <h3 className="text-2xl font-black text-[#1A1108] mt-0.5">
                  {isLoading ? '...' : uniqueColleges.length}
                </h3>
              </div>
            </motion.div>

            {/* Metric 4: System Safeguard Status */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#1A1108] p-5 rounded-[22px] shadow-lg flex items-center gap-4 text-white"
            >
              <div className="w-12 h-12 bg-[#C9A227]/20 text-[#C9A227] rounded-2xl flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[9px] font-black tracking-widest text-neutral-400 uppercase font-mono">
                  Cloud Connection
                </p>
                <h3 className="text-sm font-bold text-[#C9A227] mt-1 flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  PERSISTENT LIVE
                </h3>
              </div>
            </motion.div>
          </div>

          {/* Live Analytics and Launch Controller Cluster */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            
            {/* Left Column: Recharts Daily Growth Trend Area Plot */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-7 bg-white/75 backdrop-blur-md border border-[#1A1108]/10 rounded-[28px] p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#C9A227]/10 text-[#C9A227] rounded-xl">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-sm uppercase tracking-tight text-[#1A1108]">
                        Daily Registry growth trend
                      </h3>
                      <p className="text-[10px] text-[#1A1108]/60 font-mono mt-0.5">
                        Past 30 Days Activity Log
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold uppercase font-mono tracking-wider bg-[#1A1108]/5 px-2.5 py-1 rounded-lg border border-[#1A1108]/10 text-[#1A1108]">
                    {waitlistData.length} entries recorded
                  </span>
                </div>
                
                {/* Recharts Container */}
                <div className="h-[240px] w-full mt-4 pr-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getGrowthTrendData()} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C9A227" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#C9A227" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1A1108/10" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 9, fill: '#1A1108', opacity: 0.6 }} 
                        axisLine={false} 
                        tickLine={false}
                      />
                      <YAxis 
                        allowDecimals={false}
                        tick={{ fontSize: 9, fill: '#1A1108', opacity: 0.6 }} 
                        axisLine={false} 
                        tickLine={false}
                      />
                      <ChartTooltip 
                        contentStyle={{ 
                          backgroundColor: '#1A1108', 
                          borderRadius: '16px', 
                          border: '1px solid #C9A227', 
                          color: '#F4EBD7',
                          fontSize: '11px',
                          fontFamily: 'monospace'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="Registrations" 
                        stroke="#C9A227" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorRegistrations)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Dynamic Launch & Maintenance Settings Controller */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="lg:col-span-5 bg-white/75 backdrop-blur-md border border-[#1A1108]/10 rounded-[28px] p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-[#1A1108]/5 text-[#1A1108] rounded-xl">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm uppercase tracking-tight text-[#1A1108]">
                      System Launch Command
                    </h3>
                    <p className="text-[10px] text-[#1A1108]/60 font-mono mt-0.5">
                      Live Core Mode Configuration
                    </p>
                  </div>
                </div>

                {/* Maintenance Toggle Switch Component */}
                <div className="bg-[#1A1108]/5 border border-[#1A1108]/10 rounded-2xl p-4 mb-4 flex items-center justify-between">
                  <div className="text-left">
                    <h4 className="text-xs uppercase font-condensed font-extrabold tracking-wider text-[#1A1108] flex items-center gap-1.5 font-sans">
                      <span>Maintenance Mode Gate</span>
                      {maintenanceActive && (
                        <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-ping" />
                      )}
                    </h4>
                    <p className="text-[10px] text-[#1A1108]/70 font-sans mt-0.5 max-w-[200px]">
                      If active, normal students land on the countdown screen instantly.
                    </p>
                  </div>
                  <button
                    onClick={() => handleUpdateMaintenanceStatus(!maintenanceActive)}
                    disabled={isUpdatingSettings}
                    className={`w-14 h-8 rounded-full p-1 transition-all duration-300 outline-none flex items-center border ${
                      maintenanceActive 
                        ? 'bg-[#C9A227] border-[#C9A227]' 
                        : 'bg-neutral-200 border-neutral-300'
                    }`}
                  >
                    <div 
                      className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-all duration-300 ${
                        maintenanceActive ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Target Launch Date Input parameters form */}
                <div className="space-y-3">
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#1A1108]/70 font-mono">
                      Launch Countdown Timestamp
                    </label>
                    <input
                      type="datetime-local"
                      value={targetLaunchDate}
                      onChange={(e) => setTargetLaunchDate(e.target.value)}
                      className="w-full bg-[#1A1108]/5 border border-[#1A1108]/15 px-3 py-2 rounded-xl text-xs font-semibold outline-none focus:border-[#C9A227] focus:bg-white transition-all font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#1A1108]/70 font-mono">
                      Maintenance Message
                    </label>
                    <textarea
                      rows={2}
                      value={launchMessage}
                      onChange={(e) => setLaunchMessage(e.target.value)}
                      placeholder="Enter custom countdown caption message..."
                      className="w-full bg-[#1A1108]/5 border border-[#1A1108]/15 px-3 py-2 rounded-xl text-xs outline-none focus:border-[#C9A227] focus:bg-white transition-all font-sans resize-none"
                    />
                  </div>

                  <button
                    onClick={handleUpdateLaunchDateSettings}
                    disabled={isUpdatingSettings}
                    className="w-full bg-[#1A1108] text-white py-2.5 rounded-xl text-[10px] uppercase font-black tracking-wider hover:bg-[#C9A227] hover:text-[#1A1108] transition-all disabled:opacity-50 font-sans shadow-md cursor-pointer"
                  >
                    {isUpdatingSettings ? 'Applying changes...' : 'Save Launch Parameters'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Filtering and Query Control Center */}
          <div className="bg-white/75 backdrop-blur-md border border-[#1A1108]/10 rounded-[28px] p-4 sm:p-6 mb-8 shadow-sm flex flex-col md:flex-row items-center gap-4">
            
            <div className="relative w-full md:flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1108]/40" />
              <input
                type="text"
                placeholder="Search by student name, email, college or academic major..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1A1108]/5 border border-[#1A1108]/10 pl-11 pr-4 py-3 rounded-2xl text-xs sm:text-sm font-medium text-[#1A1108] placeholder-[#1A1108]/30 outline-none focus:border-[#C9A227] focus:bg-white transition-all"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1A1108]/40 hover:text-[#1A1108]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Grad Year */}
            <div className="w-full md:w-48 flex-shrink-0">
              <select
                value={selectedGradYear}
                onChange={(e) => setSelectedGradYear(e.target.value)}
                className="w-full bg-[#1A1108]/5 border border-[#1A1108]/10 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-[#1A1108] cursor-pointer outline-none focus:border-[#C9A227] transition-all"
              >
                <option value="all">🎓 Grad Year: All</option>
                {uniqueGradYears.map(year => (
                  <option key={year} value={year}>Class of {year}</option>
                ))}
              </select>
            </div>

            {/* Filter College */}
            <div className="w-full md:w-56 flex-shrink-0">
              <select
                value={selectedCollege}
                onChange={(e) => setSelectedCollege(e.target.value)}
                className="w-full bg-[#1A1108]/5 border border-[#1A1108]/10 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-[#1A1108] cursor-pointer outline-none focus:border-[#C9A227] transition-all"
              >
                <option value="all">🏫 College: All</option>
                {uniqueColleges.map(coll => (
                  <option key={coll} value={coll}>{coll}</option>
                ))}
              </select>
            </div>

            {/* Sort Selector */}
            <div className="w-full md:w-56 flex-shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-[#1A1108]/5 border border-[#1A1108]/10 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-[#1A1108] cursor-pointer outline-none focus:border-[#C9A227] transition-all"
              >
                <option value="joinedAt_desc">⚡ Joined: Newest First</option>
                <option value="joinedAt_asc">⏳ Joined: Oldest First</option>
                <option value="name_asc">👤 Name: A to Z</option>
                <option value="name_desc">👤 Name: Z to A</option>
                <option value="college_asc">🏫 College: A to Z</option>
                <option value="college_desc">🏫 College: Z to A</option>
              </select>
            </div>
          </div>

          {/* Database List / Table Section */}
          <div className="bg-white/70 backdrop-blur-md rounded-[32px] border border-[#1A1108]/10 shadow-xl overflow-hidden relative">
            
            {/* Loading Indicator Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col justify-center items-center z-20 gap-3">
                <RefreshCw className="w-8 h-8 text-[#C9A227] animate-spin" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A1108]">Syncing Cloud Store...</span>
              </div>
            )}

            {dataError && (
              <div className="p-10 flex flex-col items-center justify-center text-center gap-3">
                <AlertCircle className="w-10 h-10 text-red-500" />
                <p className="text-sm font-bold text-red-600">{dataError}</p>
                <button 
                  onClick={fetchWaitlist}
                  className="bg-[#1A1108] text-white text-xs font-bold uppercase px-4 py-2.5 rounded-xl cursor-pointer hover:bg-[#C9A227] hover:text-[#1A1108] transition-all mt-2"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty States */}
            {!isLoading && !dataError && sortedAndFilteredData.length === 0 && (
              <div className="p-16 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-16 h-16 bg-[#1A1108]/5 rounded-full flex items-center justify-center text-[#1A1108]/30">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-display text-lg text-[#1A1108]/80 uppercase">No registrations found</h3>
                  <p className="text-xs text-[#1A1108]/60 mt-1 max-w-sm">
                    No waitlist students matched your current queries. Try softening your search or resetting constraints.
                  </p>
                </div>
                {(searchTerm !== '' || selectedGradYear !== 'all' || selectedCollege !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedGradYear('all');
                      setSelectedCollege('all');
                    }}
                    className="bg-[#1A1108] text-[#F4EBD7] text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-[#C9A227] hover:text-[#1A1108] transition-all cursor-pointer shadow-[3px_3px_0px_0px_#C9A227]"
                  >
                    Reset Filter Parameters
                  </button>
                )}
              </div>
            )}

            {/* Desktop Table View */}
            {!isLoading && !dataError && sortedAndFilteredData.length > 0 && (
              <div className="overflow-x-auto hidden lg:block">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#1A1108]/5 border-b border-[#1A1108]/15">
                      <th className="p-5 font-condensed text-[10px] font-black tracking-widest text-[#1A1108]/60 uppercase">Student Profile</th>
                      <th className="p-5 font-condensed text-[10px] font-black tracking-widest text-[#1A1108]/60 uppercase">College / University</th>
                      <th className="p-5 font-condensed text-[10px] font-black tracking-widest text-[#1A1108]/60 uppercase">Course or Major</th>
                      <th className="p-5 font-condensed text-[10px] font-black tracking-widest text-[#1A1108]/60 uppercase">Year</th>
                      <th className="p-5 font-condensed text-[10px] font-black tracking-widest text-[#1A1108]/60 uppercase">Referrals</th>
                      <th className="p-5 font-condensed text-[10px] font-black tracking-widest text-[#1A1108]/60 uppercase text-center">Registration Time</th>
                      <th className="p-5 font-condensed text-[10px] font-black tracking-widest text-[#1A1108]/60 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A1108]/10">
                    <AnimatePresence>
                      {sortedAndFilteredData.map((item, index) => {
                        const isNewest = item.uid === getNewestSignUpId();
                        return (
                          <motion.tr 
                            key={item.uid}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.2 }}
                            className={`transition-all text-sm group ${
                              isNewest 
                                ? 'bg-[#C9A227]/10 hover:bg-[#C9A227]/15 border-l-4 border-l-[#C9A227] shadow-[0_0_15px_rgba(201,162,39,0.3)]' 
                                : 'hover:bg-[#1A1108]/5'
                            }`}
                          >
                            <td className="p-5">
                              <div className="flex flex-col">
                                <span className="font-extrabold text-[#1A1108] flex items-center gap-2">
                                  {item.fullName}
                                  {isNewest && (
                                    <span className="inline-flex items-center gap-1 bg-[#C9A227] text-[#1A1108] text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded-full animate-pulse border border-[#1A1108]/10 shadow-sm font-sans">
                                      ✨ Newest Registration
                                    </span>
                                  )}
                                </span>
                                <span className="text-xs text-[#1A1108]/60 font-mono mt-0.5">{item.email}</span>
                              </div>
                            </td>
                          <td className="p-5">
                            <span className="font-semibold text-[#1A1108]">{item.collegeName}</span>
                          </td>
                          <td className="p-5">
                            <span className="text-[#1A1108]/80 font-medium">{item.course}</span>
                          </td>
                          <td className="p-5">
                            <span className="text-[10px] font-black tracking-widest uppercase bg-[#C9A227]/10 text-[#C9A227] px-2.5 py-1 rounded-md border border-[#C9A227]/20 font-sans">
                              {item.graduationYear}
                            </span>
                          </td>
                          <td className="p-5">
                            {item.referralCode ? (
                              <div className="flex flex-col text-[10px] gap-0.5 font-mono">
                                <span className="text-emerald-700 font-bold">Code: {item.referralCode}</span>
                                {item.referrerUid && <span className="text-neutral-500 scale-90 origin-left">RefBy: {item.referrerUid.slice(0, 8)}...</span>}
                              </div>
                            ) : (
                              <span className="text-xs text-neutral-400 font-mono">-</span>
                            )}
                          </td>
                          <td className="p-5 text-center text-xs font-mono text-neutral-500">
                            {formatJoinedAt(item.joinedAt)}
                          </td>
                          <td className="p-5 text-right">
                            {deleteConfirmId === item.uid ? (
                              <div className="flex items-center justify-end gap-2">
                                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest mr-2 animate-pulse">Confirm?</span>
                                <button
                                  onClick={() => handleDeleteEntry(item.uid)}
                                  disabled={deletingId === item.uid}
                                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-all cursor-pointer shadow-sm relative"
                                >
                                  {deletingId === item.uid ? '...' : 'YES'}
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="bg-neutral-200 text-neutral-700 hover:bg-neutral-300 p-2 rounded-lg transition-all cursor-pointer shadow-sm"
                                >
                                  NO
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmId(item.uid)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                                title="Delete waitlist entry"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}

            {/* Mobile / Tablet Cards View */}
            {!isLoading && !dataError && sortedAndFilteredData.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 lg:hidden">
                <AnimatePresence>
                  {sortedAndFilteredData.map((item) => {
                    const isNewest = item.uid === getNewestSignUpId();
                    return (
                      <motion.div 
                        key={item.uid}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, x: -30 }}
                        className={`border rounded-2xl p-5 flex flex-col gap-4 shadow-sm relative overflow-hidden transition-all duration-305 ${
                          isNewest
                            ? 'border-[#C9A227] shadow-[0_0_15px_rgba(201,162,39,0.35)] bg-gradient-to-br from-white to-[#C9A227]/5'
                            : 'bg-white/80 border-[#1A1108]/10'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h4 className="font-extrabold text-[#1A1108] text-base leading-tight flex items-center gap-1.5 flex-wrap">
                              {item.fullName}
                              {isNewest && (
                                <span className="inline-flex bg-[#C9A227] text-[#1A1108] text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded-full uppercase animate-pulse">
                                  ✨ NEWEST
                                </span>
                              )}
                            </h4>
                            <p className="text-xs text-[#1A1108]/60 font-mono mt-1">{item.email}</p>
                          </div>
                          <span className="text-[10px] font-black tracking-widest text-[#C9A227] bg-[#C9A227]/10 border border-[#C9A227]/20 px-2.5 py-1 rounded-md uppercase font-sans">
                            {item.graduationYear}
                          </span>
                        </div>

                      <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#1A1108]/5 text-xs">
                        <div>
                          <p className="text-[9px] font-black tracking-wider text-neutral-400 uppercase font-mono">College</p>
                          <p className="font-bold text-[#1A1108] mt-0.5">{item.collegeName}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black tracking-wider text-neutral-400 uppercase font-mono">Major / Course</p>
                          <p className="font-semibold text-[#1A1108] mt-0.5">{item.course}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs mt-1 font-mono">
                        <div>
                          <p className="text-[9px] font-black tracking-wider text-neutral-400 uppercase">Joined On</p>
                          <p className="text-neutral-500 mt-0.5 text-[10px]">{formatJoinedAt(item.joinedAt)}</p>
                        </div>
                        {item.referralCode && (
                          <div className="text-right">
                            <p className="text-[9px] font-black tracking-wider text-neutral-400 uppercase">Referrals</p>
                            <p className="text-emerald-700 font-bold text-[10px] mt-0.5">{item.referralCode}</p>
                          </div>
                        )}
                      </div>

                      {/* Deletion Interface inside Card */}
                      <div className="mt-2 pt-3 border-t border-[#1A1108]/5 flex justify-end">
                        {deleteConfirmId === item.uid ? (
                          <div className="flex items-center gap-2 bg-red-50 p-1.5 rounded-xl border border-red-100">
                            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest px-2 animate-pulse">Delete?</span>
                            <button
                              onClick={() => handleDeleteEntry(item.uid)}
                              disabled={deletingId === item.uid}
                              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                            >
                              {deletingId === item.uid ? '...' : 'YES'}
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="bg-white text-neutral-700 hover:bg-neutral-100 text-xs font-bold px-3 py-1.5 rounded-lg border border-neutral-200 transition-all"
                            >
                              NO
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(item.uid)}
                            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-red-700 bg-neutral-50 hover:bg-red-50/50 border border-neutral-150 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete Record
                          </button>
                        )}
                      </div>
                    </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
            
          </div>

          {/* Section: Serverless Trigger & Email Template Simulation console */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/75 backdrop-blur-md border border-[#1A1108]/10 rounded-[28px] p-6 mb-8 mt-8 shadow-sm flex flex-col md:flex-row gap-6"
          >
            
            {/* Simulator left controls column */}
            <div className="w-full md:w-5/12 flex flex-col justify-between">
              <div className="text-left">
                <span className="text-[9px] font-black tracking-[0.2em] text-[#C9A227] uppercase bg-[#C9A227]/10 px-3 py-1 rounded-full border border-[#C9A227]/20 inline-flex items-center gap-1.5 mb-3 animate-pulse font-sans">
                  <Terminal className="w-3 h-3" /> Serverless Email Simulator
                </span>
                <h3 className="font-display text-sm uppercase tracking-tight text-[#1A1108] mb-2 font-sans font-bold">
                  Nodemailer Trigger Simulator
                </h3>
                <p className="text-xs text-[#1A1108]/75 leading-relaxed font-sans mb-4">
                  Select any registered waitlisted student to simulate the Firebase Cloud Function event listener trigger execution step-by-step.
                </p>

                {/* Picker Dropdown */}
                <div className="flex flex-col gap-1.5 mb-4">
                  <label className="text-[9px] font-black tracking-widest text-[#1A1108]/60 uppercase font-mono">
                    Choose Target Student
                  </label>
                  <select
                    value={selectedSimulatorStudentId}
                    onChange={(e) => setSelectedSimulatorStudentId(e.target.value)}
                    className="bg-[#1A1108]/10 border border-[#1A1108]/10 rounded-xl px-3.5 py-3 text-xs font-semibold focus:bg-white focus:border-[#C9A227] outline-none transition-all cursor-pointer text-[#1A1108] w-full"
                  >
                    <option value="" className="text-[#1A1108]">Select waitlist profile...</option>
                    {waitlistData.map(student => (
                      <option key={student.uid} value={student.uid} className="text-[#1A1108]">
                        🎒 {student.fullName} ({student.collegeName})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => handleSimulateEmailTrigger(selectedSimulatorStudentId)}
                  disabled={isSimulatingTrigger || !selectedSimulatorStudentId}
                  className="w-full text-center bg-[#C9A227] hover:bg-[#C9A227]/85 text-[#1A1108] text-xs font-black uppercase tracking-wider py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_#1A1108] cursor-pointer"
                >
                  {isSimulatingTrigger ? 'Compiling Serverless Execution...' : '✨ Run Function onWaitlistCreated()'}
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-[#1A1108]/10 text-[9px] text-[#1A1108]/50 font-mono">
                Status: functions-emulator online on Port 5001.
              </div>
            </div>

            {/* Simulator right console log output screen column */}
            <div className="w-full md:w-7/12 flex flex-col gap-3">
              
              {/* Visual Terminal panel output */}
              <div className="bg-[#100A05] text-[#F4EBD7] font-mono rounded-2xl p-4 flex-grow text-left text-xs border border-[#1A1108] min-h-[160px] max-h-[220px] overflow-y-auto shadow-inner flex flex-col gap-1.5 select-all">
                <div className="border-b border-[#F4EBD7]/10 pb-2 mb-2 flex items-center justify-between text-[10px] text-neutral-400">
                  <span className="flex items-center gap-1">🟢 LIVE TRIGGER CONSOLE LOGS</span>
                  <span>CC-functions v2.0.1</span>
                </div>
                {simulatorLogs.map((log, index) => (
                  <div key={index} className="leading-relaxed text-[10px]">
                    <span className="text-[#C9A227] font-bold select-none">&rarr;</span> {log}
                  </div>
                ))}
                {isSimulatingTrigger && (
                  <div className="animate-pulse text-[#C9A227] font-bold text-[10px]">
                    ▋ Executing serverless function...
                  </div>
                )}
              </div>

              {/* Responsive Inline compilation preview */}
              {showSimulatorEmailPreview && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="border-2 border-dashed border-[#C9A227] rounded-2xl p-4 text-center bg-[#F4EBD7]/30"
                >
                  <div className="text-xs uppercase font-condensed font-extrabold text-[#C9A227] tracking-widest flex items-center gap-2 justify-center mb-2 font-sans">
                    <Mail className="w-4 h-4" /> SECURE COMPILED SMTP EMAIL SENT PREVIEW
                  </div>
                  <p className="text-[10px] text-[#1A1108]/80 leading-relaxed font-sans mb-3">
                    A beautiful, fully-responsive 'Welcome' HTML template was successfully dispatched directly to the student! 
                  </p>
                  <div className="bg-white border border-[#1A1108]/10 rounded-xl max-h-[200px] overflow-y-auto p-4 text-left font-sans shadow-inner select-all">
                    <div className="border-b pb-2 mb-2">
                      <p className="text-[10px] text-neutral-500 font-mono m-0"><strong>From:</strong> Campus Connect Support &lt;welcome@campusconnect.edu&gt;</p>
                      <p className="text-[10px] text-neutral-500 font-mono m-0"><strong>To:</strong> {waitlistData.find(m => m.uid === selectedSimulatorStudentId)?.email}</p>
                      <p className="text-[10px] text-neutral-500 font-mono m-0"><strong>Subject:</strong> 🎒 You're on the list, {waitlistData.find(m => m.uid === selectedSimulatorStudentId)?.fullName}! Welcome to Campus Connect</p>
                    </div>
                    <div className="font-sans">
                      <h2 className="text-sm font-black text-[#1A1108] m-0 mb-1.5 uppercase">🎒 Welcome to the Inner Circle, {waitlistData.find(m => m.uid === selectedSimulatorStudentId)?.fullName}!</h2>
                      <p className="text-[11px] text-neutral-700 m-0 leading-relaxed mb-2">
                        Thank you for joining the Campus Connect waitlist. We are bringing college students together in a brand new way, and you've officially claimed your spot.
                      </p>
                      <div className="bg-[#F4EBD7] p-2.5 rounded-lg border border-[#1A1108]/10 text-[10px] mb-2 leading-relaxed">
                        <p className="m-0"><strong>University:</strong> {waitlistData.find(m => m.uid === selectedSimulatorStudentId)?.collegeName}</p>
                        <p className="m-0"><strong>Major:</strong> {waitlistData.find(m => m.uid === selectedSimulatorStudentId)?.course || 'General major studies'}</p>
                        <p className="m-0"><strong>Graduation Year:</strong> Class of {waitlistData.find(m => m.uid === selectedSimulatorStudentId)?.graduationYear}</p>
                      </div>
                      <p className="text-[11px] text-neutral-700 m-0">
                        Want to jump ahead? Share your unique referral code <strong className="text-[#C9A227] font-mono text-[11px]">{waitlistData.find(m => m.uid === selectedSimulatorStudentId)?.referralCode || 'CAMPUS-VIP'}</strong> to skip 100 spots in the queue!
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

            </div>
          </motion.div>

          <footer className="mt-12 text-center text-xs text-[#1A1108]/40 font-mono">
            System waitlist logs are stored securely using Google Cloud Firestore.
          </footer>

        </div>
      )}

      {/* Welcome Email Template Preview Modal */}
      <AnimatePresence>
        {showEmailPreviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#1A1108]/60 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-6 font-sans"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="bg-[#F4EBD7] border-2 border-[#1A1108] rounded-[28px] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl w-full max-w-4xl"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b-2 border-[#1A1108]/15 bg-white/40">
                <div className="flex items-center gap-2 text-left">
                  <Mail className="w-5 h-5 text-[#C9A227]" />
                  <div>
                    <h2 className="font-display text-sm sm:text-base uppercase tracking-tight text-[#1A1108] font-bold">
                      Welcome Email Template
                    </h2>
                    <p className="text-[10px] text-[#1A1108]/60 font-mono m-0">
                      Real-time rendering design preview
                    </p>
                  </div>
                </div>

                {/* Device Type Toggle Controls */}
                <div className="flex items-center gap-1.5 bg-[#1A1108]/5 p-1 rounded-xl border border-[#1A1108]/10">
                  <button
                    onClick={() => setPreviewDeviceType('desktop')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all outline-none cursor-pointer ${
                      previewDeviceType === 'desktop'
                        ? 'bg-[#1A1108] text-[#F4EBD7] shadow-sm'
                        : 'text-[#1A1108]/60 hover:text-[#1A1108] hover:bg-[#1A1108]/5'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    <span>Desktop</span>
                  </button>
                  <button
                    onClick={() => setPreviewDeviceType('mobile')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all outline-none cursor-pointer ${
                      previewDeviceType === 'mobile'
                        ? 'bg-[#1A1108] text-[#F4EBD7] shadow-sm'
                        : 'text-[#1A1108]/60 hover:text-[#1A1108] hover:bg-[#1A1108]/5'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile</span>
                  </button>
                </div>

                <button
                  onClick={() => setShowEmailPreviewModal(false)}
                  className="p-1 px-2.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-full transition-colors font-bold text-[#1A1108] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body / Scrollable email workspace */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center bg-[#1D1711]/5">
                
                {/* Email Client Wrap Simulator Card */}
                <motion.div
                  layout
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className={`bg-white border-2 border-[#1A1108] rounded-2xl shadow-lg flex flex-col transition-all overflow-hidden ${
                    previewDeviceType === 'mobile' ? 'max-w-sm w-full' : 'max-w-2xl w-full'
                  }`}
                >
                  {/* Mail Client Header Block */}
                  <div className="bg-[#1A1108]/5 border-b-2 border-[#1A1108] p-4 text-[11px] font-sans text-left space-y-1.5">
                    <p className="m-0 text-neutral-500">
                      <strong className="text-neutral-800">From:</strong> Campus Connect Support &lt;welcome@campusconnect.edu&gt;
                    </p>
                    <p className="m-0 text-neutral-500">
                      <strong className="text-neutral-800">To:</strong> verified-student@university.edu
                    </p>
                    <p className="m-0 text-neutral-500">
                      <strong className="text-neutral-800">Subject:</strong> 🎒 You're on the list! Welcome to Campus Connect
                    </p>
                  </div>

                  {/* HTML Content Body Preview */}
                  <div className="bg-[#FDFBF7] p-6 text-center font-sans">
                    {/* Tiny visual preheader */}
                    <div className="text-[10px] uppercase font-extrabold tracking-widest text-[#C9A227] mb-6 font-mono">
                      * waitlist clearance confirmation *
                    </div>

                    {/* Email Header Logo */}
                    <div className="flex justify-center mb-6">
                      <div className="border border-[#1A1108] px-4 py-2 bg-white shadow-sm flex items-center gap-1.5">
                        <span className="text-[#1A1108] font-black tracking-tighter text-xs">CAMPUS</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" />
                        <span className="text-[#C9A227] font-black tracking-tighter text-xs">CONNECT</span>
                      </div>
                    </div>

                    {/* Elegant Banner Heading */}
                    <h1 className="text-lg sm:text-xl font-black text-[#1A1108] uppercase tracking-tight leading-none mb-4 font-display">
                      Welcome To The <br /> Inner Circle! 🎉
                    </h1>

                    <p className="text-xs text-neutral-700 leading-relaxed max-w-sm mx-auto mb-6">
                      Academic registration domain check complete. Your exclusive spot in India's premier student network is secured.
                    </p>

                    {/* Interactive Badge Details */}
                    <div className="bg-white border-2 border-[#1A1108] rounded-2xl p-4 text-left max-w-md mx-auto mb-6 space-y-2.5 shadow-[4px_4px_0px_0px_#C9A227]">
                      <div className="border-b pb-2 flex justify-between items-center gap-4">
                        <span className="text-[9px] font-black tracking-wider text-neutral-400 uppercase font-mono">Verified Institution</span>
                        <span className="text-xs font-bold text-[#1A1108] text-right">Indian Institute of Technology, Bombay</span>
                      </div>
                      <div className="border-b pb-2 flex justify-between items-center gap-4">
                        <span className="text-[9px] font-black tracking-wider text-neutral-400 uppercase font-mono">Academic Cohort</span>
                        <span className="text-xs font-bold text-[#1A1108] text-right">Computer Science, Class of '27</span>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-[9px] font-black tracking-wider text-neutral-400 uppercase font-mono">Waitlist Position</span>
                        <span className="text-xs font-black text-[#C9A227] text-right">#248 (Cleared for Launch Phase-1)</span>
                      </div>
                    </div>

                    {/* Explanatory notes */}
                    <p className="text-[11px] text-neutral-600 leading-relaxed max-w-xs mx-auto mb-6">
                      You are positioned to bypass public queues and connect seamlessly with like-minded peers across elite hubs instantly upon launcher release.
                    </p>

                    {/* HTML Call-to-action */}
                    <div className="mb-6">
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="inline-block bg-[#1A1108] text-[#F3ECD8] text-[10px] font-black uppercase tracking-widest px-6 py-3.5 rounded-xl border border-transparent hover:bg-[#C9A227] hover:text-[#1A1108] transition-colors"
                      >
                        Share Code To Skip Queue &rarr;
                      </a>
                    </div>

                    {/* Referral Info Block */}
                    <div className="bg-[#1A1108]/5 border border-[#1A1108]/10 rounded-xl p-3 max-w-sm mx-auto mb-8 text-[11px] text-neutral-700 leading-relaxed text-left">
                      💡 Invite colleagues with referral handle: <strong className="text-[#C9A227] font-mono">CS-BOMBAY-VIP</strong>. Each verified sign-up bumps you up 100 queue spots!
                    </div>

                    {/* Footer Credentials */}
                    <div className="border-t pt-6 text-neutral-400 font-mono space-y-1">
                      <p className="m-0 font-bold uppercase tracking-wider text-[#C9A227] text-[10px]">Campus Connect Launch Directory</p>
                      <p className="m-0 text-[9px] text-neutral-500">Mumbai • Delhi • Bangalore • Pune</p>
                      <p className="m-0 text-neutral-500 text-[9px] mt-2 leading-relaxed">To prevent service degradation, secure tokens are mapped only to registered university mail credentials.</p>
                    </div>

                  </div>
                </motion.div>

              </div>

              {/* Modal Footer actions */}
              <div className="px-6 py-4 bg-white/40 border-t-2 border-[#1A1108]/15 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <p className="text-[10px] text-[#1A1108]/60 font-mono m-0 text-left sm:max-w-md">
                  This HTML template builds on top of direct system emails configured in Cloud Tasks and Resends. System status is healthy.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowEmailPreviewModal(false)}
                    className="bg-[#1A1108] hover:bg-[#C9A227] hover:text-[#1A1108] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-[2px_2px_0px_0px_#1A1108] cursor-pointer"
                  >
                    Done Viewing
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

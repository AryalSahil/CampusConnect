import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Copy, Check, ExternalLink, Inbox, FileText, Send, Sparkles } from 'lucide-react';
import { User } from 'firebase/auth';
import { WaitlistRegistration } from '../types';

interface EmailTemplateStationProps {
  user: User;
  waitlistRecord: WaitlistRegistration;
  myWaitlistNumber: number;
}

type TemplateType = 'welcome' | 'invite' | 'beta_codes';

export default function EmailTemplateStation({ user, waitlistRecord, myWaitlistNumber }: EmailTemplateStationProps) {
  const [activeTab, setActiveTab] = useState<TemplateType>('welcome');
  const [copied, setCopied] = useState(false);
  const [simulatedSent, setSimulatedSent] = useState(false);
  
  // Custom draft edits
  const [customName, setCustomName] = useState(user.displayName || 'Campus Connect Scholar');
  const [recipientEmail, setRecipientEmail] = useState(activeTab === 'welcome' ? user.email || '' : '');

  const referralLink = `${window.location.origin}?ref=${user.uid}`;

  // Reset email field appropriately when tab changes
  const handleTabChange = (tab: TemplateType) => {
    setActiveTab(tab);
    setSimulatedSent(false);
    if (tab === 'welcome') {
      setRecipientEmail(user.email || '');
    } else {
      setRecipientEmail('');
    }
  };

  // Plaintext definitions for copying / mailto
  const getSubject = (): string => {
    switch (activeTab) {
      case 'welcome':
        return `[Campus Connect] Spot #${myWaitlistNumber} Secured! Welcome to the Circle 🎓`;
      case 'invite':
        return `🎓 Class invitation: Skip the waitlist on Campus Connect!`;
      case 'beta_codes':
        return `🔥 EARLY ACCESS SECURED: Your exclusive Campus Connect Beta Code`;
    }
  };

  const getBodyText = (): string => {
    const divider = '==========================================';
    switch (activeTab) {
      case 'welcome':
        return `Hey ${customName},

You're officially locked on the list for Campus Connect!

${divider}
🎫 MEMBER ID: ${user.uid.slice(0, 12).toUpperCase()}
📍 INSTITUTION GROUP: ${waitlistRecord.collegeName.toUpperCase()}
🎓 DEPT / CLASS: ${waitlistRecord.course.toUpperCase()} - ${waitlistRecord.graduationYear}
🚀 CURRENT POSITION: #${myWaitlistNumber.toLocaleString()}
${divider}

What's next?
We are deploying batch servers first to ${waitlistRecord.collegeName}. You'll receive your unique Beta Invite Code here as soon as your college node goes online.

Want to jump 500 spots immediately?
Share your unique referral link with classmates. Each friend who signs up skips you 500 spots closer to launch day!
Your link: ${referralLink}

Stay outstanding,
The Campus Connect Launch Crew`;

      case 'invite':
        return `Hey there!

I just secured my spot on Campus Connect—the exclusive social network landing in ${waitlistRecord.collegeName} for matching class cliques, event pools, and transient rides.

They are letting colleges onboard in priority order based on waitlist size. If you register using my direct referral link, I jump 500 spots and you get instant launch queue immunity!

Claim your priority spot here:
👉 ${referralLink}

See you inside the circle,
-${customName}`;

      case 'beta_codes':
        return `Greetings Campus Legend,

You are receiving this exclusive message because of your priority placement in waitlist group #${myWaitlistNumber.toLocaleString()}.

Your collegiate node is finalizing beta configuration. Use this developer test code to instantiate matching circles:
🔑 CODE: CC-BETA-${user.uid.slice(0, 5).toUpperCase()}-${waitlistRecord.graduationYear}

1. Go to ${window.location.origin}
2. Secure your Google Verification
3. Input the test code to immediately activate your match card modules.

Do not share this development key outside of ${waitlistRecord.collegeName}.

Best regards,
The Dev Sandbox Group`;
    }
  };

  const getHtmlPreview = () => {
    const subject = getSubject();
    switch (activeTab) {
      case 'welcome':
        return (
          <div className="text-[#1A1108] font-sans text-xs leading-relaxed max-w-full overflow-hidden">
            <div className="bg-[#1A1108] text-[#F4EBD7] p-4 rounded-t-xl flex justify-between items-center">
              <div>
                <p className="font-extrabold text-[9px] text-[#C9A227] tracking-widest uppercase">OFFICIAL SECUREMENT</p>
                <p className="text-sm font-semibold tracking-tight">{subject}</p>
              </div>
              <Inbox className="w-5 h-5 text-[#C9A227]" />
            </div>
            
            <div className="bg-white p-5 border border-t-0 border-[#1A1108]/15 rounded-b-xl flex flex-col gap-4 text-left">
              <p>Hey <strong className="text-[#1A1108]">{customName}</strong>,</p>
              
              <p>You're officially locked on the launch database for <strong className="text-[#1A1108]">Campus Connect</strong>!</p>
              
              <div className="bg-[#1A1108]/5 border border-[#1A1108]/10 p-3 rounded-xl font-mono text-[10px] grid grid-cols-2 gap-2 text-[#1A1108]/75">
                <div>
                  <span className="block text-[8px] text-[#1A1108]/50 uppercase font-black">MEMBER ID</span>
                  <span className="font-bold text-[#1A1108]">{user.uid.slice(0, 12).toUpperCase()}</span>
                </div>
                <div>
                  <span className="block text-[8px] text-[#1A1108]/50 uppercase font-black">YOUR SPOT</span>
                  <span className="font-bold text-[#C9A227]">#{myWaitlistNumber.toLocaleString()}</span>
                </div>
                <div className="col-span-2 border-t border-[#1A1108]/10 pt-1.5 mt-1">
                  <span className="block text-[8px] text-[#1A1108]/50 uppercase font-black">CAMPUS NETWORK GROUP</span>
                  <span className="font-bold text-[#1A1108] uppercase break-all">{waitlistRecord.collegeName}</span>
                </div>
              </div>

              <p>We are deploying batch servers first to <strong className="text-[#1A1108] break-all">{waitlistRecord.collegeName}</strong>. You'll receive your unique Beta Invite Code as soon as your college node goes online.</p>
              
              <div className="border-t border-[#1A1108]/10 pt-3 mt-1 text-center">
                <span className="text-[10px] font-bold text-[#C9A227] block mb-2">Want to skip 500 spots automatically?</span>
                <p className="text-[11px] mb-3">Ask friends to use your unique verification link:</p>
                <code className="block bg-[#1A1108] text-[#F4EBD7] py-2 px-3 rounded-lg text-[9px] font-mono break-all mb-1 select-all">{referralLink}</code>
              </div>

              <div className="text-[10px] text-[#1A1108]/50 mt-2">
                <p>Stay outstanding,</p>
                <p className="font-bold">The Campus Connect Launch Crew</p>
              </div>
            </div>
          </div>
        );

      case 'invite':
        return (
          <div className="text-[#1A1108] font-sans text-xs leading-relaxed max-w-full overflow-hidden">
            <div className="bg-[#C9A227] text-[#1A1108] p-4 rounded-t-xl flex justify-between items-center">
              <div>
                <p className="font-black text-[9px] text-[#1A1108]/70 tracking-widest uppercase">PEER RECOMMENDATION</p>
                <p className="text-sm font-bold tracking-tight">{subject}</p>
              </div>
              <Send className="w-5 h-5" />
            </div>
            
            <div className="bg-white p-5 border border-t-0 border-[#1A1108]/15 rounded-b-xl flex flex-col gap-4 text-left">
              <p>Hey classmate,</p>
              
              <p>I just secured my spot on <strong className="text-[#1A1108]">Campus Connect</strong>—the exclusive social network landing in <em className="underline not-italic">{waitlistRecord.collegeName}</em> for matching class cliques, event pools, and transit pools.</p>

              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-center">
                <span className="text-[10px] font-black tracking-wider text-amber-700 block mb-1">🔥 SKIP THE WAITLIST</span>
                <p className="text-[11px] text-amber-900 mb-2">By registering using my direct class referral link below, I jump 500 spots and you skip the standard verification queue!</p>
                <a 
                  href={referralLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-block bg-[#1A1108] hover:bg-[#1A1108]/90 text-[#F4EBD7] text-[10px] font-black uppercase px-4 py-2 rounded-xl transition-all"
                >
                  Join Campus Connect List 🚀
                </a>
              </div>

              <code className="block bg-neutral-50 border border-neutral-200 py-1.5 px-2 rounded font-mono text-[9px] break-all text-center">{referralLink}</code>

              <div className="text-[10px] text-[#1A1108]/60 mt-1">
                <p>See you inside the circle,</p>
                <p className="font-bold font-display uppercase tracking-tight text-[#1A1108] mt-0.5">-{customName}</p>
              </div>
            </div>
          </div>
        );

      case 'beta_codes':
        return (
          <div className="text-[#1A1108] font-sans text-xs leading-relaxed max-w-full overflow-hidden">
            <div className="bg-[#1A1108] text-[#F4EBD7] p-4 rounded-t-xl flex justify-between items-center">
              <div>
                <p className="font-extrabold text-[9px] text-[#C9A227] tracking-widest uppercase">SANDBOX GROUP DEV KEYS</p>
                <p className="text-sm font-semibold tracking-tight">{subject}</p>
              </div>
              <Sparkles className="w-5 h-5 text-[#C9A227] fill-transparent" />
            </div>
            
            <div className="bg-white p-5 border border-t-0 border-[#1A1108]/15 rounded-b-xl flex flex-col gap-4 text-left">
              <p>Greetings Campus Legend,</p>
              
              <p>You are receiving this priority development token because of your early placement in waitlist group <strong className="text-[#1A1108]">#{myWaitlistNumber.toLocaleString()}</strong>.</p>

              <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl text-center">
                <span className="text-[9px] font-black tracking-widest text-[#1A1108]/60 uppercase block mb-1">DEVELOPER TOKEN AUTH</span>
                <span className="block font-mono text-base font-extrabold text-[#1A1108] tracking-widest bg-white border border-indigo-150 py-2.5 px-4 rounded-lg select-all">
                  CC-BETA-{user.uid.slice(0, 5).toUpperCase()}-{waitlistRecord.graduationYear}
                </span>
                <span className="text-[8px] text-neutral-400 block mt-1.5">COLLABORATIVE PORT CLOSED BETA</span>
              </div>

              <p>Go to <span className="underline">{window.location.host}</span> to authenticate your profile with verified college credentials and input this code to join active matching streams.</p>

              <div className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200/40 p-2.5 rounded-lg font-mono">
                🛑 <strong>DO NOT SHARE:</strong> This developer key is linked explicitly to {waitlistRecord.collegeName.toUpperCase()} members.
              </div>

              <div className="text-[10px] text-[#1A1108]/50 mt-1">
                <p>Best regards,</p>
                <p className="font-bold">The Dev Sandbox Group</p>
              </div>
            </div>
          </div>
        );
    }
  };

  // Launch pre-filled email client link
  const handleLaunchEmailClient = () => {
    const subject = encodeURIComponent(getSubject());
    const body = encodeURIComponent(getBodyText());
    const to = encodeURIComponent(recipientEmail || '');
    
    const mailtoUrl = `mailto:${to}?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, '_blank');
  };

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(getBodyText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simulated instant send to verify
  const handleSimulateSend = () => {
    setSimulatedSent(true);
    setTimeout(() => {
      setSimulatedSent(false);
    }, 5000);
  };

  return (
    <div id="email-template-station-container" className="w-full bg-white border-2 border-[#1A1108] rounded-3xl p-5 md:p-6 text-left shadow-[5px_5px_0px_0px_#1A1108] mt-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-[#C9A227]/10 flex items-center justify-center border border-[#C9A227]/30 text-[#C9A227]">
          <Mail className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-display text-sm tracking-tight text-[#1A1108] uppercase leading-none font-bold">
            Email Notification Station
          </h4>
          <p className="text-[9px] text-[#1A1108]/60 mt-1 uppercase font-semibold">Generate waitlist status & referral drafts</p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-[#1A1108]/15 gap-1 mb-4 pb-1">
        {(['welcome', 'invite', 'beta_codes'] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => handleTabChange(type)}
            className={`text-[10px] font-bold px-3 py-2 rounded-xl transition-all uppercase tracking-wider cursor-pointer border ${
              activeTab === type
                ? 'bg-[#1A1108] text-white border-[#1A1108]'
                : 'text-[#1A1108]/60 border-transparent hover:bg-[#1A1108]/5'
            }`}
          >
            {type === 'welcome' && 'Welcome Mail'}
            {type === 'invite' && 'Classmate Invite'}
            {type === 'beta_codes' && 'Beta Launch Token'}
          </button>
        ))}
      </div>

      {/* Input controls for pre-fill customization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        <div className="flex flex-col gap-1">
          <label className="font-condensed text-[9px] font-black tracking-widest text-[#1A1108]/60 uppercase">
            Sender Name Tag
          </label>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="bg-[#1A1108]/5 border border-[#1A1108]/15 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#1A1108] outline-none focus:border-[#C9A227]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-condensed text-[9px] font-black tracking-widest text-[#1A1108]/60 uppercase">
            Recipient's Email (Optional)
          </label>
          <input
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder={activeTab === 'welcome' ? 'Your email address' : 'classmate@college.edu'}
            className="bg-[#1A1108]/5 border border-[#1A1108]/15 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#1A1108] outline-none focus:border-[#C9A227]"
          />
        </div>
      </div>

      {/* Dashboard Email Frame Simulator */}
      <div className="bg-[#1A1108]/5 border border-[#1A1108]/10 rounded-2xl p-3 mb-4">
        <div className="flex items-center justify-between border-b border-[#1A1108]/10 pb-2 mb-3 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-[10px] text-[#1A1108]/40 font-mono ml-2">sandbox-mail-preview.app</span>
          </div>
          <FileText className="w-3.5 h-3.5 text-[#1A1108]/30" />
        </div>

        <div className="max-w-full overflow-x-auto">
          {getHtmlPreview()}
        </div>
      </div>

      {/* Draft Simulation Feedback */}
      <AnimatePresence>
        {simulatedSent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 p-2.5 rounded-xl text-xs font-bold mb-4 flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Successfully simulated dispatch! Copy the text or click "Open Draft" to dispatch for real.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Core Action buttons */}
      <div className="flex flex-wrap gap-2.5 justify-between">
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={handleLaunchEmailClient}
            className="bg-[#1A1108] hover:bg-[#1A1108]/90 text-white font-extrabold text-xs px-4.5 py-2.5 rounded-xl flex items-center gap-1.5 outline-none cursor-pointer hover:scale-[1.03] transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Email Draft</span>
          </button>
          
          <button
            type="button"
            onClick={handleCopyDraft}
            className="bg-white hover:bg-neutral-50 text-[#1A1108] border border-[#1A1108]/20 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 outline-none cursor-pointer transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Draft</span>
              </>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={handleSimulateSend}
          className="bg-[#C9A227] hover:bg-[#C9A227]/90 text-[#1A1108] font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 outline-none cursor-pointer transition-all hover:scale-[1.03]"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Simulate Email Send</span>
        </button>
      </div>
    </div>
  );
}

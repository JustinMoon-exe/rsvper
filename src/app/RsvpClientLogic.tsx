// src/app/RsvpClientLogic.tsx
'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface GuestData { name: string; headCount: number; }
interface RsvpResponse { status: string; message?: string; }

type RsvpClientLogicProps = object;

export function RsvpClientLogic({}: RsvpClientLogicProps) { 
  const guestParam = useSearchParams().get('guest');
  const [guestData, setGuestData] = useState<GuestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [userChoice, setUserChoice] = useState<'Yes' | 'No' | null>(null);

  useEffect(() => {
    const appsScriptUrl = "https://script.google.com/macros/s/AKfycbxsJ0_04Pc8H48foxBve87kcC1Pdd4FiKB1s98RikdzpYenJ1Ua4C2jxM_f3fcSdgh8Aw/exec";
    if (!appsScriptUrl) { setError("CRITICAL: API URL error."); setLoading(false); return; }
    if (!guestParam) { setError('No guest specified in link.'); setLoading(false); return; }
    
    setLoading(true); setError(null); setConfirmation(null); setUserChoice(null);
    (async () => {
      try {
        const res = await fetch(`/api/rsvp?mode=getAllowance&guest=${encodeURIComponent(guestParam.trim())}`);
        if (!res.ok) {
            let errText = await res.text();
            try { errText = JSON.parse(errText).error || errText; } catch {} // Try to parse error from Apps Script
            throw new Error(errText || `Server error ${res.status}`);
        }
        const data: GuestData & { error?: string } = await res.json();
        if (data.error) throw new Error(data.error);
        setGuestData(data);
      } catch (e: unknown) { setError(`Could not load invitation details: ${e instanceof Error ? e.message : String(e)}`); }
      finally { setLoading(false); }
    })();
  }, [guestParam]);

  const handleRsvpSubmit = async (attendingStatus: 'Yes' | 'No') => {
    if (!guestData) return;
    setSubmitting(true);
    setUserChoice(attendingStatus); 
    setError(null); 
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'rsvp', guest: guestData.name, attending: attendingStatus })
      });
      if (!res.ok) {
        let errText = await res.text();
        try { errText = JSON.parse(errText).message || errText; } catch {}
        throw new Error(errText || `Server error ${res.status}`);
      }
      const result: RsvpResponse = await res.json();
      if (result.status !== 'success') throw new Error(result.message || 'Unknown server error.');
      setConfirmation(
        attendingStatus === 'Yes'
          ? `Thank you, ${guestData.name}! We're delighted you'll be celebrating with us. Your ${guestData.headCount} seat(s) are confirmed.`
          : `Thank you for letting us know, ${guestData.name}. You'll be missed!`
      );
    } catch (e: unknown) {
      setError(`RSVP submission failed: ${e instanceof Error ? e.message : String(e)}. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut", staggerChildren: 0.07 } },
    exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.25, ease: "easeIn" } }
  };
  const itemVariants = { // For staggering individual items inside the form
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: {type: "spring", stiffness: 350, damping: 25} }
  };

  if (loading) {
    return <p className="text-center text-inherit/70 py-10 text-lg">Loading your details…</p>;
  }
  
  return (
    <div className="space-y-6 text-center w-full"> {/* Text color inherited from .glass-form-box */}
      <AnimatePresence mode="wait">
        {confirmation ? (
          <motion.div
            key="confirmation"
            variants={contentVariants} initial="hidden" animate="visible" exit="exit"
            className={`py-8 px-4 rounded-lg 
              ${userChoice === 'Yes' ? 'bg-green-600/15 text-green-100 border border-green-600/25' 
                                     : 'bg-amber-600/15 text-amber-100 border-amber-600/25'}`}
          >
            <h2 className="text-2xl font-bold mb-3">
              {userChoice === 'Yes' ? "We Can't Wait!" : "Response Received"}
            </h2>
            <p className="text-lg">{confirmation}</p>
          </motion.div>
        ) : error ? (
            <motion.div
                key="error"
                variants={contentVariants} initial="hidden" animate="visible"
                className="py-5 bg-red-600/20 text-red-100 p-4 rounded-lg border border-red-600/30"
            >
                <p className="font-bold text-lg mb-1">Oops!</p>
                <p>{error}</p>
            </motion.div>
        ) : guestData ? (
          <motion.div
            key="form"
            variants={contentVariants} initial="hidden" animate="visible"
            className="space-y-5" // Main vertical spacing for form elements
          >
            <motion.p variants={itemVariants} className="text-xl md:text-2xl">
              Hello <span className="font-bold text-white">{guestData.name}</span>,
            </motion.p>
            <motion.p variants={itemVariants} className="text-lg md:text-xl opacity-80">
              We have joyfully reserved <strong className="font-bold text-white"><span className="seat-highlight">{guestData.headCount}</span></strong> seat{guestData.headCount > 1 ? 's' : ''} in your honour.
            </motion.p>
            <motion.p variants={itemVariants} className="text-xl md:text-2xl font-bold mt-3 mb-2">
              Will you be joining us?
            </motion.p>
            
            {/* Button Container - Using flex and gap for spacing */}
            <motion.div 
              variants={itemVariants} 
              className="rsvp-button-container"
            >
              {/* Accept Button (Subtle Style) */}
              <button
                onClick={() => handleRsvpSubmit('Yes')}
                disabled={submitting}
                className="rsvp-button-base w-full sm:flex-1 
                           bg-[var(--color-button-secondary-bg)] text-[var(--color-button-secondary-text)] 
                           hover:bg-[var(--color-button-secondary-hover-bg)] 
                           border border-[var(--color-text-on-glass)]/20 hover:border-[var(--color-text-on-glass)]/40 
                           focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-form-bg)] focus-visible:ring-[var(--color-button-secondary-text)]/70"
              >
                {submitting && userChoice === 'Yes' ? (
                    <span className="flex items-center justify-center"><span className="loader w-5 h-5 mr-2 border-t-[var(--color-button-secondary-text)]"></span> Processing...</span>
                ) : 'Joyfully Accept'}
              </button>
              {/* Decline Button (Prominent Style) */}
              <button
                onClick={() => handleRsvpSubmit('No')}
                disabled={submitting}
                className="rsvp-button-base w-full sm:flex-1
                           bg-[var(--color-button-bg)] text-[var(--color-button-text)] 
                           hover:bg-[var(--color-button-hover-bg)]
                           focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-form-bg)] focus-visible:ring-[var(--color-button-hover-bg)]"
              >
                 {submitting && userChoice === 'No' ? (
                    <span className="flex items-center justify-center"><span className="loader w-5 h-5 mr-2 border-t-[var(--color-button-text)]"></span> Processing...</span>
                ) : 'Regretfully Decline'}
              </button>
            </motion.div>
          </motion.div>
        ) : (
          <p className="text-center opacity-70 py-10">Invitation details could not be loaded.</p>
        )}
      </AnimatePresence>
    </div>
  );
}
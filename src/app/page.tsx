// src/app/page.tsx
'use client';

import { Suspense, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { RsvpClientLogic } from './RsvpClientLogic';
import { WeddingInvitationImage } from '@/components/WeddingInvitationImage';

function LoadingSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-page-bg">
      <div className="text-center py-20">
        <div className="loader w-12 h-12 border-t-[var(--color-text-accent)] mx-auto" />
        <p className="text-text-secondary mt-4 text-lg font-gayathri">Loading invitation…</p>
      </div>
    </div>
  );
}

export default function RsvpPageContainer() {
  const { scrollY } = useScroll();

  // Image filter animations: Start after scrolling 50px, full effect by 250px.
  const imageBlur = useTransform(scrollY, [50, 250], [0, 5], { clamp: true });
  const imageBrightness = useTransform(scrollY, [50, 250], [1, 0.6], { clamp: true }); 
  const imageSaturation = useTransform(scrollY, [50, 250], [1, 0.8], { clamp: true });

  // RSVP box state and animation
  const [showRsvpBox, setShowRsvpBox] = useState(false);
  const [rsvpBoxIsFixed, setRsvpBoxIsFixed] = useState(false);
  
  const rsvpAnimateStartScrollY = 100; 
  const rsvpFixedTriggerScrollY = 300; // ScrollY value when RSVP box should become fixed

  const rsvpBoxOpacity = useTransform(scrollY, [rsvpAnimateStartScrollY, rsvpFixedTriggerScrollY - 50], [0, 1], { clamp: true });
  // For the Y animation BEFORE it becomes fixed. Animates from further down to its normal flow position.
  const rsvpBoxInitialYAnimate = useTransform(scrollY, [rsvpAnimateStartScrollY, rsvpFixedTriggerScrollY], ["60vh", "0vh"], { clamp: true });

  useEffect(() => {
    const unsubscribeScroll = scrollY.on("change", (latest) => {
      if (latest >= rsvpAnimateStartScrollY) {
        setShowRsvpBox(true); 
      } else {
        setShowRsvpBox(false); 
      }

      if (latest >= rsvpFixedTriggerScrollY) {
        setRsvpBoxIsFixed(true);
      } else {
        setRsvpBoxIsFixed(false);
      }
    });
    
    const currentScroll = scrollY.get();
    if (currentScroll >= rsvpAnimateStartScrollY) setShowRsvpBox(true);
    if (currentScroll >= rsvpFixedTriggerScrollY) setRsvpBoxIsFixed(true);

    return () => unsubscribeScroll();
  }, [scrollY, rsvpAnimateStartScrollY, rsvpFixedTriggerScrollY]);


  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <div className="font-gayathri min-h-[180vh] relative overflow-x-hidden bg-page-bg py-6 sm:py-8">
        
        <motion.div
          className="fixed top-0 left-0 right-0 h-screen w-screen flex items-center justify-center -z-10 pointer-events-none"
          style={{
            filter: `blur(${imageBlur.get()}px) brightness(${imageBrightness.get()}) saturate(${imageSaturation.get()})`,
          }}
        >
          {/* Inner wrapper for the image to control its size AND create the "border" effect */}
          <div className="w-full h-full max-w-2xl max-h-[calc(100vh-6rem)] p-3 sm:p-4 bg-[var(--color-card-bg)] shadow-invite-image-frame rounded-md">
            <WeddingInvitationImage className="object-contain w-full h-full" />
          </div>
        </motion.div>

        {/* Spacer div: Its height determines how much user scrolls before RSVP appearance section */}
        <div style={{ height: `${rsvpFixedTriggerScrollY}px` }} className="w-full"></div>

        {/* RSVP BOX SECTION */}
        {/* This parent helps contain the RSVP box if it's not fixed, and centers it via page-content-container */}
        <div id="rsvp-section-scroll-parent" className="relative page-content-container">
            <AnimatePresence>
              {showRsvpBox && ( // Conditionally render based on scroll
                <motion.div
                  key="rsvpBoxMotionKey"
                  style={{
                    opacity: rsvpBoxOpacity, // Controlled by scroll transform
                    // When not fixed, translateY is animated. When fixed, it's centered by fixed positioning.
                    translateY: !rsvpBoxIsFixed ? rsvpBoxInitialYAnimate.get() : undefined,
                  }}
                  // For very initial appearance if not using translateY transform immediately
                  initial={!rsvpBoxIsFixed ? { opacity:0, y:100 } : false} 
                  animate={!rsvpBoxIsFixed ? { opacity:1, y:0 } : { opacity:1 }} // Animate to y:0 (its natural flow pos)
                  transition={{ duration: 0.4, ease: "circOut" }}
                  className={`
                    w-full max-w-xs sm:max-w-sm /* RSVP Box Width */
                    px-6 py-8 sm:p-8 md:px-8 md:py-10 /* INNER PADDING */
                    glass-form-box 
                    mx-auto /* Center it when in relative flow */
                    ${rsvpBoxIsFixed 
                      ? 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30' 
                      : 'relative mb-16' 
                    }
                  `}
                >
                  <h2 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-[var(--color-text-on-glass)]">
                    Kindly Respond
                  </h2>
                  <RsvpClientLogic />
                </motion.div>
              )}
            </AnimatePresence>
        </div>
        
        {/* Ensures page is scrollable enough for all effects if content is short */}
        <div className="h-[50vh]"></div> 
      </div>
    </Suspense>
  );
}
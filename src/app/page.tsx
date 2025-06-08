// src/app/page.tsx
'use client';

import { Suspense } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { RsvpClientLogic } from './RsvpClientLogic';

function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-page-bg">
      <div className="text-center">
        <div className="w-12 h-12 loader mx-auto"></div>
        <p className="text-text-secondary mt-4 text-lg font-gayathri">Loading invitation…</p>
      </div>
    </div>
  );
}

export default function RsvpPageContainer() {
  const { scrollY } = useScroll();

  // Scroll-based blur/darkening for the image
  const imageBlur = useTransform(scrollY, [window.innerHeight / 2, window.innerHeight], [0, 12], { clamp: true });
  const imageBrightness = useTransform(scrollY, [window.innerHeight / 2, window.innerHeight], [1, 0.3], { clamp: true });

  // RSVP card fade-in and slide-up
  const rsvpBoxOpacity = useTransform(scrollY, [window.innerHeight / 2, window.innerHeight], [0, 1], { clamp: true });
  const rsvpBoxY = useTransform(scrollY, [window.innerHeight / 2, window.innerHeight], [50, 0], { clamp: true });

  // Update the filter values on scroll for the image
  useEffect(() => {
    const unsubscribe = scrollY.on("change", () => {
      const blurValue = imageBlur.get();
      const brightnessValue = imageBrightness.get();
      const imageWrapper = document.querySelector('.invitation-image-wrapper') as HTMLElement;
      if (imageWrapper) {
        imageWrapper.style.filter = `blur(${blurValue}px) brightness(${brightnessValue})`;
      }
    });
    return () => unsubscribe();
  }, [scrollY, imageBlur, imageBrightness]);

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <div className="font-gayathri min-h-[200vh] relative overflow-x-hidden bg-page-bg">
        {/* Wedding Invitation Section */}
        <div className="fixed inset-0 pointer-events-none">
          <motion.div
            className="invitation-image-wrapper"
          >
            <Image
              src="/WeddingInvitationImage.png"
              alt="Wedding Invitation"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 800px) 90vw, 800px"
            />
          </motion.div>
        </div>

        {/* RSVP Form Section */}
        <motion.div
          style={{
            opacity: rsvpBoxOpacity,
            transform: `translate(-50%, -50%) translateY(${rsvpBoxY.get()}px)`
          }}
          className="glass-form-box"
        >
          <h2 className="kindly-respond-heading">
            Kindly Respond
          </h2>
          <RsvpClientLogic />
        </motion.div>
        {/* Bottom spacer */}
        <div className="h-[50vh]"></div>
      </div>
    </Suspense>
  );
}
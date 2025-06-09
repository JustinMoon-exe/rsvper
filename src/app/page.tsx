// src/app/page.tsx
'use client';

import { Suspense, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
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

  // SSR-safe viewport height
  const [viewportHeight, setViewportHeight] = useState(800);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setViewportHeight(window.innerHeight);
    }
  }, []);

  // Scroll-based blur/darkening for the image
  const imageBlur = useTransform(scrollY, [viewportHeight / 2, viewportHeight], [0, 12], { clamp: true });
  const imageBrightness = useTransform(scrollY, [viewportHeight / 2, viewportHeight], [1, 0.3], { clamp: true });

  // RSVP card fade-in and slide-up
  const rsvpBoxOpacity = useTransform(scrollY, [viewportHeight / 2, viewportHeight], [0, 1], { clamp: true });
  const rsvpBoxY = useTransform(scrollY, [viewportHeight / 2, viewportHeight], [50, 0], { clamp: true });

  // Scroll indicator opacity
  const scrollIndicatorOpacity = useTransform(scrollY, [0, viewportHeight / 2], [1, 0], { clamp: true });

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
          {/* Scroll Indicator */}
          <motion.div
            className="scroll-indicator"
            style={{ opacity: scrollIndicatorOpacity }}
          >
            <span className="scroll-indicator-text">Scroll to RSVP</span>
            <div className="scroll-indicator-arrow" />
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
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

  // Lightbox modal state
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Disable scroll when modal is open
  useEffect(() => {
    if (isImageModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isImageModalOpen]);

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

  // Only allow opening modal if image is not very blurred
  const canOpenModal = imageBlur.get() < 2 && !isImageModalOpen;

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <div className="font-gayathri min-h-[200vh] relative overflow-x-hidden bg-page-bg">
        {/* Wedding Invitation Section */}
        <div className="fixed inset-0">
          <motion.div
            className="invitation-image-wrapper"
            onClick={() => { if (canOpenModal) setIsImageModalOpen(true); }}
            style={{ cursor: canOpenModal ? 'zoom-in' : 'default', pointerEvents: isImageModalOpen ? 'none' : 'auto' }}
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
          {!isImageModalOpen && (
            <>
              <div className="scroll-indicator-shadow" />
              <motion.div
                className="scroll-indicator"
                style={{ opacity: scrollIndicatorOpacity }}
              >
                <span className="scroll-indicator-text">Scroll to RSVP</span>
                <div className="scroll-indicator-arrow" />
              </motion.div>
            </>
          )}
        </div>

        {/* Image Lightbox Modal */}
        {isImageModalOpen && (
          <div className="image-modal-overlay">
            <div className="image-modal-content">
              <Image
                src="/WeddingInvitationImage.png"
                alt="Wedding Invitation Fullscreen"
                fill
                className="object-contain"
                priority
                sizes="100vw"
              />
              <button className="image-modal-close" onClick={() => setIsImageModalOpen(false)} aria-label="Close image">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="14" cy="14" r="13" fill="none" />
                  <line x1="9" y1="9" x2="19" y2="19" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="19" y1="9" x2="9" y2="19" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* RSVP Form Section */}
        {!isImageModalOpen && (
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
        )}
        {/* Bottom spacer */}
        <div className="h-[50vh]"></div>
      </div>
    </Suspense>
  );
}
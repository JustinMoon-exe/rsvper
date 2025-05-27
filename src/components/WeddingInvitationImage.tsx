// src/components/WeddingInvitationImage.tsx
'use client';
import Image from 'next/image';
import { useState } from 'react';

interface WeddingInvitationImageProps {
  className?: string; // Allows passing additional Tailwind classes e.g. object-fit
}

const INVITE_IMAGE_SRC = "/WeddingInvitationImage.png"; // YOUR IMAGE FILENAME
const IMAGE_INTRINSIC_WIDTH = 1080;  // UPDATE to your image's actual width
const IMAGE_INTRINSIC_HEIGHT = 1512; // UPDATE to your image's actual height

export function WeddingInvitationImage({ className }: WeddingInvitationImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div 
        className={`w-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center flex items-center justify-center ${className ?? ''}`.trim()}
        // Keep aspect ratio for the error box to prevent layout jumps
        style={{ aspectRatio: `${IMAGE_INTRINSIC_WIDTH}/${IMAGE_INTRINSIC_HEIGHT}` }} 
      >
        <p className="text-gray-500">Invitation image failed to load.</p>
      </div>
    );
  }

  return (
    // This div is meant to be the direct child that the Image component fills.
    // Its parent in page.tsx will control its max-width and max-height.
    <div 
      className={`relative w-full h-full overflow-hidden rounded-sm ${className ?? ''}`.trim()}
    >
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200/50 animate-pulse flex items-center justify-center rounded-sm">
          <div className="loader w-10 h-10 border-t-[var(--color-text-accent)]"></div>
        </div>
      )}
      <Image
        src={INVITE_IMAGE_SRC}
        alt="Wedding Invitation for Maria Parayil and Cole Pate"
        layout="fill" 
        objectFit="contain" // Ensures the whole image is visible and scaled down
        priority 
        className={`transition-opacity duration-700 ease-in-out ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoadingComplete={() => setTimeout(() => setLoaded(true), 50)} // Using onLoadingComplete
        onError={() => {
          console.error("Error loading wedding invitation image.");
          setError(true);
          setLoaded(false); 
        }}
      />
    </div>
  );
}
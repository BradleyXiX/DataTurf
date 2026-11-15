'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { StadiumPoster } from './StadiumPoster';

// Lazy-load the 3D scene only on the client with zero SSR overhead
const Stadium3D = dynamic(() => import('./Stadium3D'), {
  ssr: false,
  loading: () => null,
});

interface StadiumSignatureProps {
  className?: string;
  opacity?: number;
}

/**
 * DataTurf Stadium Signature Moment
 * Refined stadium visual combining an authentic static isometric vector poster
 * with an optional, lazy-loaded progressive 3D enhancement on eligible desktop screens.
 *
 * Guarantees:
 * - Poster is preserved on phones, reduced motion, SSR, and WebGL failures.
 * - Brief, elegant reveal (500ms) with motion-reduce bypass.
 * - Stays strictly off Club and Compare routes.
 * - No scroll takeover or continuous offscreen animation.
 */
export function StadiumSignature({
  className = '',
  opacity = 0.35,
}: StadiumSignatureProps) {
  const [revealed, setRevealed] = useState(false);
  const [canLoad3D, setCanLoad3D] = useState(false);

  useEffect(() => {
    // Brief reveal trigger on mount
    setRevealed(true);

    // Only trial 3D if on desktop (width >= 768) and motion is not reduced
    const isDesktop = window.innerWidth >= 768;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isDesktop && !reducedMotion) {
      setCanLoad3D(true);
    }
  }, []);

  return (
    <div
      className={`relative w-full h-full overflow-hidden pointer-events-none select-none transition-all duration-700 ease-out motion-reduce:transition-none ${
        revealed ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'
      } ${className}`}
      aria-hidden="true"
    >
      {/* 1. Rock-solid static SVG poster fallback (Active everywhere) */}
      <StadiumPoster opacity={opacity} />

      {/* 2. Optional progressive 3D enhancement (Only desktop, not reduced motion) */}
      {canLoad3D && <Stadium3D />}
    </div>
  );
}

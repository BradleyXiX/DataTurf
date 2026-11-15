import React from 'react';

interface PitchArtworkProps {
  className?: string;
  variant?: 'hero' | 'tactical' | 'mark';
  opacity?: number;
}

/**
 * DataTurf Original Vector Pitch Artwork
 * Authentic FIFA/UEFA pitch dimensions (105m x 68m coordinate space).
 * Designed for static clarity with sports geometry, mowing stripes, and technical ticks.
 */
export function PitchArtwork({
  className = '',
  variant = 'hero',
  opacity = 0.35,
}: PitchArtworkProps) {
  if (variant === 'mark') {
    return (
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <rect width="40" height="40" rx="8" fill="#0d1117" />
        <rect x="0.5" y="0.5" width="39" height="39" rx="7.5" stroke="#10b981" strokeOpacity="0.3" />
        {/* Pitch boundary */}
        <rect x="5" y="7" width="30" height="26" rx="2" stroke="#10b981" strokeWidth="1" strokeOpacity="0.7" />
        {/* Halfway line */}
        <line x1="20" y1="7" x2="20" y2="33" stroke="#10b981" strokeWidth="1" strokeOpacity="0.7" />
        {/* Center circle & spot */}
        <circle cx="20" cy="20" r="5" stroke="#10b981" strokeWidth="1" strokeOpacity="0.7" />
        <circle cx="20" cy="20" r="1.2" fill="#10b981" />
        {/* Penalty boxes */}
        <rect x="5" y="13" width="5" height="14" stroke="#10b981" strokeWidth="0.8" strokeOpacity="0.5" />
        <rect x="30" y="13" width="5" height="14" stroke="#10b981" strokeWidth="0.8" strokeOpacity="0.5" />
      </svg>
    );
  }

  return (
    <div className={`relative overflow-hidden pointer-events-none select-none ${className}`}>
      <svg
        viewBox="0 0 1050 680"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        aria-hidden="true"
        style={{ opacity }}
      >
        <defs>
          {/* Subtle alternating turf mowing stripes */}
          <pattern id="turf-stripes" width="100" height="680" patternUnits="userSpaceOnUse">
            <rect width="50" height="680" fill="#ffffff" fillOpacity="0.012" />
            <rect x="50" width="50" height="680" fill="#000000" fillOpacity="0.02" />
          </pattern>
          {/* Radial mask for ambient hero integration */}
          <radialGradient id="pitch-vignette" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="65%" stopColor="#ffffff" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <mask id="hero-mask">
            <rect width="1050" height="680" fill="url(#pitch-vignette)" />
          </mask>
        </defs>

        <g mask={variant === 'hero' ? 'url(#hero-mask)' : undefined}>
          {/* Turf field fill with grass mowing stripes */}
          <rect x="40" y="40" width="970" height="600" rx="6" fill="#0c1117" />
          <rect x="40" y="40" width="970" height="600" rx="6" fill="url(#turf-stripes)" />

          {/* Outer Touchline & Goal Lines */}
          <rect
            x="50"
            y="50"
            width="950"
            height="580"
            stroke="#10b981"
            strokeWidth="1.75"
            strokeOpacity="0.4"
          />

          {/* Halfway Line */}
          <line
            x1="525"
            y1="50"
            x2="525"
            y2="630"
            stroke="#10b981"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />

          {/* Center Circle (9.15m = 82px) */}
          <circle
            cx="525"
            cy="340"
            r="82"
            stroke="#10b981"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />

          {/* Center Spot */}
          <circle cx="525" cy="340" r="3" fill="#10b981" fillOpacity="0.7" />

          {/* Left Penalty Area (16.5m depth = 148px, 40.32m width = 360px, y: 160-520) */}
          <rect
            x="50"
            y="160"
            width="148"
            height="360"
            stroke="#10b981"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />

          {/* Left 6-Yard Box (5.5m depth = 49px, 18.32m width = 164px, y: 258-422) */}
          <rect
            x="50"
            y="258"
            width="49"
            height="164"
            stroke="#10b981"
            strokeWidth="1.25"
            strokeOpacity="0.35"
          />

          {/* Left Penalty Spot (11m = 99px from goal line => x=149) */}
          <circle cx="149" cy="340" r="2.5" fill="#10b981" fillOpacity="0.6" />

          {/* Left Penalty Arc (arc outside penalty area) */}
          <path
            d="M 198 285 A 82 82 0 0 1 198 395"
            stroke="#10b981"
            strokeWidth="1.25"
            strokeOpacity="0.35"
            fill="none"
          />

          {/* Right Penalty Area */}
          <rect
            x="852"
            y="160"
            width="148"
            height="360"
            stroke="#10b981"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />

          {/* Right 6-Yard Box */}
          <rect
            x="951"
            y="258"
            width="49"
            height="164"
            stroke="#10b981"
            strokeWidth="1.25"
            strokeOpacity="0.35"
          />

          {/* Right Penalty Spot (901) */}
          <circle cx="901" cy="340" r="2.5" fill="#10b981" fillOpacity="0.6" />

          {/* Right Penalty Arc */}
          <path
            d="M 852 285 A 82 82 0 0 0 852 395"
            stroke="#10b981"
            strokeWidth="1.25"
            strokeOpacity="0.35"
            fill="none"
          />

          {/* Corner Arcs (1m = 9px) */}
          <path d="M 50 59 A 9 9 0 0 0 59 50" stroke="#10b981" strokeWidth="1.25" strokeOpacity="0.35" fill="none" />
          <path d="M 50 621 A 9 9 0 0 1 59 630" stroke="#10b981" strokeWidth="1.25" strokeOpacity="0.35" fill="none" />
          <path d="M 1000 59 A 9 9 0 0 1 991 50" stroke="#10b981" strokeWidth="1.25" strokeOpacity="0.35" fill="none" />
          <path d="M 1000 621 A 9 9 0 0 0 991 630" stroke="#10b981" strokeWidth="1.25" strokeOpacity="0.35" fill="none" />

          {/* Technical Field Coordinate Ticks */}
          <g stroke="#10b981" strokeWidth="1" strokeOpacity="0.25">
            {/* Top touchline ticks */}
            <line x1="198" y1="44" x2="198" y2="50" />
            <line x1="360" y1="44" x2="360" y2="50" />
            <line x1="525" y1="42" x2="525" y2="50" />
            <line x1="690" y1="44" x2="690" y2="50" />
            <line x1="852" y1="44" x2="852" y2="50" />
            {/* Bottom touchline ticks */}
            <line x1="198" y1="630" x2="198" y2="636" />
            <line x1="360" y1="630" x2="360" y2="636" />
            <line x1="525" y1="630" x2="525" y2="638" />
            <line x1="690" y1="630" x2="690" y2="636" />
            <line x1="852" y1="630" x2="852" y2="636" />
          </g>

          {/* Technical Coordinate Labels */}
          <text x="525" y="38" textAnchor="middle" fill="#10b981" fillOpacity="0.35" fontSize="9" fontFamily="monospace" letterSpacing="2">
            52.5M • MIDLINE
          </text>
          <text x="198" y="38" textAnchor="middle" fill="#10b981" fillOpacity="0.3" fontSize="8" fontFamily="monospace">
            16.5M
          </text>
          <text x="852" y="38" textAnchor="middle" fill="#10b981" fillOpacity="0.3" fontSize="8" fontFamily="monospace">
            16.5M
          </text>
        </g>
      </svg>
    </div>
  );
}

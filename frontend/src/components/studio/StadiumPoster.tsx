import React from 'react';

interface StadiumPosterProps {
  className?: string;
  opacity?: number;
}

/**
 * DataTurf Stadium Signature Poster
 * Pure SVG/CSS static stadium visual with isometric tactical geometry,
 * authentic pitch proportions (105m x 68m), floodlight atmospheric glows,
 * and technical coordinate telemetry.
 *
 * Guaranteed zero JS execution, zero layout shift, works with reduced motion and no WebGL.
 */
export function StadiumPoster({
  className = '',
  opacity = 0.4,
}: StadiumPosterProps) {
  return (
    <div
      className={`relative overflow-hidden pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 640"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto transition-opacity duration-700 ease-out motion-reduce:transition-none"
        style={{ opacity }}
      >
        <defs>
          {/* Radial Floodlight Glow */}
          <radialGradient id="stadium-floodlight" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
            <stop offset="40%" stopColor="#059669" stopOpacity="0.10" />
            <stop offset="75%" stopColor="#080a0d" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#080a0d" stopOpacity="0" />
          </radialGradient>

          {/* Vignette mask to seamlessly blend into #080a0d */}
          <linearGradient id="stadium-fade-h" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="15%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="85%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="stadium-fade-v" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="25%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="80%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          <mask id="stadium-blend-mask">
            <rect width="1200" height="640" fill="url(#stadium-fade-h)" />
            <rect width="1200" height="640" fill="url(#stadium-fade-v)" style={{ mixBlendMode: 'multiply' }} />
          </mask>

          {/* Turf Mowing Strip Pattern */}
          <pattern id="isometric-turf-stripes" width="80" height="40" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="80" y2="40" stroke="#10b981" strokeWidth="0.5" strokeOpacity="0.04" />
            <line x1="40" y1="0" x2="120" y2="40" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.02" />
          </pattern>
        </defs>

        {/* Ambient Stadium Glow */}
        <ellipse cx="600" cy="320" rx="460" ry="240" fill="url(#stadium-floodlight)" />

        <g mask="url(#stadium-blend-mask)">
          {/* Stadium Tier Outer Rim (Isometric Elliptical Structure) */}
          <ellipse
            cx="600"
            cy="330"
            rx="520"
            ry="230"
            stroke="#ffffff"
            strokeWidth="1"
            strokeOpacity="0.06"
            strokeDasharray="4 8"
          />
          <ellipse
            cx="600"
            cy="325"
            rx="480"
            ry="210"
            stroke="#10b981"
            strokeWidth="0.75"
            strokeOpacity="0.12"
          />

          {/* Corner Floodlight Tower Axes */}
          {/* Top-Left */}
          <line x1="160" y1="140" x2="320" y2="230" stroke="#10b981" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="2 4" />
          <circle cx="160" cy="140" r="3" fill="#10b981" fillOpacity="0.5" />
          {/* Top-Right */}
          <line x1="1040" y1="140" x2="880" y2="230" stroke="#10b981" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="2 4" />
          <circle cx="1040" cy="140" r="3" fill="#10b981" fillOpacity="0.5" />
          {/* Bottom-Left */}
          <line x1="160" y1="510" x2="320" y2="420" stroke="#10b981" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="2 4" />
          <circle cx="160" cy="510" r="3" fill="#10b981" fillOpacity="0.5" />
          {/* Bottom-Right */}
          <line x1="1040" y1="510" x2="880" y2="420" stroke="#10b981" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="2 4" />
          <circle cx="1040" cy="510" r="3" fill="#10b981" fillOpacity="0.5" />

          {/* Isometric Pitch Surface */}
          {/* Pitch coordinates in isometric 30-degree projection:
              Top vertex: (600, 160)
              Right vertex: (940, 325)
              Bottom vertex: (600, 490)
              Left vertex: (260, 325)
          */}
          <polygon
            points="600,160 940,325 600,490 260,325"
            fill="#0b0f14"
            stroke="#10b981"
            strokeWidth="1.5"
            strokeOpacity="0.45"
          />
          <polygon
            points="600,160 940,325 600,490 260,325"
            fill="url(#isometric-turf-stripes)"
          />

          {/* Halfway Line: connecting midpoints of top-left and bottom-right edges */}
          {/* Midpoint (260,325) to (600,160) is (430, 242.5) */}
          {/* Midpoint (600,490) to (940,325) is (770, 407.5) */}
          {/* Actual isometric transverse midline: connects (430, 407.5) and (770, 242.5) */}
          <line
            x1="430"
            y1="242.5"
            x2="770"
            y2="407.5"
            stroke="#10b981"
            strokeWidth="1.25"
            strokeOpacity="0.4"
          />

          {/* Center Circle in Isometric Projection */}
          <ellipse
            cx="600"
            cy="325"
            rx="75"
            ry="36"
            stroke="#10b981"
            strokeWidth="1.25"
            strokeOpacity="0.45"
          />
          <circle cx="600" cy="325" r="2.5" fill="#10b981" fillOpacity="0.8" />

          {/* Left Penalty Area (Isometric Box) */}
          {/* From left corner (260, 325) along edges toward (600, 160) and (600, 490) */}
          <polygon
            points="260,325 345,284 415,361 330,402"
            stroke="#10b981"
            strokeWidth="1"
            strokeOpacity="0.35"
            fill="none"
          />
          {/* Left Goal Area (6-yard) */}
          <polygon
            points="260,325 295,308 325,343 290,360"
            stroke="#10b981"
            strokeWidth="0.75"
            strokeOpacity="0.3"
            fill="none"
          />

          {/* Right Penalty Area (Isometric Box) */}
          {/* From right corner (940, 325) along edges toward (600, 160) and (600, 490) */}
          <polygon
            points="940,325 855,284 785,361 870,402"
            stroke="#10b981"
            strokeWidth="1"
            strokeOpacity="0.35"
            fill="none"
          />
          {/* Right Goal Area (6-yard) */}
          <polygon
            points="940,325 905,308 875,343 910,360"
            stroke="#10b981"
            strokeWidth="0.75"
            strokeOpacity="0.3"
            fill="none"
          />

          {/* Technical Telemetry Annotations */}
          <g className="font-mono text-[9px] fill-emerald-500/50 select-none">
            <text x="600" y="145" textAnchor="middle">105.0m TOUCHLINE AXIS</text>
            <text x="245" y="325" textAnchor="end">68.0m GOAL LINE</text>
            <text x="955" y="325" textAnchor="start">68.0m GOAL LINE</text>
            <text x="600" y="515" textAnchor="middle">DATATURF RESEARCH ARENA</text>
          </g>

          {/* Center Coordinates Dot Callout */}
          <line x1="600" y1="325" x2="600" y2="280" stroke="#10b981" strokeWidth="0.75" strokeOpacity="0.5" strokeDasharray="2 2" />
          <circle cx="600" cy="280" r="1.5" fill="#10b981" />
          <text x="610" y="283" className="font-mono text-[8px] fill-emerald-400/70">ORIGIN [0, 0]</text>
        </g>
      </svg>
    </div>
  );
}

'use client';

import React from 'react';

interface BorisOperationsIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

/**
 * Custom SVG vector icon matching the AI BORIS Operations Intelligence triangular logo
 * (Interlocked tri-fold geometric symbol enclosed in a circular perimeter).
 * Fully uniform with Lucide sidebar icons (accepts className, sizing, and currentColor fill/stroke).
 */
export default function BorisOperationsIcon({
  className = 'h-4 w-4',
  size,
  ...props
}: BorisOperationsIconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
      {...props}
    >
      {/* Outer Enclosing Ring */}
      <path
        d="M50 4C24.6 4 4 24.6 4 50s20.6 46 46 46 46-20.6 46-46S75.4 4 50 4zm0 84C29 88 12 71 12 50S29 12 50 12s38 17 38 38-17 38-38 38z"
      />
      {/* Interlocked Triangular Branch 1 (Top/Right) */}
      <path
        d="M26 26h48l-9 16H42.5l14 24.5-9 15.5L26 26z"
      />
      {/* Interlocked Triangular Branch 2 (Bottom/Left) */}
      <path
        d="M74 26L48 71l8.5 15L82.5 42H60l14-16z"
      />
      {/* Interlocked Triangular Branch 3 (Center Interlock) */}
      <path
        d="M37.5 42L19 74h47l-8-14H31l6.5-18z"
      />
    </svg>
  );
}

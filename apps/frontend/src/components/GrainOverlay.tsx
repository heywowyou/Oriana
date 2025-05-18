"use client";

import React from "react";

const GrainOverlay = () => {
  // The SVG noise pattern as a data URI
  // You can adjust baseFrequency (e.g., 0.7 to 0.9) for grain size
  // and opacity (e.g., 0.02 to 0.05) for intensity.
  const svgNoisePattern = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='noiseFilter' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.86' stitchTiles='stitch' numOctaves='1'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E")`;

  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none z-[9999] opacity-100" // Ensure opacity is set if needed
      style={{
        backgroundImage: svgNoisePattern,
        backgroundRepeat: "repeat",
      }}
      aria-hidden="true"
    />
  );
};

export default GrainOverlay;

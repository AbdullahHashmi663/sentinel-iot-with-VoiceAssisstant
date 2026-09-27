"use client";

import React from 'react';

const KATAKANA_STRING = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポ";

// Deterministic static distribution: 20% White/Black, 10% Green, 70% Blue (No animations)
const KATAKANA_ITEMS = Array.from({ length: 2400 }, (_, i) => {
  const char = KATAKANA_STRING[i % KATAKANA_STRING.length];
  // Deterministic pseudo-random hash across index
  const hash = (i * 9301 + 49297) % 233280;
  const ratio = hash / 233280;

  let colorClass = "c-blue"; // Default 70%
  if (ratio < 0.20) {
    colorClass = "c-white"; // 20% White in dark mode, Carbon Black in light mode
  } else if (ratio < 0.30) {
    colorClass = "c-green"; // 10% Emerald Green
  }

  return { char, colorClass };
});

export default function Pattern() {
  return (
    <div className="w-full h-full absolute inset-0 pointer-events-none select-none">
      <div className="jp-matrix">
        {KATAKANA_ITEMS.map((item, idx) => (
          <span key={idx} className={item.colorClass}>
            {item.char}
          </span>
        ))}
      </div>
    </div>
  );
}

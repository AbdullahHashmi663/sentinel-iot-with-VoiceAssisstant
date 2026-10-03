"use client";

import React from "react";

export interface CustomLoaderProps {
  size?: number | "sm" | "md" | "lg" | "xl";
  color?: string;
  className?: string;
  glow?: boolean;
}

export default function CustomLoader({
  size = 170,
  color,
  className = "",
  glow = true
}: CustomLoaderProps) {
  const pixelSize =
    typeof size === "number"
      ? size
      : size === "sm"
      ? 56
      : size === "md"
      ? 110
      : size === "lg"
      ? 170
      : 220;

  const styleOverride: React.CSSProperties = {
    "--loader-size": `${pixelSize}px`,
    ...(color ? { "--loader-color": color } : {})
  } as React.CSSProperties;

  return (
    <div
      className={`custom-loader-wrapper relative flex items-center justify-center select-none pointer-events-none ${className}`}
      style={styleOverride}
    >
      <div className={`semicircle ${glow ? "glow-active" : ""}`}>
        <div>
          <div>
            <div>
              <div>
                <div>
                  <div>
                    <div>
                      <div />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

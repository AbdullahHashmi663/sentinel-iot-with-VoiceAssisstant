import type { Metadata } from "next";
import "./globals.css";
import Pattern from "@/components/Pattern";
import GlobalLoaderHUD from "@/components/GlobalLoaderHUD";

export const metadata: Metadata = {
  title: "Sentinel-IoT | Autonomous Explainable XDR & Compliance SOC",
  description: "Next-generation Autonomous Explainable Extended Detection and Response (XDR) platform powered by dual-head Google Conformer, sub-millisecond Saliency SHAP, and automated NIST SP 800-53 & ISO 27001 compliance auditing.",
  icons: {
    icon: "/sentinel_shield_logo.jpg",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="cyberpunk" className="dark h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Space+Grotesk:wght@400;500;600;700&family=Orbitron:wght@500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#05050a] text-[#dee3eb] antialiased selection:bg-[#00f0ff]/30 selection:text-[#00f0ff] relative">
        {/* Japanese Matrix Animated Cyber Background with Soft Ambient Blur & Vignette */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[var(--bg-canvas)]">
          <Pattern />
          {/* Subtle Ambient Radial Vignette */}
          <div className="absolute inset-0 ambient-vignette pointer-events-none" />
        </div>
        <div className="relative z-10 flex flex-col min-h-full">
          {children}
        </div>

        {/* Global Tactical Concentric Semicircle Loader HUD */}
        <GlobalLoaderHUD />
      </body>
    </html>
  );
}

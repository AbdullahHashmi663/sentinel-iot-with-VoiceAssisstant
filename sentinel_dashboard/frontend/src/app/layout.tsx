import type { Metadata } from "next";
import "./globals.css";

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
      <body className="min-h-full flex flex-col cyber-grid-bg antialiased selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}

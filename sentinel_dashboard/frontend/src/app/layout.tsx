import type { Metadata } from "next";
import "./globals.css";
import "./workspace.css";
import "./endpoint.css";

export const metadata: Metadata = {
  title: "Sentinel IoT — Your control room",
  description: "A clearer view of your connected world. Local telemetry, explainable intelligence, and your private Mereoleona assistant.",
  icons: { icon: "/sentinel-eye.svg" },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" data-theme="sentinel"><body>{children}</body></html>;
}

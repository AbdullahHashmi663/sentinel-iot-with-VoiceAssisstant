import type { Metadata } from "next";
import FleetDashboard from "@/components/endpoint/FleetDashboard";
import "../endpoint.css";
export const metadata: Metadata = { title: "Client machines — Sentinel IoT", description: "Explicitly pair and monitor your separate client computers." };
export default function Page() { return <FleetDashboard />; }

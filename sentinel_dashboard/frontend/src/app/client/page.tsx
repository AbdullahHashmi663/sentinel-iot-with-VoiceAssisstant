import type { Metadata } from "next";
import ClientDashboard from "@/components/endpoint/ClientDashboard";
import "../endpoint.css";
export const metadata: Metadata = { title: "My Sentinel — Client dashboard", description: "Your computer’s health, private connection, and sharing controls." };
export default function Page() { return <ClientDashboard />; }

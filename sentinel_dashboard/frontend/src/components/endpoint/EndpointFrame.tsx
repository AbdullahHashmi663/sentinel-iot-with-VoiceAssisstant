"use client";
import type { ReactNode } from "react";
import { Activity, ArrowUpRight, Cable, LayoutDashboard, LockKeyhole, Monitor, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function EndpointFrame({ children, section, onSection, onGuide, fleet = false }: {
  children: ReactNode; section: string; onSection: (section: string) => void; onGuide?: () => void; fleet?: boolean;
}) {
  return <div className="endpoint-app">
    <aside className="endpoint-sidebar">
      <Link className="endpoint-brand" href={fleet ? "/clients" : "/client"}><Image src="/sentinel-eye.svg" width={35} height={28} alt="" /><span>sentinel<span>iot</span><i /></span></Link>
      <div className="endpoint-workspace"><span><Monitor size={18} /></span><div>{fleet ? "Client machines" : "My Sentinel"}<small>{fleet ? "OPERATOR WORKSPACE" : "PERSONAL ENDPOINT"}</small></div></div>
      <span className="endpoint-caption">{fleet ? "YOUR FLEET" : "YOUR COMPUTER"}</span>
      <nav aria-label={fleet ? "Client management" : "Client dashboard"}>{[
        { id: "overview", title: fleet ? "Client overview" : "Overview", icon: LayoutDashboard },
        { id: "connection", title: fleet ? "Enroll a client" : "Connection", icon: Cable },
        { id: "privacy", title: "Privacy & control", icon: LockKeyhole },
      ].map(({ id, title, icon: Icon }) => <button key={id} onClick={() => onSection(id)} className={section === id ? "active" : ""} aria-current={section === id ? "page" : undefined}><Icon size={17} />{title}</button>)}</nav>
      <div className="endpoint-sidebar-foot"><ShieldCheck size={22} /><p>{fleet ? "Independent machines.\nOne considered view." : "A little awareness.\nA clearer day."}</p><span>LOCAL BY DESIGN</span>{fleet && <Link href="/">Main control room <ArrowUpRight size={13} /></Link>}</div>
    </aside>
    <div className="endpoint-body"><header className="endpoint-top"><span><Activity size={13} />{fleet ? "Sentinel / Client machines" : "Sentinel / Client dashboard"}</span><div><span className="endpoint-private"><LockKeyhole size={12} />Private workspace</span>{onGuide && <button onClick={onGuide}><Sparkles size={14} />Mereoleona</button>}</div></header><main>{children}</main><footer className="endpoint-footer"><span>SENTINEL IOT <i />{fleet ? "YOUR CLIENT PERIMETER" : "YOUR MACHINE. YOUR PERSPECTIVE."}</span><span>Local health monitoring · People stay in control</span></footer></div>
  </div>;
}

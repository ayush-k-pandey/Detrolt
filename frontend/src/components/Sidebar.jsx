import { NavLink } from "react-router-dom";
import { LayoutDashboard, Zap, ClipboardList, Brain, LogOut } from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "../hooks/useAuth";
import { useApi } from "../hooks/useApi";
import { getUserProfile } from "../api";

const links = [
  { to: "/app",            end: true,  icon: <LayoutDashboard size={16} />, label: "Dashboard"  },
  { to: "/app/activities", end: false, icon: <Zap size={16} />,             label: "Activities" },
  { to: "/app/log",        end: false, icon: <ClipboardList size={16} />,   label: "Daily Log"  },
  { to: "/app/insights",   end: false, icon: <Brain size={16} />,            label: "Insights"   },
];

const XP_THRESHOLDS = [0, 500, 1200, 2500, 5000, 10000, 99999];

export default function Sidebar({ onLogout }) {
  const { user: authUser }  = useAuth();
  const { data: profile }   = useApi(getUserProfile);

  const name   = profile?.name  ?? authUser?.name ?? "User";
  const level  = profile?.level ?? 1;
  const title  = profile?.title ?? "Beginner";
  const xp     = profile?.xp   ?? 0;
  const xpNext = XP_THRESHOLDS[Math.min(level, 6)];
  const pct    = Math.min(Math.round((xp / xpNext) * 100), 100);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Logo size={18} color="rgba(116,198,157,0.9)" />
        <span>Detrolt</span>
      </div>

      {/* User badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: "#2d6a4f", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{name[0]?.toUpperCase()}</span>
        </div>
        <div style={{ overflow: "hidden" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
          <div style={{ fontSize: 11, color: "rgba(116,198,157,0.75)" }}>Lv.{level} — {title}</div>
        </div>
      </div>

      {/* XP bar */}
      <div style={{ padding: "0 10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>XP</span>
          <span style={{ fontSize: 10, color: "rgba(116,198,157,0.7)" }}>{xp}/{xpNext}</span>
        </div>
        <div className="xp-track"><div className="xp-fill" style={{ width: `${pct}%` }} /></div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>{xpNext - xp} XP to Level {level + 1}</div>
      </div>

      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        {links.map(l => (
          <NavLink key={l.to} to={l.to} end={l.end}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
            {l.icon}{l.label}
          </NavLink>
        ))}
      </nav>

      <button onClick={onLogout}
        style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", fontSize: 13, borderRadius: 8, width: "100%", fontFamily: "inherit", transition: "color 0.15s" }}
        onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
        onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}>
        <LogOut size={15} /> Sign Out
      </button>
    </aside>
  );
}

import { BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, PieChart, Pie, Cell, ResponsiveContainer, Legend, LineChart, Line } from "recharts";
import { TrendingUp, Target, AlertTriangle } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { getStatsSummary, getStatsChart, getStatsWeekly, getMLPredictions } from "../api";
import { LoadingSpinner, ErrorView } from "../components/StateViews";
import { useAuth } from "../hooks/useAuth";

const BADGES = [
  { icon: "🔥", name: "First Streak",  earned: true,  desc: "3 days in a row"       },
  { icon: "💎", name: "Perfect Week",  earned: false, desc: "7 days above goal"      },
  { icon: "🚀", name: "Century",       earned: false, desc: "Score 100+ in one day"  },
  { icon: "🧠", name: "Scholar",       earned: false, desc: "Study 30 days straight" },
  { icon: "⚡", name: "Comeback",      earned: false, desc: "Back after 5-day gap"   },
];

const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #eef2ef", borderRadius: 10, padding: "10px 14px", fontSize: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => p.value != null && <div key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}pts</strong></div>)}
    </div>
  );
};

function StatCard({ label, value, sub, color = "#2d6a4f" }) {
  return (
    <div className="card" style={{ flex: 1 }}>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color }}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { user }       = useAuth();
  const summary        = useApi(getStatsSummary);
  const chart          = useApi(getStatsChart);
  const weekly         = useApi(getStatsWeekly);
  const predictions    = useApi(getMLPredictions);

  if (summary.loading) return <div className="page-inner"><LoadingSpinner message="Loading dashboard..." /></div>;
  if (summary.error)   return <div className="page-inner"><ErrorView message={summary.error} onRetry={summary.refetch} /></div>;

  const s   = summary.data;
  const pct = Math.min(Math.round((s.total_xp / [0,500,1200,2500,5000,10000,99999][Math.min(s.level,6)]) * 100), 100);
  const m   = predictions.data;

  return (
    <div className="page-inner">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#111814", letterSpacing: "-0.02em" }}>
          Good morning, {user?.name ?? s.title} 👋
        </h1>
        <p style={{ color: "#6b7a72", fontSize: 14, marginTop: 4 }}>
          {s.streak > 0 ? `Day ${s.streak} of your streak — keep it alive.` : "Start your streak today — log your first activity."}
        </p>
      </div>

      {/* XP bar */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div>
            <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 15 }}>Level {s.level}</span>
            <span style={{ color: "#6b7a72", fontSize: 13, marginLeft: 8 }}>— {s.title}</span>
          </div>
          <span style={{ fontSize: 13, color: "#2d6a4f", fontWeight: 600 }}>{s.total_xp.toLocaleString()} XP</span>
        </div>
        <div className="xp-track" style={{ height: 8 }}><div className="xp-fill" style={{ width: `${pct}%` }} /></div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <StatCard label="Today's Score" value={`${s.today_score}pts`} sub={`Goal: ${s.daily_goal}pts`} color="#2d6a4f" />
        <StatCard label="🔥 Streak"     value={`${s.streak} days`}   sub="Consecutive days"      color="#d97706" />
        <StatCard label="Consistency"   value={`${s.consistency}%`}  sub="Last 30 days"           color="#2d6a4f" />
        <StatCard label="Burnout Risk"  value={m?.burnout_risk ?? "—"} sub="ML model"             color={m?.burnout_risk_color ?? "#2d6a4f"} />
      </div>

      {/* Charts */}
      {chart.data && (
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, marginBottom: 20 }}>
          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Daily Points — Last 14 Days</h3>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={chart.data.daily} barSize={14}>
                <XAxis dataKey="date" tick={{ fill: "#9aada3", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9aada3", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<TT />} />
                <ReferenceLine y={s.daily_goal} stroke="#2d6a4f" strokeDasharray="4 3" strokeWidth={1.5} />
                <Bar dataKey="points" name="Points" fill="#74c69d" radius={[5,5,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Category Breakdown</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={chart.data.categories} cx="50%" cy="50%" innerRadius={44} outerRadius={72} dataKey="value" paddingAngle={3}>
                  {chart.data.categories.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #eef2ef", borderRadius: 10, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", marginTop: 8 }}>
              {chart.data.categories.map(c => (
                <span key={c.name} style={{ fontSize: 12, color: c.color, display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, display: "inline-block" }} />
                  {c.name} {c.value}%
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Week comparison */}
      {weekly.data && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600 }}>This Week vs Last Week</h3>
            <span style={{ fontSize: 12, color: "#2d6a4f", fontWeight: 600, background: "#f0faf3", padding: "3px 10px", borderRadius: 99 }}>{weekly.data.trend}</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weekly.data.data} barSize={12} barGap={4}>
              <XAxis dataKey="date" tick={{ fill: "#9aada3", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9aada3", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TT />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Bar dataKey="this_week" name="This week" fill="#2d6a4f" radius={[4,4,0,0]} />
              <Bar dataKey="last_week" name="Last week" fill="#d8f3dc" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ML prediction cards */}
      {m && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 28 }}>
          {[
            { icon: <TrendingUp size={16}/>, label: "Tomorrow's predicted score", value: `${m.tomorrow_score} pts`, color: "#2d6a4f", bg: "#f0faf3" },
            { icon: <Target size={16}/>,     label: "Best day of week",            value: m.best_day,               color: "#d97706", bg: "#fffbeb" },
            { icon: <AlertTriangle size={16}/>,label:"Effort gap today",           value: `+${m.effort_gap} pts`,   color: "#dc2626", bg: "#fef2f2" },
          ].map(c => (
            <div key={c.label} className="card" style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", color: c.color, flexShrink: 0 }}>{c.icon}</div>
              <div>
                <div style={{ fontSize: 11, color: "#6b7a72", marginBottom: 4 }}>{c.label}</div>
                <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 20, fontWeight: 700, color: c.color }}>{c.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Badges */}
      <div className="card">
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Achievements</h3>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {BADGES.map(b => (
            <div key={b.name} className={b.earned ? "badge-earned" : "badge-locked"} style={{ textAlign: "center", width: 72 }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>{b.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#374840" }}>{b.name}</div>
              <div style={{ fontSize: 10, color: "#9aada3", marginTop: 2 }}>{b.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

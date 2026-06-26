import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Brain, TrendingUp, AlertTriangle, Star, Zap, Calendar } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { getMLPredictions, getMLInsights, getMLForecast, getMLImpact } from "../api";
import { LoadingSpinner, ErrorView } from "../components/StateViews";

const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#fff", border:"1px solid #eef2ef", borderRadius:10, padding:"10px 14px", fontSize:12, boxShadow:"0 4px 20px rgba(0,0,0,0.08)" }}>
      <div style={{ fontWeight:600, marginBottom:4 }}>{label}</div>
      {payload.map((p,i) => p.value != null && <div key={i} style={{ color:p.color }}>{p.name}: <strong>{p.value}pts</strong></div>)}
    </div>
  );
};

const ICONS  = { streak:<Zap size={15}/>, pattern:<Calendar size={15}/>, predict:<TrendingUp size={15}/>, impact:<Star size={15}/>, warning:<AlertTriangle size={15}/> };
const COLORS = {
  streak:  { bg:"#f0faf3", border:"#74c69d", icon:"#2d6a4f" },
  pattern: { bg:"#f0faf3", border:"#74c69d", icon:"#2d6a4f" },
  predict: { bg:"#fffbeb", border:"#fcd34d", icon:"#d97706" },
  impact:  { bg:"#f0faf3", border:"#74c69d", icon:"#2d6a4f" },
  warning: { bg:"#fef2f2", border:"#fca5a5", icon:"#dc2626" },
};

export default function Insights() {
  const pred    = useApi(getMLPredictions);
  const ins     = useApi(getMLInsights);
  const fore    = useApi(getMLForecast);
  const impact  = useApi(getMLImpact);

  if (pred.loading || ins.loading) return <div className="page-inner"><LoadingSpinner message="Running ML models..." /></div>;
  if (pred.error)                  return <div className="page-inner"><ErrorView message={pred.error} onRetry={pred.refetch} /></div>;

  const m    = pred.data;
  const cards= ins.data  ?? [];
  const imps = impact.data ?? [];
  const maxI = imps[0]?.impact ?? 1;

  const foreData = (() => {
    if (!fore.data) return [];
    return [
      ...(fore.data.actual   ?? []).map(d => ({ date:d.date, points:d.points, predicted:null })),
      ...(fore.data.forecast ?? []).map(d => ({ date:d.date, points:null, predicted:d.predicted })),
    ];
  })();

  return (
    <div className="page-inner">
      <div style={{ marginBottom:28 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
          <Brain size={22} color="#2d6a4f" />
          <h1 style={{ fontSize:26, fontWeight:700, color:"#111814", letterSpacing:"-0.02em" }}>ML Insights</h1>
        </div>
        <p style={{ color:"#6b7a72", fontSize:14 }}>Predictions and patterns from your real activity history.</p>
      </div>

      {/* ML summary cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
        {[
          { label:"Tomorrow's score",     value:`${m.tomorrow_score} pts`,    icon:<TrendingUp size={16}/>, color:"#2d6a4f", bg:"#f0faf3" },
          { label:"Consistency forecast", value:`${m.consistency_forecast}%`, icon:<Star size={16}/>,       color:"#2d6a4f", bg:"#f0faf3" },
          { label:"Burnout risk",         value:m.burnout_risk,               icon:<AlertTriangle size={16}/>, color:m.burnout_risk_color, bg:"#f0faf3" },
          { label:"Best day to push",     value:m.best_day,                   icon:<Calendar size={16}/>,   color:"#d97706", bg:"#fffbeb" },
        ].map(c => (
          <div key={c.label} className="card" style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:9, background:c.bg, display:"flex", alignItems:"center", justifyContent:"center", color:c.color, flexShrink:0 }}>{c.icon}</div>
            <div>
              <div style={{ fontSize:10, color:"#9aada3", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.07em" }}>{c.label}</div>
              <div style={{ fontFamily:"Space Grotesk, sans-serif", fontSize:18, fontWeight:700, color:c.color }}>{c.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Forecast chart */}
      <div className="card" style={{ marginBottom:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <div>
            <h3 style={{ fontSize:15, fontWeight:700 }}>Score Forecast — Next 7 Days</h3>
            <p style={{ fontSize:12, color:"#9aada3", marginTop:2 }}>Solid = actual · Dashed = ML prediction</p>
          </div>
          <span style={{ fontSize:11, background:"#f0faf3", color:"#2d6a4f", padding:"4px 12px", borderRadius:99, fontWeight:600 }}>Ridge Regression</span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={foreData}>
            <CartesianGrid stroke="#f0f4f1" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fill:"#9aada3", fontSize:10 }} axisLine={false} tickLine={false} interval={2} />
            <YAxis tick={{ fill:"#9aada3", fontSize:10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<TT />} />
            <Line type="monotone" dataKey="points"    name="Actual"    stroke="#2d6a4f" strokeWidth={2.5} dot={{ fill:"#2d6a4f", r:3 }} connectNulls={false} />
            <Line type="monotone" dataKey="predicted" name="Predicted" stroke="#74c69d" strokeWidth={2}   dot={{ fill:"#74c69d", r:3 }} strokeDasharray="5 4" connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 }}>
        {/* Insight cards */}
        <div className="card">
          <h3 style={{ fontSize:15, fontWeight:700, marginBottom:14 }}>Smart Insights</h3>
          {cards.length === 0
            ? <p style={{ color:"#9aada3", fontSize:13 }}>Log a few days to generate insights.</p>
            : <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {cards.map((ins,i) => {
                  const c = COLORS[ins.type] ?? COLORS.predict;
                  return (
                    <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"12px 14px", background:c.bg, borderRadius:10, border:`1px solid ${c.border}` }}>
                      <span style={{ color:c.icon, flexShrink:0, marginTop:1 }}>{ICONS[ins.type] ?? <Star size={15}/>}</span>
                      <p style={{ fontSize:13, color:"#374840", lineHeight:1.5 }}>{ins.text}</p>
                    </div>
                  );
                })}
              </div>}
        </div>

        {/* Activity impact */}
        <div className="card">
          <h3 style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>Activity Impact Score</h3>
          <p style={{ fontSize:12, color:"#9aada3", marginBottom:16 }}>Which activity contributes most in the last 30 days.</p>
          {imps.length === 0
            ? <p style={{ color:"#9aada3", fontSize:13 }}>Log activities to see impact scores.</p>
            : <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {imps.map((a,i) => (
                  <div key={a.id}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        {i===0 && <span style={{ fontSize:12 }}>🏆</span>}
                        <span style={{ fontSize:13, color:"#374840", fontWeight:i===0?600:400 }}>{a.name}</span>
                        <span style={{ fontSize:10, color:"#9aada3" }}>({a.sessions} sessions)</span>
                      </div>
                      <span style={{ fontSize:12, fontFamily:"Space Grotesk, sans-serif", fontWeight:700, color:a.color }}>{a.impact}</span>
                    </div>
                    <div style={{ height:5, background:"#eef2ef", borderRadius:99, overflow:"hidden" }}>
                      <div style={{ width:`${Math.round(a.impact/maxI*100)}%`, height:"100%", background:a.color, borderRadius:99, transition:"width 0.6s ease" }} />
                    </div>
                  </div>
                ))}
              </div>}
          {m.top_activity && m.top_activity !== "—" && (
            <div style={{ marginTop:20, padding:"12px 14px", background:"#f0faf3", borderRadius:10, border:"1px solid #d8f3dc" }}>
              <div style={{ fontSize:11, color:"#6b7a72", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.07em" }}>Top this month</div>
              <div style={{ fontFamily:"Space Grotesk, sans-serif", fontSize:17, fontWeight:700, color:"#2d6a4f" }}>🎯 {m.top_activity}</div>
            </div>
          )}
        </div>
      </div>

      {/* Effort gap */}
      <div className="card" style={{ background:"linear-gradient(135deg,#f0faf3,#fff)", border:"1px solid #d8f3dc" }}>
        <div style={{ display:"flex", gap:20, alignItems:"center" }}>
          <div style={{ width:64, height:64, borderRadius:16, background:"#2d6a4f", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Brain size={28} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontSize:16, fontWeight:700, color:"#111814", marginBottom:6 }}>Effort Gap: +{m.effort_gap} pts needed today</h3>
            <p style={{ fontSize:13, color:"#6b7a72", lineHeight:1.6 }}>
              {m.effort_gap === 0
                ? "You've already hit your goal today! 🎉 Great work — keep the momentum going."
                : `You need ${m.effort_gap} more points today to stay on track. Complete one more activity to close the gap.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

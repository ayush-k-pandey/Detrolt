import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { getActivities, saveLog } from "../api";
import { LoadingSpinner, ErrorView, EmptyState } from "../components/StateViews";

const DAYS = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - (6 - i));
  return {
    label:   d.toLocaleDateString("en", { weekday: "short" }),
    dateStr: d.toISOString().split("T")[0],
    display: d.toLocaleDateString("en", { month: "short", day: "numeric" }),
    isToday: i === 6,
  };
});

export default function DailyLog() {
  const { data: acts, loading, error } = useApi(getActivities);
  const [selDay,    setSelDay]    = useState(6);
  const [completed, setCompleted] = useState({});
  const [notes,     setNotes]     = useState("");
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);

  const toggle = (id) => setCompleted(p => ({ ...p, [id]: !p[id] }));

  const earned   = acts?.filter(a => completed[a.id]).reduce((s,a) => s + a.points, 0) ?? 0;
  const total    = acts?.reduce((s,a) => s + a.points, 0) ?? 0;
  const accuracy = total ? Math.round(earned / total * 100) : 0;
  const goal     = 50;
  const hitGoal  = earned >= goal;

  const handleSave = async () => {
    if (!acts?.length) return;
    setSaving(true);
    try {
      await saveLog({
        date: DAYS[selDay].dateStr,
        completions: acts.map(a => ({ activity_id: a.id, completed: !!completed[a.id] })),
        notes,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally { setSaving(false); }
  };

  if (loading) return <div className="page-inner"><LoadingSpinner message="Loading activities..." /></div>;
  if (error)   return <div className="page-inner"><ErrorView message={error} /></div>;

  return (
    <div className="page-inner">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#111814", letterSpacing: "-0.02em" }}>Daily Log</h1>
        <p style={{ color: "#6b7a72", fontSize: 14, marginTop: 4 }}>Mark what you completed. Points add up automatically.</p>
      </div>

      {/* Day selector */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {DAYS.map((d, i) => (
            <button key={i} onClick={() => { setSelDay(i); setCompleted({}); setSaved(false); }}
              style={{ flex:1, padding:"10px 4px", borderRadius:10, border:"none", cursor:"pointer", textAlign:"center", background: selDay===i ? "#2d6a4f" : d.isToday ? "#f0faf3" : "transparent", transition:"background 0.15s" }}>
              <div style={{ fontSize:10, fontWeight:600, color: selDay===i ? "rgba(255,255,255,0.7)" : "#9aada3", marginBottom:3, textTransform:"uppercase" }}>{d.label}</div>
              <div style={{ fontSize:14, fontWeight:700, fontFamily:"Space Grotesk, sans-serif", color: selDay===i ? "#fff" : "#374840" }}>{d.display.split(" ")[1]}</div>
              <div style={{ fontSize:9, color: selDay===i ? "rgba(255,255,255,0.6)" : "#c8d4cc", marginTop:2 }}>{d.display.split(" ")[0]}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
        <div className="card">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <h3 style={{ fontSize:15, fontWeight:700 }}>Activities</h3>
            <span style={{ fontSize:12, color:"#6b7a72" }}>{acts?.filter(a=>completed[a.id]).length ?? 0}/{acts?.length ?? 0} done</span>
          </div>

          {!acts?.length ? (
            <EmptyState icon="🎯" title="No activities yet" message="Go to Activities tab and add some first." />
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
              {acts.map(a => (
                <button key={a.id} onClick={() => toggle(a.id)}
                  style={{ display:"flex", alignItems:"center", gap:14, padding:"13px 14px", borderRadius:10, border:"none", cursor:"pointer", textAlign:"left", width:"100%", background: completed[a.id] ? "#f0faf3" : "transparent", transition:"background 0.15s" }}>
                  {completed[a.id] ? <CheckCircle2 size={20} color="#2d6a4f"/> : <Circle size={20} color="#c8d4cc"/>}
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:500, color: completed[a.id] ? "#2d6a4f" : "#374840" }}>{a.name}</div>
                    <div style={{ fontSize:11, color:"#9aada3", marginTop:1 }}>{a.category}</div>
                  </div>
                  <div style={{ fontSize:13, fontWeight:700, fontFamily:"Space Grotesk, sans-serif", color: completed[a.id] ? "#2d6a4f" : "#c8d4cc" }}>+{a.points}pts</div>
                </button>
              ))}
            </div>
          )}

          <div style={{ marginTop:20, paddingTop:16, borderTop:"1px solid #eef2ef" }}>
            <label style={{ fontSize:11, color:"#6b7a72", textTransform:"uppercase", letterSpacing:"0.07em", display:"block", marginBottom:8 }}>Notes (optional)</label>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="How did today go?" rows={3}
              style={{ width:"100%", padding:"10px 12px", borderRadius:10, border:"1px solid #c8d4cc", fontSize:13, color:"#374840", resize:"none", outline:"none", fontFamily:"inherit", lineHeight:1.5 }} />
          </div>
          <button className="btn-primary" style={{ marginTop:14, width:"100%", justifyContent:"center" }} onClick={handleSave} disabled={saving || !acts?.length}>
            {saving ? "Saving..." : saved ? "✓ Saved!" : "Save log"}
          </button>
        </div>

        {/* Summary */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div className="card" style={{ borderColor: hitGoal ? "#74c69d" : "#eef2ef", background: hitGoal ? "#f0faf3" : "#fff" }}>
            <div className="stat-label">Today's score</div>
            <div style={{ fontFamily:"Space Grotesk, sans-serif", fontSize:48, fontWeight:700, color: hitGoal ? "#2d6a4f" : "#374840", lineHeight:1 }}>{earned}</div>
            <div style={{ fontSize:13, color:"#9aada3", marginTop:4 }}>of {goal} goal pts</div>
            <div style={{ marginTop:12, height:6, background:"#eef2ef", borderRadius:99, overflow:"hidden" }}>
              <div style={{ width:`${Math.min(earned/goal*100,100)}%`, height:"100%", background: hitGoal ? "#2d6a4f" : "#74c69d", borderRadius:99, transition:"width 0.5s ease" }} />
            </div>
            {hitGoal && <div style={{ marginTop:10, fontSize:13, color:"#2d6a4f", fontWeight:600 }}>🎉 Goal hit!</div>}
          </div>
          <div className="card">
            <div className="stat-label">Accuracy</div>
            <div style={{ fontFamily:"Space Grotesk, sans-serif", fontSize:32, fontWeight:700, color:"#2d6a4f" }}>{accuracy}%</div>
            <div style={{ fontSize:12, color:"#9aada3", marginTop:2 }}>Completed / planned</div>
          </div>
          <div className="card">
            <div className="stat-label" style={{ marginBottom:12 }}>Breakdown</div>
            {acts?.map(a => (
              <div key={a.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderBottom:"1px solid #f7f8f5" }}>
                <span style={{ fontSize:12, color: completed[a.id] ? "#374840" : "#c8d4cc" }}>{a.name}</span>
                <span style={{ fontSize:12, fontWeight:700, color: completed[a.id] ? "#2d6a4f" : "#eef2ef", fontFamily:"Space Grotesk, sans-serif" }}>{completed[a.id] ? `+${a.points}` : "—"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

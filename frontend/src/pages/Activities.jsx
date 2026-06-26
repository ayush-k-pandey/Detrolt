import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { getActivities, createActivity, deleteActivity } from "../api";
import { LoadingSpinner, ErrorView, EmptyState } from "../components/StateViews";

const CATEGORIES = ["Study","Health","Personal","Creative","Work"];
const CAT_COLORS = { Study:"#2d6a4f", Health:"#40916c", Personal:"#74c69d", Creative:"#1b4332", Work:"#52b788" };

function Ring({ pct, size=52, stroke=5, color="#74c69d" }) {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle fill="none" stroke="#eef2ef" cx={size/2} cy={size/2} r={r} strokeWidth={stroke} />
        <circle fill="none" stroke={color}   cx={size/2} cy={size/2} r={r} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ}
          strokeDashoffset={circ - (Math.min(pct,100)/100)*circ}
          style={{ transition: "stroke-dashoffset 0.7s ease" }} />
      </svg>
      <span style={{ position: "absolute", fontSize: 10, fontWeight: 700, color, fontFamily: "Space Grotesk, sans-serif" }}>{pct}%</span>
    </div>
  );
}

export default function Activities() {
  const { data: acts, loading, error, refetch } = useApi(getActivities);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState({ name:"", category:"Study", points:10, weekly_goal:3, color:"#2d6a4f" });
  const [saving,   setSaving]   = useState(false);

  const add = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try { await createActivity({ ...form, color: CAT_COLORS[form.category] ?? "#2d6a4f" }); refetch(); setShowForm(false); setForm({ name:"", category:"Study", points:10, weekly_goal:3, color:"#2d6a4f" }); }
    finally { setSaving(false); }
  };

  const remove = async (id) => { await deleteActivity(id); refetch(); };

  if (loading) return <div className="page-inner"><LoadingSpinner message="Loading activities..." /></div>;
  if (error)   return <div className="page-inner"><ErrorView message={error} onRetry={refetch} /></div>;

  const inputS = { width:"100%", padding:"9px 10px", borderRadius:8, border:"1px solid #c8d4cc", fontSize:13, color:"#111814", outline:"none", fontFamily:"inherit" };

  return (
    <div className="page-inner">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:700, color:"#111814", letterSpacing:"-0.02em" }}>Activities</h1>
          <p style={{ color:"#6b7a72", fontSize:14, marginTop:4 }}>Your custom activity library. Assign points, set weekly goals.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(s=>!s)}><Plus size={15}/>New activity</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom:20, borderColor:"#74c69d" }}>
          <h3 style={{ fontSize:14, fontWeight:600, marginBottom:16 }}>Add activity</h3>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 100px 100px", gap:12, marginBottom:14 }}>
            <div>
              <label style={{ fontSize:11, color:"#6b7a72", display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.06em" }}>Name</label>
              <input style={inputS} placeholder="e.g. Morning Run" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} />
            </div>
            <div>
              <label style={{ fontSize:11, color:"#6b7a72", display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.06em" }}>Category</label>
              <select style={inputS} value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                {CATEGORIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:11, color:"#6b7a72", display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.06em" }}>Points</label>
              <input style={inputS} type="number" value={form.points} onChange={e=>setForm(p=>({...p,points:Number(e.target.value)}))} />
            </div>
            <div>
              <label style={{ fontSize:11, color:"#6b7a72", display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.06em" }}>Weekly goal</label>
              <input style={inputS} type="number" value={form.weekly_goal} onChange={e=>setForm(p=>({...p,weekly_goal:Number(e.target.value)}))} />
            </div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button className="btn-primary" onClick={add} disabled={saving}>{saving?"Saving...":"Add activity"}</button>
            <button className="btn-ghost"   onClick={()=>setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {acts?.length === 0 ? (
        <EmptyState icon="🎯" title="No activities yet" message="Add your first activity to start tracking points." />
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:14 }}>
          {acts?.map(a => {
            const pct = Math.round((a.completed_this_week / a.weekly_goal) * 100);
            return (
              <div key={a.id} className="card" style={{ position:"relative" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div style={{ flex:1 }}>
                    <span style={{ fontSize:11, fontWeight:600, color:a.color, background:`${a.color}18`, padding:"2px 8px", borderRadius:99, display:"inline-block", marginBottom:6 }}>{a.category}</span>
                    <h3 style={{ fontSize:16, fontWeight:700, color:"#111814", marginBottom:4 }}>{a.name}</h3>
                    <div style={{ fontSize:13, color:"#6b7a72" }}><span style={{ color:"#2d6a4f", fontWeight:700 }}>{a.points} pts</span> per session</div>
                  </div>
                  <Ring pct={Math.min(pct,100)} color={a.color} />
                </div>
                <div style={{ marginTop:14, paddingTop:12, borderTop:"1px solid #eef2ef" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#6b7a72", marginBottom:6 }}>
                    <span>Weekly goal</span>
                    <span style={{ color:"#374840", fontWeight:600 }}>{a.completed_this_week}/{a.weekly_goal} sessions</span>
                  </div>
                  <div style={{ height:4, background:"#eef2ef", borderRadius:99, overflow:"hidden" }}>
                    <div style={{ width:`${Math.min(pct,100)}%`, height:"100%", background:a.color, borderRadius:99, transition:"width 0.5s ease" }} />
                  </div>
                </div>
                <button onClick={()=>remove(a.id)}
                  style={{ position:"absolute", top:14, right:14, background:"transparent", border:"none", cursor:"pointer", color:"#c8d4cc", padding:4, borderRadius:6 }}
                  onMouseEnter={e=>e.currentTarget.style.color="#dc2626"}
                  onMouseLeave={e=>e.currentTarget.style.color="#c8d4cc"}>
                  <Trash2 size={14}/>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

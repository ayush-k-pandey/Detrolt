import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap, TrendingUp, Brain, Target, Award, ChevronDown,
         BarChart2, CheckCircle, Star, Menu, X, Play, ChevronRight } from "lucide-react";
import Logo from "./Logo";

const BG_IMAGE   = "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260611_133301_d5f2a94a-b22e-4e4a-a6b6-eacdddf1f5b0.png&w=1280&q=85";
const GRASS_IMAGE = "https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1781191264/grass_eam204.png";

const FEATURES = [
  {
    icon: <Zap size={22} color="#2d6a4f" />,
    title: "Custom Activity Library",
    desc: "Create your own activities — study sessions, gym, reading, coding — and assign point values that match your priorities.",
    detail: "Add unlimited activities. Set weekly frequency goals per activity. Organise by category: Study, Health, Personal, Creative, Work.",
  },
  {
    icon: <BarChart2 size={22} color="#2d6a4f" />,
    title: "Live Analytics Dashboard",
    desc: "See your daily scores, streaks, and consistency trends in beautiful, real-time charts updated the moment you log.",
    detail: "14-day bar chart, category donut, week-vs-week comparison, streak calendar, accuracy gauge — all updating live.",
  },
  {
    icon: <Brain size={22} color="#2d6a4f" />,
    title: "ML Predictions",
    desc: "Machine learning models analyse your history and predict tomorrow's score, flag burnout risk, and identify your best days.",
    detail: "Ridge Regression for score prediction. Logistic Regression for burnout. K-Means for habit archetypes. Isolation Forest for anomaly detection.",
  },
  {
    icon: <Target size={22} color="#2d6a4f" />,
    title: "Daily Point Goals",
    desc: "Set a daily point target. Every activity you complete chips away at the goal. See exactly how close you are in real time.",
    detail: "Customisable daily goal. Accuracy score (completed vs planned). Effort gap calculator — shows how many pts you need right now.",
  },
  {
    icon: <Award size={22} color="#2d6a4f" />,
    title: "XP, Levels & Badges",
    desc: "Every point earns XP. Level up from Beginner to Legendary. Unlock badges for streaks, perfect weeks, and comebacks.",
    detail: "6 levels: Beginner → Consistent → Focused → Disciplined → Elite → Legendary. 5 unique badges. Streak tracking.",
  },
  {
    icon: <TrendingUp size={22} color="#2d6a4f" />,
    title: "Persistent Data",
    desc: "Your data is saved permanently to MongoDB. Sign in from any device and your entire history — every log, every streak — is there.",
    detail: "JWT authentication. Each user's data is completely private. Data never deleted. Accessible from any browser.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Create your activities",
    desc: "Add the things that matter to you — DSA practice, gym, reading, projects. Assign each one a point value based on difficulty or importance.",
    img: (
      <div style={{ background: "#1a1f1c", borderRadius: 12, padding: 16, fontFamily: "monospace" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {["#ff5f57","#febc2e","#28c840"].map(c => <span key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block" }} />)}
        </div>
        {[
          { name: "DSA Practice",  pts: 15, cat: "Study",    color: "#2d6a4f" },
          { name: "Gym Session",   pts: 10, cat: "Health",   color: "#40916c" },
          { name: "Read 30min",    pts: 5,  cat: "Personal", color: "#74c69d" },
          { name: "Side Project",  pts: 20, cat: "Creative", color: "#1b4332" },
        ].map(a => (
          <div key={a.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "rgba(255,255,255,0.04)", borderRadius: 8, marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontFamily: "Inter, sans-serif" }}>{a.name}</div>
              <div style={{ fontSize: 10, color: a.color, marginTop: 2 }}>{a.cat}</div>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#74c69d", fontFamily: "Space Grotesk, sans-serif" }}>+{a.pts}pts</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    num: "02",
    title: "Log what you complete",
    desc: "Each day, check off what you actually did. Detrolt calculates your score, accuracy, and whether you hit your daily goal instantly.",
    img: (
      <div style={{ background: "#1a1f1c", borderRadius: 12, padding: 16 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {["#ff5f57","#febc2e","#28c840"].map(c => <span key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block" }} />)}
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 10, fontFamily: "Inter, sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>Today — Jun 20</div>
        {[
          { name: "DSA Practice", pts: 15, done: true  },
          { name: "Gym Session",  pts: 10, done: true  },
          { name: "Read 30min",   pts: 5,  done: true  },
          { name: "Side Project", pts: 20, done: false },
        ].map(a => (
          <div key={a.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", background: a.done ? "rgba(116,198,157,0.08)" : "rgba(255,255,255,0.03)", borderRadius: 8, marginBottom: 5 }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, background: a.done ? "rgba(116,198,157,0.3)" : "rgba(255,255,255,0.05)", border: a.done ? "1px solid #74c69d" : "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {a.done && <span style={{ fontSize: 9, color: "#74c69d" }}>✓</span>}
            </div>
            <span style={{ flex: 1, fontSize: 12, color: a.done ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.3)", fontFamily: "Inter, sans-serif" }}>{a.name}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: a.done ? "#74c69d" : "rgba(255,255,255,0.2)", fontFamily: "Space Grotesk, sans-serif" }}>+{a.pts}</span>
          </div>
        ))}
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "Inter, sans-serif" }}>Today's score</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#74c69d", fontFamily: "Space Grotesk, sans-serif" }}>30 / 50 pts</span>
        </div>
      </div>
    ),
  },
  {
    num: "03",
    title: "Get ML-powered insights",
    desc: "After a few days, Detrolt's ML models kick in — predicting your next score, flagging burnout risk, and showing what works best for you.",
    img: (
      <div style={{ background: "#1a1f1c", borderRadius: 12, padding: 16 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {["#ff5f57","#febc2e","#28c840"].map(c => <span key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block" }} />)}
        </div>
        {[
          { label: "Tomorrow's Score",  value: "62 pts",  color: "#74c69d", bg: "rgba(116,198,157,0.1)" },
          { label: "Burnout Risk",      value: "Low",     color: "#74c69d", bg: "rgba(116,198,157,0.1)" },
          { label: "Best Day",          value: "Tuesday", color: "#febc2e", bg: "rgba(254,188,46,0.1)"  },
          { label: "Effort Gap",        value: "+8 pts",  color: "#ff5f57", bg: "rgba(255,95,87,0.1)"   },
        ].map(m => (
          <div key={m.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px", background: m.bg, borderRadius: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "Inter, sans-serif" }}>{m.label}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: m.color, fontFamily: "Space Grotesk, sans-serif" }}>{m.value}</span>
          </div>
        ))}
        <div style={{ marginTop: 8, padding: "10px 12px", background: "rgba(116,198,157,0.06)", borderRadius: 8, border: "1px solid rgba(116,198,157,0.15)" }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "Inter, sans-serif", lineHeight: 1.5 }}>
            💡 <strong style={{ color: "#74c69d" }}>Insight:</strong> DSA Practice has the highest impact on your weekly score. Keep prioritising it.
          </p>
        </div>
      </div>
    ),
  },
];

export default function Hero() {
  const navigate    = useNavigate();
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [activeFeat,setActiveFeat]= useState(0);
  const [activeStep,setActiveStep]= useState(0);

  return (
    <div style={{ fontFamily: "Inter, sans-serif", overflowX: "hidden" }}>

      {/* ── HERO SECTION ── */}
      <section style={{
        position: "relative", minHeight: "100svh", overflow: "hidden",
        backgroundImage: `url('${BG_IMAGE}')`,
        backgroundSize: "cover", backgroundPosition: "center",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(240,250,243,0.55)", zIndex: 1 }} />

        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", flex: 1 }}>

          {/* Navbar */}
          <nav className="animate-fade-down" style={{ padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <Logo size={22} color="#111814" />
              <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 18, fontWeight: 700, color: "#111814", letterSpacing: "-0.02em" }}>Detrolt</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 28 }} className="desktop-nav">
              {["Features", "How it works"].map(l => (
                <a key={l} href={`#${l.toLowerCase().replace(" ","-")}`}
                  style={{ fontSize: 13, color: "#374840", textDecoration: "none", fontWeight: 500 }}
                  onMouseEnter={e => e.target.style.color = "#111814"}
                  onMouseLeave={e => e.target.style.color = "#374840"}>
                  {l}
                </a>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => navigate("/login")} className="btn-ghost" style={{ padding: "8px 18px", fontSize: 13 }}>Sign In</button>
              <button onClick={() => navigate("/login")} className="btn-primary" style={{ padding: "9px 20px", fontSize: 13 }}>Get Started</button>
            </div>
          </nav>

          {/* Hero copy */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "40px 20px 0" }}>
            <div className="animate-fade-up" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(45,106,79,0.1)", border: "1px solid rgba(45,106,79,0.25)", borderRadius: 99, padding: "5px 14px", marginBottom: 24 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2d6a4f", display: "inline-block", animation: "pulse-dot 2s ease-in-out infinite" }} />
              <span style={{ fontSize: 12, color: "#2d6a4f", fontWeight: 600 }}>Personal Data Science Project</span>
            </div>

            <h1 style={{ fontFamily: "Space Grotesk, sans-serif", color: "#111814", fontWeight: 600, lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: 700, margin: "0 auto 20px" }}>
              <span className="animate-fade-up" style={{ display: "block", fontSize: "clamp(40px,7vw,80px)" }}>Track what matters.</span>
              <span className="animate-fade-up" style={{ display: "block", fontSize: "clamp(40px,7vw,80px)", animationDelay: "100ms", color: "#2d6a4f", fontStyle: "italic" }}>Grow every day.</span>
            </h1>

            <p className="animate-fade-up" style={{ animationDelay: "220ms", fontSize: "clamp(14px,2vw,18px)", color: "#374840", maxWidth: 480, margin: "0 auto 28px", lineHeight: 1.6 }}>
              Log daily activities, earn points, and let ML uncover your patterns — your personal growth dashboard.
            </p>

            <div className="animate-fade-up" style={{ animationDelay: "340ms", display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
              <button onClick={() => navigate("/login")} className="btn-primary" style={{ fontSize: 15, padding: "13px 30px" }}>
                Start for free <ArrowRight size={16} />
              </button>
              <a href="#how-it-works" className="btn-ghost" style={{ fontSize: 15, padding: "13px 30px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 7 }}>
                <Play size={14} /> See how it works
              </a>
            </div>
            <p className="animate-fade-up" style={{ animationDelay: "420ms", fontSize: 12, color: "#6b7a72" }}>
              Built with React · FastAPI · MongoDB · scikit-learn
            </p>
          </div>

          <div style={{ minHeight: 48 }} />
        </div>

        {/* Grass */}
        <img src={GRASS_IMAGE} alt="" aria-hidden style={{ position: "absolute", bottom: 0, left: 0, width: "100%", zIndex: 10, pointerEvents: "none", userSelect: "none" }} />
      </section>

      {/* ── FEATURES SECTION ── */}
      <section id="features" style={{ background: "#fff", padding: "100px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#2d6a4f", textTransform: "uppercase", letterSpacing: "0.1em" }}>Features</span>
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 700, color: "#111814", marginTop: 10, letterSpacing: "-0.02em" }}>
              Everything you need to grow
            </h2>
            <p style={{ fontSize: 16, color: "#6b7a72", marginTop: 12, maxWidth: 480, margin: "12px auto 0" }}>
              From simple activity logging to ML-powered predictions — Detrolt covers the full picture.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>

            {/* Feature list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {FEATURES.map((f, i) => (
                <button key={i} onClick={() => setActiveFeat(i)}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 14,
                    padding: "18px 20px", borderRadius: 12, border: "none",
                    textAlign: "left", cursor: "pointer", width: "100%",
                    background: activeFeat === i ? "#f0faf3" : "transparent",
                    borderLeft: activeFeat === i ? "3px solid #2d6a4f" : "3px solid transparent",
                    transition: "all 0.2s",
                  }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: activeFeat === i ? "#d8f3dc" : "#f7f8f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" }}>
                    {f.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: activeFeat === i ? "#2d6a4f" : "#374840", marginBottom: 4 }}>{f.title}</div>
                    <div style={{ fontSize: 13, color: "#6b7a72", lineHeight: 1.5 }}>{f.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Feature detail panel */}
            <div style={{ position: "sticky", top: 32, background: "#f0faf3", borderRadius: 20, padding: 32, border: "1px solid #d8f3dc" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#2d6a4f", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                {FEATURES[activeFeat].icon}
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#111814", marginBottom: 12, letterSpacing: "-0.01em" }}>
                {FEATURES[activeFeat].title}
              </h3>
              <p style={{ fontSize: 14, color: "#374840", lineHeight: 1.7, marginBottom: 20 }}>
                {FEATURES[activeFeat].detail}
              </p>
              <button onClick={() => navigate("/login")} className="btn-primary">
                Try it free <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ background: "#f7f8f5", padding: "100px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#2d6a4f", textTransform: "uppercase", letterSpacing: "0.1em" }}>How it works</span>
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 700, color: "#111814", marginTop: 10, letterSpacing: "-0.02em" }}>
              Three steps to better habits
            </h2>
            <p style={{ fontSize: 16, color: "#6b7a72", marginTop: 12, maxWidth: 440, margin: "12px auto 0" }}>
              Get started in minutes. See insights within days. Build momentum that lasts.
            </p>
          </div>

          {/* Step tabs */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 40 }}>
            {STEPS.map((s, i) => (
              <button key={i} onClick={() => setActiveStep(i)}
                style={{
                  padding: "10px 24px", borderRadius: 99, border: "none", cursor: "pointer",
                  fontFamily: "inherit", fontSize: 13, fontWeight: 600,
                  background: activeStep === i ? "#2d6a4f" : "#fff",
                  color:      activeStep === i ? "#fff"    : "#9aada3",
                  boxShadow:  activeStep === i ? "0 4px 16px rgba(45,106,79,0.25)" : "none",
                  transition: "all 0.2s",
                }}>
                {s.num} {s.title.split(" ")[0]}
              </button>
            ))}
          </div>

          {/* Step content */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#2d6a4f", marginBottom: 12 }}>Step {STEPS[activeStep].num}</div>
              <h3 style={{ fontSize: 28, fontWeight: 700, color: "#111814", letterSpacing: "-0.02em", marginBottom: 16 }}>
                {STEPS[activeStep].title}
              </h3>
              <p style={{ fontSize: 15, color: "#6b7a72", lineHeight: 1.7, marginBottom: 28 }}>
                {STEPS[activeStep].desc}
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                {activeStep < STEPS.length - 1 ? (
                  <button onClick={() => setActiveStep(s => s + 1)} className="btn-primary">
                    Next step <ChevronRight size={15} />
                  </button>
                ) : (
                  <button onClick={() => navigate("/login")} className="btn-primary">
                    Get started <ArrowRight size={15} />
                  </button>
                )}
              </div>
            </div>
            <div>
              {STEPS[activeStep].img}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section style={{ background: "#2d6a4f", padding: "80px 32px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", marginBottom: 16 }}>
            Ready to start growing?
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", marginBottom: 32, lineHeight: 1.6 }}>
            Create your free account. Your data is saved permanently and private to you.
          </p>
          <button onClick={() => navigate("/login")}
            style={{ background: "#fff", color: "#2d6a4f", border: "none", borderRadius: 99, padding: "14px 36px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 8, transition: "transform 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
            Create free account <ArrowRight size={16} />
          </button>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 16 }}>
            🔒 No credit card. No ads. Your data stays yours.
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#111814", padding: "32px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
          <Logo size={16} color="rgba(116,198,157,0.7)" />
          <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 14, fontWeight: 700, color: "rgba(116,198,157,0.7)" }}>Detrolt</span>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
          Built by Ayush Pandey · VIT Chennai · 24BCE5299
        </p>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
        }
      `}</style>
    </div>
  );
}

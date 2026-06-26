import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Logo from "../components/Logo";
import { ArrowLeft } from "lucide-react";

export default function Login() {
  const [tab,     setTab]     = useState("signin");
  const [form,    setForm]    = useState({ name: "", email: "", password: "", confirm: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register }   = useAuth();
  const navigate              = useNavigate();

  const setF = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handle = async () => {
    setError("");
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    if (tab === "signup" && !form.name) { setError("Please enter your name."); return; }
    if (tab === "signup" && form.password !== form.confirm) { setError("Passwords don't match."); return; }
    if (tab === "signup" && form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      if (tab === "signin") await login(form.email, form.password);
      else                  await register(form.name, form.email, form.password);
      navigate("/app");
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inp = (type, placeholder, key) => (
    <input type={type} placeholder={placeholder} value={form[key]} onChange={setF(key)}
      onKeyDown={e => e.key === "Enter" && handle()}
      style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #c8d4cc",
        fontSize: 14, outline: "none", fontFamily: "inherit", color: "#111814",
        background: "#fff", transition: "border 0.15s", marginBottom: 10, display: "block" }}
      onFocus={e => e.target.style.borderColor = "#2d6a4f"}
      onBlur={e  => e.target.style.borderColor = "#c8d4cc"} />
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0faf3 0%, #f7f8f5 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Inter, sans-serif", padding: 20 }}>

      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Back to home */}
        <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#6b7a72", fontSize: 13, marginBottom: 24, fontFamily: "inherit" }}>
          <ArrowLeft size={14} /> Back to home
        </button>

        <div style={{ background: "#fff", borderRadius: 20, padding: "36px 32px",
          boxShadow: "0 8px 48px rgba(0,0,0,0.10)", border: "1px solid #eef2ef" }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 9, justifyContent: "center", marginBottom: 6 }}>
            <Logo size={26} color="#2d6a4f" />
            <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 22, fontWeight: 700, color: "#2d6a4f", letterSpacing: "-0.02em" }}>Detrolt</span>
          </div>
          <p style={{ textAlign: "center", fontSize: 13, color: "#9aada3", marginBottom: 24 }}>
            {tab === "signin" ? "Welcome back! Sign in to continue." : "Create your account to get started."}
          </p>

          {/* Tabs */}
          <div style={{ display: "flex", background: "#f7f8f5", borderRadius: 12, padding: 4, marginBottom: 22, gap: 4 }}>
            {[["signin","Sign In"],["signup","Sign Up"]].map(([t,l]) => (
              <button key={t} onClick={() => { setTab(t); setError(""); }}
                style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "none", cursor: "pointer",
                  fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                  background: tab===t ? "#fff" : "transparent",
                  color:      tab===t ? "#2d6a4f" : "#9aada3",
                  boxShadow:  tab===t ? "0 1px 6px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.15s" }}>
                {l}
              </button>
            ))}
          </div>

          {tab === "signup" && inp("text",     "Your name",        "name")}
          {inp("email",    "Email address",    "email")}
          {inp("password", "Password",         "password")}
          {tab === "signup" && inp("password", "Confirm password", "confirm")}

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 9,
              padding: "10px 14px", fontSize: 13, color: "#dc2626", marginBottom: 14 }}>
              {error}
            </div>
          )}

          <button onClick={handle} disabled={loading}
            style={{ width: "100%", padding: "13px 0", borderRadius: 99,
              background: loading ? "#74c69d" : "#2d6a4f",
              color: "#fff", border: "none", fontSize: 14, fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit", marginBottom: 16, transition: "background 0.15s" }}>
            {loading ? "Please wait..." : tab === "signin" ? "Sign In" : "Create Account"}
          </button>

          <p style={{ textAlign: "center", fontSize: 13, color: "#9aada3" }}>
            {tab === "signin" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setTab(tab==="signin"?"signup":"signin"); setError(""); }}
              style={{ background: "none", border: "none", color: "#2d6a4f", fontWeight: 600,
                cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
              {tab === "signin" ? "Sign Up" : "Sign In"}
            </button>
          </p>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #f0f0f0", textAlign: "center" }}>
            <p style={{ fontSize: 11, color: "#c8d4cc", lineHeight: 1.6 }}>
              🔒 Your data is saved permanently and private to your account.<br />
              No one else can see your activities or logs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

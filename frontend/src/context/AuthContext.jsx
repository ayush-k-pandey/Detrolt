import { createContext, useState, useEffect } from "react";

const API = "http://localhost:8000";
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null);
  const [token,     setToken]     = useState(() => localStorage.getItem("dt_token"));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) { setIsLoading(false); return; }
    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r  => r.ok ? r.json() : Promise.reject())
      .then(u  => setUser(u))
      .catch(() => { localStorage.removeItem("dt_token"); setToken(null); })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email, password) => {
    const r = await fetch(`${API}/auth/login`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!r.ok) { const e = await r.json(); throw new Error(e.detail || "Login failed"); }
    const data = await r.json();
    localStorage.setItem("dt_token", data.access_token);
    setToken(data.access_token);
    setUser({ name: data.user_name, id: data.user_id });
  };

  const register = async (name, email, password) => {
    const r = await fetch(`${API}/auth/register`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!r.ok) { const e = await r.json(); throw new Error(e.detail || "Registration failed"); }
    const data = await r.json();
    localStorage.setItem("dt_token", data.access_token);
    setToken(data.access_token);
    setUser({ name: data.user_name, id: data.user_id });
  };

  const logout = () => {
    localStorage.removeItem("dt_token");
    setToken(null); setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth }      from "./hooks/useAuth";
import Hero             from "./components/Hero";
import Login            from "./pages/Login";
import AppLayout        from "./AppLayout";

function Spinner() {
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:14, fontFamily:"Inter, sans-serif" }}>
      <div style={{ width:32, height:32, borderRadius:"50%", border:"3px solid #d8f3dc", borderTopColor:"#2d6a4f", animation:"spin 0.8s linear infinite" }} />
      <p style={{ color:"#9aada3", fontSize:13 }}>Loading Detrolt...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  return user ? <Navigate to="/app" replace /> : children;
}

function AppRoutes() {
  const { logout } = useAuth();
  return (
    <Routes>
      <Route path="/"      element={<PublicRoute><Hero /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/app/*" element={
        <PrivateRoute>
          <AppLayout onLogout={() => { logout(); window.location.href = "/"; }} />
        </PrivateRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

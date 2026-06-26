import { Routes, Route } from "react-router-dom";
import Sidebar    from "./components/Sidebar";
import Dashboard  from "./pages/Dashboard";
import Activities from "./pages/Activities";
import DailyLog   from "./pages/DailyLog";
import Insights   from "./pages/Insights";

export default function AppLayout({ onLogout }) {
  return (
    <div className="app-shell">
      <Sidebar onLogout={onLogout} />
      <main className="main-content">
        <Routes>
          <Route index             element={<Dashboard />}  />
          <Route path="activities" element={<Activities />} />
          <Route path="log"        element={<DailyLog />}   />
          <Route path="insights"   element={<Insights />}   />
        </Routes>
      </main>
    </div>
  );
}

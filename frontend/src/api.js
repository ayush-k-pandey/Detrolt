// BASE is empty string = calls go to same domain the app is hosted on.
// On Render: detrolt.onrender.com/auth/login
// Locally: vite proxy forwards to localhost:8000
const BASE = "";

function getToken() {
  return localStorage.getItem("dt_token");
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const res   = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem("dt_token");
    window.location.href = "/login";
    return;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }

  return res.json();
}

export const getUserProfile   = ()     => apiFetch("/user/profile");
export const updateUserGoal   = (goal) => apiFetch("/user/goal", { method: "PUT", body: JSON.stringify({ daily_goal: goal }) });
export const getActivities    = ()     => apiFetch("/activities");
export const createActivity   = (data) => apiFetch("/activities", { method: "POST", body: JSON.stringify(data) });
export const deleteActivity   = (id)   => apiFetch(`/activities/${id}`, { method: "DELETE" });
export const saveLog          = (data) => apiFetch("/log", {
  method: "POST",
  body: JSON.stringify({
    ...data,
    date: data.date instanceof Date ? data.date.toISOString().split("T")[0] : data.date,
  }),
});
export const getLog           = (d)    => apiFetch(`/log/${d}`);
export const getLogHistory    = ()     => apiFetch("/log/history/14days");
export const getStatsSummary  = ()     => apiFetch("/stats/summary");
export const getStatsChart    = ()     => apiFetch("/stats/chart");
export const getStatsWeekly   = ()     => apiFetch("/stats/weekly");
export const getMLPredictions = ()     => apiFetch("/ml/predictions");
export const getMLInsights    = ()     => apiFetch("/ml/insights");
export const getMLForecast    = ()     => apiFetch("/ml/forecast");
export const getMLImpact      = ()     => apiFetch("/ml/activity-impact");

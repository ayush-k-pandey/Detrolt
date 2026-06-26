export function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", gap: 14 }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #d8f3dc", borderTopColor: "#2d6a4f", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "#9aada3", fontSize: 13 }}>{message}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function ErrorView({ message, onRetry }) {
  return (
    <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 12, padding: "24px", textAlign: "center", margin: "24px 0" }}>
      <p style={{ color: "#dc2626", fontWeight: 600, marginBottom: 8 }}>Could not load data</p>
      <p style={{ color: "#9aada3", fontSize: 13, marginBottom: 16 }}>{message}</p>
      {onRetry && <button onClick={onRetry} className="btn-primary">Retry</button>}
    </div>
  );
}

export function EmptyState({ icon = "📭", title, message }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#374840", marginBottom: 8 }}>{title}</h3>
      <p style={{ color: "#9aada3", fontSize: 13 }}>{message}</p>
    </div>
  );
}

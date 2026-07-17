export function Stat({ label, value, unit }) {
  return (
    <div className="card" style={{ padding: "8px 10px" }}>
      <div className="kicker" style={{ marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>
        {value}
        <span className="kicker" style={{ marginLeft: 6 }}>{unit}</span>
      </div>
    </div>
  );
}

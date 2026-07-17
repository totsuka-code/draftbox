export function Stat({ label, value, unit }) {
  return (
    <div className="statCard">
      <div className="statLabel">{label}</div>
      <div className="statValue">
        {value}
        <span>{unit}</span>
      </div>
    </div>
  );
}

const COLORS = {
  RECEIVED:   { bg: "#FFF3CD", text: "#856404", dot: "#FFC107" },
  PROCESSING: { bg: "#CCE5FF", text: "#004085", dot: "#0D6EFD" },
  READY:      { bg: "#D4EDDA", text: "#155724", dot: "#28A745" },
  DELIVERED:  { bg: "#E2E3E5", text: "#383D41", dot: "#6C757D" },
};

export default function StatusBadge({ status }) {
  const c = COLORS[status] || COLORS.RECEIVED;
  return (
    <span style={{
      background: c.bg, color: c.text,
      padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
      display: "inline-flex", alignItems: "center", gap: 5,
      letterSpacing: 0.5, fontFamily: "monospace",
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%",
        background: c.dot, display: "inline-block",
      }} />
      {status}
    </span>
  );
}

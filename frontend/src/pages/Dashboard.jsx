import { useDashboard } from "../hooks/useOrders";
import StatusBadge from "../components/StatusBadge";

const STATUSES = ["RECEIVED", "PROCESSING", "READY", "DELIVERED"];

const PRICES = {
  shirt: 80, pants: 100, saree: 200,
  jacket: 250, kurta: 120, bedsheet: 150, blanket: 300,
};

export default function Dashboard() {
  const { stats, loading } = useDashboard();

  if (loading) return <p style={{ padding: 32 }}>Loading...</p>;
  if (!stats) return null;

  return (
    <div>
      <h2 style={s.h2}>Overview</h2>

      <div style={s.statGrid}>
        <StatCard label="Total Orders" value={stats.totalOrders} accent="#0D6EFD" />
        <StatCard label="Revenue (Delivered)" value={`₹${stats.totalRevenue.toLocaleString()}`} accent="#28A745" />
      </div>

      <h3 style={s.h3}>Orders by Status</h3>
      <div style={s.statGrid}>
        {STATUSES.map((status) => (
          <div key={status} style={{ ...s.card, borderLeft: "4px solid #ccc" }}>
            <div style={s.statNum}>{stats.ordersByStatus[status] ?? 0}</div>
            <StatusBadge status={status} />
          </div>
        ))}
      </div>

      <h3 style={s.h3}>Price Reference</h3>
      <div style={s.card}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {Object.entries(PRICES).map(([item, price]) => (
            <span key={item} style={s.priceTag}>
              <strong style={{ textTransform: "capitalize" }}>{item}</strong> — ₹{price}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div style={{ ...s.card, borderLeft: `4px solid ${accent}` }}>
      <div style={s.statNum}>{value}</div>
      <div style={s.statLabel}>{label}</div>
    </div>
  );
}

const s = {
  h2: { fontSize: 20, fontWeight: 700, marginBottom: 16 },
  h3: { fontSize: 15, fontWeight: 700, margin: "24px 0 12px", color: "#555" },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 8 },
  card: { background: "#fff", borderRadius: 8, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" },
  statNum: { fontSize: 28, fontWeight: 700, marginBottom: 6 },
  statLabel: { fontSize: 12, color: "#777", textTransform: "uppercase", letterSpacing: 1 },
  priceTag: { background: "#F5F0E8", padding: "6px 14px", borderRadius: 20, fontSize: 13 },
};

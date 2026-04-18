import { useState } from "react";
import { useOrders } from "../hooks/useOrders";
import { api } from "../utils/api";
import StatusBadge from "../components/StatusBadge";

const STATUSES = ["RECEIVED", "PROCESSING", "READY", "DELIVERED"];

export default function OrdersList() {
  const [filters, setFilters] = useState({ status: "", search: "", garmentType: "" });
  const { orders, loading, error, refresh } = useOrders(filters);

  async function handleStatusChange(id, newStatus) {
    try {
      await api.updateStatus(id, newStatus);
      refresh();
    } catch (e) {
      alert("Failed to update: " + e.message);
    }
  }

  return (
    <div>
      <h2 style={s.h2}>Orders</h2>

      <div style={s.filterRow}>
        <input
          style={s.input}
          placeholder="Search name, phone, order ID..."
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        />
        <select
          style={s.select}
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input
          style={{ ...s.input, maxWidth: 160 }}
          placeholder="Garment type..."
          value={filters.garmentType}
          onChange={(e) => setFilters((f) => ({ ...f, garmentType: e.target.value }))}
        />
        <span style={{ fontSize: 13, color: "#777", alignSelf: "center" }}>
          {orders.length} result(s)
        </span>
      </div>

      {loading && <p style={{ color: "#777" }}>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && orders.length === 0 && (
        <div style={s.empty}>No orders found.</div>
      )}

      {orders.map((order) => (
        <div key={order.id} style={s.card}>
          <div style={s.cardTop}>
            <div>
              <div style={s.name}>{order.customerName}</div>
              <div style={s.meta}>{order.phone} · <code>{order.id}</code></div>
            </div>
            <div style={{ textAlign: "right" }}>
              <StatusBadge status={order.status} />
              <div style={s.total}>₹{order.totalAmount}</div>
            </div>
          </div>

          <div style={s.garmentRow}>
            {order.garments.map((g, i) => (
              <span key={i} style={s.garmentTag}>
                {g.quantity}× <strong style={{ textTransform: "capitalize" }}>{g.type}</strong>
                <span style={{ color: "#888", marginLeft: 4 }}>₹{g.subtotal}</span>
              </span>
            ))}
          </div>

          <div style={s.cardBottom}>
            <span style={s.dateInfo}>
              📅 Created: {new Date(order.createdAt).toLocaleDateString("en-IN")}
              &nbsp;·&nbsp;
              📦 Est. Delivery: {order.estimatedDelivery}
            </span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#777" }}>Move to:</span>
              <select
                style={s.select}
                value={order.status}
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
              >
                {STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const s = {
  h2: { fontSize: 20, fontWeight: 700, marginBottom: 16 },
  filterRow: { display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" },
  input: {
    flex: 1, minWidth: 180, padding: "9px 12px",
    border: "1px solid #DDD", borderRadius: 6, fontSize: 13,
    fontFamily: "inherit", background: "#FAFAFA", outline: "none",
  },
  select: {
    padding: "8px 10px", border: "1px solid #DDD", borderRadius: 6,
    fontSize: 13, fontFamily: "inherit", background: "#FAFAFA", cursor: "pointer",
  },
  empty: {
    background: "#fff", padding: 40, borderRadius: 8,
    textAlign: "center", color: "#999",
  },
  card: {
    background: "#fff", borderRadius: 8, padding: "16px 20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.07)", marginBottom: 12,
  },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  name: { fontWeight: 700, fontSize: 15 },
  meta: { fontSize: 12, color: "#888", marginTop: 3 },
  total: { fontSize: 20, fontWeight: 700, marginTop: 4 },
  garmentRow: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 },
  garmentTag: {
    background: "#F5F0E8", padding: "4px 12px",
    borderRadius: 20, fontSize: 12,
  },
  cardBottom: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", borderTop: "1px solid #F0F0F0", paddingTop: 12,
  },
  dateInfo: { fontSize: 12, color: "#888" },
};

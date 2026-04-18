import { useState } from "react";
import { api } from "../utils/api";

const GARMENT_TYPES = ["shirt", "pants", "saree", "jacket", "kurta", "bedsheet", "blanket"];
const PRICES = { shirt: 80, pants: 100, saree: 200, jacket: 250, kurta: 120, bedsheet: 150, blanket: 300 };

const emptyGarment = () => ({ type: "shirt", quantity: 1 });

export default function CreateOrder({ onCreated }) {
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    garments: [emptyGarment()],
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);
  const [created, setCreated] = useState(null);

  const total = form.garments.reduce(
    (sum, g) => sum + (PRICES[g.type] || 0) * (parseInt(g.quantity) || 0), 0
  );

  function setGarment(i, field, val) {
    setForm((f) => {
      const gs = [...f.garments];
      gs[i] = { ...gs[i], [field]: field === "quantity" ? Math.max(1, parseInt(val) || 1) : val };
      return { ...f, garments: gs };
    });
  }

  function addGarment() {
    setForm((f) => ({ ...f, garments: [...f.garments, emptyGarment()] }));
  }

  function removeGarment(i) {
    setForm((f) => ({ ...f, garments: f.garments.filter((_, idx) => idx !== i) }));
  }

  async function handleSubmit() {
    setErrors([]);
    setSubmitting(true);
    try {
      const res = await api.createOrder(form);
      setCreated(res.data);
      if (onCreated) onCreated(res.data);
    } catch (e) {
      setErrors(e.message.split(", "));
    } finally {
      setSubmitting(false);
    }
  }

  if (created) {
    return (
      <div style={{ ...s.card, textAlign: "center", padding: 48 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Order Created</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: "#0D6EFD", fontFamily: "monospace", marginBottom: 8 }}>
          {created.id}
        </div>
        <div style={{ color: "#555", marginBottom: 4 }}>{created.customerName} · {created.phone}</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>₹{created.totalAmount}</div>
        <div style={{ color: "#777", fontSize: 13, marginBottom: 28 }}>
          Est. Delivery: {created.estimatedDelivery}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          <button style={s.btnSecondary} onClick={() => { setCreated(null); setForm({ customerName: "", phone: "", garments: [emptyGarment()] }); }}>
            + New Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={s.h2}>New Order</h2>

      {errors.length > 0 && (
        <div style={s.errorBox}>
          {errors.map((e, i) => <div key={i}>⚠ {e}</div>)}
        </div>
      )}

      <div style={s.card}>
        <div style={s.row}>
          <div style={s.field}>
            <label style={s.label}>Customer Name</label>
            <input
              style={s.input}
              value={form.customerName}
              onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
              placeholder="e.g. Anjali Verma"
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Phone Number</label>
            <input
              style={s.input}
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="10-digit mobile"
              maxLength={10}
            />
          </div>
        </div>

        <label style={{ ...s.label, marginTop: 24, display: "block" }}>Garments</label>
        {form.garments.map((g, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center" }}>
            <select
              style={{ ...s.input, flex: 2 }}
              value={g.type}
              onChange={(e) => setGarment(i, "type", e.target.value)}
            >
              {GARMENT_TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)} — ₹{PRICES[t]}</option>
              ))}
            </select>
            <input
              type="number" min={1} style={{ ...s.input, width: 72 }}
              value={g.quantity}
              onChange={(e) => setGarment(i, "quantity", e.target.value)}
            />
            <span style={{ minWidth: 64, fontSize: 13, color: "#777" }}>
              = ₹{PRICES[g.type] * (parseInt(g.quantity) || 0)}
            </span>
            {form.garments.length > 1 && (
              <button style={s.removeBtn} onClick={() => removeGarment(i)}>✕</button>
            )}
          </div>
        ))}

        <button style={s.btnSecondary} onClick={addGarment}>+ Add Garment</button>

        <div style={s.footer}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>Total: ₹{total}</div>
          <button
            style={{ ...s.btnPrimary, opacity: submitting ? 0.6 : 1 }}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create Order →"}
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  h2: { fontSize: 20, fontWeight: 700, marginBottom: 16 },
  card: { background: "#fff", borderRadius: 8, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.07)" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
  field: { display: "flex", flexDirection: "column" },
  label: { fontSize: 11, fontWeight: 700, color: "#555", marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" },
  input: {
    padding: "9px 12px", border: "1px solid #DDD", borderRadius: 6,
    fontSize: 13, fontFamily: "inherit", background: "#FAFAFA", outline: "none",
  },
  footer: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    borderTop: "1px solid #EEE", paddingTop: 20, marginTop: 24,
  },
  btnPrimary: {
    background: "#1A1A1A", color: "#fff", border: "none",
    padding: "10px 24px", borderRadius: 6, fontSize: 14,
    fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
  },
  btnSecondary: {
    background: "#F5F0E8", color: "#1A1A1A", border: "none",
    padding: "8px 18px", borderRadius: 5, fontSize: 13,
    fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginTop: 4,
  },
  removeBtn: {
    background: "#fff", color: "#DC3545", border: "1px solid #DC3545",
    padding: "6px 12px", borderRadius: 5, cursor: "pointer", fontFamily: "inherit",
  },
  errorBox: {
    background: "#FFF0F0", border: "1px solid #FFC0C0", borderRadius: 6,
    padding: "12px 16px", marginBottom: 16, color: "#C00", fontSize: 13,
  },
};

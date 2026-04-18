import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import OrdersList from "./pages/OrdersList";
import CreateOrder from "./pages/CreateOrder";

const NAV = [
  { id: "dashboard", label: "Dashboard" },
  { id: "orders",    label: "Orders" },
  { id: "create",    label: "+ New Order" },
];

export default function App() {
  const [tab, setTab] = useState("dashboard");

  return (
    <div style={s.root}>
      <header style={s.header}>
        <div>
          <div style={s.logo}>✦ LAUNDRY CO.</div>
          <div style={s.logoSub}>ORDER MANAGEMENT</div>
        </div>
        <nav style={s.nav}>
          {NAV.map(({ id, label }) => (
            <button
              key={id}
              style={tab === id ? s.navActive : s.navBtn}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main style={s.main}>
        {tab === "dashboard" && <Dashboard />}
        {tab === "orders"    && <OrdersList />}
        {tab === "create"    && <CreateOrder onCreated={() => setTab("orders")} />}
      </main>
    </div>
  );
}

const s = {
  root: { fontFamily: "'Georgia', serif", background: "#F5F0E8", minHeight: "100vh" },
  header: {
    background: "#1A1A1A", color: "#F5F0E8",
    padding: "16px 32px", display: "flex",
    alignItems: "center", justifyContent: "space-between",
  },
  logo: { fontWeight: 700, fontSize: 20, letterSpacing: 2 },
  logoSub: { fontSize: 10, opacity: 0.45, letterSpacing: 4, marginTop: 2 },
  nav: { display: "flex", gap: 6 },
  navBtn: {
    background: "transparent", color: "rgba(245,240,232,0.7)",
    border: "1px solid rgba(245,240,232,0.2)", padding: "7px 16px",
    borderRadius: 4, cursor: "pointer", fontSize: 13, fontFamily: "inherit",
  },
  navActive: {
    background: "#F5F0E8", color: "#1A1A1A",
    border: "1px solid #F5F0E8", padding: "7px 16px",
    borderRadius: 4, cursor: "pointer", fontSize: 13,
    fontFamily: "inherit", fontWeight: 700,
  },
  main: { maxWidth: 960, margin: "0 auto", padding: "32px 20px" },
};

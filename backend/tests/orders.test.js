const request = require("supertest");
const app = require("../src/app");
const store = require("../src/models/orderStore");

beforeEach(() => store._clear());

// ─── CREATE ORDER ────────────────────────────────────────────────
describe("POST /api/orders", () => {
  const validPayload = {
    customerName: "Priya Sharma",
    phone: "9876543210",
    garments: [
      { type: "shirt", quantity: 2 },
      { type: "saree", quantity: 1 },
    ],
  };

  it("creates an order and returns 201 with correct totals", async () => {
    const res = await request(app).post("/api/orders").send(validPayload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const { data } = res.body;
    expect(data.id).toMatch(/^LC-/);
    expect(data.status).toBe("RECEIVED");
    expect(data.totalAmount).toBe(360); // shirt*2=160 + saree*1=200
    expect(data.garments).toHaveLength(2);
    expect(data.estimatedDelivery).toBeDefined();
  });

  it("rejects missing customerName", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ ...validPayload, customerName: "" });
    expect(res.status).toBe(400);
    expect(res.body.errors.some((e) => e.includes("customerName"))).toBe(true);
  });

  it("rejects invalid phone (letters)", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ ...validPayload, phone: "abc123" });
    expect(res.status).toBe(400);
    expect(res.body.errors.some((e) => e.includes("phone"))).toBe(true);
  });

  it("rejects unknown garment type", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ ...validPayload, garments: [{ type: "tuxedo", quantity: 1 }] });
    expect(res.status).toBe(400);
    expect(res.body.errors.some((e) => e.includes("tuxedo"))).toBe(true);
  });

  it("rejects zero quantity", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ ...validPayload, garments: [{ type: "shirt", quantity: 0 }] });
    expect(res.status).toBe(400);
  });
});

// ─── LIST ORDERS ─────────────────────────────────────────────────
describe("GET /api/orders", () => {
  beforeEach(async () => {
    await request(app).post("/api/orders").send({
      customerName: "Rahul Mehta",
      phone: "9111111111",
      garments: [{ type: "pants", quantity: 1 }],
    });
    await request(app).post("/api/orders").send({
      customerName: "Anjali Singh",
      phone: "9222222222",
      garments: [{ type: "jacket", quantity: 2 }],
    });
  });

  it("returns all orders", async () => {
    const res = await request(app).get("/api/orders");
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
  });

  it("filters by status", async () => {
    const res = await request(app).get("/api/orders?status=RECEIVED");
    expect(res.status).toBe(200);
    expect(res.body.data.every((o) => o.status === "RECEIVED")).toBe(true);
  });

  it("filters by customer name search", async () => {
    const res = await request(app).get("/api/orders?search=rahul");
    expect(res.body.count).toBe(1);
    expect(res.body.data[0].customerName).toBe("Rahul Mehta");
  });

  it("filters by garmentType", async () => {
    const res = await request(app).get("/api/orders?garmentType=jacket");
    expect(res.body.count).toBe(1);
  });

  it("rejects invalid status filter", async () => {
    const res = await request(app).get("/api/orders?status=UNKNOWN");
    expect(res.status).toBe(400);
  });
});

// ─── UPDATE STATUS ────────────────────────────────────────────────
describe("PATCH /api/orders/:id/status", () => {
  let orderId;

  beforeEach(async () => {
    const res = await request(app).post("/api/orders").send({
      customerName: "Test User",
      phone: "9000000000",
      garments: [{ type: "shirt", quantity: 1 }],
    });
    orderId = res.body.data.id;
  });

  it("updates status to PROCESSING", async () => {
    const res = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .send({ status: "PROCESSING" });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("PROCESSING");
  });

  it("returns 404 for unknown order", async () => {
    const res = await request(app)
      .patch("/api/orders/LC-NOPE/status")
      .send({ status: "READY" });
    expect(res.status).toBe(404);
  });

  it("rejects invalid status", async () => {
    const res = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .send({ status: "SHIPPED" });
    expect(res.status).toBe(400);
  });
});

// ─── DASHBOARD ───────────────────────────────────────────────────
describe("GET /api/dashboard", () => {
  it("returns correct counts after creating orders", async () => {
    await request(app).post("/api/orders").send({
      customerName: "A",
      phone: "9000000001",
      garments: [{ type: "shirt", quantity: 1 }],
    });

    const orderRes = await request(app).post("/api/orders").send({
      customerName: "B",
      phone: "9000000002",
      garments: [{ type: "blanket", quantity: 1 }],
    });

    // Deliver the second order
    await request(app)
      .patch(`/api/orders/${orderRes.body.data.id}/status`)
      .send({ status: "DELIVERED" });

    const dash = await request(app).get("/api/dashboard");
    expect(dash.body.data.totalOrders).toBe(2);
    expect(dash.body.data.totalRevenue).toBe(300); // only blanket (delivered)
    expect(dash.body.data.ordersByStatus.RECEIVED).toBe(1);
    expect(dash.body.data.ordersByStatus.DELIVERED).toBe(1);
  });
});

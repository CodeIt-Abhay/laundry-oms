const { v4: uuidv4 } = require("uuid");
const store = require("../models/orderStore");
const { getPrice, isValidStatus, ITEM_PRICES, VALID_STATUSES } = require("../utils/config");

// POST /api/orders
function createOrder(req, res) {
  const { customerName, phone, garments } = req.body;

  // --- validation ---
  const errors = [];

  if (!customerName || customerName.trim().length < 2)
    errors.push("customerName must be at least 2 characters");

  if (!phone || !/^\d{10}$/.test(phone.trim()))
    errors.push("phone must be a 10-digit number");

  if (!Array.isArray(garments) || garments.length === 0)
    errors.push("garments must be a non-empty array");

  if (garments) {
    garments.forEach((g, i) => {
      if (!g.type) errors.push(`garments[${i}].type is required`);
      else if (getPrice(g.type) === null)
        errors.push(`garments[${i}].type "${g.type}" is not a valid item. Valid: ${Object.keys(ITEM_PRICES).join(", ")}`);

      const qty = parseInt(g.quantity, 10);
      if (!qty || qty < 1)
        errors.push(`garments[${i}].quantity must be a positive integer`);
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  // --- compute bill ---
  const lineItems = garments.map((g) => {
    const unitPrice = getPrice(g.type);
    const qty = parseInt(g.quantity, 10);
    return {
      type: g.type.toLowerCase(),
      quantity: qty,
      unitPrice,
      subtotal: unitPrice * qty,
    };
  });

  const totalAmount = lineItems.reduce((sum, item) => sum + item.subtotal, 0);

  // estimated delivery: 3 business days from now (simple version, not calendar-aware)
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

  const order = {
    id: "LC-" + uuidv4().slice(0, 8).toUpperCase(),
    customerName: customerName.trim(),
    phone: phone.trim(),
    garments: lineItems,
    totalAmount,
    status: "RECEIVED",
    estimatedDelivery: estimatedDelivery.toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.insert(order);
  return res.status(201).json({ success: true, data: order });
}

// GET /api/orders
function listOrders(req, res) {
  const { status, search, garmentType } = req.query;

  let results = store.getAll();

  if (status) {
    const s = status.toUpperCase();
    if (!isValidStatus(s)) {
      return res.status(400).json({
        success: false,
        errors: [`Invalid status. Valid values: ${VALID_STATUSES.join(", ")}`],
      });
    }
    results = results.filter((o) => o.status === s);
  }

  if (search) {
    const q = search.toLowerCase().trim();
    results = results.filter(
      (o) =>
        o.customerName.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        o.id.toLowerCase().includes(q)
    );
  }

  if (garmentType) {
    const g = garmentType.toLowerCase().trim();
    results = results.filter((o) =>
      o.garments.some((item) => item.type === g)
    );
  }

  return res.json({ success: true, count: results.length, data: results });
}

// GET /api/orders/:id
function getOrder(req, res) {
  const order = store.getById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, errors: ["Order not found"] });
  }
  return res.json({ success: true, data: order });
}

// PATCH /api/orders/:id/status
function updateStatus(req, res) {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, errors: ["status is required"] });
  }

  const s = status.toUpperCase();
  if (!isValidStatus(s)) {
    return res.status(400).json({
      success: false,
      errors: [`Invalid status. Valid values: ${VALID_STATUSES.join(", ")}`],
    });
  }

  const order = store.getById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, errors: ["Order not found"] });
  }

  const updated = store.update(req.params.id, {
    status: s,
    updatedAt: new Date().toISOString(),
  });

  return res.json({ success: true, data: updated });
}

// GET /api/dashboard
function getDashboard(req, res) {
  const all = store.getAll();

  const totalOrders = all.length;
  const totalRevenue = all
    .filter((o) => o.status === "DELIVERED")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const ordersByStatus = VALID_STATUSES.reduce((acc, s) => {
    acc[s] = all.filter((o) => o.status === s).length;
    return acc;
  }, {});

  return res.json({
    success: true,
    data: {
      totalOrders,
      totalRevenue,
      ordersByStatus,
    },
  });
}

module.exports = { createOrder, listOrders, getOrder, updateStatus, getDashboard };

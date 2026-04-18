const express = require("express");
const router = express.Router();
const {
  createOrder,
  listOrders,
  getOrder,
  updateStatus,
  getDashboard,
} = require("../controllers/orderController");

router.get("/dashboard", getDashboard);

router.route("/orders")
  .get(listOrders)
  .post(createOrder);

router.get("/orders/:id", getOrder);
router.patch("/orders/:id/status", updateStatus);

module.exports = router;

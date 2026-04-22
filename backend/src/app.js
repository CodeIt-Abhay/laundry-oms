const express = require("express");
const cors = require("cors");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("Laundry OMS Backend Running 🚀");
});

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// API routes
app.use("/api", orderRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, errors: ["Route not found"] });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, errors: ["Internal server error"] });
});

module.exports = app;
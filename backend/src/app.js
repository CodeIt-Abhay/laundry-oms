const express = require("express");
const cors = require("cors");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Health check — useful when deploying, CI can ping this
app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api", orderRoutes);

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ success: false, errors: ["Route not found"] });
});

// Central error handler — keeps controllers clean
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, errors: ["Internal server error"] });
});

module.exports = app;

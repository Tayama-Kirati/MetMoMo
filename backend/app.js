// Express app (no network listener) — server.js starts it, tests import it directly.
const express = require("express");
const cors    = require("cors");
const helmet  = require("helmet");
const path    = require("path");
require("dotenv").config({ quiet: true });

const { apiLimiter } = require("./middleware/rateLimits");
const errorHandler   = require("./middleware/errorHandler");

const app = express();

const corsOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",").map(s => s.trim()).filter(Boolean);

if (process.env.TRUST_PROXY) app.set("trust proxy", Number(process.env.TRUST_PROXY) || 1);

// Images are loaded by the frontend from another origin, so allow cross-origin reads
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api", apiLimiter);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Metmomo API is live!", status: "ok" });
});
app.get("/api/health", (req, res) => res.status(200).json({ status: "ok" }));

app.use("/api/auth",        require("./router/auth/authRouter"));
app.use("/api/products",    require("./router/admin/productRouter"));
app.use("/api/admin",       require("./router/admin/adminUsersRouter"));
app.use("/api/reviews",     require("./router/user/userReviewRouter"));
app.use("/api/profile",     require("./router/user/profileRoute"));
app.use("/api/cart",        require("./router/user/cartRoute"));
app.use("/api/orders",      require("./router/user/orderRoute"));
app.use("/api/coupons",     require("./router/user/couponRoute"));
app.use("/api/payment",     require("./router/user/paymentRoute"));
app.use("/api/restaurants", require("./router/admin/restaurantRouter"));
app.use("/api/owner",       require("./router/owner/ownerRouter"));
app.use("/api/delivery",    require("./router/delivery/deliveryRouter"));
app.use("/api/driver",      require("./router/driver/driverRouter"));
app.use("/api/ai",          require("./router/ai/aiRouter"));

app.use("/api", (req, res) => res.status(404).json({ message: "Route not found" }));
app.use(errorHandler);

module.exports = app;
module.exports.corsOrigins = corsOrigins;

const express = require("express");
const http    = require("http");
const cors    = require("cors");
const path    = require("path");
require("dotenv").config();

const { connectDatabase } = require("./database/database");
const app    = express();
const server = http.createServer(app);

// ── Socket.io ──────────────────────────────────────────────
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

 
global._io = io;

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    if (userId) socket.join(userId)
  })
  socket.on("disconnect", () => {})
});
 

app.use(cors({ origin: ["*"], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const authRouter       = require("./router/auth/authRouter");
const productRouter    = require("./router/admin/productRouter");
const adminUsersRouter = require("./router/admin/adminUsersRouter");
const userReviewRouter = require("./router/user/userReviewRouter");
const profileRoute     = require("./router/user/profileRoute");
const cartRoute        = require("./router/user/cartRoute");
const orderRoute       = require("./router/user/orderRoute");
const paymentRoute     = require("./router/user/paymentRoute");
const restaurantRouter = require("./router/admin/restaurantRouter");
const ownerRouter      = require("./router/owner/ownerRouter");
const deliveryRouter   = require("./router/delivery/deliveryRouter");
const driverRouter     = require("./router/driver/driverRouter");

app.get("/", (req, res) => {
  res.status(200).json({ message: "Metmomo API is live!", status: "ok" });
});

app.use("/api/auth",        authRouter);
app.use("/api/products",    productRouter);
app.use("/api/admin",       adminUsersRouter);
app.use("/api/reviews",     userReviewRouter);
app.use("/api/profile",     profileRoute);
app.use("/api/cart",        cartRoute);
app.use("/api/orders",      orderRoute);
app.use("/api/payment",     paymentRoute);
app.use("/api/restaurants", restaurantRouter);
app.use("/api/owner",       ownerRouter);
app.use("/api/delivery",    deliveryRouter);
app.use("/api/driver",      driverRouter);

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 4000;
connectDatabase(process.env.MONGO_URI).then(() => {
  server.listen(PORT, () => console.log(`Server running → http://localhost:${PORT}`));
});

module.exports = app;

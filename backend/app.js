const express = require("express");
const cors    = require("cors");
const path    = require("path");
require("dotenv").config();

const { connectDatabase } = require("./database/database");
const app = express();

  
app.use(cors({
  origin: ["*"],
  credentials: true,
}));

 
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

 
app.get("/", (req, res) => {
  res.status(200).json({ message: "Metmomo API is live!", status: "ok" });
});

 
app.use("/api/auth",     authRouter);
app.use("/api/products", productRouter);
app.use("/api/admin",    adminUsersRouter);
app.use("/api/reviews",  userReviewRouter);
app.use("/api/profile",  profileRoute);
app.use("/api/cart",     cartRoute);
app.use("/api/orders",   orderRoute);
app.use("/api/payment",  paymentRoute);

 
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

 
const PORT = process.env.PORT || 3000;
connectDatabase(process.env.MONGO_URI).then(() => {
  app.listen(PORT, () => console.log(`Server running → http://localhost:${PORT}`));
});

module.exports = app;
const router = require("express").Router();
const isAuthenticated = require("../../middleware/isAuthenticated");
const catchAsync = require("../../services/catchAsync");
const { createOrder, getMyOrders, getAllOrders } = require("../../controller/user/order/orderController");

// GET  /api/orders         → my orders
// POST /api/orders/create  → create order
// GET  /api/orders/all     → admin: all orders
router.route("/").get(isAuthenticated, catchAsync(getMyOrders));
router.route("/create").post(isAuthenticated, catchAsync(createOrder));
router.route("/all").get(isAuthenticated, catchAsync(getAllOrders));

module.exports = router;
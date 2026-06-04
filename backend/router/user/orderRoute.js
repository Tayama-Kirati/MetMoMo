const router = require("express").Router();
const isAuthenticated = require("../../middleware/isAuthenticated");
const catchAsync = require("../../services/catchAsync");
const { createOrder, getMyOrders, getAllOrders, markDelivered, cancelOrder } = require("../../controller/user/order/orderController");

// GET  /api/orders              → my orders
// POST /api/orders/create       → create order
// GET  /api/orders/all          → admin: all orders
// PATCH /api/orders/:id/delivered → customer confirms receipt
router.route("/").get(isAuthenticated, catchAsync(getMyOrders));
router.route("/create").post(isAuthenticated, catchAsync(createOrder));
router.route("/all").get(isAuthenticated, catchAsync(getAllOrders));
router.route("/:id/delivered").patch(isAuthenticated, catchAsync(markDelivered));
router.route("/:id/cancel").delete(isAuthenticated, catchAsync(cancelOrder));

module.exports = router;
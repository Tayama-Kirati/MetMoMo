const router = require("express").Router();
const isAuthenticated = require("../../middleware/isAuthenticated");
const catchAsync = require("../../services/catchAsync");
const validate = require("../../middleware/validate");
const {
  quoteOrder, createOrder, getMyOrders, getMyOrder, reorder, markDelivered, cancelOrder,
} = require("../../controller/user/order/orderController");

const orderBody = validate({ items: { type: "array", min: 1 }, shippingAddress: { type: "string", max: 300 } });

router.use(isAuthenticated);

router.get("/",                  catchAsync(getMyOrders));
router.post("/quote",            validate({ items: { type: "array", min: 1 } }), catchAsync(quoteOrder));
router.post("/create",           orderBody, catchAsync(createOrder));
router.get("/:id",               catchAsync(getMyOrder));
router.post("/:id/reorder",      catchAsync(reorder));
router.patch("/:id/delivered",   catchAsync(markDelivered));
router.delete("/:id/cancel",     catchAsync(cancelOrder));

module.exports = router;

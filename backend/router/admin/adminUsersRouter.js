// All /api/admin routes — admin login required for every one of them
const router = require('express').Router();
const isAuthenticated = require('../../middleware/isAuthenticated');
const restrictTo = require('../../middleware/restrictTo');
const catchAsync = require('../../services/catchAsync');
const c = require('../../controller/admin/adminController');

router.use(isAuthenticated, restrictTo('admin'));

router.get('/users',          catchAsync(c.getUsers));
router.patch('/users/:id',    catchAsync(c.updateUser));
router.delete('/users/:id',   catchAsync(c.deleteUser));

router.get('/orders',                 catchAsync(c.getAllOrders));
router.get('/orders/export.csv',      catchAsync(c.exportOrdersCsv));
router.patch('/orders/:id/status',    catchAsync(c.updateOrderStatus));
router.patch('/orders/:id/refund',    catchAsync(c.markRefunded));

router.get('/stats',          catchAsync(c.getStats));
router.get('/payouts',        catchAsync(c.getPayouts));
router.get('/settings',       catchAsync(c.getSettings));
router.patch('/settings',     catchAsync(c.updateSettings));

router.patch('/restaurants/:id/approval', catchAsync(c.setRestaurantApproval));

router.get('/coupons',        catchAsync(c.listCoupons));
router.post('/coupons',       catchAsync(c.createCoupon));
router.patch('/coupons/:id',  catchAsync(c.updateCoupon));
router.delete('/coupons/:id', catchAsync(c.deleteCoupon));

router.get('/reviews/reported', catchAsync(c.getReportedReviews));
router.patch('/reviews/:id',    catchAsync(c.moderateReview));
router.delete('/reviews/:id',   catchAsync(c.deleteReview));

module.exports = router;

const router = require("express").Router();
const isAuthenticated = require("../../middleware/isAuthenticated");
const catchAsync = require("../../services/catchAsync");
const {
  getProductReview,
  createReview,
  deleteReview,
  getMyReviews,
} = require("../../controller/user/review/reviewController");

// GET    /api/reviews/reviews       → my reviews (auth required)
router.route("/reviews")
  .get(isAuthenticated, catchAsync(getMyReviews));

// GET    /api/reviews/reviews/:id   → all reviews for product :id
// POST   /api/reviews/reviews/:id   → create review for product :id
// DELETE /api/reviews/reviews/:id   → delete review :id
router.route("/reviews/:id")
  .get(catchAsync(getProductReview))
  .post(isAuthenticated, catchAsync(createReview))
  .delete(isAuthenticated, catchAsync(deleteReview));

module.exports = router;
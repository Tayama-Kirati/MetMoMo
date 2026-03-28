// FIX: Product and Review were never imported — every endpoint crashed with ReferenceError
const Product = require("../../../models/productModel");
const Review  = require("../../../models/reviewModel");

// GET /api/reviews/reviews  — my reviews
exports.getMyReviews = async (req, res) => {
  // FIX: was using req.params.id (undefined here) instead of req.user.id
  const userId = req.user.id;
  const reviews = await Review.find({ userId })
    .populate("productId", "productName productImage productCategory");
  res.status(200).json({ message: "Reviews retrieved successfully", data: reviews });
};

// GET /api/reviews/reviews/:id  — all reviews for a product
// FIX: this function was entirely commented out — restored it
exports.getProductReview = async (req, res) => {
  const productId = req.params.id;
  const reviews = await Review.find({ productId })
    .populate("userId", "userName userEmail")
    .populate("productId", "productName");
  res.status(200).json({ message: "Reviews retrieved successfully", data: reviews });
};

// POST /api/reviews/reviews/:id  — create a review for product :id
exports.createReview = async (req, res) => {
  // FIX: userId was taken from req.params.id (= the productId!) instead of req.user
  const userId    = req.user.id;
  const productId = req.params.id;
  const { rating, message } = req.body;

  if (!rating || !message) {
    return res.status(400).json({ message: "Please provide rating and message" });
  }

  const productExist = await Product.findById(productId);
  if (!productExist) {
    return res.status(404).json({ message: "Product not found with the given productId" });
  }

  const already = await Review.findOne({ userId, productId });
  if (already) {
    return res.status(400).json({ message: "You have already reviewed this product" });
  }

  const review = await Review.create({ userId, productId, rating, message });
  return res.status(201).json({ message: "Review created successfully", data: review });
};

// DELETE /api/reviews/reviews/:id
exports.deleteReview = async (req, res) => {
  const reviewId = req.params.id;
  const userId   = req.user.id;

  const review = await Review.findById(reviewId);
  if (!review) return res.status(404).json({ message: "Review not found" });

  // FIX: was comparing ObjectId object to string with !== which always returns true
  // so every delete was rejected with "not authorized"
  if (review.userId.toString() !== userId.toString()) {
    return res.status(403).json({ message: "You are not authorized to delete this review" });
  }

  await Review.findByIdAndDelete(reviewId);
  res.status(200).json({ message: "Review deleted successfully" });
};

// Alias kept for router compatibility
exports.addProductReview = exports.createReview;
const express = require('express');
const router = express.Router();

const isAuthenticated = require('../../middleware/isAuthenticated');
const optionalAuth = require('../../middleware/optionalAuth');
const restrictTo = require('../../middleware/restrictTo');
const { upload } = require('../../services/storage');
const { aiLimiter } = require('../../middleware/rateLimits');

const images = upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'logo',       maxCount: 1 },
]);

const {
  getAllRestaurants,
  getRestaurant,
  getRestaurantMenu,
  getReviewSummary,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} = require('../../controller/admin/restaurants/restaurantController');

router
  .route('/')
  .get(optionalAuth, getAllRestaurants)
  .post(isAuthenticated, restrictTo('admin'), images, createRestaurant);

router
  .route('/:id')
  .get(optionalAuth, getRestaurant)
  .put(isAuthenticated, restrictTo('admin'), images, updateRestaurant)
  .patch(isAuthenticated, restrictTo('admin'), images, updateRestaurant)
  .delete(isAuthenticated, restrictTo('admin'), deleteRestaurant);

router.get('/:id/menu', optionalAuth, getRestaurantMenu);
router.get('/:id/review-summary', aiLimiter, optionalAuth, getReviewSummary);

module.exports = router;

const express = require('express');
const router = express.Router();

const isAuthenticated = require('../../middleware/isAuthenticated');
const restrictTo = require('../../middleware/restrictTo');

const {
  getAllRestaurants,
  getRestaurant,
  getRestaurantMenu,
  createRestaurant,
  updateRestaurant,
} = require('../../controller/admin/restaurants/restaurantController');

// GET all restaurants
router
  .route('/restaurants')
  .get(getAllRestaurants)
  .post(isAuthenticated, restrictTo('admin'), createRestaurant);

// GET single restaurant + update
router
  .route('/restaurants/:id')
  .get(getRestaurant)
  .put(isAuthenticated, restrictTo('admin'), updateRestaurant);

// GET menu
router
  .route('/restaurants/:id/menu')
  .get(getRestaurantMenu);

module.exports = router;
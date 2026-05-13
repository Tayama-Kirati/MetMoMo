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

router
  .route('/')
  .get(getAllRestaurants)
  .post(isAuthenticated, restrictTo('admin'), createRestaurant);

router
  .route('/:id')
  .get(getRestaurant)
  .put(isAuthenticated, restrictTo('admin'), updateRestaurant);

router
  .route('/:id/menu')
  .get(getRestaurantMenu);

module.exports = router;
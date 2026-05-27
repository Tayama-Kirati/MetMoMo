const express = require('express');
const router = express.Router();

const isAuthenticated = require('../../middleware/isAuthenticated');
const restrictTo = require('../../middleware/restrictTo');
const { multer, storage } = require('../../middleware/multerConfig');

const upload = multer({ storage }).fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'logo',       maxCount: 1 },
]);

const {
  getAllRestaurants,
  getRestaurant,
  getRestaurantMenu,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} = require('../../controller/admin/restaurants/restaurantController');

router
  .route('/')
  .get(getAllRestaurants)
  .post(isAuthenticated, restrictTo('admin'), upload, createRestaurant);

router
  .route('/:id')
  .get(getRestaurant)
  .put(isAuthenticated, restrictTo('admin'), upload, updateRestaurant)
  .patch(isAuthenticated, restrictTo('admin'), upload, updateRestaurant)
  .delete(isAuthenticated, restrictTo('admin'), deleteRestaurant);

router
  .route('/:id/menu')
  .get(getRestaurantMenu);

module.exports = router;

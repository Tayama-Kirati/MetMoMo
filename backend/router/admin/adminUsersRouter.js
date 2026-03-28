const router = require('express').Router();
const isAuthenticated = require('../../middleware/isAuthenticated');
const restrictTo = require('../../middleware/restrictTo');
const { getUsers, deleteUser} = require("../../controller/admin/users/userController");
const catchAsync = require('../../services/catchAsync');


 
 
router.route("/users").get(catchAsync(getUsers));
router.route("/users/:id").delete(catchAsync(deleteUser));
module.exports = router;

const express = require('express');
const authController = require('../controllers/authController');
const userController = require('./../controllers/userController');
const stationController = require('./../controllers/stationController');
const router = express.Router();

// router.param('id', tourController.checkID);
router.route('/login').post(authController.login);
router.route('/signup').post(authController.signup);

router
  .route('/forgetpassword')
  .post(authController.protect, authController.forgetPassword);

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    userController.getAllUsers,
  );

router
  .route('/updateMyPassword')
  .patch(authController.protect, authController.updatePassword);

router
  .route('/resetpassword/:token')
  .patch(authController.protect, authController.resetPassword);

router
  .route('/updateMe')
  .patch(authController.protect, userController.updateMe);

router
  .route('/deleteMe')
  .delete(authController.protect, userController.deleteMe);

module.exports = router;

const express = require('express');
const authController = require('../controllers/authController');
const userController = require('./../controllers/userController');

const router = express.Router();

// router.param('id', tourController.checkID);
router.route('/login').post(authController.login);
router.route('/signup').post(authController.signup);

router.route('/admin-exists').get(userController.checkAdminExists);

router
  .route('/me')
  .get(authController.protect, userController.getMe, userController.getUser);

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

router.route('/:id').get(authController.protect, userController.getUser);

router
  .route('/updateMe')
  .patch(authController.protect, userController.updateMe);

router
  .route('/deleteMe')
  .delete(authController.protect, userController.deleteMe);

router
  .route('/:id')
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    userController.deleteUser,
  );

module.exports = router;

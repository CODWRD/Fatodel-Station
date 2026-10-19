const express = require('express');
const dashboardController = require('./../controllers/dashboardController');
const authController = require('./../controllers/authController');
const router = express.Router();

router
  .route('/')
  .post(authController.protect, dashboardController.createRecord);

router
  .route('/stats')
  .get(authController.protect, dashboardController.getRecordStats);

module.exports = router;

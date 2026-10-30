const express = require('express');
const stationController = require('./../controllers/stationController');
const authController = require('./../controllers/authController');

const router = express.Router();

router
  .route('/:managerId')
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    stationController.createStation,
  )
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    stationController.getAllStations,
  );

router
  .route('/manager')
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    stationController.createManager,
  )
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    stationController.getAllManager,
  );

router
  .route('/manager/:id')
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    stationController.deleteManager,
  );

router
  .route('/:id')
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    stationController.UpdateStation,
  );

module.exports = router;

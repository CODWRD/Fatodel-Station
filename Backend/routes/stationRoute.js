const express = require('express');
const stationController = require('./../controllers/stationController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.route('/').post(stationController.createStation);

router
  .route('/manager')
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    stationController.createManager,
  )
  .get(stationController.getManagers);

router
  .route('/manager/:id')
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    stationController.deleteManager,
  );

router.route('/:id').patch(stationController.assignStationManager);

module.exports = router;

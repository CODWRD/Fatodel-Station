const express = require('express');
const stationController = require('./../controllers/stationController');

const router = express.Router();

router.route('/').post(stationController.createStation);

router
  .route('/manager')
  .post(stationController.createManager)
  .get(stationController.getManagers);

router.route('/manager/:id').delete(stationController.deleteManager);

router.route('/:id').patch(stationController.assignStationManager);

module.exports = router;

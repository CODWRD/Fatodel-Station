const express = require('express');
const stationController = require('./../controllers/stationController');

const router = express.Router();

router.route('/').post(stationController.createStationManager);

module.exports = router;

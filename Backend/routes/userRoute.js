const express = require('express');
const authController = require('../controllers/authController');
const stationController = require('./../controllers/stationController');
const router = express.Router();

// router.param('id', tourController.checkID);
router.route('/login').post(authController.login);

router.route('/signup').post(authController.signup);
router
  .route('/manager')
  .post(stationController.createManager)
module.exports = router;

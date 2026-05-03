const express = require('express');
const tourController = require('./../controller/loginController');
const router = express.Router();

// router.param('id', tourController.checkID);
router.route('/').post(tourController.loginController);
module.exports = router;

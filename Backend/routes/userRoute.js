const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

// router.param('id', tourController.checkID);
router.route('/').get(authController.login);
module.exports = router;
router.route('/').post(authController.signup);
module.exports = router;

const express = require('express');
const dashboardController = require('./../controllers/dashBoardController');

const router = express.Router();

router
  .route('/')
  .post(dashboardController.createRecord)
  .get(dashboardController.getRecordStats);

module.exports = router;

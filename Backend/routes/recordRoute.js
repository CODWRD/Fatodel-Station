const express = require('express');
const recordController = require('./../controllers/recordController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.route('/').get(authController.protect, recordController.getAllRecords);

router
  .route('/:id')
  .get(authController.protect, recordController.getRecordByID)
  .patch(authController.protect, recordController.updateRecord)
  .delete(authController.protect, recordController.deleteRecord);


router
  .route('/station/:stationId')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    recordController.getStationMonthlyRecords
  );
module.exports = router;

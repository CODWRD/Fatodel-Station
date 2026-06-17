const express = require('express');
const recordController = require('./../controllers/recordController');

const router = express.Router();

router
  .route('/')
  // .post(recordController.createRecord)
  .get(recordController.getAllRecords);

router
  .route('/:id')
  .get(recordController.getRecordByID)
  .patch(recordController.updateRecord)
  .delete(recordController.deleteRecord);
module.exports = router;

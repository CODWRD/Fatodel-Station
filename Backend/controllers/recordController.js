const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Record = require('./../models/RecordModel');

exports.getAllRecords = catchAsync(async (req, res) => {
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'month'];
  excludedFields.forEach((el) => delete queryObj[el]);

  if (req.query.month) {
    const [year, month] = req.query.month.split('-');
    queryObj.date = {
      $gte: new Date(year, month - 1, 1),
      $lt: new Date(year, month, 1),
    };
  }

  console.log('q', queryObj);
  let query = Record.find(queryObj);

  query = query.sort(req.query.sort === 'newest' ? '-date' : 'date');

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  const newRecord = await query;

  res.status(200).json({
    status: 'Success',
    data: newRecord,
  });
});

exports.getRecordByID = catchAsync(async (req, res) => {
  const record = await Record.findById(req.params.id);
  res.status(200).json({
    status: 'Success',
    data: record,
  });
});

exports.updateRecord = catchAsync(async (req, res, next) => {
  const record = await Record.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!record) {
    return next(new AppError('No record found with that ID', 404));
  }

  res.status(200).json({
    status: 'Success',
    message: 'Record has been Updated Successfully',
  });
});

exports.deleteRecord = catchAsync(async (req, res, next) => {
  const record = await Record.findByIdAndDelete(req.params.id);

  if (!record) {
    return next(new AppError('No record found with that ID', 404));
  }

  res.status(200).json({
    status: 'Success',
    data: null,
  });
});

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Record = require('./../models/RecordModel');
const Station = require('./../models/stationModel');

const confirmManager = async function (manager, next) {
  const station = await Station.findOne({ manager });

  if (!station) {
    return next(new AppError('No station is assigned to this manager', 403));
  }

  return station;
};

exports.getAllRecords = catchAsync(async (req, res, next) => {
  const station = await confirmManager(req.user.id, next);
  if (!station) return;

  const queryObj = { ...req.query };
  // console.log(queryObj)
  const excludedFields = ['page', 'sort', 'limit', 'month'];
  excludedFields.forEach((el) => delete queryObj[el]);

  queryObj.station = station._id;

  if (req.query.month) {
    const [year, month] = req.query.month.split('-');
    queryObj.date = {
      $gte: new Date(year, month - 1, 1),
      $lt: new Date(year, month, 1),
    };
  }

  let query = Record.find(queryObj);

  query = query.sort(req.query.sort === 'newest' ? '-date' : 'date');

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);
  console.log(query);

  const newRecord = await query;
  // console.log('newRecord', newRecord);

  if (!newRecord[0]) {
    return next(new AppError('No record found', 404));
  }

  res.status(200).json({
    status: 'Success',
    data: newRecord,
  });
});

exports.getRecordByID = catchAsync(async (req, res, next) => {
  const station = await confirmManager(req.user._id, next);
  if (!station) return;
  const record = await Record.findOne({
    _id: req.params.id,
    station: station._id,
  });

  if (!record) {
    return next(new AppError('No record found with that ID', 404));
  }
  res.status(200).json({
    status: 'Success',
    data: record,
  });
});

exports.updateRecord = catchAsync(async (req, res, next) => {
  // correct the req.body
  const station = await confirmManager(req.user._id, next);
  if (!station) return;

  const allowedFields = [
    'rate',
    'OpeningMeter',
    'closingMeter',
    'literSold',
    'dailyTotalSales',
    'dailyExpenses',
    'date',
    'attendant',
    'attendantSales',
  ];

  const updateData = {};

  allowedFields.forEach((el) => {
    if (req.body[el] !== undefined) {
      updateData[el] = req.body[el];
    }
  });

  const record = await Record.findOneAndUpdate(
    { station: station._id, _id: req.params.id },
    updateData,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!record) {
    return next(new AppError('No record found with that ID', 404));
  }

  res.status(200).json({
    status: 'Success',
    message: 'Record has been Updated Successfully',
  });
});


exports.deleteRecord = catchAsync(async (req, res, next) => {
  const station = await confirmManager(req.user.id, next);

  if (!station) return;

  const record = await Record.findOneAndDelete({
    _id: req.params.id,
    station: station._id,
  });

  if (!record) {
    return next(
      new AppError('No record found with that ID', 404),
    );
  }

  res.status(200).json({
    status: 'success',
    data: null,
  });
});


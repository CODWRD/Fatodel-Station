const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Record = require('./../models/recordModel');
const Station = require('./../models/stationModel');

const getManagerStation = async (managerId) => {
  return Station.findOne({ manager: managerId });
};

exports.getStationMonthlyRecords = catchAsync(async (req, res, next) => {
  const { stationId } = req.params;
  const { month } = req.query;

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return next(new AppError('Please provide a valid month.', 400));
  }

  const [year, monthNumber] = month.split('-').map(Number);

  const startDate = new Date(Date.UTC(year, monthNumber - 1, 1));
  const endDate = new Date(Date.UTC(year, monthNumber, 1));

  const records = await Record.find({
    station: stationId,
    date: {
      $gte: startDate,
      $lt: endDate,
    },
  }).sort({ date: -1 });

  res.status(200).json({
    status: 'success',
    results: records.length,
    data: records,
  });
});

exports.getAllRecords = catchAsync(async (req, res, next) => {
  const filter = { ...req.query };

  const excludedFields = ['page', 'sort', 'limit', 'month'];
  excludedFields.forEach((field) => delete filter[field]);

  if (req.user.role === 'manager') {
    const station = await getManagerStation(req.user.id);

    if (!station) {
      return next(new AppError('No station is assigned to this manager', 403));
    }

    filter.station = station._id;
  }

  if (req.query.month) {
    const [year, month] = req.query.month.split('-');

    filter.date = {
      $gte: new Date(Number(year), Number(month) - 1, 1),
      $lt: new Date(Number(year), Number(month), 1),
    };
  }

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;
  const sort = req.query.sort === 'newest' ? '-date' : 'date';

  const records = await Record.find(filter).sort(sort).skip(skip).limit(limit);

  res.status(200).json({
    status: 'Success',
    results: records.length,
    data: records,
  });
});

exports.getRecordByID = catchAsync(async (req, res, next) => {
  const filter = { _id: req.params.id };

  if (req.user.role === 'manager') {
    const station = await getManagerStation(req.user.id);

    if (!station) {
      return next(new AppError('No station is assigned to this manager', 403));
    }

    filter.station = station._id;
  }

  const record = await Record.findOne(filter);

  if (!record) {
    return next(new AppError('No record found with that ID', 404));
  }

  res.status(200).json({
    status: 'Success',
    data: record,
  });
});

exports.updateRecord = catchAsync(async (req, res, next) => {
  const filter = { _id: req.params.id };

  if (req.user.role === 'manager') {
    const station = await getManagerStation(req.user.id);

    if (!station) {
      return next(new AppError('No station is assigned to this manager', 403));
    }

    filter.station = station._id;
  }

  const allowedFields = [
    'rate',
    'OpeningMeter',
    'closingMeter',
    'literSold',
    'dailyTotalSales',
    'dailyExpenses',
    'date',
    'attendant',
    'note',
  ];

  const updateData = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  const record = await Record.findOneAndUpdate(filter, updateData, {
    new: true,
    runValidators: true,
  });

  if (!record) {
    return next(new AppError('No record found with that ID', 404));
  }

  res.status(200).json({
    status: 'Success',
    message: 'Record updated successfully',
    data: record,
  });
});

exports.deleteRecord = catchAsync(async (req, res, next) => {
  const filter = { _id: req.params.id };

  if (req.user.role === 'manager') {
    const station = await getManagerStation(req.user.id);

    if (!station) {
      return next(new AppError('No station is assigned to this manager', 403));
    }

    filter.station = station._id;
  }

  const record = await Record.findOneAndDelete(filter);

  if (!record) {
    return next(new AppError('No record found with that ID', 404));
  }

  res.status(200).json({
    status: 'Success',
    data: null,
  });
});

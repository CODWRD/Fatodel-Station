const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Record = require('./../models/RecordModel');
const Station = require('./../models/stationModel');

exports.createRecord = catchAsync(async (req, res, next) => {
  const station = await Station.findOne({
    manager: req.user.id,
  });

  if (!station) {
    return next(new AppError('No station is assigned to this manager', 403));
  }

  const { OpeningMeter, closingMeter, date } = req.body;

  if (closingMeter < OpeningMeter) {
    return next(
      new AppError('Closing meter cannot be less than opening meter', 400),
    );
  }

  const existing = await Record.findOne({
    station: station._id,
    date,
  });

  if (existing) {
    return next(
      new AppError('A record already exists for this station and date', 400),
    );
  }

  const record = await Record.create({
    ...req.body,
    station: station._id,
    createdBy: req.user.id,
  });

  res.status(201).json({
    status: 'success',
    data: {
      record,
    },
  });
});

exports.getRecordStats = catchAsync(async (req, res, next) => {
  const matchStage = {
    date: {
      $gte: new Date('2026-01-01'),
      $lt: new Date('2026-02-01'),
    },
  };

  if (req.user.role === 'manager') {
    const station = await Station.findOne({
      manager: req.user.id,
    });

    if (!station)
      return next(new AppError('No station is assigned to this manager', 403));
    matchStage.station = station._id;
  }

  const monthlyRecord = await Record.aggregate([
    {
      $match: matchStage,
    },

    {
      $group: {
        _id: null,
        monthlyLiterSales: { $sum: '$literSold' },
        totalExpenses: { $sum: '$dailyExpenses' },
        netProfit: {
          $sum: { $subtract: ['$dailyTotalSales', '$dailyExpenses'] },
        },
        avgFuelPrice: { $avg: '$rate' },
        monthlyRevenue: { $sum: '$dailyTotalSales' },
        recordCount: { $sum: 1 },
      },
    },
  ]);

  let record = monthlyRecord[0];
  if (!record) return next(new AppError('No record found', 404));
  const data =
    req.user.role === 'manager'
      ? {
          monthlyRevenue: record.monthlyRevenue,
          monthlyFuelSold: record.monthlyLiterSales,
          netProfit: record.netProfit,
        }
      : record;

  res.status(200).json({
    status: 'Success',
    data,
  });
});

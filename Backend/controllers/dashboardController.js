const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Record = require('./../models/RecordModel');

exports.createRecord = catchAsync(async (req, res, next) => {
  const { openingMeter, closingMeter, date } = req.body;
  if (openingMeter <= closingMeter) {
    return next(
      new AppError('Opening Meter must be greater than Closing Meter', 400),
    );
  }

  const existing = await Record.findOne({ date });
  if (existing) return next(new AppError('Data already existed'), 400);

  await Record.create(req.body);
  res.status(201).json({
    status: 'Success',
    data: 'Record Created Successfully',
  });
});

exports.getRecordStats = catchAsync(async (req, res, next) => {
  const record = await Record.aggregate([
    {
      $match: {
        date: {
          $gte: new Date('2026-06-01'),
          $lt: new Date('2026-07-01'),
        },
      },
    },

    {
      $group: {
        _id: null,
        monthlyLiterSales: { $sum: '$literSold' },
        totalFuelSold: { $sum: '$attendantSales' },
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

  res.status(200).json({
    status: 'Success',
    data: record,
  });
});

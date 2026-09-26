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
  if (existing) return next(new AppError('Data already existed', 400));

  await Record.create(req.body);
  res.status(201).json({
    status: 'Success',
    data: 'Record Created Successfully',
  });
});

exports.getRecordStats = catchAsync(async (req, res, next) => {
  const monthlyRecord = await Record.aggregate([
    {
      $match: {
        date: {
          $gte: new Date('2026-01-01'),
          $lt: new Date('2026-02-01'),
        },
      },
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

  const role = 'Manager';
  if (!monthlyRecord[0]) return next(new AppError('No record found', 404));

  let record = monthlyRecord[0];
  if (role === 'Admin') {
    record === record;
  } else if (role === 'Manager') {
    record = {
      monthlyRevenue: record.monthlyRevenue,
      monthlyFuelSold: record.monthlyLiterSales,
      netProfit: record.netProfit,
    };
  }

  res.status(200).json({
    status: 'Success',
    data: record,
  });
});

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Station = require('./../models/stationModel');

exports.createStationManager = catchAsync(async (req, res, next) => {
  const station = await Station.create({
    name: req.body.name,
    location: req.body.location,
    owner: req.user.id,
    manager: req.body.manager,
  });

  res.status(201).json({
    status: 'Success',
    data: station,
  });

  next(new AppError('error', 404));
});

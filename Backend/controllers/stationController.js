const AppError = require('./../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Station = require('./../models/stationModel');
const User = require('./../models/userModel');

exports.createStation = catchAsync(async (req, res, next) => {
  const station = await Station.create({
    stationName: req.body.stationName,
    location: req.body.location,
    // owner: User.admin._id,
  });

  res.status(201).json({
    status: 'Success',
    data: station,
  });
});

exports.createManager = catchAsync(async (req, res, next) => {
  const manager = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: 'manager',
  });

  res.status(201).json({
    status: 'Success',
    data: manager,
  });
});

exports.assignStationManager = catchAsync(async (req, res, next) => {
  const assign = await Station.findByIdAndUpdate(
    req.params.id,
    { manager: req.body.manager },
    { new: true },
  );

  if (!assign) return new AppError('Station not found', 400);

  res.status(201).json({
    status: 'Success',
    data: assign,
  });
});

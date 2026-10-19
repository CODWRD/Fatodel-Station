const AppError = require('./../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Station = require('./../models/stationModel');
const User = require('./../models/userModel');

exports.createManager = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'admin')
    return next(new AppError('Only admin can create a manager', 403));

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

exports.createStation = catchAsync(async (req, res, next) => {
  const station = await Station.create({
    stationName: req.body.stationName,
    location: req.body.location,
    owner: req.user._id,
    manager: req.body.manager,
  });

  res.status(201).json({
    status: 'Success',
    data: station,
  });
});

exports.getAllStations = catchAsync(async (req, res) => {
  const stations = await Station.find();
  res.status(200).json({
    status: 'Success',
    data: stations,
  });
});

exports.UpdateStation = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'admin')
    return next(
      new AppError('Only Admin is allowed to assign manager to station', 403),
    );

  const update = await Station.findByIdAndUpdate(
    req.params.id,
    { stationName: req.body.stationName },
    { new: true },
  );

  if (!update) return next(new AppError('Station not found', 400));

  res.status(200).json({
    status: 'Success',
    data: update,
  });
});

exports.getAllManager = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'admin')
    return next(new AppError('Only Admin is allowed', 403));

  const manager = await User.find({ role: 'manager' });

  if (!manager.length) return next(new AppError('No data  found', 404));

  res.status(200).json({
    status: 'Success',
    results: manager.length,
    data: manager,
  });
});

exports.deleteManager = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'admin')
    return next(new AppError('Only Admin is allowed', 403));

  const manager = await User.findByIdAndDelete({
    _id: req.params.id,
    role: 'manager',
  });

  if (!manager) return next(new AppError('user not found'));

  res.status(200).json({
    status: 'Success',
    message: 'Manager successfully deleted',
  });
});

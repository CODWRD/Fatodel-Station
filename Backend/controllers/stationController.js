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

  // placeholder
  const role = manager;

  if (role !== 'admin')
    return next(new AppError('Only admin can create a manager', 400));

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

exports.getManagers = catchAsync(async (req, res, next) => {
  const managers = await User.find({ role: 'manager' });

  if (!managers.length) return next(new AppError('No data  found', 404));

  res.status(200).json({
    status: 'Success',
    results: managers.length,
    data: managers,
  });
});

exports.deleteManager = catchAsync(async (req, res, next) => {
  const managers = await User.findByIdAndDelete({
    _id: req.params.id,
    role: 'manager',
  });
if(req.)
  if (!manager) return next(new AppError('user not found'));


});

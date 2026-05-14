const jwt = require('jsonwebtoken');
const catchAsync = require('./../utils/catchAsync');
const user = require('./../models/userModel');
const AppError = require('./../utils/appError');

const signToken = (id) => {
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res) => {
  const newUser = await user.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = jwt.sign({ id: newUser.__id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(200).json({
    status: 'success',
    token,
    data: {
      newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { password, email } = req.body;

  if (!password || !email) {
    return next(new AppError('Please provide your email or password'), 400);
  }

  const token = signToken(id);
  res.status(200).json({
    status: 'Success',
    token,
  });
});

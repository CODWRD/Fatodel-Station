const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const userRouter = require('./routes/userRoute');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// app.use(cors());

app.use(express.json());

app.use('/api/v1/login', userRouter);
app.use('/api/v1/signup', userRouter);

app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);
module.exports = app;

const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const app = express();
const sanitize = require('@exortek/express-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');
const hpp = require('hpp');

// const mongoose = require('mongoose');
// const cors = require('cors');
const userRouter = require('./routes/userRoute');
const recordRouter = require('./routes/recordRoute');
const dashboardRouter = require('./routes/dashboardRoute');
const stationRouter = require('./routes/stationRoute');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// app.use(cors());
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'To many request from this IP, Please try again in an hour',
});

app.use('/api', limiter);

app.use(express.json());
app.use(helmet());
app.use(sanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: [
      'rate',
      'OpeningMeter',
      'closingMeter',
      'literSold',
      'dailyTotalSales',
      'dailyExpenses',
      'date',
      'attendant',
      'attendantSales',
    ],
  }),
);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/users', userRouter);
app.use('/api/v1/record', recordRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/station', stationRouter);

app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);
module.exports = app;

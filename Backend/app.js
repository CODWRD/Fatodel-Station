const express = require('express');
const app = express();
// const mongoose = require('mongoose');
// const cors = require('cors');
const userRouter = require('./routes/userRoute');
const recordRouter = require('./routes/recordRoute');
const dashboardRouter = require('./routes/dashboardRoute');
const stationRouter = require('./routes/stationRoute');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// app.use(cors());

app.use(express.json());

app.use('/api/v1/users', userRouter);
app.use('/api/v1/record', recordRouter);
app.use('/api/v1/dashboard/stats', dashboardRouter);
app.use('/api/v1/station', stationRouter);

app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);
module.exports = app;

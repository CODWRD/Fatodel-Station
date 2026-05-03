const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const loginRouter = require('./route/loginRoute');

app.use(cors());

app.use(express.json());

app.use('/api/v1/login', loginRouter);

module.exports = app;

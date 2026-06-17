const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema(
  {
    rate: {
      type: Number,
      required: [true, 'Please Input a fuel price'],
    },
    OpeningMeter: {
      type: Number,
      required: [true, 'Please Input an Opening Meter'],
    },
    closingMeter: {
      type: Number,
      required: [true, 'Please Input a Closing Meter'],
    },
    literSold: { type: Number, required: [true, 'Please Input Meter Sold'] },

    dailyTotalSales: {
      type: Number,
      required: [true, 'Please Input Daily Sales'],
    },

    dailyExpenses: {
      type: Number,
      required: [true, 'Please Input Daily Expenses'],
    },

    date: {
      type: Date,
      required: [true, 'Please Input Date'],
    },

    attendant: {
      type: String,
      required: [true, 'Please provide Attendant'],
    },

    attendantSales: {
      type: Number,
      required: [true, 'Please provide Attendance Sales'],
    },

    note: String,

    // submittedBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'User',
    //   required: true,
    // },
  },
  { Timestamps: true },
);

const Record = mongoose.model('Record', recordSchema);

module.exports = Record;

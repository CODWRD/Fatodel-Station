const mongoose = require('mongoose');

const RecordSchema = new mongoose.Schema(
  {
    station: {
      type: mongoose.Schema.ObjectId,
      ref: 'Station',
      required: [true, 'A record must belong to a station'],
    },

    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A record must have a creator'],
    },

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
      default: Date.now,
      required: [true, 'Please Input Date'],
    },

    note: String,
  },
  { timestamps: true },
);

RecordSchema.pre(/^find/, function () {
  this.populate({
    path: 'station',
    select: 'stationName',
  });

  this.populate({
    path: 'createdBy',
    select: 'name',
  });
});

const Record = mongoose.model('Record', RecordSchema);

module.exports = Record;

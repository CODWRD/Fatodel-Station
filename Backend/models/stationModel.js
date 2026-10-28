const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  stationName: {
    type: String,
    required: true,
    unique: true,
  },

  location: {
    type: String,
    required: true,
    unique: true,
  },

  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },

  manager: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});

// stationSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'manager',
//     select: '-__v',
//   });

//   // next();
// });
const Station = mongoose.model('Station', stationSchema);

module.exports = Station;

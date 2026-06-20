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

  // owner: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User',
  //   required: true,
  // },

  manager: {
    type: 'String',
    // default: 'vic',
  },
});

const Station = mongoose.model('Station', stationSchema);

module.exports = Station;

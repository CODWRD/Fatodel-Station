const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  location: {
    type: String,
    required: true,
  },

  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  manager: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const Station = mongoose.model('Station', stationSchema);

module.exports = Station;

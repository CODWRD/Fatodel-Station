const mongoose = require('mongoose');
const loginSchema = new mongoose.Schema({
  name: {
    type: String,
    // required: true,
  },

  email: {
    type: String,
    unique: true,
    required: true,
  },

  password: {
    type: String,
    unique: true,
    required: true,
  },

  role: {
    type: String,
    enum: ['owner', 'manager'],
    default: 'owner',
  },
});

const login = mongoose.model('Login', loginSchema);
module.exports = login;

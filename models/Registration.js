const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
  model: String,
  name: String,
  phone: String,
  email: String,
  agree: Boolean,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Registration', RegistrationSchema);
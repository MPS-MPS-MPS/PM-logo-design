const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  institution: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  profilePicUrl: {
    type: String,
    default: '',
  },
  libraries: [{
    name: String,
    papers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Paper' }]
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('User', UserSchema);
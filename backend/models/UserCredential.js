const mongoose = require('mongoose');

const userCredentialSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  userId: String,
  password: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
});

const UserCredential =
  mongoose.models.UserCredential || mongoose.model('UserCredential', userCredentialSchema);

module.exports = UserCredential;

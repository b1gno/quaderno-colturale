const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  nome:     { type: String, required: true, trim: true },
  ruolo:    { type: String, enum: ['user', 'admin'], default: 'user' },
  username: { type: String },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.username) this.username = this.email.split('@')[0];
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);

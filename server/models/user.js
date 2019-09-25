const config = require("../config");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, lowercase: true },
  password: String
});

userSchema.pre("save", async function(next) {
  const user = this;
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;
    next();
  } catch (err) {
    return next(err);
  }
});
userSchema.methods.generateAuthToken = function() {
  const timestamp = new Date().getTime();
  const token = jwt.sign({ sub: this._id, iat: timestamp }, config.secret);
  return token;
};
userSchema.methods.comparePassword = async function(candidatePassword) {
  const valid = await bcrypt.compare(candidatePassword, this.password);
  return valid;
};
const User = new mongoose.model("user", userSchema);

module.exports = User;

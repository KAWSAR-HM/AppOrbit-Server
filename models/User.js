const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  photo: String,
  role: { type: String, enum: ["user", "moderator", "admin"], default: "user" }
});

module.exports = mongoose.model("User", userSchema);

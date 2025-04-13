const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  googleid: String,
  email: String,
  isAdmin: { type: Boolean, default: false }
});

// compile model from schema
module.exports = mongoose.model("user", UserSchema);

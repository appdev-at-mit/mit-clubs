const mongoose = require("mongoose");

const ClubSchema = new mongoose.Schema({
  club_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  is_active: { type: Boolean, default: true },
  is_accepting: { type: Boolean, default: false },
  recruiting_cycle: { type: String, default: "Unknown" },
  membership_process: { type: String, default: "Open Membership" },
  type: { type: String, required: true },
  email: { type: String },
  website: { type: String },
  mission: { type: String },
  picture_url: { type: String }
});

// compile model from schema
module.exports = mongoose.model("club", ClubSchema); 
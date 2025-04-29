const mongoose = require("mongoose");

const ClubSchema = new mongoose.Schema({
  club_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  is_active: { type: Boolean, default: true },
  is_accepting: { type: Boolean, default: false },
  recruiting_cycle: { type: String, default: "Unknown" },
  membership_process: { type: String, default: "Open Membership" },
  tags: { type: String },
  email: { type: String },
  instagram: { type: String },
  linkedin: { type: String },
  facebook: { type: String },
  website: { type: String },
  mission: { type: String },
  image_url: { type: String },
  saveCount: { type: Number, default: 0 },
  savedByUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

// compile model from schema
module.exports = mongoose.model("club", ClubSchema); 
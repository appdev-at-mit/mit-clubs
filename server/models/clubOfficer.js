const mongoose = require("mongoose");

const ClubOfficerSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  club_id: { type: String, required: true },
  role: { type: String, default: "officer" },
}, { timestamps: true });

ClubOfficerSchema.index({ user_id: 1, club_id: 1 }, { unique: true });

module.exports = mongoose.model("clubOfficer", ClubOfficerSchema);
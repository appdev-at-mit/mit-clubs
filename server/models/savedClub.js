const mongoose = require("mongoose");

const SavedClubSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  club_id: { type: String, required: true },
}, { timestamps: true });

// create a compound index to ensure a user can only save a club once
SavedClubSchema.index({ user_id: 1, club_id: 1 }, { unique: true });

// compile model from schema
module.exports = mongoose.model("savedClub", SavedClubSchema); 
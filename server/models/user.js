const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  googleid: String,
  email: String,
  isAdmin: { type: Boolean, default: false },
  memberOf: [{ 
    club_id: { type: String, required: true },
    role: { type: String, default: "Member" },
    joined_date: { type: Date, default: Date.now }
  }],
  savedClubs: [{ 
    club_id: { type: String, required: true },
    saved_date: { type: Date, default: Date.now }
  }]
});

// compile model from schema
module.exports = mongoose.model("user", UserSchema);

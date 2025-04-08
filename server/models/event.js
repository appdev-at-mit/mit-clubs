const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  event_id: {
    type: String,
    required: true,
    unique: true
  },
  club_id: {
    type: String,
    required: true,
    ref: "Club"
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date
  },
  location: {
    type: String,
    default: ""
  },
  is_recruiting_event: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Auto-generate event_id as a UUID if not provided
EventSchema.pre("save", function(next) {
  if (!this.event_id) {
    this.event_id = mongoose.Types.ObjectId().toString();
  }

  // Update the updated_at field
  this.updated_at = new Date();

  next();
});

module.exports = mongoose.model("Event", EventSchema);

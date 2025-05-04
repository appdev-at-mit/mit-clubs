const mongoose = require("mongoose");

const ClubSchema = new mongoose.Schema({
  club_id: { type: String, required: true, unique: true },
  name: { 
    type: String, 
    required: true,
    maxlength: [100, 'Club name cannot exceed 100 characters']
  },
  is_active: { type: Boolean, default: true },
  is_accepting: { type: Boolean, default: false },
  recruiting_cycle: { 
    type: [String], 
    default: [], 
    validate: {
      validator: function(v) {
        // allow either string or array of strings
        return v === undefined || 
               v === null || 
               v === "" || 
               (Array.isArray(v) && v.every(item => typeof item === 'string')) ||
               typeof v === 'string';
      },
      message: props => `${props.value} is not a valid recruiting cycle!`
    },
    // convert single string to array when saving
    set: function(v) {
      if (typeof v === 'string') return [v];
      return v;
    }
  },
  membership_process: { type: String, default: "Open Membership" },
  tags: { type: String },
  email: { type: String },
  instagram: { type: String },
  linkedin: { type: String },
  facebook: { type: String },
  website: { type: String },
  mission: { 
    type: String,
    maxlength: [1000, 'Mission statement cannot exceed 1000 characters']
  },
  image_url: { type: String },
  saveCount: { type: Number, default: 0 },
  savedByUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  questions: {
    type: [{
      question: { type: String, required: true },
      answer: { 
        type: String, 
        default: "",
        maxlength: [500, 'Answer cannot exceed 500 characters']
      }
    }],
    default: [
      { question: "What does the time commitment for this club look like?", answer: "" },
      { question: "When and where does this club meet?", answer: "" }
    ]
  },
  members: {
    type: [{
      id: { type: String, required: true },
      name: { 
        type: String, 
        required: true,
        maxlength: [50, 'Member name cannot exceed 50 characters'],
        validate: {
          validator: function(v) {
            return /^[A-Za-z\s]+$/.test(v);
          },
          message: props => 'Name can only contain alphabetic characters and spaces'
        }
      },
      email: { 
        type: String, 
        required: true,
        maxlength: [100, 'Email cannot exceed 100 characters']
      },
      role: { type: String, required: true },
      permissions: { type: String, required: true }
    }],
    default: []
  }
});

// compile model from schema
module.exports = mongoose.model("club", ClubSchema); 
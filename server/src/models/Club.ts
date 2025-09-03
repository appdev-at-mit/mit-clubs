import mongoose from "mongoose";

export interface ClubQuestion {
  question: string;
  answer: string;
}

export interface ClubMember {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string;
}

export interface Club {
  club_id: string;
  name: string;
  is_active: boolean;
  is_accepting?: boolean;
  recruiting_cycle?: string[];
  membership_process?: string;
  tags?: string[];
  email?: string;
  instagram?: string;
  linkedin?: string;
  facebook?: string;
  website?: string;
  mission?: string;
  image_url?: string;
  saveCount?: number;
  questions?: ClubQuestion[];
  members?: ClubMember[];
}

const ClubQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: {
    type: String,
    default: "",
    maxlength: [500, "Answer cannot exceed 500 characters"],
  },
});

const ClubMemberSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: {
    type: String,
    required: true,
    maxlength: [50, "Member name cannot exceed 50 characters"],
    validate: {
      validator: function (v: string) {
        return /^[A-Za-z\s]+$/.test(v);
      },
      message: "Name can only contain alphabetic characters and spaces",
    },
  },
  email: {
    type: String,
    required: true,
    maxlength: [100, "Email cannot exceed 100 characters"],
  },
  role: { type: String, required: true },
  permissions: { type: String, required: true },
});

const ClubSchema = new mongoose.Schema({
  club_id: { type: String, required: true, unique: true },
  name: {
    type: String,
    required: true,
    maxlength: [100, "Club name cannot exceed 100 characters"],
  },
  is_active: { type: Boolean, default: true },
  is_accepting: { type: Boolean },
  recruiting_cycle: {
    type: [String],
    validate: {
      validator: function (v: any) {
        // allow either string or array of strings
        return (
          v === undefined ||
          v === null ||
          v === "" ||
          (Array.isArray(v) &&
            v.every((item: any) => typeof item === "string")) ||
          typeof v === "string"
        );
      },
      message: "Invalid recruiting cycle format",
    },
    // convert single string to array when saving
    set: function (v: any) {
      if (typeof v === "string") return [v];
      return v;
    },
  },
  membership_process: { type: String },
  tags: { type: [String] },
  email: { type: String },
  instagram: { type: String },
  linkedin: { type: String },
  facebook: { type: String },
  website: { type: String },
  mission: {
    type: String,
    maxlength: [1000, "Mission statement cannot exceed 1000 characters"],
  },
  image_url: { type: String },
  saveCount: { type: Number },
  questions: {
    type: [ClubQuestionSchema],
  },
  members: {
    type: [ClubMemberSchema],
  },
});

const ClubModel = mongoose.model<Club>("club", ClubSchema);

function createClubModel() {
  return new ClubModel();
}
export type ClubModelType = ReturnType<typeof createClubModel>;

export default ClubModel;

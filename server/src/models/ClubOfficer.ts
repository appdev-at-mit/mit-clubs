import mongoose from "mongoose";

export interface ClubOfficer {
  user_id: mongoose.Types.ObjectId;
  club_id: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ClubOfficerSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    club_id: { type: String, required: true },
    role: { type: String, default: "officer" },
  },
  { timestamps: true }
);

ClubOfficerSchema.index({ user_id: 1, club_id: 1 }, { unique: true });

const ClubOfficerModel = mongoose.model<ClubOfficer>(
  "clubOfficer",
  ClubOfficerSchema
);

const f = () => new ClubOfficerModel();
export type ClubOfficerModelType = ReturnType<typeof f>;

export default ClubOfficerModel;

import mongoose from "mongoose";

export interface SavedClub {
  user_id: mongoose.Types.ObjectId;
  club_id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const SavedClubSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    club_id: { type: String, required: true },
  },
  { timestamps: true }
);

// create a compound index to ensure a user can only save a club once
SavedClubSchema.index({ user_id: 1, club_id: 1 }, { unique: true });

const SavedClubModel = mongoose.model<SavedClub>("savedClub", SavedClubSchema);

const f = () => new SavedClubModel();
export type SavedClubModelType = ReturnType<typeof f>;

export default SavedClubModel;

import mongoose from "mongoose";
import { Club } from "./Club";
import { Event } from "./event";

export interface UserClubMembership {
  club_id: string;
  role: string;
  joined_date: Date;
}

export interface User {
  name: string | undefined;
  email: string | undefined;
  mitId: string | undefined;
  isAdmin?: boolean;
  memberOf?: UserClubMembership[];
  savedClubs?: Club[]; // Array of full Club objects
  savedEvents?: Event[]; // Array of full Event objects (matching clubs)
}

const UserClubMembershipSchema = new mongoose.Schema({
  club_id: { type: String, required: true },
  role: { type: String, default: "Member" },
  joined_date: { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, sparse: true },
  mitId: { type: String, unique: true, sparse: true },
  isAdmin: { type: Boolean, default: false },
  memberOf: [UserClubMembershipSchema],
  savedClubs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'club' }], // References to Club documents
  savedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'event' }], // References to Event documents (matching clubs)
});

const UserModel = mongoose.model<User>("user", UserSchema);

function createUserModel() {
  return new UserModel();
}
export type UserModelType = ReturnType<typeof createUserModel>;

export default UserModel;

import mongoose from "mongoose";

export interface UserClubMembership {
  club_id: string;
  role: string;
  joined_date: Date;
}

export interface UserSavedClub {
  club_id: string;
  saved_date: Date;
}

export interface User {
  name: string | undefined;
  email: string | undefined;
  googleId: string | undefined;
  isAdmin?: boolean;
  memberOf?: UserClubMembership[];
  savedClubs?: UserSavedClub[];
}

const UserClubMembershipSchema = new mongoose.Schema({
  club_id: { type: String, required: true },
  role: { type: String, default: "Member" },
  joined_date: { type: Date, default: Date.now },
});

const UserSavedClubSchema = new mongoose.Schema({
  club_id: { type: String, required: true },
  saved_date: { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  googleId: String,
  isAdmin: { type: Boolean, default: false },
  memberOf: [UserClubMembershipSchema],
  savedClubs: [UserSavedClubSchema],
});

const UserModel = mongoose.model<User>("user", UserSchema);

const f = () => new UserModel();
export type UserModelType = ReturnType<typeof f>;

export default UserModel;

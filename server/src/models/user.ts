import mongoose from 'mongoose';

export interface User {
    name: string | undefined,
    email: string | undefined,
    googleId: string | undefined,
    isAdmin?: boolean,
}

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  googleId: String,
  isAdmin: { type: Boolean, default: false },
});

const UserModel = mongoose.model("user", UserSchema);

const f = () => new UserModel();
export type UserModelType = ReturnType<typeof f>;

export default UserModel;
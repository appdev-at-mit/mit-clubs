import { Request, Response, NextFunction } from "express";
import { OAuth2Client } from "google-auth-library";
import User, { UserModelType } from "../models/user";

// create a new OAuth client used to verify google sign-in
const CLIENT_ID = process.env["GOOGLE_CLIENT_ID"];
const client = new OAuth2Client(CLIENT_ID);

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

interface AuthResult {
  user: UserModelType;
  isNewUser: boolean;
}

// accepts a login token from the frontend
async function verify(token: string): Promise<GoogleUser> {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error("Invalid token payload");
  }
  return {
    email: payload.email || "",
    name: payload.name || "",
    picture: payload.picture || "",
    sub: payload.sub,
  };
}

// gets user from DB, or makes a new account if it doesn't exist yet
async function getOrCreateUser(googleUser: GoogleUser): Promise<AuthResult> {
  let existingUser = await User.findOne({ googleId: googleUser.sub });

  if (!existingUser) {
    existingUser = await User.findOne({ email: googleUser.email });

    if (existingUser) {
      existingUser.googleId = googleUser.sub;
    }
  }

  if (existingUser) {
    let updated = false;

    if (existingUser.googleId !== googleUser.sub) {
      existingUser.googleId = googleUser.sub;
      updated = true;
    }

    if (existingUser.email !== googleUser.email) {
      existingUser.email = googleUser.email;
      updated = true;
    }
    if (existingUser.name !== googleUser.name) {
      existingUser.name = googleUser.name;
      updated = true;
    }
    const savedUser = updated ? await existingUser.save() : existingUser;
    return { user: savedUser, isNewUser: false };
  }

  // user doesn't exist, create new one
  const newUser = new User({
    name: googleUser.name,
    googleId: googleUser.sub,
    email: googleUser.email,
    isAdmin: false,
  });

  const savedUser = await newUser.save();
  return { user: savedUser, isNewUser: true };
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ error: "No token provided" });
      return;
    }

    const googleUser = await verify(token);
    const result = await getOrCreateUser(googleUser);

    req.session.user = result.user;

    res.send({ user: result.user, isNewUser: result.isNewUser });
  } catch (error) {
    console.error("Failed to log in:", error);
    res.status(401).send({ err: error });
  }
}

export function logout(req: Request, res: Response): void {
  req.session.user = undefined;
  req.user = undefined;
  res.send({});
}

export function populateCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  req.user = req.session.user;
  next();
}

export function ensureLoggedIn(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).send({ err: "not logged in" });
    return;
  }
  next();
}

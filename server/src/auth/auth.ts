import { Request, Response, NextFunction } from "express";
import { jwtDecode } from "jwt-decode";
import User, { UserModelType } from "../models/user";

interface GoogleCredential {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

export async function login(req: Request, res: Response) {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "No token provided" });
  }

  try {
    const decoded = jwtDecode(token) as GoogleCredential;
    
    // get or create user
    let user = await User.findOne({ googleId: decoded.sub });
    let isNewUser = false;

    if (!user) {
      // create new user
      user = new User({
        name: decoded.name,
        email: decoded.email,
        googleId: decoded.sub,
        isAdmin: false,
      });
      await user.save();
      isNewUser = true;
    } else {
      // update existing user info
      user.name = decoded.name;
      user.email = decoded.email;
      await user.save();
    }

    // store user in session
    req.session.user = user;

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin || false,
      },
      isNewUser
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}

export function logout(req: Request, res: Response) {
  req.session.user = undefined;
  req.user = undefined;
  res.send({});
}

export function populateCurrentUser(req: Request, res: Response, next: NextFunction) {
  // simply populate "req.user" for convenience
  req.user = req.session.user;
  next();
}
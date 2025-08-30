import express, { Request, Response } from "express";
import { login, logout } from "./auth/auth";

const router = express.Router();

// auth routes

/**
 * POST /api/login
 *
 * Authenticates a user with Google OAuth token
 */
router.post("/login", login);

/**
 * POST /api/logout
 *
 * Logs out the current user and clears session
 */
router.post("/logout", logout);

/**
 * GET /api/whoami
 *
 * Returns the current authenticated user's information
 */
router.get("/whoami", (req: Request, res: Response): void => {
  if (!req.user) {
    res.send({});
    return;
  }
  res.send(req.user);
});

export default router;

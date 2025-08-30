import express, { Request, Response } from "express";
import { ensureLoggedIn } from "../auth/auth";

export const adminRouter = express.Router();

/**
 * GET /api/admin/check
 *
 * Returns the admin status of the authenticated user
 */
adminRouter.get(
  "/admin/check",
  ensureLoggedIn,
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.json({ isAdmin: false });
        return;
      }

      res.json({ isAdmin: !!req.user.isAdmin });
    } catch (error) {
      console.error("Error checking admin status:", error);
      res.status(500).json({ error: "Error checking admin status" });
    }
  }
);

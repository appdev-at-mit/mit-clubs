import express, { Request, Response } from "express";
import SavedClub from "../models/SavedClub";
import Club from "../models/Club";
import { ensureLoggedIn } from "../auth/auth";

export const userRouter = express.Router();

/**
 * GET /api/saved-clubs
 *
 * Returns a JSON array of clubs saved by the authenticated user
 */
userRouter.get(
  "/saved-clubs",
  ensureLoggedIn,
  async (req: Request, res: Response): Promise<void> => {
    const user_id = req.user?._id;

    if (!user_id) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    try {
      const savedClubEntries = await SavedClub.find({ user_id });

      if (savedClubEntries.length === 0) {
        res.json([]);
        return;
      }

      const clubIds = savedClubEntries.map((entry: any) => entry.club_id);
      const clubs = await Club.find({ club_id: { $in: clubIds } });

      res.status(200).json(clubs);
    } catch (error) {
      console.error("error fetching saved clubs:", error);
      res.status(500).json({ error: "error fetching saved clubs" });
    }
  }
);

/**
 * GET /api/saved-club-ids
 *
 * Returns a JSON array of club IDs saved by the authenticated user
 */
userRouter.get(
  "/saved-club-ids",
  ensureLoggedIn,
  async (req: Request, res: Response): Promise<void> => {
    const user_id = req.user?._id;

    if (!user_id) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    try {
      const savedClubEntries = await SavedClub.find({ user_id }).select(
        "club_id -_id"
      );
      res.status(200).json(savedClubEntries);
    } catch (error) {
      console.error("error fetching saved club ids:", error);
      res.status(500).json({ error: "error fetching saved club ids" });
    }
  }
);

/**
 * GET /api/users/clubs
 *
 * Returns a JSON array of clubs where the user is a member
 */
userRouter.get(
  "/users/clubs",
  ensureLoggedIn,
  async (req: Request, res: Response): Promise<void> => {
    const user_id = req.user?._id;

    if (!user_id) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    try {
      res.json([]);
    } catch (error) {
      console.error("error fetching user clubs:", error);
      res.status(500).json({ error: "error fetching user clubs" });
    }
  }
);

/**
 * GET /api/users/data
 *
 * Returns comprehensive user data including saved clubs and memberships
 */
userRouter.get(
  "/users/data",
  ensureLoggedIn,
  async (req: Request, res: Response): Promise<void> => {
    const user_id = req.user?._id;

    if (!user_id) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    try {
      const savedClubEntries = await SavedClub.find({ user_id });
      let savedClubs: any[] = [];

      if (savedClubEntries.length > 0) {
        const clubIds = savedClubEntries.map((entry: any) => entry.club_id);
        savedClubs = await Club.find({ club_id: { $in: clubIds } });
      }

      const memberClubs: any[] = [];

      res.json({
        savedClubs,
        memberClubs,
      });
    } catch (error) {
      console.error("error fetching user data:", error);
      res.status(500).json({ error: "error fetching user data" });
    }
  }
);

import express, { Request, Response } from 'express';
import SavedClub from "../models/SavedClub";
import Club from "../models/Club";
import { ensureLoggedIn } from "../auth/auth";

export const userRouter = express.Router();

/**
 * GET /api/saved-clubs
 *
 * Returns a JSON array of clubs saved by the authenticated user
 */
userRouter.get("/saved-clubs", ensureLoggedIn, async (req: Request, res: Response): Promise<void> => {
  const user_id = req.user?._id;

  if (!user_id) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  try {
    const savedClubEntries = await SavedClub.find({ user_id });

    if (savedClubEntries.length === 0) {
      res.json([]);
      return;ƒ
    }

    const clubIds = savedClubEntries.map((entry: any) => entry.club_id);
    const clubs = await Club.find({ club_id: { $in: clubIds } });

    res.status(200).json(clubs);
  } catch (error) {
    console.error("error fetching saved clubs:", error);
    res.status(500).json({ error: "error fetching saved clubs" });
  }
});

/**
 * GET /api/saved-club-ids
 *
 * Returns a JSON array of club IDs saved by the authenticated user
 */
userRouter.get("/saved-club-ids", ensureLoggedIn, async (req: Request, res: Response): Promise<void> => {
  const user_id = req.user?._id;

  if (!user_id) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  try {
    const savedClubEntries = await SavedClub.find({ user_id }).select("club_id -_id");
    res.status(200).json(savedClubEntries);
  } catch (error) {
    console.error("error fetching saved club ids:", error);
    res.status(500).json({ error: "error fetching saved club ids" });
  }
});
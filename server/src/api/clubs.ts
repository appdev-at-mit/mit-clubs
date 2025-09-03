import express, { Request, Response } from "express";
import Club from "../models/Club";
import User from "../models/user";
import { ensureLoggedIn } from "../auth/auth";

export const clubRouter = express.Router();

/**
 * GET /api/clubs
 *
 * Returns a JSON array of all clubs in the database
 */
clubRouter.get("/clubs", async (req: Request, res: Response): Promise<void> => {
  try {
    const clubs = await Club.find({});
    if (clubs.length === 0) {
      res.status(404).json({ error: "clubs not found" });
      return;
    }
    res.json(clubs);
  } catch (error) {
    console.error("error fetching clubs:", error);
    res.status(500).json({ error: "error fetching clubs" });
  }
});

/**
 * GET /api/clubs/:id
 *
 * Returns a JSON object for the club with the specified ID
 */
clubRouter.get(
  "/clubs/:id",
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      const club = await Club.findOne({ club_id: id });
      if (!club) {
        res.status(404).json({ error: "club not found" });
        return;
      }
      res.json(club);
    } catch (error) {
      console.error("error fetching club:", error);
      res.status(500).json({ error: "error fetching club" });
    }
  }
);

/**
 * POST /api/club
 *
 * Creates a new club with the provided data
 */
clubRouter.post("/club", async (req: Request, res: Response): Promise<void> => {
  try {
    const newClub = await Club.create(req.body);
    res.status(201).json({
      message: "club added successfully",
      club_id: newClub.club_id,
    });
  } catch (error) {
    console.error("error adding club:", error);
    res.status(500).json({ error: "error adding club" });
  }
});

/**
 * DELETE /api/club
 *
 * Deletes a club by club_id
 */
clubRouter.delete(
  "/club",
  async (req: Request, res: Response): Promise<void> => {
    const { club_id } = req.body;
    try {
      const result = await Club.deleteOne({ club_id });

      if (result.deletedCount === 0) {
        res.status(404).json({ error: "club not found" });
        return;
      }

      res.json({ message: "club deleted successfully" });
    } catch (error) {
      console.error("error deleting club:", error);
      res.status(500).json({ error: "error deleting club" });
    }
  }
);

/**
 * POST /api/save-club
 *
 * Saves a club to the user's saved clubs list
 */
clubRouter.post(
  "/save-club",
  ensureLoggedIn,
  async (req: Request, res: Response): Promise<void> => {
    const { club_id } = req.body;
    if (!req.user) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    const user_id = req.user._id;

    try {
      const club = await Club.findOne({ club_id });
      if (!club) {
        res.status(404).json({ error: "Club not found" });
        return;
      }

      const user = await User.findById(user_id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const alreadySaved =
        user.savedClubs &&
        user.savedClubs.some((saved: any) => saved._id.equals(club._id));

      if (alreadySaved) {
        res.status(200).json(club);
        return;
      }

      if (!user.savedClubs) {
        user.savedClubs = [];
      }
      user.savedClubs.push(club);
      await user.save();

      club.saveCount = club.saveCount + 1;
      await club.save();

      res.status(201).json(club);
    } catch (error) {
      console.error("error saving club:", error);
      res.status(500).json({ error: "error saving club" });
    }
  }
);

/**
 * DELETE /api/unsave-club/:id
 *
 * Removes a club from the user's saved clubs list
 */
clubRouter.delete(
  "/unsave-club/:id",
  ensureLoggedIn,
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    const user_id = req.user._id;
    const { id: club_id } = req.params;

    try {
      const user = await User.findById(user_id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const hasSaved =
        user.savedClubs &&
        user.savedClubs.some((saved: any) => saved.club_id === club_id);

      if (!hasSaved) {
        res.status(404).json({ error: "club not found in saved list" });
        return;
      }

      if (user.savedClubs) {
        user.savedClubs = user.savedClubs.filter(
          (saved: any) => saved.club_id !== club_id
        );
      }
      await user.save();

      const currentClub = await Club.findOne({ club_id: club_id });
      if (currentClub) {
        currentClub.saveCount = currentClub.saveCount - 1;
        await currentClub.save();
      }
      res.status(200).json(currentClub);
    } catch (error) {
      console.error("error unsaving club:", error);
      res.status(500).json({ error: "error unsaving the club" });
    }
  }
);

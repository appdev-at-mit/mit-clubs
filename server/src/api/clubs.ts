import express, { Request, Response } from "express";
import Club from "../models/Club";
import SavedClub from "../models/SavedClub";
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
    const user_id = req.user?._id;

    if (!user_id) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    try {
      // check if already saved
      const existing = await SavedClub.findOne({ user_id, club_id });
      if (existing) {
        const currentClub = await Club.findOne({ club_id });
        res.status(200).json(currentClub);
        return;
      }

      // check if user has previously contributed to save count
      const club = await Club.findOne({ club_id });
      if (!club) {
        res.status(404).json({ error: "Club not found" });
        return;
      }

      let updateOperation = {};
      const userHasSavedBefore = club.savedByUsers.some((id: any) =>
        id.equals(user_id)
      );

      if (!userHasSavedBefore) {
        updateOperation = {
          $inc: { saveCount: 1 },
          $addToSet: { savedByUsers: user_id },
        };
      }

      const updatedClub = await Club.findOneAndUpdate(
        { club_id: club_id },
        updateOperation,
        {
          new: true,
        }
      );

      // create entry in SavedClub collection
      await SavedClub.create({ user_id, club_id });

      // Add to user's savedClubs array
      await User.updateOne(
        { _id: user_id },
        {
          $addToSet: {
            savedClubs: {
              club_id: club_id,
              saved_date: new Date(),
            },
          },
        }
      );

      res.status(201).json(updatedClub);
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
    const user_id = req.user?._id;
    const { id: club_id } = req.params;

    if (!user_id) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    try {
      const existing = await SavedClub.findOne({ user_id, club_id });

      if (!existing) {
        res.status(404).json({ error: "club not found in saved list" });
        return;
      }

      await SavedClub.deleteOne({ user_id, club_id });

      // remove from user's savedClubs array
      await User.updateOne(
        { _id: user_id },
        { $pull: { savedClubs: { club_id: club_id } } }
      );

      const currentClub = await Club.findOne({ club_id: club_id });
      res.status(200).json(currentClub);
    } catch (error) {
      console.error("error unsaving club:", error);
      res.status(500).json({ error: "error unsaving the club" });
    }
  }
);

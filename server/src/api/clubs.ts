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
 * Middleware to ensure user has owner permissions for a club OR is a system admin
 */
const ensureOwnerOrAdmin = async (req: Request, res: Response, next: any) => {
  try {
    const clubId = req.params["id"] || req.params["clubId"] || req.body.club_id;

    if (!clubId) {
      return res.status(400).json({ error: "Club ID is required" });
    }

    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (req.user.isAdmin) {
      return next();
    }

    const club = await Club.findOne({ club_id: clubId });
    if (!club) {
      return res.status(404).json({ error: "Club not found" });
    }

    const userEmail = req.user.email;
    if (!userEmail) {
      return res.status(401).json({ error: "User email not found" });
    }

    const isMemberWithOwnerPermission =
      club.members &&
      club.members.some(
        (member: any) =>
          member.email === userEmail && member.permissions === "Owner"
      );

    if (!isMemberWithOwnerPermission) {
      return res
        .status(403)
        .json({ error: "You don't have permission to manage this club" });
    }

    next();
  } catch (error) {
    console.error("Error in permission check:", error);
    res.status(500).json({ error: "Error checking permissions" });
  }
};

/**
 * PUT /api/club
 *
 * Updates club details with validation and permission checks
 */
clubRouter.put(
  "/club",
  ensureLoggedIn,
  ensureOwnerOrAdmin,
  async (req: Request, res: Response): Promise<void> => {
    const { club_id, ...updateData } = req.body;

    if (!club_id) {
      res.status(400).json({ error: "club_id is required" });
      return;
    }

    const allowedFields = [
      "name",
      "is_active",
      "is_accepting",
      "recruiting_cycle",
      "membership_process",
      "tags",
      "email",
      "instagram",
      "linkedin",
      "facebook",
      "website",
      "mission",
      "image_url",
      "questions",
      "members",
    ];

    const validUpdateData = Object.keys(updateData)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});

    if (validUpdateData.name && validUpdateData.name.length > 100) {
      res.status(400).json({ error: "Club name cannot exceed 100 characters" });
      return;
    }

    if (validUpdateData.mission && validUpdateData.mission.length > 1000) {
      res
        .status(400)
        .json({ error: "Mission statement cannot exceed 1000 characters" });
      return;
    }

    if (validUpdateData.questions) {
      for (let i = 0; i < validUpdateData.questions.length; i++) {
        const question = validUpdateData.questions[i];
        if (question.answer && question.answer.length > 500) {
          res.status(400).json({
            error: `Answer for question ${i + 1} cannot exceed 500 characters`,
          });
          return;
        }
      }
    }

    if (
      updateData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateData.email)
    ) {
      res.status(400).json({ error: "Invalid email format" });
      return;
    }

    try {
      const result = await Club.updateOne(
        { club_id },
        { $set: validUpdateData }
      );

      if (result.matchedCount === 0) {
        res.status(404).json({ error: "club not found" });
        return;
      }

      const updatedClub = await Club.findOne({ club_id });
      res.json({
        message: "club updated successfully",
        club: updatedClub,
      });
    } catch (error) {
      console.error("error updating club:", error);
      res.status(500).json({ error: "error updating club" });
    }
  }
);

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

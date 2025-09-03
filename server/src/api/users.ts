import express, { Request, Response } from "express";
import SavedClub from "../models/SavedClub";
import Club from "../models/Club";
import User from "../models/user";
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
    if (!req.user) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    const user_id = req.user._id;

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
    if (!req.user) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    const user_id = req.user._id;

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
    if (!req.user) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    const user_id = req.user._id;

    try {
      const user = await User.findById(user_id);
      if (!user || !user.memberOf || user.memberOf.length === 0) {
        res.json([]);
        return;
      }

      const memberOf = user.memberOf;
      const clubIds = memberOf.map((membership: any) => membership.club_id);
      const clubs = await Club.find({ club_id: { $in: clubIds } });

      const clubsWithMembership = clubIds
        .map((clubId: string) => {
          const club = clubs.find((c) => c.club_id === clubId);
          if (!club) return null;

          const membership = memberOf.find((m: any) => m.club_id === clubId);
          if (!membership) return null;

          return {
            ...club.toObject(),
            role: membership.role || "Member",
            year_joined: membership.joined_date
              ? new Date(membership.joined_date).getFullYear().toString()
              : undefined,
          };
        })
        .filter(Boolean);

      res.json(clubsWithMembership);
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
    if (!req.user) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    const user_id = req.user._id;

    try {
      const user = await User.findById(user_id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const savedClubEntries = await SavedClub.find({ user_id });
      const memberClubIds =
        user.memberOf && user.memberOf.length > 0
          ? user.memberOf.map((membership: any) => membership.club_id)
          : [];
      const savedClubIds = savedClubEntries.map((entry: any) => entry.club_id);
      const allClubIds = [...new Set([...memberClubIds, ...savedClubIds])];

      if (allClubIds.length === 0) {
        res.json({
          memberClubs: [],
          savedClubs: [],
        });
        return;
      }

      const clubs = await Club.find({ club_id: { $in: allClubIds } });

      let memberClubs: any[] = [];
      if (user.memberOf && user.memberOf.length > 0) {
        const memberOf = user.memberOf;
        memberClubs = memberClubIds
          .map((clubId: string) => {
            const club = clubs.find((c) => c.club_id === clubId);
            if (!club) return null;

            const membership = memberOf.find((m: any) => m.club_id === clubId);
            if (!membership) return null;

            return {
              ...club.toObject(),
              role: membership.role || "Member",
              year_joined: membership.joined_date
                ? new Date(membership.joined_date).getFullYear().toString()
                : undefined,
            };
          })
          .filter(Boolean);
      }

      const savedClubs = savedClubIds
        .map((clubId: string) => {
          const club = clubs.find((c) => c.club_id === clubId);
          return club ? club.toObject() : null;
        })
        .filter(Boolean);

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

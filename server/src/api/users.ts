import express, { Request, Response } from "express";
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
      const user = await User.findById(user_id).populate("savedClubs");
      if (!user || !user.savedClubs || user.savedClubs.length === 0) {
        res.json([]);
        return;
      }

      res.status(200).json(user.savedClubs);
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
      const user = await User.findById(user_id).populate("savedClubs");
      if (!user || !user.savedClubs) {
        res.json([]);
        return;
      }

      const savedClubIds = user.savedClubs.map((club: any) => ({
        club_id: club.club_id,
      }));
      res.status(200).json(savedClubIds);
    } catch (error) {
      console.error("error fetching saved club ids:", error);
      res.status(500).json({ error: "error fetching saved club ids" });
    }
  }
);

/**
 * GET /api/saved-events
 *
 * Returns a JSON array of events saved by the authenticated user
 */
userRouter.get(
  "/saved-events",
  ensureLoggedIn,
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    const user_id = req.user._id;

    try {
      const user = await User.findById(user_id).populate("savedEvents");
      if (!user || !user.savedEvents || user.savedEvents.length === 0) {
        res.json([]);
        return;
      }
      res.status(200).json(user.savedEvents);
    } catch (error) {
      console.error("error fetching saved events:", error);
      res.status(500).json({ error: "error fetching saved events" });
    }
  }
);

/**
 * GET /api/saved-event-ids
 *
 * Returns a JSON array of event IDs saved by the authenticated user
 */
userRouter.get(
  "/saved-event-ids",
  ensureLoggedIn,
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    const user_id = req.user._id;

    try {
      const user = await User.findById(user_id).populate("savedEvents");
      if (!user || !user.savedEvents) {
        res.json([]);
        return;
      }
      const savedEventIds = user.savedEvents.map((event: any) => ({
        event_id: event.event_id,
      }));
      res.status(200).json(savedEventIds);
    } catch (error) {
      console.error("error fetching saved event ids:", error);
      res.status(500).json({ error: "error fetching saved event ids" });
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
      const user = await User.findById(user_id)
        .populate("savedClubs")
        .populate("savedEvents");
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const memberClubIds =
        user.memberOf && user.memberOf.length > 0
          ? user.memberOf.map((membership: any) => membership.club_id)
          : [];

      if (
        memberClubIds.length === 0 &&
        (!user.savedClubs || user.savedClubs.length === 0)
      ) {
        res.json({
          memberClubs: [],
          savedClubs: [],
          savedEvents: [],
        });
        return;
      }

      const clubs =
        memberClubIds.length > 0
          ? await Club.find({ club_id: { $in: memberClubIds } })
          : [];

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

      const savedClubs = user.savedClubs || [];
      const savedEvents = user.savedEvents || [];

      res.json({
        savedClubs,
        memberClubs,
        savedEvents,
      });
    } catch (error) {
      console.error("error fetching user data:", error);
      res.status(500).json({ error: "error fetching user data" });
    }
  }
);

import express, { Request, Response, NextFunction } from "express";
import { ensureLoggedIn } from "../auth/auth";
import Club from "../models/Club";
import User from "../models/user";

export const adminRouter = express.Router();

/**
 * Check that the user is owner of club or admin
 */
async function ensureOwnerOrAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id, clubId } = req.params;
    const currentClubId = id || clubId || req.body.club_id;

    if (!currentClubId) {
      res.status(400).json({ error: "Club ID is required" });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const user = req.user;
    if (user.isAdmin) {
      next();
      return;
    }

    const club = await Club.findOne({ club_id: currentClubId });
    if (!club) {
      res.status(404).json({ error: "Club not found" });
      return;
    }

    const userMember =
      club.members &&
      club.members.some(
        (member: any) =>
          member.email === user.email && member.permissions === "Owner"
      );

    if (!userMember) {
      res.status(403).json({ error: "Owner or admin permissions required" });
      return;
    }

    next();
  } catch (error) {
    console.error("Error checking owner/admin permissions:", error);
    res.status(500).json({ error: "Error checking permissions" });
  }
}

/**
 * GET /api/checkAdmin
 *
 * Returns the admin status of the authenticated user
 */
adminRouter.get(
  "/checkAdmin",
  ensureLoggedIn,
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.json({ isAdmin: false });
        return;
      }

      const isAdmin = Boolean(req.user.isAdmin);
      res.json({ isAdmin });
    } catch (error) {
      res.status(500).json({ error: "Error checking admin status" });
    }
  }
);

// |------------------------------|
// | Club Members Management      |
// |------------------------------|

/**
 * GET /api/clubs/:id/members
 *
 * Returns the members array for a specific club
 */
adminRouter.get(
  "/clubs/:id/members",
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      const club = await Club.findOne({ club_id: id });
      if (!club) {
        res.status(404).json({ error: "Club not found" });
        return;
      }

      res.json(club.members || []);
    } catch (error) {
      console.error("Error fetching club members:", error);
      res.status(500).json({ error: "Error fetching club members" });
    }
  }
);

/**
 * POST /api/clubs/:id/members
 *
 * Adds a new member to a club
 */
adminRouter.post(
  "/clubs/:id/members",
  ensureLoggedIn,
  ensureOwnerOrAdmin,
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const memberData = req.body;

    if (!id) {
      res.status(400).json({ error: "Club ID is required" });
      return;
    }

    try {
      const club = await Club.findOne({ club_id: id });
      if (!club) {
        res.status(404).json({ error: "Club not found" });
        return;
      }

      // generate an ID for the member
      // later change this to just use kerb
      memberData.id = new Date().getTime().toString();
      memberData.joined_date = new Date();

      if (!club.members) {
        club.members = [];
      }

      const existingMember = club.members.find(
        (member: any) => member.email === memberData.email
      );
      if (existingMember) {
        res
          .status(400)
          .json({ error: "A member with this email already exists" });
        return;
      }

      club.members.push(memberData);
      await club.save();

      try {
        const user = await User.findOne({ email: memberData.email });
        if (user) {
          if (!user.memberOf) {
            user.memberOf = [];
          }

          const existingMembership = user.memberOf.find(
            (m: any) => m.club_id === id
          );
          if (!existingMembership) {
            user.memberOf.push({
              club_id: id,
              role: memberData.role || "Member",
              joined_date: new Date(),
            });
            await user.save();
          }
        }
      } catch (userError) {
        console.error("Couldn't update user's memberships:", userError);
      }

      res.status(201).json({
        message: "Member added successfully",
        member: memberData,
      });
    } catch (error) {
      console.error("Error adding club member:", error);
      res.status(500).json({ error: "Error adding club member" });
    }
  }
);

/**
 * PUT /api/clubs/:clubId/members/:memberId
 *
 * Updates a member in a club
 */
adminRouter.put(
  "/clubs/:clubId/members/:memberId",
  ensureLoggedIn,
  ensureOwnerOrAdmin,
  async (req: Request, res: Response): Promise<void> => {
    const { clubId, memberId } = req.params;
    const updateData = req.body;

    if (!clubId || !memberId) {
      res.status(400).json({ error: "Club and member IDs are required" });
      return;
    }

    try {
      const club = await Club.findOne({ club_id: clubId });
      if (!club) {
        res.status(404).json({ error: "Club not found" });
        return;
      }

      if (!club.members || club.members.length === 0) {
        res.status(404).json({ error: "Member not found" });
        return;
      }

      const memberIndex = club.members.findIndex(
        (member: any) => member.id === memberId
      );
      if (memberIndex === -1) {
        res.status(404).json({ error: "Member not found" });
        return;
      }

      const currentMember = club.members[memberIndex];
      if (!currentMember) {
        res.status(404).json({ error: "Member not found" });
        return;
      }

      const currentEmail = currentMember.email;
      const newEmail = updateData.email;
      const newRole = updateData.role;

      if (newEmail !== currentEmail) {
        const existingMember = club.members.find(
          (member: any) => member.email === newEmail && member.id !== memberId
        );
        if (existingMember) {
          res
            .status(400)
            .json({ error: "A member with this email already exists" });
          return;
        }
      }

      club.members[memberIndex] = {
        ...currentMember,
        ...updateData,
        id: memberId,
      };

      await club.save();

      // update user's memberOf array
      try {
        if (currentEmail !== newEmail) {
          const oldUser = await User.findOne({ email: currentEmail });
          if (oldUser && oldUser.memberOf) {
            oldUser.memberOf = oldUser.memberOf.filter(
              (m: any) => m.club_id !== clubId
            );
            await oldUser.save();
          }
        }

        const user = await User.findOne({ email: newEmail });
        if (user) {
          const membershipIndex = user.memberOf
            ? user.memberOf.findIndex((m: any) => m.club_id === clubId)
            : -1;

          if (membershipIndex >= 0 && user.memberOf) {
            const membership = user.memberOf[membershipIndex];
            if (membership) {
              membership.role = newRole;
            }
          } else {
            user.memberOf = user.memberOf || [];
            user.memberOf.push({
              club_id: clubId,
              role: newRole,
              joined_date: new Date(),
            });
          }

          await user.save();
        }
      } catch (userError) {
        console.error("Couldn't update user's memberships:", userError);
      }

      res.json({
        message: "Member updated successfully",
        member: club.members[memberIndex],
      });
    } catch (error) {
      console.error("Error updating club member:", error);
      res.status(500).json({ error: "Error updating club member" });
    }
  }
);

/**
 * DELETE /api/clubs/:clubId/members/:memberId
 *
 * Removes a member from a club
 */
adminRouter.delete(
  "/clubs/:clubId/members/:memberId",
  ensureLoggedIn,
  ensureOwnerOrAdmin,
  async (req: Request, res: Response): Promise<void> => {
    const { clubId, memberId } = req.params;

    if (!clubId || !memberId) {
      res.status(400).json({ error: "Club and member IDs are required" });
      return;
    }

    try {
      const club = await Club.findOne({ club_id: clubId });
      if (!club) {
        res.status(404).json({ error: "Club not found" });
        return;
      }

      if (!club.members || club.members.length === 0) {
        res.status(404).json({ error: "Member not found" });
        return;
      }

      const memberIndex = club.members.findIndex(
        (member: any) => member.id === memberId
      );
      if (memberIndex === -1) {
        res.status(404).json({ error: "Member not found" });
        return;
      }

      const memberToRemove = club.members[memberIndex];
      if (!memberToRemove) {
        res.status(404).json({ error: "Member not found" });
        return;
      }

      const memberEmail = memberToRemove.email;

      club.members.splice(memberIndex, 1);
      await club.save();

      // update user's memberOf array
      try {
        const user = await User.findOne({ email: memberEmail });
        if (user && user.memberOf) {
          user.memberOf = user.memberOf.filter(
            (m: any) => m.club_id !== clubId
          );
          await user.save();
        }
      } catch (userError) {
        console.error("Couldn't update user's memberships:", userError);
      }

      res.json({ message: "Member removed successfully" });
    } catch (error) {
      console.error("Error removing club member:", error);
      res.status(500).json({ error: "Error removing club member" });
    }
  }
);

// |------------------------------|
// | Club Management              |
// |------------------------------|

/**
 * PUT /api/club
 *
 * Updates club details
 */
adminRouter.put(
  "/club",
  ensureLoggedIn,
  ensureOwnerOrAdmin,
  async (req: Request, res: Response): Promise<void> => {
    const { club_id, ...updateData } = req.body;

    if (!club_id) {
      res.status(400).json({ error: "Club ID is required" });
      return;
    }

    try {
      const updatedClub = await Club.findOneAndUpdate(
        { club_id: club_id },
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedClub) {
        res.status(404).json({ error: "Club not found" });
        return;
      }

      res.json({ message: "Club updated successfully", club: updatedClub });
    } catch (error) {
      console.error("Error updating club:", error);
      res.status(500).json({ error: "Error updating club" });
    }
  }
);

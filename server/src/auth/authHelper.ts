import { Request, Response, NextFunction } from "express";
import Club from "../models/Club";

/**
 * Middleware to ensure user is an admin
 */
export function ensureAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).send({ err: "not logged in" });
    return;
  }

  if (!req.user.isAdmin) {
    res.status(403).send({ err: "admin access required" });
    return;
  }

  next();
}

/**
 * Middleware to ensure user is an officer of a specific club
 */
export function ensureClubOfficer(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).send({ err: "not logged in" });
    return;
  }

  const { clubId } = req.params;
  if (!clubId) {
    res.status(400).send({ err: "club ID required" });
    return;
  }

  // check if user is admin (admins have access to all clubs)
  if (req.user.isAdmin) {
    next();
    return;
  }

  // check if user is officer of this specific club
  const user = req.user;
  Club.findOne({ club_id: clubId })
    .then((club) => {
      if (!club || !club.members) {
        res.status(404).send({ err: "club not found" });
        return;
      }

      const isOfficer = club.members.some(
        (member: any) =>
          member.email === user.email &&
          (member.permissions === "Owner" || member.permissions === "Officer")
      );

      if (!isOfficer) {
        res.status(403).send({ err: "club officer access required" });
        return;
      }
      next();
    })
    .catch((error) => {
      console.error("Error checking club officer status:", error);
      res.status(500).send({ err: "internal server error" });
    });
}

/**
 * Check if user is an officer of any club
 */
export async function isClubOfficer(userEmail: string): Promise<boolean> {
  try {
    const clubs = await Club.find({});
    const isOfficer = clubs.some(
      (club) =>
        club.members &&
        club.members.some(
          (member: any) =>
            member.email === userEmail &&
            (member.permissions === "Owner" || member.permissions === "Officer")
        )
    );
    return isOfficer;
  } catch (error) {
    console.error("Error checking if user is club officer:", error);
    return false;
  }
}

/**
 * Get all clubs where user is an officer
 */
export async function getUserOfficerClubs(
  userEmail: string
): Promise<string[]> {
  try {
    const clubs = await Club.find({});
    const officerClubs = clubs
      .filter(
        (club) =>
          club.members &&
          club.members.some(
            (member: any) =>
              member.email === userEmail &&
              (member.permissions === "Owner" ||
                member.permissions === "Officer")
          )
      )
      .map((club) => club.club_id);
    return officerClubs;
  } catch (error) {
    console.error("Error getting user officer clubs:", error);
    return [];
  }
}

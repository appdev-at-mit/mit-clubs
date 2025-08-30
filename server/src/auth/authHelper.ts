import { Request, Response, NextFunction } from "express";
import ClubOfficer from "../models/ClubOfficer";

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
  ClubOfficer.findOne({
    user_id: req.user._id,
    club_id: clubId,
  })
    .then((officer) => {
      if (!officer) {
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
export async function isClubOfficer(userId: string): Promise<boolean> {
  try {
    const officer = await ClubOfficer.findOne({ user_id: userId });
    return !!officer;
  } catch (error) {
    console.error("Error checking if user is club officer:", error);
    return false;
  }
}

/**
 * Get all clubs where user is an officer
 */
export async function getUserOfficerClubs(userId: string): Promise<string[]> {
  try {
    const officerRecords = await ClubOfficer.find({ user_id: userId });
    return officerRecords.map((record) => record.club_id);
  } catch (error) {
    console.error("Error getting user officer clubs:", error);
    return [];
  }
}

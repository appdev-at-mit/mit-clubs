import express, { Request, Response } from "express";
import Event from "../models/event";
import User from "../models/user";
import { ensureLoggedIn } from "../auth/auth";

export const eventRouter = express.Router();

/**
 * POST /api/save-event
 *
 * Saves an event to the user's saved events list
 */
eventRouter.post(
  "/save-event",
  ensureLoggedIn,
  async (req: Request, res: Response): Promise<void> => {
    const { event_id } = req.body;
    if (!req.user) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    const user_id = req.user._id;
    
    try {
      const event = await Event.findOne({ event_id });
      if (!event) {
        res.status(404).json({ error: "Event not found" });
        return;
      }

      const user = await User.findById(user_id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const alreadySaved =
        user.savedEvents &&
        user.savedEvents.some((saved: any) => saved._id.equals(event._id));

      if (alreadySaved) {
        res.status(200).json(event);
        return;
      }

      if (!user.savedEvents) {
        user.savedEvents = [];
      }
      user.savedEvents.push(event);
      await user.save();

      event.saveCount = (event.saveCount || 0) + 1;
      await event.save();

      res.status(201).json(event);
    } catch (error) {
      console.error("error saving event:", error);
      res.status(500).json({ error: "error saving event" });
    }
  }
);

/**
 * DELETE /api/unsave-event/:eventId
 *
 * Removes an event from the user's saved events list
 */
eventRouter.delete(
  "/unsave-event/:eventId",
  ensureLoggedIn,
  async (req: Request, res: Response): Promise<void> => {
    const { eventId } = req.params;
    if (!req.user) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    const user_id = req.user._id;

    try {
      const event = await Event.findOne({ event_id: eventId });
      if (!event) {
        res.status(404).json({ error: "Event not found" });
        return;
      }

      const user = await User.findById(user_id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const hasSaved =
        user.savedEvents &&
        user.savedEvents.some((saved: any) => saved._id.equals(event._id));

      if (!hasSaved) {
        res.status(404).json({ error: "event not found in saved list" });
        return;
      }

      if (user.savedEvents) {
        user.savedEvents = user.savedEvents.filter(
          (saved: any) => !saved._id.equals(event._id)
        );
        await user.save();
      }

      event.saveCount=(event.saveCount || 0) - 1;
      if (event.saveCount < 0) event.saveCount = 0;
      await event.save();

      res.status(200).json(event);
    } catch (error) {
      console.error("error unsaving event:", error);
      res.status(500).json({ error: "error unsaving event" });
    }
  }
);  

/** 
 * GET /api/events
 * Retuns a JSON array of all events in the database
 * (pending SIPB API)
 */

eventRouter.get(
  "/events",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const events = await Event.find({});
      if (events.length===0) {
        res.status(404).json({ error: "No events found" });
      }
      res.status(200).json(events);
    } catch (error) {
      console.error("error fetching events:", error);
      res.status(500).json({ error: "error fetching events" });
    }
  }
);
/**
 * GET /api/events/:id
 * Returns a JSON object of the event with the given event_id
 */
eventRouter.get(
  "/events/:id",
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      const event = await Event.findOne({ event_id: id });
      if (!event) {
        res.status(404).json({ error: "Event not found" });
        return;
      }
      res.status(200).json(event);
    } catch (error) {
      console.error("error fetching event by id:", error);
      res.status(500).json({ error: "error fetching event by id" });
    }
  }
);


import express, { Request, Response } from 'express';
import EventModel from '../models/event';
import User from '../models/user';

const router = express.Router();
const isDate = (value: unknown): value is Date => value instanceof Date;

// Middleware to ensure user is logged in
const ensureLoggedIn = (req: Request, res: Response, next: Function): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  next();
};

/**
 * GET /api/events
 */
router.get('/events', async (req: Request, res: Response) => {
  try {
    const { from_date, to_date, tags, search } = req.query;

    const query: any = {};

    if (from_date) {
      query.date = { $gte: new Date(from_date as string) };
    }

    if (to_date) {
      const toDate = new Date(to_date as string);
      query.$or = [
        { end_time: { $exists: true, $lte: toDate } },
        { end_time: { $exists: false }, date: { $lte: toDate } }
      ];
    }

    if (tags) {
      const tagArray = (tags as string).split(',').map(t => t.trim());
      query.tags = { $in: tagArray };
    }

    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { title: searchRegex },
        { details: searchRegex },
        { organizer: searchRegex },
      ];
    }

    const events = await EventModel.find(query)
      .sort({ date: 1 })
      .lean();

    const eventsFormatted = events.map(event => ({
      ...event,
      _id: event._id.toString(),
      date: isDate(event.date) ? event.date.toISOString() : event.date,
      recievedDate: isDate(event.recievedDate) ? event.recievedDate.toISOString() : event.recievedDate,
      last_modified: isDate(event.last_modified) ? event.last_modified.toISOString() : event.last_modified,
      end_time: event.end_time
        ? (isDate(event.end_time) ? event.end_time.toISOString() : event.end_time)
        : undefined,
    }));

    res.json({
      status: 'success',
      count: eventsFormatted.length,
      data: eventsFormatted,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch events',
    });
  }
});

/**
 * GET /api/events/:id
 */
router.get('/events/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const event = await EventModel.findById(id).lean();

    if (!event) {
      res.status(404).json({
        status: 'error',
        message: 'Event not found',
      });
      return;
    }

    const eventFormatted = {
      ...event,
      _id: event._id.toString(),
      date: isDate(event.date) ? event.date.toISOString() : event.date,
      recievedDate: isDate(event.recievedDate) ? event.recievedDate.toISOString() : event.recievedDate,
      last_modified: isDate(event.last_modified) ? event.last_modified.toISOString() : event.last_modified,
      end_time: event.end_time
        ? (isDate(event.end_time) ? event.end_time.toISOString() : event.end_time)
        : undefined,
    };

    res.json({
      status: 'success',
      data: eventFormatted,
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch event',
    });
  }
});

/**
 * POST /api/save-event
 * Saves an event to the user's saved events list (EXACTLY matches clubs pattern)
 */
router.post('/save-event', ensureLoggedIn, async (req: Request, res: Response): Promise<void> => {
  const { event_id } = req.body;
  if (!req.user) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const user_id = (req.user as any)._id;

  try {
    const event = await EventModel.findById(event_id);
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const user = await User.findById(user_id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if already saved - comparing full documents like clubs does
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
    // Push full event document like clubs does
    user.savedEvents.push(event as any);
    await user.save();
    event.saveCount = (event.saveCount || 0) + 1;
    await event.save();

    res.status(201).json(event);
  } catch (error) {
    console.error('Error saving event:', error);
    res.status(500).json({ error: 'Failed to save event' });
  }
});

/**
 * DELETE /api/unsave-event/:eventId
 * Removes an event from the user's saved events list (EXACTLY matches clubs pattern)
 */
router.delete('/unsave-event/:eventId', ensureLoggedIn, async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const user_id = (req.user as any)._id;
  const { eventId } = req.params;

  try {
    const event = await EventModel.findById(eventId);
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const user = await User.findById(user_id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if event is in saved list - comparing full documents like clubs does
    const hasSaved =
      user.savedEvents &&
      user.savedEvents.some((saved: any) => saved._id.equals(event._id));

    if (!hasSaved) {
      res.status(404).json({ error: 'Event not found in saved list' });
      return;
    }

    // Remove event from saved list - filtering full documents like clubs does
    if (user.savedEvents) {
      user.savedEvents = user.savedEvents.filter(
        (saved: any) => !saved._id.equals(event._id)
      );
    }
    await user.save();

    event.saveCount = (event.saveCount || 0) - 1;
    if (event.saveCount < 0) event.saveCount = 0;
    await event.save();

    res.status(200).json(event);
  } catch (error) {
    console.error('Error unsaving event:', error);
    res.status(500).json({ error: 'Failed to unsave event' });
  }
});

/**
 * GET /api/saved-event-ids
 * Get IDs of events saved by the current user
 */
router.get('/saved-event-ids', ensureLoggedIn, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any)._id;

    // DON'T populate to avoid loading corrupted events
    const user = await User.findById(userId).lean();

    if (!user || !user.savedEvents) {
      res.json([]);
      return;
    }

    // savedEvents contains ObjectId references, convert to strings
    const eventIds = user.savedEvents.map((id: any) => id.toString());
    res.json(eventIds);
  } catch (error) {
    console.error('Error fetching saved event IDs:', error);
    res.status(500).json({ error: 'Failed to fetch saved event IDs' });
  }
});

/**
 * GET /api/saved-events
 * Get full details of all events saved by the current user
 */
router.get('/saved-events', ensureLoggedIn, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any)._id;

    const user = await User.findById(userId).lean();

    if (!user || !user.savedEvents || user.savedEvents.length === 0) {
      res.json([]);
      return;
    }

    // Manually fetch each event (skip any that fail due to corruption)
    const eventPromises = user.savedEvents.map((id: any) =>
      EventModel.findById(id).lean().catch(() => null)
    );
    const events = (await Promise.all(eventPromises)).filter(e => e !== null);

    // Format dates
    const eventsFormatted = events.map((event: any) => ({
      ...event,
      _id: event._id.toString(),
      date: isDate(event.date) ? event.date.toISOString() : event.date,
      recievedDate: isDate(event.recievedDate) ? event.recievedDate.toISOString() : event.recievedDate,
      last_modified: isDate(event.last_modified) ? event.last_modified.toISOString() : event.last_modified,
      end_time: event.end_time
        ? (isDate(event.end_time) ? event.end_time.toISOString() : event.end_time)
        : undefined,
    }));

    res.json(eventsFormatted);
  } catch (error) {
    console.error('Error fetching saved events:', error);
    res.status(500).json({ error: 'Failed to fetch saved events' });
  }
});

/**
 * GET /api/events/sync/status
 */
router.get('/events/sync/status', async (req: Request, res: Response) => {
  try {
    const { dormspamSyncService } = await import('../services/dormspamSync.js');
    const status = dormspamSyncService.getStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to get sync status',
    });
  }
});

/**
 * POST /api/events/sync/manual
 */
router.post('/events/sync/manual', async (req: Request, res: Response) => {
  try {
    const { dormspamSyncService } = await import('../services/dormspamSync.js');
    await dormspamSyncService.manualSync();
    res.json({
      status: 'success',
      message: 'Manual sync triggered',
    });
  } catch (error) {
    console.error('Manual sync error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to trigger manual sync',
    });
  }
});

export default router;

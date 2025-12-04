import express, { Request, Response } from 'express';
import EventModel from '../models/event';

const router = express.Router();
const isDate = (value: unknown): value is Date => value instanceof Date;

/**
 * GET /api/events
 * Get all events with optional filtering
 *
 * Query params:
 * - from_date: ISO 8601 DateTime - Filter events starting on or after this date
 * - to_date: ISO 8601 DateTime - Filter events ending on or before this date
 * - tags: Comma-separated list of tag names
 * - search: Text search in title, details, and organizer
 */
router.get('/events', async (req: Request, res: Response) => {
  try {
    const { from_date, to_date, tags, search } = req.query;

    // Build query
    const query: any = {};

    // Date filtering
    if (from_date) {
      query.date = { $gte: new Date(from_date as string) };
    }

    if (to_date) {
      const toDate = new Date(to_date as string);
      // Check end_time if it exists, otherwise check date
      query.$or = [
        { end_time: { $exists: true, $lte: toDate } },
        { end_time: { $exists: false }, date: { $lte: toDate } }
      ];
    }

    // Tag filtering
    if (tags) {
      const tagArray = (tags as string).split(',').map(t => t.trim());
      query['tags.name'] = { $in: tagArray };
    }

    // Text search
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { title: searchRegex },
        { details: searchRegex },
        { organizer: searchRegex },
      ];
    }

    // Fetch events
    const events = await EventModel.find(query)
      .sort({ date: 1 }) // Sort by date ascending
      .lean();

    // Convert MongoDB Dates to ISO strings for frontend
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
 * Get a single event by MongoDB ID
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

    // Convert MongoDB Dates to ISO strings
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
 * GET /api/events/sync/status
 * Get DormSpam sync service status (for debugging)
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
 * Manually trigger a sync (for testing/debugging)
 * Requires admin authentication in production!
 */
router.post('/events/sync/manual', async (req: Request, res: Response) => {
  try {
    // TODO: Add admin authentication check
    // if (!req.user?.isAdmin) {
    //   return res.status(403).json({ error: 'Forbidden' });
    // }

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

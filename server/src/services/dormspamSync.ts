import EventModel from '../models/event';
import axios from 'axios';

const DORMSPAM_API_URL = process.env['DORMSPAM_API_URL'] || 'https://dormspam-api.example.com/api/events';
const POLL_INTERVAL = 30000; // 30 seconds (2 times per minute)
const ENABLE_SYNC = process.env['ENABLE_DORMSPAM_SYNC'] === 'true';

interface DormSpamEvent {
  id: number;
  source?: string;
  title: string;
  organizer: string;
  organizer_email: string;
  contact_email: string;
  date: string;
  location: string;
  recievedDate: string;
  last_modified: string;
  end_time?: string;
  duration?: number;
  details?: string;
  fromEmailId?: string;
  tags?: Array<{ name: string }>;
}

interface DormSpamResponse {
  status: string;
  total_events: number;
  returned: number;
  data: DormSpamEvent[];
}

class DormSpamSyncService {
  private isRunning: boolean = false;
  private lastSyncTimestamp: string | null = null;
  private pollInterval: NodeJS.Timeout | null = null;

  async start() {
    if (!ENABLE_SYNC) {
      console.log('DormSpam sync disabled (set ENABLE_DORMSPAM_SYNC=true to enable)');
      return;
    }

    if (this.isRunning) {
      console.log('DormSpam sync service already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting DormSpam sync service...');
    console.log(`Polling ${DORMSPAM_API_URL} every ${POLL_INTERVAL / 1000} seconds`);

    // Initial full sync
    await this.syncEvents();

    // Set up periodic polling
    this.pollInterval = setInterval(async () => {
      await this.syncEvents();
    }, POLL_INTERVAL);
  }

  async syncEvents() {
    try {
      const now = new Date().toISOString();
      console.log(`[${now}] Polling DormSpam API...`);

      // Build query params
      const params: any = {};
      if (this.lastSyncTimestamp) {
        params.last_updated = this.lastSyncTimestamp;
        console.log(`Fetching events updated after: ${this.lastSyncTimestamp}`);
      } else {
        console.log('Fetching all events (initial sync)');
      }

      // Call DormSpam API
      const response = await axios.get<DormSpamResponse>(DORMSPAM_API_URL, {
        params,
        timeout: 10000, // 10 second timeout
      });

      const { status, returned, data } = response.data;

      if (status !== 'success') {
        console.error('DormSpam API returned error status:', status);
        return;
      }

      console.log(`Received ${returned} events from DormSpam`);

      if (returned === 0) {
        console.log('No new events to sync');
        return;
      }

      // Process each event
      let successCount = 0;
      let errorCount = 0;

      for (const dormspamEvent of data) {
        try {
          await this.upsertEvent(dormspamEvent);
          successCount++;
        } catch (error) {
          console.error(`Failed to upsert event ${dormspamEvent.id}:`, error);
          errorCount++;
        }
      }

      console.log(`Sync completed: ${successCount} succeeded, ${errorCount} failed`);

      // Update last sync timestamp to the most recent last_modified
      if (data.length > 0 && data[0]) {
        const latestTimestamp = data.reduce((latest, event) => {
          return new Date(event.last_modified) > new Date(latest)
            ? event.last_modified
            : latest;
        }, data[0].last_modified);

        this.lastSyncTimestamp = latestTimestamp;
        console.log(`Updated last sync timestamp to: ${this.lastSyncTimestamp}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          console.error('Cannot connect to DormSpam API - is it running?');
        } else if (error.response) {
          console.error('DormSpam API error:', error.response.status, error.response.data);
        } else {
          console.error('DormSpam API request failed:', error.message);
        }
      } else {
        console.error('Sync error:', error);
      }
    }
  }

  private async upsertEvent(dormspamEvent: DormSpamEvent) {
    try {
      // Use upsert to either create or update
      const result = await EventModel.findOneAndUpdate(
        { dormspamId: dormspamEvent.id }, // Find by DormSpam ID
        {
          // Required fields
          title: dormspamEvent.title,
          organizer: dormspamEvent.organizer,
          organizer_email: dormspamEvent.organizer_email,
          contact_email: dormspamEvent.contact_email,
          date: new Date(dormspamEvent.date),
          location: dormspamEvent.location,
          recievedDate: new Date(dormspamEvent.recievedDate),
          last_modified: new Date(dormspamEvent.last_modified),

          // Optional fields - only set if provided
          ...(dormspamEvent.source && { source: dormspamEvent.source }),
          ...(dormspamEvent.end_time && { end_time: new Date(dormspamEvent.end_time) }),
          ...(dormspamEvent.duration && { duration: dormspamEvent.duration }),
          ...(dormspamEvent.details && { details: dormspamEvent.details }),
          ...(dormspamEvent.fromEmailId && { fromEmailId: dormspamEvent.fromEmailId }),
          ...(dormspamEvent.tags && { tags: dormspamEvent.tags }),

          // Track DormSpam ID
          dormspamId: dormspamEvent.id,
        },
        {
          upsert: true, // Create if doesn't exist
          new: true, // Return updated document
          setDefaultsOnInsert: true,
        }
      );

      console.log(`✓ Upserted: ${dormspamEvent.title} (DormSpam ID: ${dormspamEvent.id}, MongoDB ID: ${result._id})`);
    } catch (error) {
      console.error(`✗ Failed to upsert event ${dormspamEvent.id}:`, error);
      throw error;
    }
  }

  stop() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.isRunning = false;
    console.log('DormSpam sync service stopped');
  }

  // Manual sync trigger (useful for testing)
  async manualSync() {
    console.log('Triggering manual sync...');
    await this.syncEvents();
  }

  // Get sync status
  getStatus() {
    return {
      isRunning: this.isRunning,
      enabled: ENABLE_SYNC,
      lastSyncTimestamp: this.lastSyncTimestamp,
      pollInterval: POLL_INTERVAL,
      apiUrl: DORMSPAM_API_URL,
    };
  }
}

// Export singleton instance
export const dormspamSyncService = new DormSpamSyncService();

import axios from 'axios';
import EventModel from '../models/event';

class DormspamSyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly SYNC_INTERVAL_MS = 30000; // 30 seconds
  private readonly DORMSPAM_API_URL = process.env['DORMSPAM_API_URL'];
  private readonly DORMSPAM_API_KEY = process.env['DORMSPAM_API_KEY'];
  private lastSyncTime: Date | null = null;
  private lastSyncStatus: 'success' | 'error' | 'idle' = 'idle';
  private lastError: string | null = null;

  async syncEvents() {
    try {
      console.log('Fetching events from Dormspam API...');

      if (!this.DORMSPAM_API_URL) {
        throw new Error('DORMSPAM_API_URL not configured');
      }

      // Include API key in request header
      const response = await axios.get(this.DORMSPAM_API_URL, {
        headers: this.DORMSPAM_API_KEY ? {
          'Authorization': `Bearer ${this.DORMSPAM_API_KEY}`
        } : {}
      });

      // API returns { events: [...], count: N }
      const events = response.data.events || response.data;

      if (!Array.isArray(events)) {
        console.error('Expected array but got:', typeof events);
        throw new Error('Invalid response format from Dormspam API');
      }

      for (const event of events) {
        // Upsert each event (update if exists, insert if new)
        await EventModel.findOneAndUpdate(
          { id: event.id }, // Match by id
          {
            id: event.id,
            title: event.title,
            organizer: event.organizer,
            date: event.date,
            location: event.location,
            duration: event.duration,
            recievedDate: event.recievedDate,
            last_modified: new Date(),
            source: event.source || 'DORMSPAM',
            contact_email: event.contact_email,
            organizer_email: event.contact_email,
            details: event.details || event.text,
            fromEmailId: event.fromEmailId,
            tags: event.tags || [],
            saveCount: event.saveCount || 0,
          },
          { upsert: true, new: true } // Create if doesn't exist
        );
      }

      this.lastSyncTime = new Date();
      this.lastSyncStatus = 'success';
      this.lastError = null;
      console.log(`Synced ${events.length} events from Dormspam`);
    } catch (error: any) {
      this.lastSyncStatus = 'error';
      this.lastError = error.message || 'Unknown error';
      console.error('Error syncing events from Dormspam:', error);
    }
  }

  startSync() {
    if (this.syncInterval) {
      console.log('Sync already running');
      return;
    }

    if (!this.DORMSPAM_API_URL) {
      console.log('DormSpam sync disabled (DORMSPAM_API_URL not set)');
      return;
    }

    console.log(`Starting Dormspam sync (every ${this.SYNC_INTERVAL_MS / 1000}s)`);

    // Sync immediately
    this.syncEvents();

    // Then sync every 30 seconds
    this.syncInterval = setInterval(() => {
      this.syncEvents();
    }, this.SYNC_INTERVAL_MS);
  }

  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Stopped Dormspam sync');
    }
  }

  getStatus() {
    return {
      enabled: !!this.DORMSPAM_API_URL,
      running: this.syncInterval !== null,
      lastSyncTime: this.lastSyncTime,
      lastSyncStatus: this.lastSyncStatus,
      lastError: this.lastError,
      syncIntervalSeconds: this.SYNC_INTERVAL_MS / 1000,
    };
  }

  async manualSync() {
    console.log('Manual sync triggered');
    await this.syncEvents();
  }
}

export const dormspamSyncService = new DormspamSyncService();

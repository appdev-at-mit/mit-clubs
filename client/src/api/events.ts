import { get, post, del } from "../utilities";
import { Event } from "../types";
import { getMockEvents, getMockEventStats, createMockEvent } from "./mock-events";

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK === 'true';

/**
 * Simulate API delay for mock data
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Mock saved event IDs (stored in memory during development)
 */
let mockSavedEventIds: string[] = [];

/**
 * Mock event save counts (stored in memory during development)
 */
let mockEventSaveCounts: Map<string, number> = new Map();

/**
 * Get events with optional filtering
 */
export async function getEvents(params?: {
  from_date?: string;
  to_date?: string;
  tags?: string;
  search?: string;
}): Promise<Event[]> {
  if (USE_MOCK_DATA) {
    await delay(300);
    let events = getMockEvents();

    // Apply mock save counts
    events = events.map(event => {
      const eventKey = event._id || event.title;
      const saveCount = mockEventSaveCounts.get(eventKey) ?? event.saveCount ?? 0;
      return { ...event, saveCount };
    });

    // Apply filters to mock data
    if (params?.from_date) {
      events = events.filter(e => new Date(e.date) >= new Date(params.from_date!));
    }

    if (params?.to_date) {
      events = events.filter(e => {
        // If event has end_time, use it; otherwise use date
        const endDate = e.end_time ? new Date(e.end_time) : new Date(e.date);
        return endDate <= new Date(params.to_date!);
      });
    }

    if (params?.tags) {
      const tagArray = params.tags.split(',');
      events = events.filter(e => {
        // Only filter by tags if event has tags
        if (!e.tags || e.tags.length === 0) return false;
        return e.tags.some(tag => tagArray.includes(tag.name));
      });
    }

    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      events = events.filter(e => {
        const titleMatch = e.title.toLowerCase().includes(searchLower);
        const detailsMatch = e.details?.toLowerCase().includes(searchLower) || false;
        const organizerMatch = e.organizer.toLowerCase().includes(searchLower);
        return titleMatch || detailsMatch || organizerMatch;
      });
    }

    // Return events as-is from mock data
    return events;
  }

  // Build query string for real API
  const queryParams = new URLSearchParams();
  if (params?.from_date) queryParams.append('from_date', params.from_date);
  if (params?.to_date) queryParams.append('to_date', params.to_date);
  if (params?.tags) queryParams.append('tags', params.tags);
  if (params?.search) queryParams.append('search', params.search);

  const queryString = queryParams.toString();
  const url = queryString ? `/api/events?${queryString}` : '/api/events';

  const response = await get(url);
  // Handle the API response format: {status: "success", data: [...]}
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data || [];
  }
  // If it's already an array, return it
  if (Array.isArray(response)) {
    return response;
  }
  // Fallback
  console.error('Unexpected API response format:', response);
  return [];
}

/**
 * Get a single event by ID (using title as identifier for mock data)
 */
export async function getEvent(eventId: string): Promise<Event> {
  if (USE_MOCK_DATA) {
    await delay(200);
    const mockEvents = getMockEvents();
    // Try to find by _id (MongoDB) or by title (mock fallback)
    const event = mockEvents.find(e =>
      e._id === eventId ||
      e.title === eventId ||
      e.title.toLowerCase().replace(/\s+/g, '-') === eventId
    );

    if (!event) {
      throw new Error(`Event with ID ${eventId} not found`);
    }

    // Apply mock save count
    const eventKey = event._id || event.title;
    const saveCount = mockEventSaveCounts.get(eventKey) ?? event.saveCount ?? 0;
    return { ...event, saveCount };
  }

  const response = await get(`/api/events/${eventId}`);
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data;
  }
  return response;
}

/**
 * Save an event (register for it)
 */
export async function saveEvent(eventId: string): Promise<Event> {
  if (USE_MOCK_DATA) {
    await delay(150);

    // Add to mock saved events
    if (!mockSavedEventIds.includes(eventId)) {
      mockSavedEventIds.push(eventId);

      // Increment save count
      const currentCount = mockEventSaveCounts.get(eventId) ?? 0;
      mockEventSaveCounts.set(eventId, currentCount + 1);
    }

    // Return the updated event
    return await getEvent(eventId);
  }

  return post("/api/save-event", { event_id: eventId });
}

/**
 * Unsave an event (unregister from it)
 */
export async function unsaveEvent(eventId: string): Promise<Event> {
  if (USE_MOCK_DATA) {
    await delay(150);

    // Remove from mock saved events
    if (mockSavedEventIds.includes(eventId)) {
      mockSavedEventIds = mockSavedEventIds.filter(id => id !== eventId);

      // Decrement save count
      const currentCount = mockEventSaveCounts.get(eventId) ?? 0;
      mockEventSaveCounts.set(eventId, Math.max(currentCount - 1, 0));
    }

    // Return the updated event
    return await getEvent(eventId);
  }

  return del(`/api/unsave-event/${eventId}`);
}

/**
 * Get all saved events for the current user
 */
export async function getSavedEvents(): Promise<Event[]> {
  if (USE_MOCK_DATA) {
    await delay(250);
    const allEvents = getMockEvents();
    const savedEvents = allEvents.filter(event =>
      mockSavedEventIds.includes(event._id || '') ||
      mockSavedEventIds.includes(event.title)
    );

    // Apply mock save counts
    return savedEvents.map(event => {
      const eventKey = event._id || event.title;
      const saveCount = mockEventSaveCounts.get(eventKey) ?? event.saveCount ?? 0;
      return { ...event, saveCount };
    });
  }

  return get("/api/saved-events");
}

/**
 * Get just the IDs of saved events
 */
export async function getSavedEventIds(): Promise<string[]> {
  if (USE_MOCK_DATA) {
    await delay(100);
    return mockSavedEventIds;
  }

  const result = await get("/api/saved-event-ids");

  // Handle different response formats
  if (Array.isArray(result)) {
    // If it's an array of objects with event_id property
    if (result.length > 0 && typeof result[0] === 'object' && 'event_id' in result[0]) {
      return result.map(item => item.event_id);
    }
    // If it's already an array of strings
    if (result.length > 0 && typeof result[0] === 'string') {
      return result;
    }
    // Empty array
    return [];
  }

  // Fallback
  console.error('Unexpected getSavedEventIds response format:', result);
  return [];
}

// Development helpers (only work in mock mode)
export const devHelpers = USE_MOCK_DATA ? {
  getStats: getMockEventStats,
  resetSavedEvents: () => {
    mockSavedEventIds = [];
    mockEventSaveCounts.clear();
  },
  addEvent: createMockEvent,
  getSavedIds: () => [...mockSavedEventIds],
  getSaveCounts: () => new Map(mockEventSaveCounts),
} : null;

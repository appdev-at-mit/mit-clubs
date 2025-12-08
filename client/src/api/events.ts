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
 * Get events - fetches from MongoDB (synced from Dormspam by backend)
 */
export async function getEvents(): Promise<Event[]> {
  if (USE_MOCK_DATA) {
    await delay(300);
    return getMockEvents();
  }

  const response = await get('/api/events');

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
 * Get a single event by ID
 */
export async function getEvent(eventId: string): Promise<Event> {
  if (USE_MOCK_DATA) {
    await delay(200);
    const mockEvents = getMockEvents();
    const event = mockEvents.find(e =>
      e._id === eventId ||
      e.title === eventId ||
      e.title.toLowerCase().replace(/\s+/g, '-') === eventId
    );

    if (!event) {
      throw new Error(`Event with ID ${eventId} not found`);
    }

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
 * Save an event (bookmark it)
 */
export async function saveEvent(eventId: string): Promise<Event> {
  if (USE_MOCK_DATA) {
    await delay(150);

    if (!mockSavedEventIds.includes(eventId)) {
      mockSavedEventIds.push(eventId);
      const currentCount = mockEventSaveCounts.get(eventId) ?? 0;
      mockEventSaveCounts.set(eventId, currentCount + 1);
    }

    return await getEvent(eventId);
  }

  return post("/api/save-event", { event_id: eventId });
}

/**
 * Unsave an event (remove bookmark)
 */
export async function unsaveEvent(eventId: string): Promise<Event> {
  if (USE_MOCK_DATA) {
    await delay(150);

    if (mockSavedEventIds.includes(eventId)) {
      mockSavedEventIds = mockSavedEventIds.filter(id => id !== eventId);
      const currentCount = mockEventSaveCounts.get(eventId) ?? 0;
      mockEventSaveCounts.set(eventId, Math.max(currentCount - 1, 0));
    }

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

  if (Array.isArray(result)) {
    if (result.length > 0 && typeof result[0] === 'object' && 'event_id' in result[0]) {
      return result.map(item => item.event_id);
    }
    if (result.length > 0 && typeof result[0] === 'string') {
      return result;
    }
    return [];
  }

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

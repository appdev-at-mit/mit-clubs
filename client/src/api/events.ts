import { get, post, put, del } from "../utilities";
// define Event type!!!

/**
 * Save a event to the user's saved event list
 */
export async function saveEvent(eventId: string): Promise<Event> {
  return post("/api/save-event", { event_id: eventId });
}

/**
 * Remove a event from the user's saved events list
 */
export async function unsaveEvent(eventId: string): Promise<Event> {
  return del(`/api/unsave-event/${eventId}`);
}

/**
 * Get saved events for the current user
 */
export async function getSavedEvents(): Promise<Event[]> {
  return get("/api/saved-events");
}

/**
 * Get saved event IDs for the current user
 */
export async function getSavedEventIds(): Promise<{ event_id: string }[]> {
  return get("/api/saved-event-ids");
}
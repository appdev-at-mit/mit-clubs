import { Event } from "../types";

/**
 * Generate a date/time for testing (days from now)
 */
function generateDate(daysAhead: number, hour: number = 18, minute: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

/**
 * Generate end time from start time and duration
 */
function generateEndTime(startDate: string, durationMinutes: number): string {
  const date = new Date(startDate);
  date.setMinutes(date.getMinutes() + durationMinutes);
  return date.toISOString();
}

/**
 * Helper to format time for display (6:00 PM)
 */
export function formatTime(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Helper to extract date (YYYY-MM-DD)
 */
export function formatDate(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  return date.toISOString().split('T')[0];
}

const MOCK_EVENTS: Event[] = [
  {
    title: "Tech Talk: AI in Modern Development",
    organizer: "Computer Science Club",
    organizer_email: "csclub@mit.edu",
    contact_email: "csclub@mit.edu",
    date: "2025-12-06T18:00:00.000Z",          // this week
    location: "Engineering Building Room 301",
    recievedDate: "2025-11-28T18:00:00.000Z",
    last_modified: "2025-12-01T18:00:00.000Z",

    end_time: "2025-12-06T20:00:00.000Z",
    duration: 120,
    details: "Join us for an exciting discussion about the latest trends in AI.",
    tags: [{ name: "tech" }, { name: "ai" }, { name: "workshop" }],
  },

  {
    title: "Fall Networking Mixer",
    organizer: "Business Club",
    organizer_email: "business@mit.edu",
    contact_email: "business@mit.edu",
    date: "2025-11-10T17:30:00.000Z",          // still November
    location: "Student Union Ballroom",
    recievedDate: "2025-11-06T18:00:00.000Z",
    last_modified: "2025-11-10T17:30:00.000Z",

    source: "DORMSPAM",
    end_time: "2025-11-10T19:30:00.000Z",
    duration: 120,
    details: "Connect with fellow students and industry professionals.",
    fromEmailId: "<NETWORKING-FALL@mit.edu>",
    tags: [{ name: "networking" }, { name: "career" }, { name: "social" }],
  },

  {
    title: "Weekly Game Night",
    organizer: "Gaming Society",
    organizer_email: "gaming@mit.edu",
    contact_email: "gaming@mit.edu",
    date: "2025-12-02T19:00:00.000Z",          // yesterday
    location: "Recreation Center Game Room",
    recievedDate: "2025-11-30T18:00:00.000Z",
    last_modified: "2025-12-02T19:00:00.000Z",

    source: "DORMSPAM",
  },

  {
    title: "Environmental Cleanup Drive",
    organizer: "Green Initiative",
    organizer_email: "green@mit.edu",
    contact_email: "green@mit.edu",
    date: "2025-12-10T09:00:00.000Z",          // next week
    location: "Campus Quad (Meet at fountain)",
    recievedDate: "2025-11-25T18:00:00.000Z",
    last_modified: "2025-11-30T18:00:00.000Z",

    details: "Help make our campus greener!",
    fromEmailId: "<CLEANUP-2025@mit.edu>",
    tags: [{ name: "community-service" }, { name: "environment" }],
  },

  {
    title: "Intro to React Workshop",
    organizer: "Computer Science Club",
    organizer_email: "csclub@mit.edu",
    contact_email: "csclub@mit.edu",
    date: "2025-12-12T14:00:00.000Z",          // next week
    location: "Computer Lab B",
    recievedDate: "2025-11-27T18:00:00.000Z",
    last_modified: "2025-12-01T18:00:00.000Z",

    duration: 180,
    details: "Learn the basics of React.js in this hands-on workshop.",
    tags: [{ name: "tech" }, { name: "workshop" }],
  },

  {
    title: "Open Mic Night",
    organizer: "Arts & Performance Club",
    organizer_email: "arts@mit.edu",
    contact_email: "arts@mit.edu",
    date: "2025-12-15T20:00:00.000Z",
    location: "Campus Coffee House",
    recievedDate: "2025-11-23T18:00:00.000Z",
    last_modified: "2025-11-28T18:00:00.000Z",

    source: "DORMSPAM",
    end_time: "2025-12-15T23:00:00.000Z",
    duration: 180,
    details: "Showcase your talent—poetry, music, comedy and more!",
    fromEmailId: "<OPEN-MIC@mit.edu>",
  },

  {
    title: "Startup Pitch Competition",
    organizer: "Entrepreneurship Club",
    organizer_email: "entrepreneur@mit.edu",
    contact_email: "entrepreneur@mit.edu",
    date: "2025-12-18T16:00:00.000Z",
    location: "Innovation Hub Auditorium",
    recievedDate: "2025-11-21T18:00:00.000Z",
    last_modified: "2025-11-29T18:00:00.000Z",

    source: "DORMSPAM",
    end_time: "2025-12-18T19:00:00.000Z",
    duration: 180,
    tags: [
      { name: "entrepreneurship" },
      { name: "competition" },
      { name: "startup" },
    ],
  },

  {
    title: "Meditation & Mindfulness Session",
    organizer: "Wellness Club",
    organizer_email: "wellness@mit.edu",
    contact_email: "wellness@mit.edu",
    date: "2025-12-03T12:00:00.000Z",         // today
    location: "Wellness Center Room 202",
    recievedDate: "2025-12-01T18:00:00.000Z",
    last_modified: "2025-12-02T18:00:00.000Z",
  },

  {
    title: "HackMIT 2025: 24-Hour Hackathon",
    organizer: "HackMIT",
    organizer_email: "team@hackmit.org",
    contact_email: "team@hackmit.org",
    date: "2025-12-20T09:00:00.000Z",
    location: "Engineering Building",
    recievedDate: "2025-11-18T18:00:00.000Z",
    last_modified: "2025-11-28T18:00:00.000Z",

    source: "DORMSPAM",
    duration: 1440,
    details: "24-hour coding marathon!",
    tags: [{ name: "tech" }, { name: "coding" }, { name: "competition" }],
  },

  {
    title: "Career Fair Prep Workshop",
    organizer: "Business Club",
    organizer_email: "business@mit.edu",
    contact_email: "business@mit.edu",
    date: "2025-12-03T15:00:00.000Z",         // today
    location: "Career Center Main Room",
    recievedDate: "2025-11-29T18:00:00.000Z",
    last_modified: "2025-12-02T18:00:00.000Z",

    source: "DORMSPAM",
    details: "Learn how to network and perfect your elevator pitch.",
  },

  {
    title: "Study Abroad Info Session",
    organizer: "International Students Association",
    organizer_email: "isa@mit.edu",
    contact_email: "isa@mit.edu",
    date: "2025-12-11T18:30:00.000Z",
    location: "International House",
    recievedDate: "2025-11-26T18:00:00.000Z",
    last_modified: "2025-11-30T18:00:00.000Z",

    end_time: "2025-12-11T20:00:00.000Z",
    duration: 90,
    tags: [
      { name: "education" },
      { name: "international" },
      { name: "travel" },
    ],
  },

  {
    title: "Photography Walk",
    organizer: "Photography Club",
    organizer_email: "photo@mit.edu",
    contact_email: "photo@mit.edu",
    date: "2025-12-09T17:00:00.000Z",         // next week
    location: "Meet at Campus Center",
    recievedDate: "2025-11-28T18:00:00.000Z",
    last_modified: "2025-12-01T18:00:00.000Z",

    end_time: "2025-12-09T19:00:00.000Z",
    details: "Join us for a sunset photography walk!",
    fromEmailId: "<PHOTO-WALK@mit.edu>",
  },
];


/**
 * Get all mock events
 */
export function getMockEvents(): Event[] {
  return MOCK_EVENTS;
}

/**
 * Get statistics about mock events (for testing)
 */
export function getMockEventStats() {
  const now = new Date();
  return {
    total: MOCK_EVENTS.length,
    past: MOCK_EVENTS.filter(e => new Date(e.date) < now).length,
    upcoming: MOCK_EVENTS.filter(e => new Date(e.date) >= now).length,
    today: MOCK_EVENTS.filter(e => formatDate(e.date) === formatDate(now.toISOString())).length,
  };
}

/**
 * Create a new mock event (for testing)
 */
export function createMockEvent(eventData: Partial<Event>): Event {
  const now = new Date().toISOString();

  const newEvent: Event = {
    // required fields
    title: eventData.title || "New Event",
    organizer: eventData.organizer || "Unknown Organizer",
    organizer_email: eventData.organizer_email || "organizer@mit.edu",
    contact_email: eventData.contact_email || "contact@mit.edu",
    date: eventData.date || generateDate(1),
    location: eventData.location || "TBD",
    recievedDate: eventData.recievedDate || now,
    last_modified: now,

    // optional fields - only add if provided
    ...(eventData.source && { source: eventData.source }),
    ...(eventData.end_time && { end_time: eventData.end_time }),
    ...(eventData.duration && { duration: eventData.duration }),
    ...(eventData.details && { details: eventData.details }),
    ...(eventData.fromEmailId && { fromEmailId: eventData.fromEmailId }),
    ...(eventData.tags && { tags: eventData.tags }),
    ...(eventData.imageUrl && { imageUrl: eventData.imageUrl }),
  };

  MOCK_EVENTS.push(newEvent);
  return newEvent;
}

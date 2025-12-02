// SIMPLE MOCK EVENTS FOR FRONTEND DEVELOPMENT

export interface MockEvent {
  event_id: string;
  name: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  location: string;
  organizerId: string;
  organizerName: string;
  attendeeCount: number;
  maxAttendees?: number;
  imageUrl?: string;
  tags: string[];
  category: string;
  isRegistered?: boolean;
}

const mockEvents: MockEvent[] = [
  {
    event_id: "evt-001",
    name: "Tech Talk: AI in Modern Development",
    description: "Join us for an exciting discussion about the latest trends in AI and machine learning, and how they're shaping modern software development.",
    date: "2025-12-05",
    startTime: "6:00 PM",
    endTime: "8:00 PM",
    location: "Engineering Building Room 301",
    organizerId: "club-cs",
    organizerName: "Computer Science Club",
    attendeeCount: 45,
    maxAttendees: 60,
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
    tags: ["tech", "ai", "workshop", "career"],
    category: "Workshop",
    isRegistered: false
  },
  {
    event_id: "evt-002",
    name: "Fall Networking Mixer",
    description: "Connect with fellow students and industry professionals at our annual fall networking event. Food and refreshments provided!",
    date: "2025-11-08",
    startTime: "5:30 PM",
    endTime: "7:30 PM",
    location: "Student Union Ballroom",
    organizerId: "club-business",
    organizerName: "Business Club",
    attendeeCount: 78,
    maxAttendees: 100,
    imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800",
    tags: ["networking", "career", "social", "professional"],
    category: "Networking",
    isRegistered: true
  },
  {
    event_id: "evt-003",
    name: "Weekly Game Night",
    description: "Bring your competitive spirit! Board games, video games, and lots of fun. Beginners welcome.",
    date: "2025-11-02",
    startTime: "7:00 PM",
    endTime: "10:00 PM",
    location: "Recreation Center Game Room",
    organizerId: "club-gaming",
    organizerName: "Gaming Society",
    attendeeCount: 32,
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800",
    tags: ["gaming", "social", "recurring", "entertainment"],
    category: "Social",
    isRegistered: false
  },
  {
    event_id: "evt-004",
    name: "Environmental Cleanup Drive",
    description: "Help make our campus greener! Join us for a morning of community service and environmental action.",
    date: "2025-11-10",
    startTime: "9:00 AM",
    endTime: "12:00 PM",
    location: "Campus Quad (Meet at fountain)",
    organizerId: "club-green",
    organizerName: "Green Initiative",
    attendeeCount: 23,
    maxAttendees: 50,
    imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800",
    tags: ["community-service", "environment", "outdoor", "volunteer"],
    category: "Community Service",
    isRegistered: true
  },
  {
    event_id: "evt-005",
    name: "Intro to React Workshop",
    description: "Learn the basics of React.js in this hands-on workshop. Bring your laptop! No prior React experience needed.",
    date: "2025-11-12",
    startTime: "2:00 PM",
    endTime: "5:00 PM",
    location: "Computer Lab B",
    organizerId: "club-cs",
    organizerName: "Computer Science Club",
    attendeeCount: 28,
    maxAttendees: 35,
    imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
    tags: ["tech", "workshop", "coding", "web-development"],
    category: "Workshop",
    isRegistered: false
  },
  {
    event_id: "evt-006",
    name: "Open Mic Night",
    description: "Showcase your talent or just enjoy the show! Poetry, music, comedy - all welcome.",
    date: "2025-11-15",
    startTime: "8:00 PM",
    endTime: "11:00 PM",
    location: "Campus Coffee House",
    organizerId: "club-arts",
    organizerName: "Arts & Performance Club",
    attendeeCount: 56,
    maxAttendees: 80,
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
    tags: ["arts", "performance", "social", "music"],
    category: "Arts & Culture",
    isRegistered: false
  },
  {
    event_id: "evt-007",
    name: "Startup Pitch Competition",
    description: "Watch student entrepreneurs pitch their innovative ideas. $5000 in prizes!",
    date: "2025-11-18",
    startTime: "4:00 PM",
    endTime: "7:00 PM",
    location: "Innovation Hub Auditorium",
    organizerId: "club-entrepreneur",
    organizerName: "Entrepreneurship Club",
    attendeeCount: 92,
    maxAttendees: 150,
    imageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800",
    tags: ["entrepreneurship", "competition", "career", "startup"],
    category: "Competition",
    isRegistered: true
  },
  {
    event_id: "evt-008",
    name: "Meditation & Mindfulness Session",
    description: "De-stress with guided meditation and mindfulness exercises. All levels welcome.",
    date: "2025-11-06",
    startTime: "12:00 PM",
    endTime: "1:00 PM",
    location: "Wellness Center Room 202",
    organizerId: "club-wellness",
    organizerName: "Wellness Club",
    attendeeCount: 15,
    maxAttendees: 25,
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
    tags: ["wellness", "health", "relaxation", "mental-health"],
    category: "Wellness",
    isRegistered: false
  },
  {
    event_id: "evt-009",
    name: "Hackathon 2025",
    description: "24-hour coding marathon! Build something amazing, win prizes, and connect with fellow developers.",
    date: "2025-11-20",
    startTime: "9:00 AM",
    endTime: "9:00 AM",
    location: "Engineering Building",
    organizerId: "club-cs",
    organizerName: "Computer Science Club",
    attendeeCount: 67,
    maxAttendees: 100,
    imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
    tags: ["tech", "coding", "competition", "hackathon"],
    category: "Competition",
    isRegistered: false
  },
  {
    event_id: "evt-010",
    name: "Career Fair Prep Workshop",
    description: "Get ready for the upcoming career fair! Learn how to network effectively and perfect your elevator pitch.",
    date: "2025-11-03",
    startTime: "3:00 PM",
    endTime: "4:30 PM",
    location: "Career Center Main Room",
    organizerId: "club-business",
    organizerName: "Business Club",
    attendeeCount: 41,
    maxAttendees: 60,
    imageUrl: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800",
    tags: ["career", "networking", "workshop", "professional"],
    category: "Workshop",
    isRegistered: true
  },
  {
    event_id: "evt-011",
    name: "Study Abroad Info Session",
    description: "Interested in studying abroad? Learn about programs, scholarships, and application processes.",
    date: "2025-11-13",
    startTime: "6:30 PM",
    endTime: "8:00 PM",
    location: "International House",
    organizerId: "club-international",
    organizerName: "International Students Association",
    attendeeCount: 38,
    imageUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800",
    tags: ["education", "international", "travel", "workshop"],
    category: "Educational",
    isRegistered: false
  },
  {
    event_id: "evt-012",
    name: "Photography Walk",
    description: "Join us for a sunset photography walk around campus! All skill levels and camera types welcome.",
    date: "2025-11-09",
    startTime: "5:00 PM",
    endTime: "7:00 PM",
    location: "Meet at Campus Center",
    organizerId: "club-photo",
    organizerName: "Photography Club",
    attendeeCount: 19,
    maxAttendees: 30,
    imageUrl: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800",
    tags: ["arts", "outdoor", "social", "photography"],
    category: "Arts & Culture",
    isRegistered: false
  }
];

/**
 * Get all mock events
 * Use this in your components until the backend is ready!
 */
export function getMockEvents(): MockEvent[] {
  return mockEvents;
}

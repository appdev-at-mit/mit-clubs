export type User = {
  _id: string;
  name: string;
  email: string;
  googleId: string;
  isAdmin: boolean;
  savedClubs?: UserSavedClub[];
  memberships?: UserClubMembership[];
};

export type UserSavedClub = {
  club_id: string;
  saved_date: Date;
};

export type UserClubMembership = {
  club_id: string;
  role: string;
  permissions: "Owner" | "Officer" | "Member";
  joined_date: Date;
};

export type Club = {
  _id: string;
  club_id: string;
  name: string;
  is_active: boolean;
  is_accepting?: boolean;
  recruiting_cycle?: string[];
  membership_process?: string[];
  tags?: string[];
  email?: string;
  instagram?: string;
  linkedin?: string;
  website?: string;
  mailing_list?: string;
  mission?: string;
  image_url?: string;
  questions?: ClubQuestion[];
  members?: ClubMember[];
  saveCount?: number;
  savedByUsers?: string[];
  created_at?: Date;
  updated_at?: Date;
};

export type ClubQuestion = {
  question: string;
  answer?: string;
  required: boolean;
};

export type ClubMember = {
  id: string;
  user_id: string;
  email: string;
  name: string;
  role: string;
  permissions: "Owner" | "Officer" | "Member";
  joined_date: Date;
};

export interface Event {
  // required fields
  title: string;
  organizer: string;
  organizer_email: string;
  contact_email: string;
  date: string; // ISO 8601
  location: string;
  recievedDate: string; // ISO 8601
  last_modified: string; // ISO 8601

  // optional fields
  source?: string;
  end_time?: string; // ISO 8601
  duration?: number;
  details?: string;
  fromEmailId?: string;
  tags?: Array<{ name: string }>;

  // app-specific fields (not from DormSpam, added by our app)
  attendeeCount?: number;
  maxAttendees?: number;

  // mongoDB fields (when using real backend)
  _id?: string;
  dormspamId?: number;
}

export type MockEvent = {
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
};

export type SavedClub = {
  _id: string;
  user_id: string;
  club_id: string;
  created_at: Date;
};

export type AuthContextType = {
  userId?: string;
  userName?: string;
  userEmail?: string;
  isAdmin: boolean;
  authChecked: boolean;
  handleLogout: () => void;
};

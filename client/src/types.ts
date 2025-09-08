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
  recruiting_cycle?: "Fall" | "Spring" | "Year-round" | string | string[];
  membership_process?: string;
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

export type Event = {
  _id: string;
  event_id: string;
  club_id: string;
  title: string;
  description: string;
  date: Date;
  end_date?: Date;
  location: string;
  is_recruiting_event: boolean;
  created_at: Date;
  updated_at: Date;
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
  handleLogin: (credentialResponse: any) => void;
  handleLogout: () => void;
};

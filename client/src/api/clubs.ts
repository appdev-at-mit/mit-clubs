import { get, post, put, del } from "../utilities";
import { Club, ClubMember } from "../types";

/**
 * Save a club to the user's saved clubs list
 */
export const saveClub = async (clubId: string): Promise<Club> => {
  return post("/api/save-club", { club_id: clubId });
};

/**
 * Remove a club from the user's saved clubs list
 */
export const unsaveClub = async (clubId: string): Promise<Club> => {
  return del(`/api/unsave-club/${clubId}`);
};

/**
 * Get all clubs
 */
export const getAllClubs = async (): Promise<Club[]> => {
  return get("/api/clubs");
};

/**
 * Get all clubs (alternative function name for compatibility)
 */
export const getClubs = async (): Promise<Club[]> => {
  return get("/api/clubs");
};

/**
 * Get saved clubs for the current user
 */
export const getSavedClubs = async (): Promise<Club[]> => {
  return get("/api/saved-clubs");
};

/**
 * Get saved club IDs for the current user
 */
export const getSavedClubIds = async (): Promise<{ club_id: string }[]> => {
  return get("/api/saved-club-ids");
};

/**
 * Update club details
 */
export const updateClub = async (
  clubData: Partial<Club>
): Promise<{ message: string; club: Club }> => {
  return put("/api/club", clubData);
};

/**
 * Get a club by ID (alternative function name for compatibility)
 */
export const getID = async (clubId: string): Promise<Club> => {
  return get(`/api/clubs/${clubId}`);
};

// Member Management Functions
/**
 * Get club members
 */
export const getClubMembers = async (clubId: string): Promise<ClubMember[]> => {
  return get(`/api/clubs/${clubId}/members`);
};

/**
 * Add a club member
 */
export const addClubMember = async (
  clubId: string,
  memberData: any
): Promise<any> => {
  return post(`/api/clubs/${clubId}/members`, memberData);
};

/**
 * Update a club member
 */
export const updateClubMember = async (
  clubId: string,
  memberId: string,
  memberData: any
): Promise<any> => {
  return put(`/api/clubs/${clubId}/members/${memberId}`, memberData);
};

/**
 * Remove a club member
 */
export const removeClubMember = async (
  clubId: string,
  memberId: string
): Promise<any> => {
  return del(`/api/clubs/${clubId}/members/${memberId}`);
};

/**
 * Get user memberships
 */
export const getUserMemberships = async (): Promise<{ data: Club[] }> => {
  const result = await get("/api/users/clubs");
  return { data: result };
};

/**
 * Get all user data including memberships and saved clubs
 */
export const getUserData = async (): Promise<{
  data: { savedClubs: Club[]; memberClubs: Club[] };
}> => {
  const result = await get("/api/users/data");
  return { data: result };
};

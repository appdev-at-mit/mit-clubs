import axios from "axios";
import { API_BASE_URL } from "../config";
// sends cookies back to server
axios.defaults.withCredentials = true;

export async function getClubs() {
  return await axios.get(`${API_BASE_URL}/api/clubs`);
}

export async function getID(id) {
  return await axios.get(`${API_BASE_URL}/api/clubs/${id}`);
}

export async function updateClub(clubId, updateData) {
  return await axios.put(`${API_BASE_URL}/api/club`, {
    club_id: clubId,
    ...updateData,
  });
}

export async function saveClub(clubId) {
  return await axios.post(`${API_BASE_URL}/api/save-club`, { club_id: clubId });
}

export async function getSavedClubs() {
  return await axios.get(`${API_BASE_URL}/api/saved-clubs`, {
    withCredentials: true,
  });
}

export async function getSavedClubIds() {
  return await axios.get(`${API_BASE_URL}/api/saved-club-ids`, {
    withCredentials: true,
  });
}

export async function unsaveClub(clubId) {
  return await axios.delete(`${API_BASE_URL}/api/unsave-club/${clubId}`, {
    withCredentials: true,
  });
}

// Member Management Functions
export async function getClubMembers(clubId) {
  return await axios.get(`${API_BASE_URL}/api/clubs/${clubId}/members`);
}

export async function addClubMember(clubId, memberData) {
  return await axios.post(
    `${API_BASE_URL}/api/clubs/${clubId}/members`,
    memberData
  );
}

export async function updateClubMember(clubId, memberId, memberData) {
  return await axios.put(
    `${API_BASE_URL}/api/clubs/${clubId}/members/${memberId}`,
    memberData
  );
}

export async function removeClubMember(clubId, memberId) {
  return await axios.delete(
    `${API_BASE_URL}/api/clubs/${clubId}/members/${memberId}`
  );
}

// get user memberships
export async function getUserMemberships() {
  return await axios.get(`${API_BASE_URL}/api/users/clubs`, { withCredentials: true });
}

// get all user data including memberships and saved clubs
export async function getUserData() {
  return await axios.get(`${API_BASE_URL}/api/users/data`, { withCredentials: true });
}

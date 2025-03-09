import axios from "axios";
// sends cookies back to server
axios.defaults.withCredentials = true;

export async function getClubs() {
  return await axios.get("http://localhost:3000/api/clubs");
}

export async function getID(id) {
  return await axios.get(`http://localhost:3000/api/clubs/${id}`);
}

export async function saveClub(clubId) {
  return await axios.post("http://localhost:3000/api/save-club", { club_id: clubId });
}

export async function getSavedClubs() {
  return await axios.get("http://localhost:3000/api/saved-clubs", {
    withCredentials: true,
  });
}

export async function unsaveClub(clubId) {
  return await axios.delete(`http://localhost:3000/api/unsave-club/${clubId}`, {
      withCredentials: true,
  });
}
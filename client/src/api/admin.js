import axios from "axios";
import { API_BASE_URL } from "../config";
// sends cookies back to server
axios.defaults.withCredentials = true;

// check if current user is an admin using User model's isAdmin field
export async function checkIsAdmin() {
  return await axios.get(`${API_BASE_URL}/api/admin/check`);
}
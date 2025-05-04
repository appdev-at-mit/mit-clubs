import axios from "axios";
// sends cookies back to server
axios.defaults.withCredentials = true;

// check if current user is an admin using User model's isAdmin field
export async function checkIsAdmin() {
  return await axios.get("http://localhost:3000/api/admin/check");
}
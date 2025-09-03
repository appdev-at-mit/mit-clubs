import { get } from "../utilities";

/**
 * Check if the current user is an admin
 */
export async function checkIsAdmin() {
  return await get("/api/checkAdmin");
}

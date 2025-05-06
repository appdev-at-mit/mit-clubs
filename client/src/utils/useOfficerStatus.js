// custom hook to check if user is an officer
import { useState, useEffect } from "react";

export default function useOfficerStatus(clubId) {
  const [isOfficer, setIsOfficer] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clubId) {
      setLoading(false);
      return;
    }

    // check officer status
    fetch(`/api/is-officer/${clubId}`)
      .then((res) => res.json())
      .then((data) => {
        setIsOfficer(data.isOfficer);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error checking officer status:", err);
        setLoading(false);
      });

    // check admin status
    fetch("/api/whoami")
      .then((res) => res.json())
      .then((data) => {
        setIsAdmin(!!data.isAdmin);
      })
      .catch((err) => console.error("Error checking admin status:", err));
  }, [clubId]);

  return { isOfficer, isAdmin, hasEditPermission: isOfficer || isAdmin, loading };
}

import React, { useEffect, useState } from "react";
import { getSavedClubs } from "../../api/clubs.js";
import ClubCard from "../modules/ClubCard";
import Navbar from "../modules/Navbar";

function SavedClubs() {
  const [savedClubs, setSavedClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSavedClubs() {
      try {
        const response = await getSavedClubs();
        setSavedClubs(response.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch saved clubs.");
      } finally {
        setLoading(false);
      }
    }

    fetchSavedClubs();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error)
    return (
        <p className="text-red-500 text-bold text-3xl p-10">{error}</p>
    );

  return (
    <>
      <Navbar />
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4 px-3">My Saved Clubs</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-3">
          {savedClubs.map((club) => (
            <ClubCard
              key={club.club_id}
              id={club.club_id}
              name={club.name}
              type={club.type}
              isAccepting={club.is_accepting}
              description={club.mission}
              pictureUrl={club.picture_url}
              recruitmentProcess={club.membership_process}
              isSavedInitially={true}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default SavedClubs;

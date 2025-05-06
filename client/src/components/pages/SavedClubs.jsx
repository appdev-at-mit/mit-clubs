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
        console.error("Error fetching saved clubs:", err);
        if (err.response?.status === 401) {
          setError("Please log in to view your saved clubs");
        } else {
          setError(err.response?.data?.error || "Failed to fetch saved clubs");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchSavedClubs();
  }, []);

  if (loading) return (
    <>
      <Navbar />
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-cyan-600">Loading...</p>
      </div>
    </>
  );

  if (error) return (
    <>
      <Navbar />
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-red-500 font-semibold">{error}</p>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">My Saved Clubs</h1>
        
        {savedClubs.length === 0 ? (
          <div className="bg-gray-100 p-8 rounded-lg text-center">
            <p className="text-xl text-gray-600">You haven't saved any clubs yet.</p>
            <p className="mt-2 text-gray-500">
              Browse clubs and click the bookmark icon to save them for later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedClubs.map((club) => (
              <ClubCard
                key={club.club_id}
                id={club.club_id}
                name={club.name}
                tags={club.tags}
                isAccepting={club.is_accepting}
                description={club.mission}
                image_url={club.image_url}
                recruitmentProcess={club.membership_process}
                isSavedInitially={true}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default SavedClubs;

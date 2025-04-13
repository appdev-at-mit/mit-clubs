import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getID } from "../../api/clubs";
import useOfficerStatus from "../../utils/useOfficerStatus";
import ClubOfficers from "../../components/modules/ClubOfficers";

const ClubDetails = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const {
    hasEditPermission,
    isOfficer,
    isAdmin,
    loading: permissionsLoading,
  } = useOfficerStatus(clubId);

  useEffect(() => {
    const fetchClubDetails = async () => {
      try {
        const response = await getID(clubId);
        setClub(response.data);
        setEditData(response.data); // Initialize edit data
        setLoading(false);
      } catch (error) {
        console.error("Error fetching club details:", error);
        setLoading(false);
      }
    };

    fetchClubDetails();
  }, [clubId]);

  const updateClub = async () => {
    try {
      const response = await fetch("/api/club", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ club_id: clubId, ...editData }),
      });
      const data = await response.json();
      if (response.ok) {
        // Refresh club data
        const updatedClub = await getID(clubId);
        setClub(updatedClub.data);
        setIsEditing(false);
      } else {
        console.error("Error updating club:", data.error);
      }
    } catch (error) {
      console.error("Error updating club:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData({
      ...editData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  if (loading) {
    return <p className="text-center text-xl mt-10 text-cyan-600">Loading...</p>;
  }

  if (!club) {
    return <p className="text-center text-xl mt-10 text-red-500">Club not found.</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8">
      <div className="w-full max-w-4xl">
        {/* Back Button */}
        <button
          className="mb-6 px-6 py-3 bg-white text-black text-md font-medium rounded-full border hover:bg-cyan-600 transition-all"
          onClick={() => navigate("/")}
        >
          ← Back to All Clubs
        </button>

        {/* Edit Controls */}
        {hasEditPermission && !permissionsLoading && !isEditing && (
          <button
            className="mb-6 ml-4 px-6 py-3 bg-cyan-600 text-white text-md font-medium rounded-full hover:bg-cyan-700 transition-all"
            onClick={() => setIsEditing(true)}
          >
            Edit Club Details
          </button>
        )}

        <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
          {/* Club Header */}
          <div className="bg-cyan-100 text-black text-center py-8 px-6">
            {isEditing ? (
              <>
                <input
                  type="text"
                  name="name"
                  value={editData.name}
                  onChange={handleChange}
                  className="text-4xl font-extrabold bg-white p-2 rounded w-full mb-2"
                />
                <textarea
                  name="mission"
                  value={editData.mission}
                  onChange={handleChange}
                  className="text-lg mt-2 bg-white p-2 rounded w-full"
                  rows="3"
                ></textarea>
              </>
            ) : (
              <>
                <h1 className="text-4xl font-extrabold">{club.name}</h1>
                <p className="text-lg mt-2">{club.mission}</p>
              </>
            )}
          </div>

          {/* Club Details */}
          <div className="p-8 space-y-6">
            {isEditing ? (
              // Edit Form
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">Type</label>
                  <input
                    type="text"
                    name="type"
                    value={editData.type}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Active</label>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={editData.is_active}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Yes
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Recruitment Cycle</label>
                  <input
                    type="text"
                    name="recruiting_cycle"
                    value={editData.recruiting_cycle}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Membership Process</label>
                  <input
                    type="text"
                    name="membership_process"
                    value={editData.membership_process}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Website</label>
                  <input
                    type="text"
                    name="website"
                    value={editData.website}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    className="px-6 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
                    onClick={updateClub}
                  >
                    Save Changes
                  </button>
                  <button
                    className="px-6 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <>
                <div>
                  <p className="text-lg text-gray-700">
                    <strong>Type:</strong> {club.type}
                  </p>
                </div>
                <div>
                  <p className="text-lg text-gray-700">
                    <strong>Active:</strong> {club.is_active ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <p className="text-lg text-gray-700">
                    <strong>Recruitment Cycle:</strong> {club.recruiting_cycle}
                  </p>
                </div>
                <div>
                  <p className="text-lg text-gray-700">
                    <strong>Membership Process:</strong> {club.membership_process}
                  </p>
                </div>
                <div>
                  <p className="text-lg text-gray-700">
                    <strong>Email:</strong>{" "}
                    <a href={`mailto:${club.email}`} className="text-cyan-600 hover:underline">
                      {club.email}
                    </a>
                  </p>
                </div>
                <div>
                  <p className="text-lg text-gray-700">
                    <strong>Website:</strong>{" "}
                    <a
                      href={club.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-600 hover:underline"
                    >
                      {club.website}
                    </a>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Club Officers Section */}
        <div className="mt-8 bg-white shadow-2xl rounded-lg overflow-hidden">
          <div className="p-8">
            <ClubOfficers clubId={clubId} isUserOfficer={isOfficer || isAdmin} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubDetails;

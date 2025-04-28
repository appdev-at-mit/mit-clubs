import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getID } from "../../api/clubs";
// import { Mail, Globe, Users, CheckCircle, XCircle, RefreshCw, ClipboardList } from "lucide-react";
import {
  FaTags, // For "Type"
  FaCheckCircle, // For "Active: Yes"
  FaTimesCircle, // For "Active: No"
  FaSyncAlt, // For "Recruitment Cycle"
  FaClipboardCheck, // For "Membership Process"
  FaEnvelope,
  FaGlobe,
} from "react-icons/fa";

const ClubDetails = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClubDetails = async () => {
      try {
        const response = await getID(clubId);
        setClub(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching club details:", error);
        setLoading(false);
      }
    };

    fetchClubDetails();
  }, [clubId]);

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
          className="mb-6 px-6 py-3 bg-white text-black text-md font-medium rounded-full border hover:bg-gray-100 transition-all"
          onClick={() => navigate("/")}
        >
          ← Back to All Clubs
        </button>
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
          {/* Club Header */}
          <div className="bg-cyan-100 text-black text-center py-8 px-6">
            <h1 className="text-4xl font-extrabold">{club.name}</h1>
            <div className="mt-4 inline-flex justify-center gap-6 text-lg items-center">
              <div className="flex items-center gap-2">
                <FaGlobe size={18} className="text-gray-700" />
                <a
                  href={club.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-700 hover:underline"
                >
                  {club.website}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <FaEnvelope size={18} className="text-gray-700" />
                <a href={`mailto:${club.email}`} className="text-cyan-700 hover:underline">
                  {club.email}
                </a>
              </div>
            </div>
            <p className="text-base mt-3">{club.mission}</p>
          </div>
          {/* Club Details */}
          <div className="p-8 space-y-5">
            <div className="flex items-center gap-2">
              {club.is_active ? (
                <FaCheckCircle className="text-green-300 w-5 h-5" />
              ) : (
                <FaTimesCircle className="text-red-700 w-5 h-5" />
              )}
              <p className="text-lg text-gray-700">
                <strong className="font-bold">Active:</strong> {club.is_active ? "Yes" : "No"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <FaTags className="text-gray-500 w-5 h-5" />
              <p className="text-lg text-gray-700">
                <strong class="font-bold">Type:</strong> {club.type}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <FaSyncAlt className="text-gray-500 w-5 h-5" />
              <p className="text-lg text-gray-700">
                <strong class="font-bold">Recruitment Cycle:</strong> {club.recruiting_cycle}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <FaClipboardCheck className="text-gray-500 w-5 h-5" />
              <p className="text-lg text-gray-700">
                <strong class="font-bold">Membership Process:</strong> {club.membership_process}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubDetails;

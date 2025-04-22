import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getID } from "../../api/clubs";
import { Mail, Globe, Users, CheckCircle, XCircle, RefreshCw, ClipboardList } from "lucide-react";
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

  {
    /* Replace array with actual images when hooking to backend */
  }
  const imageArray = [
    "/images/gallery1.jpg",
    "/images/gallery2.jpg",
    "/images/gallery3.jpg",
    "/images/gallery4.jpg",
    "/images/gallery5.jpg",
  ];

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
      <div className="w-full max-w-5xl">
        <button
          className="mb-6 px-4 py-2 bg-white text-black text-md font-medium rounded-full border hover:bg-gray-100 transition-all"
          onClick={() => navigate("/")}
        >
          ← Back to All Clubs
        </button>
      </div>
      <div className="w-full max-w-5xl bg-cyan-100 p-8 rounded-xl shadow-lg space-y-4 text-center">
        <h1 className="text-3xl font-extrabold text-center">{club.name}</h1>

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

        <p className="text-md text-justify">{club.mission}</p>

        <div className="flex flex-wrap gap-4 items-center justify-center text-sm">
          <div className="flex items-center gap-2 p-2 bg-white rounded-full shadow-md">
            {club.is_active ? (
              <FaCheckCircle className="text-green-500" />
            ) : (
              <FaTimesCircle className="text-red-700" />
            )}
            <p>
              <strong>Active</strong>
            </p>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white rounded-full shadow-md">
            <FaTags className="text-gray-600" />
            <p>{club.type}</p>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white rounded-full shadow-md">
            <FaSyncAlt className="text-gray-600" />
            <p>
              <strong>Recruitment Cycle:</strong> {club.recruiting_cycle}
            </p>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white rounded-full shadow-md">
            <FaClipboardCheck className="text-gray-600" />
            <p>
              <strong>Membership Process:</strong> {club.membership_process}
            </p>
          </div>
        </div>

        {/* Gallery at Bottom */}
        <div className="w-full mt-6 p-2 overflow-hidden">
          <div className="relative w-full h-64">
            <div
              className="absolute top-0 left-0 flex animate-loop-scroll gap-4"
              style={{ width: `${imageArray.length * 2 * 256 + imageArray.length * 2 * 16}px` }} // image + gap
            >
              {imageArray.concat(imageArray).map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Gallery image ${index + 1}`}
                  className="h-64 w-64 shadow-md object-cover"
                />
              ))}
            </div>
          </div>
        </div>

        <style>
          {`
            @keyframes loop-scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }

            .animate-loop-scroll {
              animation: loop-scroll 40s linear infinite;
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default ClubDetails;

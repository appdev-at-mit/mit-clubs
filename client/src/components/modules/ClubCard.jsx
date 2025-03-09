import React, { useState } from "react";
import {
  FaRegBookmark,
  FaBookmark,
  FaUsers,
  FaClipboardCheck,
} from "react-icons/fa";
import { saveClub, unsaveClub } from "../../api/clubs.js";
import defaultImage from "../../assets/default.png";
import { useNavigate } from "react-router-dom";

function ClubCard({
  id,
  name,
  description,
  isAccepting,
  type,
  membersRange,
  recruitmentProcess,
  pictureUrl,
  isSavedInitially = false,
}) {
  const [isSaved, setIsSaved] = useState(isSavedInitially);
  const navigate = useNavigate();

  const toggleSave = async (e) => {
    e.stopPropagation();
    try {
      if (!isSaved) {
        await saveClub(id);
      } else {
        await unsaveClub(id);
      }
      setIsSaved(!isSaved);
    } catch (error) {
      alert(error.response?.data?.error || "Failed to update save status.");
    }
  };

  const handleCardClick = () => {
    navigate(`/clubs/${id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="w-full h-full flex flex-col bg-white shadow-md rounded-lg p-6 border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        {/* Club Name and Logo */}
        <div className="flex-1 pr-2">
          <h2 className="text-xl font-semibold text-gray-900 break-words">
            {name}
          </h2>
          <div className="mt-2 flex flex-wrap gap-2 min-h-[28px]">
            {(Array.isArray(type) ? type : [type]).map((t, index) => (
              <span
                key={index}
                className="text-xs bg-cyan-100 text-cyan-900 rounded-full px-2 py-1"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <img
          src={pictureUrl || defaultImage}
          alt={name}
          className="h-14 w-14 object-contain ml-2 flex-shrink-0"
        />
      </div>

      {/* Club Description */}
      <p className="text-gray-600 mt-2 text-sm flex-grow line-clamp-3 min-h-[3rem]">
        {description}
      </p>

      {/* Club Details */}
      <div className="mt-4 flex justify-between items-center text-gray-500 text-sm">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <FaUsers className="text-gray-500" />
            {membersRange}
          </span>
          <span className="flex items-center gap-1">
            <FaClipboardCheck className="text-gray-500" />
            {recruitmentProcess}
          </span>
          <span
            className={`flex items-center gap-1 ${
              isAccepting ? "text-green-600" : "text-red-600"
            }`}
          >
            {isAccepting ? "Taking Members" : "Not Taking Members"}
          </span>
        </div>
        <button
          onClick={toggleSave}
          className="text-blue-500 hover:text-blue-700 transition-colors"
        >
          {isSaved ? (
            <FaBookmark className="text-blue-500 text-2xl" />
          ) : (
            <FaRegBookmark className="text-gray-500 text-2xl" />
          )}
        </button>
      </div>
    </div>
  );
}

export default ClubCard;

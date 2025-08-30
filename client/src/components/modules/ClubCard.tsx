import React, { useState } from "react";
import {
  FaRegBookmark,
  FaBookmark,
  FaUsers,
  FaClipboardCheck,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { saveClub, unsaveClub } from "../../api/clubs";
import defaultImage from "../../assets/default.png";
import { useNavigate } from "react-router-dom";

const ClubCard = ({
  id,
  name,
  description,
  isAccepting,
  tags,
  membersRange,
  recruitmentProcess,
  image_url,
  isSavedInitially = false,
}: {
  id: string;
  name: string;
  description: string;
  isAccepting: boolean;
  tags: string[] | string;
  membersRange?: string;
  recruitmentProcess: string;
  image_url?: string;
  isSavedInitially?: boolean;
}) => {
  const [isSaved, setIsSaved] = useState<boolean>(isSavedInitially);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const navigate = useNavigate();

  async function toggleSave(e: React.MouseEvent): Promise<void> {
    e.stopPropagation();
    try {
      if (!isSaved) {
        await saveClub(id);
      } else {
        await unsaveClub(id);
      }
      setIsSaved(!isSaved);
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to update save status.");
    }
  }

  function handleCardClick(): void {
    navigate(`/clubs/${id}`);
  }

  const tagList =
    typeof tags === "string"
      ? tags.split(/,\s*/).filter((tag) => tag)
      : Array.isArray(tags)
      ? tags
      : [];

  let fullImageUrl = defaultImage;
  if (typeof image_url === "string") {
    if (image_url.startsWith("/")) {
      fullImageUrl = `https://engage.mit.edu${image_url}`;
    } else if (image_url) {
      fullImageUrl = image_url;
    }
  }

  return (
    <div
      onClick={handleCardClick}
      className="w-full h-full flex flex-col bg-white shadow-md rounded-lg p-4 border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow relative"
    >
      <div className="flex mb-4">
        <div className="flex-1 pr-20">
          <h2 className="text-xl font-semibold text-gray-900 break-words hyphens-auto overflow-wrap-anywhere overflow-hidden">
            {name}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2 min-h-[28px]">
            {tagList.map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-brand-blue/20 text-brand-blue-dark font-medium rounded-full px-2.5 py-1"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="absolute top-4 right-4">
          <img
            src={fullImageUrl}
            alt={name}
            className="h-16 w-16 md:h-12 md:w-12 object-contain flex-shrink-0 rounded-md"
          />
        </div>
      </div>
      <p className="text-gray-600 mt-1 text-sm flex-grow min-h-[3rem] break-words hyphens-auto overflow-wrap-anywhere overflow-hidden">
        {description}
      </p>
      <div className="mt-2 flex justify-between items-center text-gray-500 text-sm">
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
          {membersRange && (
            <span className="flex items-center gap-1">
              <FaUsers className="text-gray-500" />
              {membersRange}
            </span>
          )}
          <span className={`flex items-center gap-1`}>
            <FaClipboardCheck className={`text-gray-500`} />
            {recruitmentProcess}
          </span>
          <span
            className={`flex items-center gap-1 ${
              isAccepting ? "text-brand-green-dark" : "text-brand-red"
            }`}
          >
            {isAccepting ? (
              <FaCheckCircle className="text-brand-green-dark" />
            ) : (
              <FaTimesCircle className="text-brand-red" />
            )}
            {isAccepting ? "Accepting Members" : "Not Accepting Members"}
          </span>
        </div>
        <button
          onClick={toggleSave}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="flex-shrink-0 ml-2"
        >
          {isSaved ? (
            <FaBookmark
              className={`text-2xl transition-colors duration-300 ease-in-out ${
                isHovering ? "text-brand-blue-dark" : "text-brand-blue"
              }`}
            />
          ) : isHovering ? (
            <FaBookmark className="text-brand-blue text-2xl transition-colors duration-300 ease-in-out" />
          ) : (
            <FaRegBookmark className="text-brand-blue-dark text-2xl transition-colors duration-300 ease-in-out" />
          )}
        </button>
      </div>
    </div>
  );
};

export default ClubCard;

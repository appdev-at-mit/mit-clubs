import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getID, saveClub, unsaveClub, getSavedClubIds } from "../../api/clubs";
import { UserContext } from "../App";
import Navbar from "../modules/Navbar";
import defaultImage from "../../assets/default.png";

import {
  Mail,
  Globe,
  Users,
  CheckCircle,
  XCircle,
  RefreshCw,
  ClipboardList,
  Pencil,
  Settings,
  Bookmark,
  Bell,
  MessageSquare,
  Zap,
  ZapOff,
  ArrowLeft,
  ThumbsUp
} from "lucide-react";
import { FaFacebookF, FaRegBookmark, FaBookmark } from "react-icons/fa";

const ClubDetails = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { userId, login } = useContext(UserContext);
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isHoveringSave, setIsHoveringSave] = useState(false);
  const [saveCount, setSaveCount] = useState(243);

  useEffect(() => {
    const fetchAllDetails = async () => {
      setLoading(true);
      try {
        // fetch main club details
        const clubResponse = await getID(clubId);
        setClub(clubResponse.data);

        // fetch user's saved clubs IF logged in
        if (userId) {
          const savedIdsResponse = await getSavedClubIds();
          if (savedIdsResponse && Array.isArray(savedIdsResponse.data)) {
            setIsSaved(savedIdsResponse.data.some((saved) => saved.club_id === clubId));
          }
        } else {
          setIsSaved(false);
        }
      } catch (error) {
        console.error("Error fetching club details or save status:", error);
        setClub(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAllDetails();
  }, [clubId, userId]);

  // function to handle image errors
  const handleImageError = (e) => {
    e.target.src = defaultImage;
  };

  // toggle save function
  const handleToggleSave = async () => {
    if (!userId) {
      login();
      return;
    }

    try {
      let response;
      if (!isSaved) {
        response = await saveClub(clubId);
      } else {
        response = await unsaveClub(clubId);
      }
      // update state based on response
      if (response && response.data) {
        setClub(response.data); // update club data (contains new saveCount)
        setIsSaved(!isSaved); // toggle save status
      } else {
        // fallback if API doesn't return data
        setIsSaved(!isSaved);
        setClub((prev) => ({
          ...prev,
          saveCount: isSaved ? prev.saveCount - 1 : prev.saveCount + 1,
        }));
      }
    } catch (error) {
      console.error("Failed to toggle save status:", error);
      alert(error.response?.data?.error || "Failed to update save status.");
    }
  };

  // process tags
  const tagList =
    typeof club?.tags === "string"
      ? club.tags.split(/,\s*/).filter((tag) => tag)
      : Array.isArray(club?.tags)
      ? club.tags
      : [];

  // construct image URL
  let fullImageUrl = defaultImage;
  if (typeof club?.image_url === "string") {
    if (club.image_url.startsWith("/")) {
      fullImageUrl = `https://engage.mit.edu${club.image_url}`;
    } else if (club.image_url) {
      fullImageUrl = club.image_url;
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-center text-xl text-brand-blue-dark">Loading club details...</p>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-center text-xl text-red-600">Could not load club details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-8 relative">
        <button 
          onClick={() => navigate('/')}
          className="hidden md:flex flex-col items-center text-gray-600 hover:text-brand-blue-dark transition-colors absolute -left-16 top-12"
        >
          <ArrowLeft size={24} className="mb-1" />
          <span className="text-xs font-medium">Back</span>
        </button>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column */}
          <div className="w-full lg:w-3/4 space-y-8">
            {/* Header */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="flex-grow overflow-hidden">
                  {/* Mobile-only back button */}
                  <div className="flex items-center mb-3 md:hidden">
                    <button 
                      onClick={() => navigate('/')}
                      className="flex items-center text-gray-600 hover:text-brand-blue-dark transition-colors mr-3"
                    >
                      <ArrowLeft size={20} className="mr-1" />
                      <span className="text-sm">Back</span>
                    </button>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 break-words hyphens-auto overflow-wrap-anywhere">{club.name}</h1>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tagList.map((tag, index) => (
                      <span
                        key={index}
                        className="text-sm bg-brand-blue/20 text-brand-blue-dark font-medium rounded-full px-3 py-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <img
                  src={fullImageUrl}
                  alt={`${club.name} logo`}
                  className="h-24 w-24 object-contain flex-shrink-0 border border-gray-200 rounded-md"
                  onError={handleImageError}
                />
              </div>
            </div>

            {/* Club Mission */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Club Mission</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words overflow-hidden">
                {club.mission || "No mission statement provided."}
              </p>
            </div>
            
            {/* FAQ Section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Frequently Asked Questions</h2>
              
              <div className="space-y-4">
                {club.questions && club.questions.length > 0 ? (
                  club.questions.map((item, index) => (
                    <div key={index} className={index < club.questions.length - 1 ? "border-b border-gray-200 pb-4" : "pb-4"}>
                      <div className="flex">
                        <div className="border-l-4 border-gray-300 pl-4 w-full overflow-hidden">
                          <div className="mb-2">
                            <span className="font-semibold text-gray-800">Question: </span>
                            <span className="text-gray-800 break-words overflow-wrap-anywhere hyphens-auto">{item.question.replace("this club", club.name)}</span>
                          </div>
                          
                          <p className="text-gray-700 break-words overflow-wrap-anywhere hyphens-auto">
                            {item.answer ? item.answer : <span className="text-gray-500 italic">This question has not been answered yet.</span>}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No FAQ information available.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Changed width to lg:w-1/4 */}
          <div className="w-full lg:w-1/4 space-y-6">
            {/* Save/Bell Buttons */}
            <div className="flex items-center justify-start gap-3">
              {/* Save Button/Display */}
              <button
                onClick={handleToggleSave}
                onMouseEnter={() => setIsHoveringSave(true)}
                onMouseLeave={() => setIsHoveringSave(false)}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {isSaved ? (
                  <FaBookmark
                    className={`text-xl transition-colors duration-300 ease-in-out ${
                      isHoveringSave ? "text-brand-blue-dark" : "text-brand-blue"
                    }`}
                  />
                ) : isHoveringSave ? (
                  <FaBookmark className="text-brand-blue text-xl transition-colors duration-300 ease-in-out" />
                ) : (
                  <FaRegBookmark className="text-brand-blue-dark text-xl transition-colors duration-300 ease-in-out" />
                )}
                {/* Save count */}
                <span className="ml-1">{club?.saveCount ?? 0}</span>
              </button>
              {/* Manage Club Button */}
              <button 
                onClick={() => navigate(`/clubs/${clubId}/manage`)}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Settings size={16} className="text-gray-500" />
                <span>Manage Club</span>
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                  Basic Info
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  {/* Active Status */}
                  <div className="flex items-center gap-3">
                    {club.is_active ? (
                      <Zap size={18} className="text-brand-green-dark flex-shrink-0" />
                    ) : (
                      <ZapOff size={18} className="text-red-600 flex-shrink-0" />
                    )}
                    <span>{club.is_active ? "Active" : "Inactive"}</span>
                  </div>
                  {/* Accepting Members */}
                  <div className="flex items-center gap-3">
                    {club.is_accepting ? (
                      <CheckCircle size={18} className="text-brand-green-dark flex-shrink-0" />
                    ) : (
                      <XCircle size={18} className="text-red-600 flex-shrink-0" />
                    )}
                    <span>
                      {club.is_accepting
                        ? "Currently Accepting Members"
                        : "Not Currently Accepting Members"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ClipboardList size={18} className="text-gray-500 flex-shrink-0" />
                    <span>{club.membership_process || "Membership process not specified"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <RefreshCw size={18} className="text-gray-500 flex-shrink-0" />
                    <span>{club.recruiting_cycle || "Recruiting cycle not specified"}</span>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Contact</h3>
                <div className="space-y-3 text-sm text-gray-700">
                  {club.facebook && (
                    <div className="flex items-center gap-3">
                      <FaFacebookF size={18} className="text-blue-600 flex-shrink-0" />
                      <a
                        href={
                          club.facebook.startsWith("http")
                            ? club.facebook
                            : `https://${club.facebook}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline break-all"
                      >
                        {club.facebook}
                      </a>
                    </div>
                  )}
                  {club.email && (
                    <div className="flex items-center gap-3">
                      <Mail size={18} className="text-gray-500 flex-shrink-0" />
                      <a href={`mailto:${club.email}`} className="hover:underline break-all">
                        {club.email}
                      </a>
                    </div>
                  )}
                  {club.website && (
                    <div className="flex items-center gap-3">
                      <Globe size={18} className="text-gray-500 flex-shrink-0" />
                      <a
                        href={
                          club.website.startsWith("http") ? club.website : `https://${club.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline break-all"
                      >
                        {club.website}
                      </a>
                    </div>
                  )}
                  {!(club.facebook || club.email || club.website) && (
                    <p className="text-gray-500 italic">No contact information provided.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubDetails;

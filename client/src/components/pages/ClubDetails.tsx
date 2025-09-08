import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getID,
  saveClub,
  unsaveClub,
  getSavedClubIds,
  getClubMembers,
} from "../../api/clubs";
import { checkIsAdmin } from "../../api/admin";
import { UserContext } from "../App";
import Navbar from "../modules/Navbar";
import LoginModal from "../modules/LoginModal";
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
  ThumbsUp,
} from "lucide-react";
import {
  FaRegBookmark,
  FaBookmark,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";
import { Club } from "../../types";

function ClubDetails() {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const userContext = useContext(UserContext);

  if (!userContext) {
    throw new Error("ClubDetails must be used within UserContext");
  }

  const { userId, handleLogin, userEmail } = userContext;
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isHoveringSave, setIsHoveringSave] = useState<boolean>(false);
  const [isHoveringManage, setIsHoveringManage] = useState<boolean>(false);
  const [hasOwnerPermission, setHasOwnerPermission] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  useEffect(() => {
    async function fetchAllDetails() {
      if (!clubId) return;

      setLoading(true);
      try {
        // fetch main club details
        const clubResponse = await getID(clubId);
        setClub(clubResponse);

        // fetch user's saved clubs IF logged in
        if (userId) {
          const savedIdsResponse = await getSavedClubIds();
          if (savedIdsResponse && Array.isArray(savedIdsResponse)) {
            setIsSaved(
              savedIdsResponse.some(
                (saved: { club_id: string }) => saved.club_id === clubId
              )
            );
          }

          // check if user has owner permissions
          try {
            const membersResponse = await getClubMembers(clubId);
            const members = Array.isArray(membersResponse)
              ? membersResponse
              : [];

            // check if the current user is an owner
            const userMember = members.find(
              (member: any) =>
                member.email === userEmail && member.permissions === "Owner"
            );

            setHasOwnerPermission(Boolean(userMember));

            // check if user is an admin
            try {
              const adminResponse = await checkIsAdmin();
              setIsAdmin(adminResponse.isAdmin);
            } catch (err) {
              console.error("Error checking admin status:", err);
              setIsAdmin(false);
            }
          } catch (err) {
            console.error("Error checking member permissions:", err);
            setHasOwnerPermission(false);
          }
        } else {
          setIsSaved(false);
          setHasOwnerPermission(false);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error fetching club details or save status:", error);
        setClub(null);
      } finally {
        setLoading(false);
      }
    }

    fetchAllDetails();
  }, [clubId, userId, userEmail]);

  // function to handle image errors
  function handleImageError(e: React.SyntheticEvent<HTMLImageElement>) {
    e.currentTarget.src = defaultImage;
  }

  // toggle save function
  async function handleToggleSave() {
    if (!userId) {
      setShowLoginModal(true);
      return;
    }

    if (!clubId) return;

    try {
      let response;
      if (!isSaved) {
        response = await saveClub(clubId);
      } else {
        response = await unsaveClub(clubId);
      }
      if (response) {
        setClub(response);
        setIsSaved(!isSaved);
      } else {
        setIsSaved(!isSaved);
        setClub((prev) =>
          prev
            ? {
                ...prev,
                saveCount: isSaved
                  ? (prev.saveCount || 0) - 1
                  : (prev.saveCount || 0) + 1,
              }
            : null
        );
      }
    } catch (error: any) {
      console.error("Failed to save/unsave club:", error);
    }
  }

  // process tags
  const tagList =
    club && typeof club.tags === "string"
      ? club.tags.split(/,\s*/).filter((tag) => tag)
      : club && Array.isArray(club.tags)
      ? club.tags
      : [];

  // construct image URL
  let fullImageUrl = defaultImage;
  if (club && typeof club.image_url === "string") {
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
          <p className="text-center text-xl text-appdev-blue-dark">
            Loading club details...
          </p>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-center text-xl text-appdev-red">
            Could not load club details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 md:px-8 py-8 relative pt-20 md:pt-28">
        <div className="mb-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-500 hover:text-appdev-blue transition-colors duration-200"
          >
            <ArrowLeft size={15} className="text-gray-500" />
            <span className="font-light text-md">Back to Clubs</span>
          </button>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-3/4 space-y-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="flex-grow overflow-hidden">
                  <h1 className="text-3xl font-bold text-gray-900 break-words hyphens-auto overflow-wrap-anywhere">
                    {club.name}
                  </h1>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tagList.map((tag, index) => (
                      <span
                        key={index}
                        className="text-sm bg-appdev-blue/20 text-appdev-blue-dark font-medium rounded-full px-3 py-1"
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
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Club Mission
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words overflow-hidden">
                {club.mission || "No mission statement provided."}
              </p>
            </div>
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Frequently Asked Questions
              </h2>

              <div className="space-y-4">
                {club.questions && club.questions.length > 0 ? (
                  club.questions.map((item, index) => (
                    <div
                      key={index}
                      className={
                        club.questions && index < club.questions.length - 1
                          ? "border-b border-gray-200 pb-4"
                          : "pb-4"
                      }
                    >
                      <div className="flex">
                        <div className="border-l-4 border-gray-300 pl-4 w-full overflow-hidden">
                          <div className="mb-2">
                            <span className="font-semibold text-gray-800">
                              Question:{" "}
                            </span>
                            <span className="text-gray-800 break-words overflow-wrap-anywhere hyphens-auto">
                              {item.question.replace("this club", club.name)}
                            </span>
                          </div>

                          <p className="text-gray-700 break-words overflow-wrap-anywhere hyphens-auto">
                            {item.answer ? (
                              item.answer
                            ) : (
                              <span className="text-gray-500 italic">
                                This question has not been answered yet.
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">
                    No FAQ information available.
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/4 space-y-6">
            <div className="flex items-center justify-start gap-3">
              <button
                onClick={handleToggleSave}
                onMouseEnter={() => setIsHoveringSave(true)}
                onMouseLeave={() => setIsHoveringSave(false)}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {isSaved ? (
                  <FaBookmark
                    className={`text-xl transition-colors duration-300 ease-in-out ${
                      isHoveringSave
                        ? "text-appdev-blue-dark"
                        : "text-appdev-blue"
                    }`}
                  />
                ) : isHoveringSave ? (
                  <FaBookmark className="text-appdev-blue text-xl transition-colors duration-300 ease-in-out" />
                ) : (
                  <FaRegBookmark className="text-appdev-blue-dark text-xl transition-colors duration-300 ease-in-out" />
                )}
                <span className="ml-1">{club ? club.saveCount || 0 : 0}</span>
              </button>
              {/* Manage Club Button - show for owners or admins */}
              {(hasOwnerPermission || isAdmin) && (
                <button
                  onClick={() => navigate(`/clubs/${clubId}/manage`)}
                  onMouseEnter={() => setIsHoveringManage(true)}
                  onMouseLeave={() => setIsHoveringManage(false)}
                  style={{
                    backgroundColor: isHoveringManage ? "#F3F4F6" : "white",
                    transition: "background-color 0.2s ease",
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700"
                >
                  <Settings size={16} className="text-gray-500" />
                  <span>Manage Club</span>
                </button>
              )}
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                  Basic Info
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-center gap-3">
                    {club.is_active ? (
                      <Zap
                        size={18}
                        className="text-appdev-green-dark flex-shrink-0"
                      />
                    ) : (
                      <ZapOff
                        size={18}
                        className="text-appdev-red flex-shrink-0"
                      />
                    )}
                    <span>{club.is_active ? "Active" : "Inactive"}</span>
                  </div>
                  {typeof club.is_accepting === "boolean" && (
                    <div className="flex items-center gap-3">
                      {club.is_accepting ? (
                        <CheckCircle
                          size={18}
                          className="text-appdev-green-dark flex-shrink-0"
                        />
                      ) : (
                        <XCircle
                          size={18}
                          className="text-appdev-red flex-shrink-0"
                        />
                      )}
                      <span>
                        {club.is_accepting
                          ? "Currently Accepting Members"
                          : "Not Currently Accepting Members"}
                      </span>
                    </div>
                  )}
                  {club.membership_process && (
                    <div className="flex items-center gap-3">
                      <ClipboardList
                        size={18}
                        className="text-gray-500 flex-shrink-0"
                      />
                      <span>{club.membership_process}</span>
                    </div>
                  )}
                  {club.recruiting_cycle && String(club.recruiting_cycle) && (
                    <div className="flex items-center gap-3">
                      <RefreshCw
                        size={18}
                        className="text-gray-500 flex-shrink-0"
                      />
                      <span>{club.recruiting_cycle}</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                  Contact
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  {club.mailing_list && (
                    <div className="flex items-center gap-3">
                      <Bell size={18} className="text-gray-500 flex-shrink-0" />
                      <a
                        href={club.mailing_list}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline break-all"
                      >
                        Mailing List
                      </a>
                    </div>
                  )}
                  {club.instagram && (
                    <div className="flex items-center gap-3">
                      <FaInstagram
                        size={18}
                        className="text-gray-500 flex-shrink-0"
                      />
                      <a
                        href={
                          club.instagram.startsWith("http")
                            ? club.instagram
                            : club.instagram.startsWith("@")
                            ? `https://instagram.com/${club.instagram.slice(1)}`
                            : `https://instagram.com/${club.instagram}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline break-all"
                      >
                        {(() => {
                          if (club.instagram.includes("instagram.com/")) {
                            const match = club.instagram.match(
                              /instagram\.com\/([^\/\?]+)/
                            );
                            return match ? `@${match[1]}` : club.instagram;
                          } else if (club.instagram.startsWith("@")) {
                            return club.instagram;
                          } else {
                            return `@${club.instagram}`;
                          }
                        })()}
                      </a>
                    </div>
                  )}
                  {club.linkedin && (
                    <div className="flex items-center gap-3">
                      <FaLinkedinIn
                        size={18}
                        className="text-gray-500 flex-shrink-0"
                      />
                      <a
                        href={
                          club.linkedin.startsWith("http")
                            ? club.linkedin
                            : `https://${club.linkedin}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline break-all"
                      >
                        {(() => {
                          // extract name from URL
                          if (club.linkedin.includes("linkedin.com/")) {
                            const match = club.linkedin.match(
                              /linkedin\.com\/(?:company|in)\/([^\/\?]+)/
                            );
                            return match ? match[1] : club.linkedin;
                          }
                          return club.linkedin;
                        })()}
                      </a>
                    </div>
                  )}
                  {club.email && (
                    <div className="flex items-center gap-3">
                      <Mail size={18} className="text-gray-500 flex-shrink-0" />
                      <a
                        href={`mailto:${club.email}`}
                        className="hover:underline break-all"
                      >
                        {club.email}
                      </a>
                    </div>
                  )}
                  {club.website && (
                    <div className="flex items-center gap-3">
                      <Globe
                        size={18}
                        className="text-gray-500 flex-shrink-0"
                      />
                      <a
                        href={
                          club.website.startsWith("http")
                            ? club.website
                            : `https://${club.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline break-all"
                      >
                        {club.website}
                      </a>
                    </div>
                  )}
                  {!(
                    club.mailing_list ||
                    club.instagram ||
                    club.linkedin ||
                    club.email ||
                    club.website
                  ) && (
                    <p className="text-gray-500 italic">
                      No contact information provided.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}

export default ClubDetails;

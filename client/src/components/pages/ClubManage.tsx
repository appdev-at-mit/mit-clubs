import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { getID, updateClub, getClubMembers } from "../../api/clubs";
import { checkIsAdmin } from "../../api/admin";
import { UserContext } from "../App";
import Navbar from "../modules/Navbar";
import { Club, ClubMember } from "../../types";

import EditClubPage from "../modules/admin-panel/EditClubPage";
import RecruitmentPage from "../modules/admin-panel/RecruitmentPage";
import QuestionsPage from "../modules/admin-panel/QuestionsPage";
import MembersPage from "../modules/admin-panel/MembersPage";

function ClubManage() {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const userContext = useContext(UserContext);

  if (!userContext) {
    throw new Error("ClubManage must be used within UserContext");
  }

  const { userId, userEmail, isAdmin: userIsAdmin } = userContext;
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("edit");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: string;
    text: string;
  } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasOwnerPermission, setHasOwnerPermission] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [isHoveringViewClub, setIsHoveringViewClub] = useState(false);

  useEffect(() => {
    async function checkPermissionsAndFetchClub() {
      if (!clubId) return;

      setLoading(true);

      if (!userId || !userEmail) {
        navigate("/");
        return;
      }

      try {
        // check admin status first
        let adminStatus = false;
        try {
          const adminResponse = await checkIsAdmin();
          adminStatus = adminResponse.isAdmin;
          setIsAdmin(adminStatus);
        } catch (err) {
          console.error("Error checking admin status:", err);
          setIsAdmin(false);
        }
        
        const membersResponse = await getClubMembers(clubId);
        const members = Array.isArray(membersResponse) ? membersResponse : [];

        // check if the current user is an owner
        const userMember = members.find(
          (member) => member.email === userEmail && member.permissions === "Owner"
        );

        setHasOwnerPermission(Boolean(userMember));
        
        const hasPermission = Boolean(userMember) || adminStatus;
        setPermissionChecked(true);

        if (!hasPermission) {
          setLoading(false);
          return;
        }

        // if has owner permission, fetch club data
        const response = await getID(clubId);
        setClub(response);
        setLoading(false);
      } catch (error) {
        console.error("Error checking permissions or fetching club:", error);
        setLoading(false);
        setPermissionChecked(true);
      }
    }

    checkPermissionsAndFetchClub();
  }, [clubId, userId, userEmail, navigate, userIsAdmin]);

  // redirect if user doesn't have permission
  useEffect(() => {
    if (permissionChecked && !hasOwnerPermission && !isAdmin && !loading) {
      navigate(`/clubs/${clubId}`);
    }
  }, [permissionChecked, hasOwnerPermission, isAdmin, loading, navigate, clubId]);

  // save functionality
  async function handleSave() {
    if (!clubId) return;
    
    // don't allow saving if user doesn't have permission
    if (!hasOwnerPermission && !isAdmin) {
      setSaveMessage({ type: 'error', text: 'You do not have permission to edit this club.' });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      let updateData = {};

      switch (activeTab) {
        case "edit":
          // get data from EditClubPage component
          const editComponent = document.getElementById("edit-form");
          if (editComponent) {
            updateData = {
              name: (
                editComponent.querySelector("#club-name") as HTMLInputElement
              )?.value,
              mission: (
                editComponent.querySelector(
                  "#club-mission"
                ) as HTMLTextAreaElement
              )?.value,
              tags: (
                editComponent.querySelector("#club-tags") as HTMLInputElement
              )?.value,
            };
          }
          break;

        case "recruitment":
          // get data from RecruitmentPage component
          const recruitmentComponent =
            document.getElementById("recruitment-form");
          if (recruitmentComponent) {
            updateData = {
              is_active: (
                recruitmentComponent.querySelector(
                  "#is_active"
                ) as HTMLInputElement
              )?.checked,
              is_accepting: (
                recruitmentComponent.querySelector(
                  "#is_accepting"
                ) as HTMLInputElement
              )?.checked,
              membership_process: (
                recruitmentComponent.querySelector(
                  "#membership-process"
                ) as HTMLSelectElement
              )?.value,
              recruiting_cycle: Array.from(
                recruitmentComponent.querySelectorAll(
                  'input[name="recruitment_cycle"]:checked'
                )
              ).map((input) => (input as HTMLInputElement).value),
            };
          }
          break;

        case "questions":
          // get data from QuestionsPage component
          const questionsComponent = document.getElementById("questions-form");
          if (questionsComponent) {
            updateData = {
              questions: JSON.parse(
                (
                  questionsComponent.querySelector(
                    "#club-questions"
                  ) as HTMLInputElement
                )?.value || "[]"
              ),
            };
          }
          break;

        case "members":
          setSaveMessage({
            type: "info",
            text: "Member changes are saved automatically.",
          });
          setIsSaving(false);
          return;

        default:
          break;
      }

      const response = await updateClub(updateData);
      setClub(response.club);

      setSaveMessage({ type: "success", text: "Changes saved successfully!" });

      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error("Error saving changes:", error);
      setSaveMessage({
        type: "error",
        text: "Error saving changes. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  function renderTabContent() {
    if (!club) return null;

    switch (activeTab) {
      case "edit":
        return <EditClubPage club={club} />;
      case "recruitment":
        return <RecruitmentPage club={club} />;
      case "questions":
        return <QuestionsPage club={club} />;
      case "members":
        return <MembersPage club={club} />;
      default:
        return <EditClubPage club={club} />;
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-xl text-brand-blue-dark">
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
          <p className="text-xl text-red-600">
            You do not have permission to manage this club.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-8 py-6 pt-28">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
          <h1 className="text-2xl font-bold text-gray-800 break-words hyphens-auto overflow-wrap-anywhere max-w-3xl overflow-hidden">
            {club.name}
          </h1>
          <button
            onClick={() => navigate(`/club/${clubId}`)}
            onMouseEnter={() => setIsHoveringViewClub(true)}
            onMouseLeave={() => setIsHoveringViewClub(false)}
            style={{
              backgroundColor: isHoveringViewClub ? "#F3F4F6" : "white",
              transition: "background-color 0.2s ease",
            }}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
          >
            View Club
          </button>
        </div>

        <div className="border-b border-gray-300 mb-6">
          <div className="hidden md:flex space-x-8">
            <button
              className={`pb-3 font-medium ${
                activeTab === "edit"
                  ? "text-brand-blue-dark border-b-2 border-brand-blue-dark"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("edit")}
            >
              Edit Club Page
            </button>
            <button
              className={`pb-3 font-medium ${
                activeTab === "recruitment"
                  ? "text-brand-blue-dark border-b-2 border-brand-blue-dark"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("recruitment")}
            >
              Recruitment
            </button>
            <button
              className={`pb-3 font-medium ${
                activeTab === "questions"
                  ? "text-brand-blue-dark border-b-2 border-brand-blue-dark"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("questions")}
            >
              Questions
            </button>
            <button
              className={`pb-3 font-medium ${
                activeTab === "members"
                  ? "text-brand-blue-dark border-b-2 border-brand-blue-dark"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("members")}
            >
              Members
            </button>
          </div>

          <div className="md:hidden">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex items-center text-gray-700"
              >
                <span className="mr-2 font-medium">
                  {activeTab === "edit"
                    ? "Edit Club Page"
                    : activeTab === "recruitment"
                    ? "Recruitment"
                    : activeTab === "questions"
                    ? "Questions"
                    : "Members"}
                </span>
                <Menu size={20} />
              </button>
            </div>

            {mobileMenuOpen && (
              <div className="bg-white absolute z-10 shadow-md rounded-md mt-2 w-48 py-1">
                <button
                  className={`block w-full text-left px-4 py-2 ${
                    activeTab === "edit"
                      ? "bg-gray-100 text-brand-blue-dark"
                      : "text-gray-700"
                  }`}
                  onClick={() => {
                    setActiveTab("edit");
                    setMobileMenuOpen(false);
                  }}
                >
                  Edit Club Page
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 ${
                    activeTab === "recruitment"
                      ? "bg-gray-100 text-brand-blue-dark"
                      : "text-gray-700"
                  }`}
                  onClick={() => {
                    setActiveTab("recruitment");
                    setMobileMenuOpen(false);
                  }}
                >
                  Recruitment
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 ${
                    activeTab === "questions"
                      ? "bg-gray-100 text-brand-blue-dark"
                      : "text-gray-700"
                  }`}
                  onClick={() => {
                    setActiveTab("questions");
                    setMobileMenuOpen(false);
                  }}
                >
                  Questions
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 ${
                    activeTab === "members"
                      ? "bg-gray-100 text-brand-blue-dark"
                      : "text-gray-700"
                  }`}
                  onClick={() => {
                    setActiveTab("members");
                    setMobileMenuOpen(false);
                  }}
                >
                  Members
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-md p-4 md:p-6">
          {renderTabContent()}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-2">
          {saveMessage && (
            <div
              className={`px-4 py-2 rounded-md ${
                saveMessage.type === "success"
                  ? "bg-green-100 text-green-800"
                  : saveMessage.type === "error"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              } w-full sm:w-auto`}
            >
              {saveMessage.text}
            </div>
          )}
          {activeTab !== "members" && (
            <div
              className={`${
                saveMessage ? "mt-2 sm:mt-0" : ""
              } sm:ml-auto w-full sm:w-auto`}
            >
              <button
                className={`px-6 py-2 bg-brand-purple text-white rounded-md hover:bg-brand-purple/80 transition-all duration-200 ${
                  isSaving ? "opacity-70 cursor-not-allowed" : ""
                } w-full sm:w-auto`}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClubManage;

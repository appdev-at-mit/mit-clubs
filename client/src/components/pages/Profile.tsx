import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import Navbar from "../modules/Navbar";
import { UserContext } from "../App";
import {
  getSavedClubs,
  getUserMemberships,
  getUserData,
} from "../../api/clubs";
import { Bookmark, Users, ExternalLink, Clock } from "lucide-react";
import { Club } from "../../types";

interface ExtendedClub extends Club {
  role?: string;
  year_joined?: string;
}

const Profile: React.FC = () => {
  const userContext = useContext(UserContext);

  if (!userContext) {
    throw new Error("Profile must be used within UserContext");
  }

  const { userId, userEmail } = userContext;
  const [savedClubs, setSavedClubs] = useState<ExtendedClub[]>([]);
  const [memberClubs, setMemberClubs] = useState<ExtendedClub[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"saved" | "member">("saved");

  useEffect(() => {
    async function fetchUserData() {
      setLoading(true);
      try {
        const response = await getUserData();
        setSavedClubs(response.data.savedClubs || []);
        setMemberClubs(response.data.memberClubs || []);
      } catch (err) {
        console.error("Error fetching user data:", err);

        try {
          const savedResponse = await getSavedClubs();
          setSavedClubs(savedResponse || []);
        } catch (savedErr) {
          console.error("Error fetching saved clubs:", savedErr);
          setSavedClubs([]);
        }

        try {
          const memberResponse = await getUserMemberships();
          setMemberClubs(memberResponse.data || []);
        } catch (memberErr) {
          console.error("Error fetching member clubs:", memberErr);
          setMemberClubs([]);
        }
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [userId]);

  if (!userId) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Please log in
            </h1>
            <p className="text-gray-600 mb-6">
              You need to be logged in to view your profile.
            </p>
          </div>
        </div>
      </>
    );
  }

  function renderClubList(clubs: ExtendedClub[], type: "saved" | "member") {
    if (clubs.length === 0) {
      return (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">
            {type === "saved"
              ? "You haven't saved any clubs yet. Browse clubs and click the bookmark icon to save them for later!"
              : "You're not a member of any clubs yet."}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {clubs.map((club) => (
          <div
            key={club.club_id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="flex items-start p-4">
              <div className="flex-grow">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-brand-blue-dark">
                    {club.name}
                  </h3>
                  {type === "member" && club.role && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                      {club.role}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mt-1">
                  {Array.isArray(club.tags)
                    ? club.tags.join(", ")
                    : club.tags || ""}
                </p>

                {type === "member" && club.year_joined && (
                  <div className="flex items-center text-xs text-gray-500 mt-2">
                    <Clock size={14} className="mr-1" />
                    <span>Joined {club.year_joined}</span>
                  </div>
                )}
              </div>

              <Link
                to={`/clubs/${club.club_id}`}
                className="flex items-center text-sm text-brand-blue hover:text-brand-blue-dark"
              >
                <span className="mr-1">View</span>
                <ExternalLink size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* profile card */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 mb-4">
                      {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
                    </div>
                    <h2 className="text-xl font-bold">
                      {userEmail ? userEmail.split("@")[0] : "User"}
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      {userEmail || "No email"}
                    </p>
                  </div>

                  <div className="flex justify-between mt-6 text-center">
                    <div>
                      <p className="font-bold text-xl">{savedClubs.length}</p>
                      <p className="text-gray-600 text-sm">Saved</p>
                    </div>
                    <div>
                      <p className="font-bold text-xl">{memberClubs.length}</p>
                      <p className="text-gray-600 text-sm">Member</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* account settings */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mt-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="font-semibold">Account Settings</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 text-center">
                      Settings coming soon
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* tabs and club lists */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="flex border-b border-gray-200">
                  <button
                    className={`px-4 py-3 flex items-center gap-2 text-sm font-medium ${
                      activeTab === "saved"
                        ? "text-brand-blue-dark border-b-2 border-brand-blue-dark"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("saved")}
                  >
                    <Bookmark size={16} />
                    <span>Saved Clubs</span>
                  </button>
                  <button
                    className={`px-4 py-3 flex items-center gap-2 text-sm font-medium ${
                      activeTab === "member"
                        ? "text-brand-blue-dark border-b-2 border-brand-blue-dark"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("member")}
                  >
                    <Users size={16} />
                    <span>My Memberships</span>
                  </button>
                </div>

                <div className="p-6">
                  {loading ? (
                    <div className="flex justify-center items-center h-48">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-blue-dark"></div>
                    </div>
                  ) : (
                    <>
                      {activeTab === "saved" &&
                        renderClubList(savedClubs, "saved")}
                      {activeTab === "member" &&
                        renderClubList(memberClubs, "member")}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;

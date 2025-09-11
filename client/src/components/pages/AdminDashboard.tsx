import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getAllClubs, updateClub } from "../../api/clubs";
import { checkIsAdmin } from "../../api/admin";
import { UserContext } from "../App";
import { Club } from "../../types";
import Navbar from "../modules/Navbar";
import { Save, Settings } from "lucide-react";

function AdminDashboard() {
  const navigate = useNavigate();
  const userContext = useContext(UserContext);

  if (!userContext) {
    throw new Error("AdminDashboard must be used within UserContext");
  }

  const { userId, userEmail, authChecked } = userContext;
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingClubs, setEditingClubs] = useState<{ [key: string]: Club }>({});
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [uploadError, setUploadError] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    async function loadDashboard() {
      if (!authChecked) return;

      if (!userId || !userEmail) {
        navigate("/");
        return;
      }

      try {
        const adminResponse = await checkIsAdmin();
        if (!adminResponse.isAdmin) {
          navigate("/");
          return;
        }

        setIsAdmin(true);
        const clubsResponse = await getAllClubs();
        setClubs(clubsResponse);
      } catch (error) {
        navigate("/");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [userId, userEmail, navigate, authChecked]);

  function handleFieldChange(
    clubId: string,
    field: keyof Club,
    value: string | string[]
  ) {
    setEditingClubs((prev) => ({
      ...prev,
      [clubId]: {
        ...prev[clubId],
        [field]: value,
      } as Club,
    }));
  }

  function getDisplayValue(club: Club, field: keyof Club): string {
    const editedClub = editingClubs[club.club_id];
    let value;

    if (editedClub && editedClub[field] !== undefined) {
      value = editedClub[field];
    } else {
      value = club[field];
    }

    if (Array.isArray(value)) {
      if (value.length > 0) {
        return String(value[0]);
      }
      return "";
    }

    return String(value || "");
  }

  function getCurrentArray(
    club: Club,
    field: "membership_process" | "recruiting_cycle"
  ): string[] {
    const editedClub = editingClubs[club.club_id];
    const value =
      editedClub && editedClub[field] !== undefined
        ? editedClub[field]
        : club[field];
    return Array.isArray(value) ? value : [];
  }

  function renderCheckboxGroup(
    club: Club,
    field: "membership_process" | "recruiting_cycle",
    options: string[]
  ) {
    const currentArray = getCurrentArray(club, field);

    return (
      <div className="space-y-1">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-1 text-xs">
            <input
              type="checkbox"
              checked={currentArray.includes(option)}
              onChange={(e) => {
                const newArray = e.target.checked
                  ? [...currentArray.filter((item) => item !== option), option]
                  : currentArray.filter((item) => item !== option);
                handleFieldChange(club.club_id, field, newArray);
              }}
              className="w-3 h-3"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    );
  }

  async function handleImageUpload(
    clubId: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    setUploadError((prev) => ({ ...prev, [clubId]: "" }));
    setUploading((prev) => ({ ...prev, [clubId]: true }));

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        handleFieldChange(clubId, "image_url", data.url);
      } else {
        const errorData = await response.json();
        setUploadError((prev) => ({
          ...prev,
          [clubId]: errorData.error || "Upload failed",
        }));
      }
    } catch (error) {
      setUploadError((prev) => ({ ...prev, [clubId]: "Upload failed" }));
    } finally {
      setUploading((prev) => ({ ...prev, [clubId]: false }));
      event.target.value = "";
    }
  }

  async function saveChanges() {
    setSaving(true);
    setSaveMessage("");

    try {
      const updatePromises = Object.entries(editingClubs).map(
        async ([clubId, changes]) => {
          const cleanChanges = { ...changes, club_id: clubId };
          return updateClub(cleanChanges);
        }
      );

      await Promise.all(updatePromises);

      const refreshedClubs = await getAllClubs();
      setClubs(refreshedClubs);
      setEditingClubs({});
      setSaveMessage(
        `Successfully updated ${Object.keys(editingClubs).length} clubs`
      );

      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      setSaveMessage("Error saving changes");
      setTimeout(() => setSaveMessage(""), 3000);
    } finally {
      setSaving(false);
    }
  }

  if (!authChecked || loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-xl">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-xl text-red-600">Access denied</p>
        </div>
      </div>
    );
  }

  const hasChanges = Object.keys(editingClubs).length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-6 pt-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          {hasChanges && (
            <div className="flex items-center gap-3">
              {saveMessage && (
                <span
                  className={`text-sm ${
                    saveMessage.includes("Error")
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {saveMessage}
                </span>
              )}
              <button
                onClick={saveChanges}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                <Save size={16} />
                {saving
                  ? "Saving..."
                  : `Save Changes (${Object.keys(editingClubs).length})`}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-700 min-w-[200px]">
                    Club Name
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 min-w-[120px]">
                    Status
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 min-w-[140px]">
                    Accepting Members
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 min-w-[150px]">
                    Membership Process
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 min-w-[140px]">
                    Recruitment Cycle
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 min-w-[80px]">
                    Profile Picture
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 min-w-[150px]">
                    Email
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 min-w-[150px]">
                    Website
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 min-w-[120px]">
                    Instagram
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 min-w-[150px]">
                    LinkedIn
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 min-w-[150px]">
                    Mailing List
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 min-w-[100px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {clubs.map((club) => (
                  <tr key={club.club_id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <input
                        type="text"
                        value={getDisplayValue(club, "name")}
                        onChange={(e) =>
                          handleFieldChange(
                            club.club_id,
                            "name",
                            e.target.value
                          )
                        }
                        className="w-full p-1 border border-gray-300 rounded text-sm"
                        placeholder="Club name"
                      />
                    </td>
                    <td className="p-3">
                      <select
                        value={getDisplayValue(club, "is_active")}
                        onChange={(e) =>
                          handleFieldChange(
                            club.club_id,
                            "is_active",
                            e.target.value
                          )
                        }
                        className="w-full p-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <select
                        value={getDisplayValue(club, "is_accepting")}
                        onChange={(e) =>
                          handleFieldChange(
                            club.club_id,
                            "is_accepting",
                            e.target.value
                          )
                        }
                        className="w-full p-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="">Not Set</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </td>
                    <td className="p-3">
                      {renderCheckboxGroup(club, "membership_process", [
                        "Open",
                        "Application",
                        "Tryout",
                        "Interview",
                      ])}
                    </td>
                    <td className="p-3">
                      {renderCheckboxGroup(club, "recruiting_cycle", [
                        "Year-round",
                        "Fall",
                        "Spring",
                        "IAP",
                      ])}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <img
                          src={
                            getDisplayValue(club, "image_url") ||
                            "https://engage.mit.edu/images/default_club_logo_square.png"
                          }
                          alt="Club"
                          className="w-8 h-8 rounded object-cover flex-shrink-0"
                        />
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1">
                            <label className="cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs px-2 py-1 rounded border">
                              {uploading[club.club_id]
                                ? "Uploading..."
                                : "Choose"}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  handleImageUpload(club.club_id, e)
                                }
                                className="hidden"
                                disabled={uploading[club.club_id]}
                              />
                            </label>
                            {getDisplayValue(club, "image_url") &&
                              getDisplayValue(club, "image_url") !==
                                "https://engage.mit.edu/images/default_club_logo_square.png" && (
                                <button
                                  onClick={() =>
                                    handleFieldChange(
                                      club.club_id,
                                      "image_url",
                                      "https://engage.mit.edu/images/default_club_logo_square.png"
                                    )
                                  }
                                  className="text-red-600 hover:text-red-800 text-xs px-1"
                                  title="Remove image"
                                >
                                  ×
                                </button>
                              )}
                          </div>
                          {uploadError[club.club_id] && (
                            <span className="text-xs text-red-600">
                              {uploadError[club.club_id]}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <input
                        type="email"
                        value={getDisplayValue(club, "email")}
                        onChange={(e) =>
                          handleFieldChange(
                            club.club_id,
                            "email",
                            e.target.value
                          )
                        }
                        className="w-full p-1 border border-gray-300 rounded text-sm"
                        placeholder="club@mit.edu"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="url"
                        value={getDisplayValue(club, "website")}
                        onChange={(e) =>
                          handleFieldChange(
                            club.club_id,
                            "website",
                            e.target.value
                          )
                        }
                        className="w-full p-1 border border-gray-300 rounded text-sm"
                        placeholder="https://website.com"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={getDisplayValue(club, "instagram")}
                        onChange={(e) =>
                          handleFieldChange(
                            club.club_id,
                            "instagram",
                            e.target.value
                          )
                        }
                        className="w-full p-1 border border-gray-300 rounded text-sm"
                        placeholder="@handle or URL"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="url"
                        value={getDisplayValue(club, "linkedin")}
                        onChange={(e) =>
                          handleFieldChange(
                            club.club_id,
                            "linkedin",
                            e.target.value
                          )
                        }
                        className="w-full p-1 border border-gray-300 rounded text-sm"
                        placeholder="LinkedIn URL"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="url"
                        value={getDisplayValue(club, "mailing_list")}
                        onChange={(e) =>
                          handleFieldChange(
                            club.club_id,
                            "mailing_list",
                            e.target.value
                          )
                        }
                        className="w-full p-1 border border-gray-300 rounded text-sm"
                        placeholder="Mailing list URL"
                      />
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() =>
                          navigate(`/clubs/${club.club_id}/manage`)
                        }
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        <Settings size={12} />
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {clubs.length} clubs.
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

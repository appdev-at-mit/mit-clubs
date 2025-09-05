import { useState } from "react";
import { X } from "lucide-react";
import { Club } from "../../../types";
import { tagCategories } from "./constants";

function EditClubPage({ club }: { club: Club }) {
  const clubTagsArray: string[] = club.tags || [];

  const [selectedTags, setSelectedTags] = useState<string[]>(clubTagsArray);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [name, setName] = useState(club.name || "");
  const [mission, setMission] = useState(club.mission || "");
  const [email, setEmail] = useState(club.email || "");
  const [instagram, setInstagram] = useState(club.instagram || "");
  const [linkedin, setLinkedin] = useState(club.linkedin || "");
  const [website, setWebsite] = useState(club.website || "");

  function toggleTag(tag: string) {
    if (selectedTags.includes(tag)) {
      setSelectedTags(
        selectedTags.filter(function (t) {
          return t !== tag;
        })
      );
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  }

  function toggleCategory(category: string) {
    setExpandedCategory(expandedCategory === category ? null : category);
  }

  function removeTag(tag: string) {
    setSelectedTags(
      selectedTags.filter(function (t) {
        return t !== tag;
      })
    );
  }

  function getTagsString() {
    return selectedTags.join(", ");
  }

  return (
    <div id="edit-form">
      <div className="mb-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-[150px,1fr] gap-2 md:gap-4 items-start">
            <label className="font-medium text-gray-700">
              Club Name<span className="text-red-500">*</span>
            </label>
            <div>
              <input
                id="club-name"
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md mb-1"
                value={name}
                onChange={function (e) {
                  setName(e.target.value);
                }}
                maxLength={100}
              />
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <p className="text-sm text-gray-500 mt-1">
                  This should be the official name that is recognized by ASA.
                </p>
                <p className="text-sm text-gray-500 mt-1 sm:ml-2 flex-shrink-0">
                  {name.length}/100
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[150px,1fr] gap-2 md:gap-4 items-start">
            <label className="font-medium text-gray-700">
              Club Mission<span className="text-red-500">*</span>
            </label>
            <div>
              <textarea
                id="club-mission"
                className="w-full p-2 border border-gray-300 rounded-md min-h-32 mb-1"
                value={mission}
                onChange={function (e) {
                  setMission(e.target.value);
                }}
                placeholder="Enter your club's mission statement here..."
                maxLength={1000}
              />
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <p className="text-sm text-gray-500 mt-1">
                  We recommend you use your official mission recognized by the
                  ASA. However, we also encourage you to add additional
                  information to the existing mission as you see fit.
                </p>
                <p className="text-sm text-gray-500 mt-1 sm:ml-2 flex-shrink-0">
                  {mission.length}/1000
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[150px,1fr] gap-2 md:gap-4 items-start">
            <label className="font-medium text-gray-700">
              Tags<span className="text-red-500">*</span>
            </label>
            <div>
              <input type="hidden" id="club-tags" value={getTagsString()} />

              <div className="mb-1 flex flex-wrap gap-2">
                {selectedTags.length > 0 ? (
                  selectedTags.map(function (tag) {
                    return (
                      <div
                        key={tag}
                        className="inline-flex items-center bg-appdev-blue/20 text-appdev-blue-dark px-2.5 py-1 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          onClick={function () {
                            removeTag(tag);
                          }}
                          className="ml-1 text-appdev-blue-dark hover:text-appdev-blue-dark/80"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500">
                    No tags selected. Add tags to help students find your club.
                  </p>
                )}
              </div>

              <div className="border border-gray-300 rounded-md p-3 max-h-64 overflow-y-auto">
                {Object.entries(tagCategories).map(function ([category, tags]) {
                  return (
                    <div key={category} className="mb-2 last:mb-0">
                      <button
                        onClick={function () {
                          toggleCategory(category);
                        }}
                        className="w-full text-left mb-1 font-medium text-gray-700 hover:text-gray-900 flex justify-between items-center"
                      >
                        {category}
                        <span
                          className={`text-xs text-gray-500 transition-transform duration-300 ${
                            expandedCategory === category ? "rotate-180" : ""
                          }`}
                        >
                          ↓
                        </span>
                      </button>

                      <div
                        className={`grid transition-all duration-300 ease-in-out ${
                          expandedCategory === category && tags.length > 0
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="ml-2 space-y-1">
                            {tags.map(function (tag) {
                              return (
                                <div key={tag} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id={`tag-${tag}`}
                                    checked={selectedTags.includes(tag)}
                                    onChange={function () {
                                      toggleTag(tag);
                                    }}
                                    className="h-4 w-4 rounded text-appdev-blue-dark focus:ring-appdev-blue-dark"
                                  />
                                  <label
                                    htmlFor={`tag-${tag}`}
                                    className="ml-2 text-sm text-gray-700"
                                  >
                                    {tag}
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Select tags that describe your club. These help students find
                your club when searching.
              </p>
            </div>
          </div>
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Contact & Social Media
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-[150px,1fr] gap-2 md:gap-4 items-start mb-6">
              <label className="font-medium text-gray-700">Email</label>
              <div>
                <input
                  id="club-email"
                  type="email"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={email}
                  onChange={function (e) {
                    setEmail(e.target.value);
                  }}
                  placeholder="club@mit.edu"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Official club email for questions and communication.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[150px,1fr] gap-2 md:gap-4 items-start mb-6">
              <label className="font-medium text-gray-700">Website</label>
              <div>
                <input
                  id="club-website"
                  type="url"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={website}
                  onChange={function (e) {
                    setWebsite(e.target.value);
                  }}
                  placeholder="https://yourclub.mit.edu"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Official club website.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[150px,1fr] gap-2 md:gap-4 items-start mb-6">
              <label className="font-medium text-gray-700">Instagram</label>
              <div>
                <input
                  id="club-instagram"
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={instagram}
                  onChange={function (e) {
                    setInstagram(e.target.value);
                  }}
                  placeholder="@yourclub or https://instagram.com/yourclub"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Instagram handle or full URL.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[150px,1fr] gap-2 md:gap-4 items-start mb-6">
              <label className="font-medium text-gray-700">LinkedIn</label>
              <div>
                <input
                  id="club-linkedin"
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={linkedin}
                  onChange={function (e) {
                    setLinkedin(e.target.value);
                  }}
                  placeholder="https://linkedin.com/company/yourclub"
                />
                <p className="text-sm text-gray-500 mt-1">
                  LinkedIn company or URL.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditClubPage;

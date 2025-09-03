import React, { useState } from "react";
import { X } from "lucide-react";
import { Club } from "../../../types";
import { tagCategories } from "./constants";

function EditClubPage({ club }: { club: Club }) {
  let clubTagsArray: string[] = [];
  if (club.tags) {
    if (typeof club.tags === "string") {
      clubTagsArray = club.tags.split(/,\s*/).filter(function(tag) { return tag.trim(); });
    } else {
      clubTagsArray = club.tags;
    }
  }

  const [selectedTags, setSelectedTags] = useState<string[]>(clubTagsArray);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [name, setName] = useState(club.name || "");
  const [mission, setMission] = useState(club.mission || "");

  function toggleTag(tag: string) {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(function(t) { return t !== tag; }));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  }

  function toggleCategory(category: string) {
    setExpandedCategory(expandedCategory === category ? null : category);
  }

  function removeTag(tag: string) {
    setSelectedTags(selectedTags.filter(function(t) { return t !== tag; }));
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
                onChange={function(e) { setName(e.target.value); }}
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
                onChange={function(e) { setMission(e.target.value); }}
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
                  selectedTags.map(function(tag) { return (
                    <div
                      key={tag}
                      className="inline-flex items-center bg-brand-blue/20 text-brand-blue-dark px-2.5 py-1 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        onClick={function() { removeTag(tag); }}
                        className="ml-1 text-brand-blue-dark hover:text-brand-blue-dark/80"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ); })
                ) : (
                  <p className="text-sm text-gray-500">
                    No tags selected. Add tags to help students find your club.
                  </p>
                )}
              </div>

              <div className="border border-gray-300 rounded-md p-3 max-h-64 overflow-y-auto">
                {Object.entries(tagCategories).map(function([category, tags]) { return (
                  <div key={category} className="mb-2 last:mb-0">
                    <button
                      onClick={function() { toggleCategory(category); }}
                      className="w-full text-left mb-1 font-medium text-gray-700 hover:text-gray-900 flex justify-between items-center"
                    >
                      {category}
                      <span className="text-xs text-gray-500">
                        {expandedCategory === category ? "↑" : "↓"}
                      </span>
                    </button>

                    {expandedCategory === category && tags.length > 0 && (
                      <div className="ml-2 space-y-1">
                        {tags.map(function(tag) { return (
                          <div key={tag} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`tag-${tag}`}
                              checked={selectedTags.includes(tag)}
                              onChange={function() { toggleTag(tag); }}
                              className="h-4 w-4 rounded text-brand-blue-dark focus:ring-brand-blue-dark"
                            />
                            <label
                              htmlFor={`tag-${tag}`}
                              className="ml-2 text-sm text-gray-700"
                            >
                              {tag}
                            </label>
                          </div>
                        ); })}
                      </div>
                    )}
                  </div>
                ); })}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Select tags that describe your club. These help students find
                your club when searching.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditClubPage;

import React, { useState, useEffect, useContext } from "react";
import { FaSearch, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { SlidersHorizontal, X } from "lucide-react";
import ClubCard from "../modules/ClubCard";
import Navbar from "../modules/Navbar";
import { UserContext } from "../App";
import { getAllClubs, getSavedClubIds } from "../../api/clubs";
import { Club } from "../../types";
import {
  tagCategories,
  membershipProcessOptions,
} from "../modules/admin-panel/constants";

type FilterState = {
  membership_process: string[];
  recruiting_cycle: string[];
  is_accepting: boolean;
  is_active: boolean;
  selected_tags: string[];
};

function Clubs() {
  const userContext = useContext(UserContext);

  if (!userContext) {
    throw new Error("Clubs must be used within UserContext");
  }

  const { userId } = userContext;
  const [filters, setFilters] = useState<FilterState>({
    membership_process: [],
    recruiting_cycle: [],
    is_accepting: false,
    is_active: true,
    selected_tags: [],
  });

  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    membership: true,
    recruiting: true,
    status: true,
  });

  const [isCategorySectionOpen, setIsCategorySectionOpen] =
    useState<boolean>(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] =
    useState<boolean>(false);

  const [clubs, setClubs] = useState<Club[]>([]);
  const [savedClubs, setSavedClubs] = useState<Set<string>>(new Set());
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isHoveringResetAll, setIsHoveringResetAll] = useState<boolean>(false);

  const recruitingCycles = ["Open", "Fall Semester", "Spring Semester", "IAP"];

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const clubsData = await getAllClubs();
        setClubs(clubsData);
        applyFilters(clubsData, filters);
      } catch (error) {
        console.error("Error loading clubs:", error);
        setClubs([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    async function loadSavedClubs() {
      if (userId) {
        try {
          const savedClubIds = await getSavedClubIds();
          setSavedClubs(new Set(savedClubIds.map((item) => item.club_id)));
        } catch (error) {
          console.error("Error fetching saved clubs:", error);
          setSavedClubs(new Set());
        }
      } else {
        setSavedClubs(new Set());
      }
    }

    loadSavedClubs();
  }, [userId]);

  function applyFilters(
    clubsList: Club[] = clubs,
    currentFilters: FilterState = filters,
    currentSearchTerm: string = searchTerm
  ) {
    let result = [...clubsList];

    if (currentSearchTerm) {
      const lowerSearchTerm = currentSearchTerm.toLowerCase();
      result = result.filter(
        (club) =>
          (club.name && club.name.toLowerCase().includes(lowerSearchTerm)) ||
          (club.mission && club.mission.toLowerCase().includes(lowerSearchTerm))
      );
    }

    if (
      currentFilters.selected_tags &&
      currentFilters.selected_tags.length > 0
    ) {
      result = result.filter((club) => {
        if (!club.tags) return false;
        const clubTags = Array.isArray(club.tags)
          ? club.tags.map((tag) => tag.toLowerCase())
          : typeof club.tags === "string"
          ? club.tags.toLowerCase().split(/,\s*/)
          : [];
        return currentFilters.selected_tags.every((selectedTag) =>
          clubTags.includes(selectedTag.toLowerCase())
        );
      });
    }

    if (
      currentFilters.membership_process &&
      currentFilters.membership_process.length > 0
    ) {
      result = result.filter((club) =>
        currentFilters.membership_process.includes(club.membership_process)
      );
    }

    if (
      currentFilters.recruiting_cycle &&
      currentFilters.recruiting_cycle.length > 0
    ) {
      result = result.filter((club) =>
        currentFilters.recruiting_cycle.includes(club.recruiting_cycle)
      );
    }

    if (currentFilters.is_accepting) {
      result = result.filter((club) => club.is_accepting === true);
    }

    if (currentFilters.is_active) {
      result = result.filter((club) => club.is_active === true);
    }

    setFilteredClubs(result);
  }

  function resetFilters() {
    const defaultFilters = {
      membership_process: [],
      recruiting_cycle: [],
      is_accepting: false,
      is_active: true,
      selected_tags: [],
    };
    setFilters(defaultFilters);
    setSearchTerm("");
    applyFilters(clubs, defaultFilters, "");
  }

  function toggleFilter(key: keyof FilterState, value: string) {
    setFilters((prev) => {
      const updated = { ...prev };
      if (!Array.isArray(updated[key])) return prev;

      const currentArray = updated[key] as string[];
      const currentIndex = currentArray.indexOf(value);
      if (currentIndex === -1) {
        (updated[key] as string[]) = [...currentArray, value];
      } else {
        (updated[key] as string[]) = currentArray.filter(
          (item) => item !== value
        );
      }
      return updated;
    });
  }

  function handleTagCheckboxChange(tag: string) {
    setFilters((prev) => {
      const currentTags = prev.selected_tags || [];
      let newTags: string[];
      if (currentTags.includes(tag)) {
        newTags = currentTags.filter((t) => t !== tag);
      } else {
        newTags = [...currentTags, tag];
      }
      return { ...prev, selected_tags: newTags };
    });
  }

  function toggleAcceptingMembers() {
    setFilters((prev) => ({ ...prev, is_accepting: !prev.is_accepting }));
  }

  function toggleActiveClubs() {
    setFilters((prev) => ({ ...prev, is_active: !prev.is_active }));
  }

  function toggleSubSection(sectionName: string) {
    setOpenSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  }

  function toggleMobileSidebar() {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  }

  useEffect(() => {
    if (clubs.length > 0) {
      applyFilters(clubs, filters, searchTerm);
    }
  }, [filters, searchTerm, clubs]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-appdev-blue mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading clubs...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-grow overflow-hidden relative pt-16">
        <div
          className={`
            fixed top-[64px] left-0 z-30 w-full max-w-xs bg-white border-r border-gray-300
            transform transition-transform duration-300 ease-in-out
            ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            flex flex-col pt-3 pb-4 px-6
            md:relative md:translate-x-0 md:flex-shrink-0 md:flex md:overflow-y-auto
            md:top-0 md:pt-8
            md:max-w-none
            md:w-64 lg:w-80
          `}
        >
          <button
            onClick={toggleMobileSidebar}
            className="absolute top-6 right-4 md:hidden text-gray-500 hover:text-gray-700 z-40"
            aria-label="Close filters"
          >
            <X size={20} />
          </button>
          <div className="flex justify-between items-center mb-1 flex-shrink-0 md:pt-0 pt-0 mt-0">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-appdev-blue-dark" />
              <span className="text-lg font-bold">Filters</span>
            </div>
            <button
              onClick={resetFilters}
              onMouseEnter={() => setIsHoveringResetAll(true)}
              onMouseLeave={() => setIsHoveringResetAll(false)}
              style={{
                backgroundColor: isHoveringResetAll ? "#E5E7EB" : "#D1D5DB",
                transition: "background-color 0.1s ease",
              }}
              className="px-3 py-1 rounded-md text-xs"
            >
              Reset All
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-3 flex-shrink-0">
            Showing {filteredClubs.length} of {clubs.length} clubs
          </p>
          <div className="flex-grow overflow-y-auto space-y-1 mt-3 scrollbar-hide">
            <div className="border-b border-gray-200 pb-2 mb-2 pr-2">
              <button
                onClick={() => setIsCategorySectionOpen(!isCategorySectionOpen)}
                className="flex justify-between items-center w-full py-1.5 text-left font-semibold text-gray-600 hover:text-gray-800"
              >
                <span>Category</span>
                {isCategorySectionOpen ? (
                  <FaChevronUp size={12} />
                ) : (
                  <FaChevronDown size={12} />
                )}
              </button>
              {isCategorySectionOpen && (
                <div className="mt-2 pl-3 space-y-1">
                  {Object.entries(tagCategories).map(([category, tags]) => (
                    <div key={category} className="pb-1">
                      <button
                        onClick={() => toggleSubSection(category)}
                        className="flex justify-between items-center w-full py-1 text-left font-medium text-sm text-gray-500 hover:text-gray-700"
                      >
                        <span>{category}</span>
                        {openSections[category] ? (
                          <FaChevronUp size={10} />
                        ) : (
                          <FaChevronDown size={10} />
                        )}
                      </button>
                      {openSections[category] && (
                        <div className="mt-1 pl-3 space-y-0.5">
                          {tags.map((tag) => (
                            <div key={tag} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`tag-${tag}`}
                                checked={
                                  filters.selected_tags ? filters.selected_tags.includes(tag) : false
                                }
                                onChange={() => handleTagCheckboxChange(tag)}
                                className="h-3 w-3 rounded text-appdev-blue-dark focus:ring-appdev-blue-dark"
                              />
                              <label htmlFor={`tag-${tag}`} className="text-xs">
                                {tag}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border-b border-gray-200 pb-2 mb-2 pr-2">
              <button
                onClick={() => toggleSubSection("membership")}
                className="flex justify-between items-center w-full py-1.5 text-left font-semibold text-gray-600 hover:text-gray-800"
              >
                <span>Membership Process</span>
                {openSections["membership"] ? (
                  <FaChevronUp size={12} />
                ) : (
                  <FaChevronDown size={12} />
                )}
              </button>
              {openSections["membership"] && (
                <div className="mt-2 pl-3 space-y-1">
                  {membershipProcessOptions.map((process) => (
                    <div key={process} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`membership-${process}`}
                        checked={
                          filters.membership_process ? filters.membership_process.includes(process) : false
                        }
                        onChange={() =>
                          toggleFilter("membership_process", process)
                        }
                        className="h-3.5 w-3.5 rounded text-appdev-blue-dark focus:ring-appdev-blue-dark"
                      />
                      <label
                        htmlFor={`membership-${process}`}
                        className="text-sm"
                      >
                        {process}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border-b border-gray-200 pb-2 mb-2 pr-2">
              <button
                onClick={() => toggleSubSection("recruiting")}
                className="flex justify-between items-center w-full py-1.5 text-left font-semibold text-gray-600 hover:text-gray-800"
              >
                <span>Recruiting Cycle</span>
                {openSections["recruiting"] ? (
                  <FaChevronUp size={12} />
                ) : (
                  <FaChevronDown size={12} />
                )}
              </button>
              {openSections["recruiting"] && (
                <div className="mt-2 pl-3 space-y-1">
                  {recruitingCycles.map((cycle) => (
                    <div key={cycle} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`recruiting-${cycle}`}
                        checked={
                          filters.recruiting_cycle ? filters.recruiting_cycle.includes(cycle) : false
                        }
                        onChange={() => toggleFilter("recruiting_cycle", cycle)}
                        className="h-3.5 w-3.5 rounded text-appdev-blue-dark focus:ring-appdev-blue-dark"
                      />
                      <label
                        htmlFor={`recruiting-${cycle}`}
                        className="text-sm"
                      >
                        {cycle}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="pb-2 mb-2 pr-2">
              <button
                onClick={() => toggleSubSection("status")}
                className="flex justify-between items-center w-full py-1.5 text-left font-semibold text-gray-600 hover:text-gray-800"
              >
                <span>Status</span>
                {openSections["status"] ? (
                  <FaChevronUp size={12} />
                ) : (
                  <FaChevronDown size={12} />
                )}
              </button>
              {openSections["status"] && (
                <div className="mt-2 pl-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_accepting_filter"
                      checked={filters.is_accepting || false}
                      onChange={toggleAcceptingMembers}
                      className="h-3.5 w-3.5 rounded text-appdev-blue-dark focus:ring-appdev-blue-dark"
                    />
                    <label htmlFor="is_accepting_filter" className="text-sm">
                      Accepting Members
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_active_filter"
                      checked={filters.is_active}
                      onChange={toggleActiveClubs}
                      className="h-3.5 w-3.5 rounded text-appdev-blue-dark focus:ring-appdev-blue-dark"
                    />
                    <label htmlFor="is_active_filter" className="text-sm">
                      Active Clubs Only
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden top-[64px]"
            onClick={toggleMobileSidebar}
            aria-hidden="true"
          />
        )}
        <div className="flex-grow overflow-y-auto p-6 w-full bg-gray-50">
          <div className="flex items-center justify-between mb-6">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search clubs by name or mission..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-appdev-blue-dark focus:border-appdev-blue-dark"
              />
              <FaSearch className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400" />
            </div>
            <button
              onClick={toggleMobileSidebar}
              className="ml-4 md:hidden p-2 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-100"
              aria-label="Open filters"
            >
              <SlidersHorizontal size={20} />
            </button>
          </div>

          {/* club grid */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
            {filteredClubs
              .filter((club) => club && club.club_id)
              .map((club) => (
                <div
                  key={club.club_id}
                  className="mb-6 break-inside-avoid-column"
                >
                  <ClubCard
                    id={club.club_id}
                    name={club.name}
                    tags={Array.isArray(club.tags) ? club.tags : []}
                    isAccepting={club.is_accepting}
                    image_url={club.image_url}
                    description={club.mission || ""}
                    recruitmentProcess={club.membership_process}
                    isSavedInitially={savedClubs.has(club.club_id)}
                  />
                </div>
              ))}
            {filteredClubs.length === 0 && !loading && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center w-full">
                <p className="text-center text-gray-500 mt-10">
                  No clubs match your current filters. Try adjusting your search
                  or filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clubs;

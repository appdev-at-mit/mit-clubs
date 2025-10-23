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
  tagEvents,
} from "../modules/admin-panel/constants";

type FilterState = {
  selected_tags: string[];
};

function Clubs() {
  const userContext = useContext(UserContext);

  if (!userContext) {
    throw new Error("Clubs must be used within UserContext");
  }

  const { userId } = userContext;
  const [filters, setFilters] = useState<FilterState>({
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
  const [isMobileView, setIsMobileView] = useState<boolean>(false);

  const recruitingCycles = ["Year-round", "Fall", "Spring", "IAP"];

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

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
        const clubTags = club.tags.map((tag) => tag.toLowerCase());
        return currentFilters.selected_tags.every((selectedTag) =>
          clubTags.includes(selectedTag.toLowerCase())
        );
      });
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
            fixed top-[64px] left-0 bottom-0 z-30 w-full max-w-xs bg-white border-r border-gray-300
            transform transition-transform duration-300 ease-in-out
            ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            flex flex-col pt-6 pb-4 px-6 overflow-y-auto
            md:relative md:translate-x-0 md:flex-shrink-0 md:flex md:overflow-y-auto
            md:top-0 md:pt-6 md:bottom-auto md:h-full
            md:max-w-none
            md:w-64 lg:w-80
          `}
        >
          <div className="flex justify-between items-center mb-1 flex-shrink-0">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-appdev-blue-dark" />
              <span className="text-lg font-bold">Filters</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resetFilters}
                onMouseEnter={() => setIsHoveringResetAll(true)}
                onMouseLeave={() => setIsHoveringResetAll(false)}
                style={{
                  backgroundColor: isHoveringResetAll ? "#E5E7EB" : "#D1D5DB",
                  transition: "background-color 0.1s ease",
                }}
                className="hidden md:block px-3 py-1 rounded-md text-xs"
              >
                Reset All
              </button>
              <button
                onClick={toggleMobileSidebar}
                className="md:hidden text-gray-500 hover:text-gray-700"
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-2 flex-shrink-0">
            Showing {filteredClubs.length} of {clubs.length} clubs
          </p>
          <button
            onClick={resetFilters}
            onMouseEnter={() => setIsHoveringResetAll(true)}
            onMouseLeave={() => setIsHoveringResetAll(false)}
            style={{
              backgroundColor: isHoveringResetAll ? "#E5E7EB" : "#D1D5DB",
              transition: "background-color 0.1s ease",
            }}
            className="md:hidden px-3 py-1 rounded-md text-xs mb-3 self-start"
          >
            Reset All
          </button>
          <div className="flex-grow overflow-y-auto space-y-1 scrollbar-hide">
            <div className="border-b border-gray-200 pb-2 mb-2 pr-2">
              <button
                onClick={() => setIsCategorySectionOpen(!isCategorySectionOpen)}
                className="flex justify-between items-center w-full py-1.5 text-left font-semibold text-gray-600 hover:text-gray-800"
              >
                <span>Category</span>
                <FaChevronDown
                  size={12}
                  className={`transition-transform duration-300 ${
                    isCategorySectionOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isCategorySectionOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="mt-2 pl-3 space-y-1">
                    {Object.entries(tagCategories).map(([category, tags]) => (
                      <div key={category} className="pb-1">
                        <button
                          onClick={() => toggleSubSection(category)}
                          className="flex justify-between items-center w-full py-1 text-left font-medium text-sm text-gray-500 hover:text-gray-700"
                        >
                          <span>{category}</span>
                          <FaChevronDown
                            size={10}
                            className={`transition-transform duration-300 ${
                              openSections[category] ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        <div
                          className={`grid transition-all duration-300 ease-in-out ${
                            openSections[category]
                              ? "grid-rows-[1fr] opacity-100"
                              : "grid-rows-[0fr] opacity-0"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="mt-1 pl-3 space-y-0.5">
                              {tags.map((tag) => (
                                <div
                                  key={tag}
                                  className="flex items-center gap-2"
                                >
                                  <input
                                    type="checkbox"
                                    id={`tag-${tag}`}
                                    checked={
                                      filters.selected_tags
                                        ? filters.selected_tags.includes(tag)
                                        : false
                                    }
                                    onChange={() =>
                                      handleTagCheckboxChange(tag)
                                    }
                                    className="h-3 w-3 rounded text-appdev-blue-dark focus:ring-appdev-blue-dark"
                                  />
                                  <label
                                    htmlFor={`tag-${tag}`}
                                    className="text-xs"
                                  >
                                    {tag}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="border-b border-gray-200 pb-2 mb-2 pr-2">
              <button
                onClick={() => toggleSubSection("eventDetails")}
                className="flex justify-between items-center w-full py-1.5 text-left font-semibold text-gray-600 hover:text-gray-800"
              >
                <span>Event Details</span>
                <FaChevronDown
                  size={12}
                  className={`transition-transform duration-300 ${
                    openSections["eventDetails"] ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  openSections["eventDetails"]
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="mt-2 pl-3 space-y-1">
                    {Object.entries(tagEvents).map(([section, tags]) => (
                      <div key={section} className="pb-1">
                        <button
                          onClick={() => toggleSubSection(section)}
                          className="flex justify-between items-center w-full py-1 text-left font-medium text-sm text-gray-500 hover:text-gray-700"
                        >
                          <span>{section}</span>
                          <FaChevronDown
                            size={10}
                            className={`transition-transform duration-300 ${
                              openSections[section] ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        <div
                          className={`grid transition-all duration-300 ease-in-out ${
                            openSections[section]
                              ? "grid-rows-[1fr] opacity-100"
                              : "grid-rows-[0fr] opacity-0"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="mt-1 pl-3 space-y-0.5">
                              {tags.map((tag) => (
                                <div key={tag} className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id={`tag-${tag}`}
                                    checked={filters.selected_tags.includes(tag)}
                                    onChange={() => handleTagCheckboxChange(tag)}
                                    className="h-3 w-3 rounded text-appdev-blue-dark focus:ring-appdev-blue-dark"
                                  />
                                  <label htmlFor={`tag-${tag}`} className="text-xs">
                                    {tag}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
                placeholder={
                  isMobileView
                    ? "Search clubs"
                    : "Search clubs by name or mission"
                }
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
        </div>
      </div>
    </div>
  );
}

export default Clubs;

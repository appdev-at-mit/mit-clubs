import React, { useState, useEffect, useContext } from "react";
import { FaSearch, FaChevronDown } from "react-icons/fa";
import { SlidersHorizontal, X } from "lucide-react";
import { UserContext } from "../App";
import { getMockEvents } from '../../api/mock-events';
import EventCard from './EventCard';
import { MockEvent } from "../../types";
import {
  tagCategories,
  tagEvents,
} from "./admin-panel/constants";

type FilterState = {
  selected_tags: string[];
};

function DailyView() {
  const userContext = useContext(UserContext);

  if (!userContext) {
    throw new Error("DailyView must be used within UserContext");
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

  const [isCategorySectionOpen, setIsCategorySectionOpen] = useState<boolean>(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const [events, setEvents] = useState<MockEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<MockEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isHoveringResetAll, setIsHoveringResetAll] = useState<boolean>(false);
  const [isMobileView, setIsMobileView] = useState<boolean>(false);

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
        const mockEventsData = getMockEvents();
        setEvents(mockEventsData);
        applyFilters(mockEventsData, filters);
      } catch (error) {
        console.error("Error loading events:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function applyFilters(
    eventsList: MockEvent[] = events,
    currentFilters: FilterState = filters,
    currentSearchTerm: string = searchTerm
  ) {
    let result = [...eventsList];

    // Show all upcoming events from today onwards
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    result = result.filter(event => event.date >= todayStr);

    if (currentSearchTerm) {
      const lowerSearchTerm = currentSearchTerm.toLowerCase();
      result = result.filter(
        (event) =>
          (event.name && event.name.toLowerCase().includes(lowerSearchTerm)) ||
          (event.description && event.description.toLowerCase().includes(lowerSearchTerm))
      );
    }

    if (
      currentFilters.selected_tags &&
      currentFilters.selected_tags.length > 0
    ) {
      result = result.filter((event) => {
        if (!event.tags) return false;
        const eventTags = event.tags.map((tag) => tag.toLowerCase());
        return currentFilters.selected_tags.every((selectedTag) =>
          eventTags.includes(selectedTag.toLowerCase())
        );
      });
    }

    // sort by date and time (chronological order)
    result.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });

    setFilteredEvents(result);
  }

  function resetFilters() {
    const defaultFilters = {
      selected_tags: [],
    };
    setFilters(defaultFilters);
    setSearchTerm("");
    applyFilters(events, defaultFilters, "");
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
    if (events.length > 0) {
      applyFilters(events, filters, searchTerm);
    }
  }, [filters, searchTerm, events]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-grow overflow-hidden relative">
      {/* filter panel */}
      <div
        className={`
          fixed top-[128px] left-0 bottom-0 z-30 w-full max-w-xs bg-white border-r border-gray-300
          transform transition-transform duration-300 ease-in-out
          ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:w-64 flex flex-col
        `}
      >
        <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-700">Filters</h2>
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
        <p className="text-xs text-gray-500 mb-2 flex-shrink-0 px-4 pt-2">
          Showing {filteredEvents.length} upcoming events
        </p>
        <button
          onClick={resetFilters}
          onMouseEnter={() => setIsHoveringResetAll(true)}
          onMouseLeave={() => setIsHoveringResetAll(false)}
          style={{
            backgroundColor: isHoveringResetAll ? "#E5E7EB" : "#D1D5DB",
            transition: "background-color 0.1s ease",
          }}
          className="md:hidden px-3 py-1 rounded-md text-xs mb-3 self-start mx-4"
        >
          Reset All
        </button>
        <div className="flex-grow overflow-y-auto space-y-1 scrollbar-hide px-4">
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

      {/* overlay for mobile sidebar */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden top-[128px]"
          onClick={toggleMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* main content */}
      <div className="flex-grow overflow-y-auto p-6 w-full bg-gray-50">
        {/* Search Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder={
                isMobileView
                  ? "Search events"
                  : "Search events by name or description"
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

        {/* events list (grouped by date */}
        {filteredEvents.length > 0 ? (
          <div className="space-y-8">
            {Object.entries(
              filteredEvents.reduce((groups, event) => {
                const date = event.date;
                if (!groups[date]) {
                  groups[date] = [];
                }
                groups[date].push(event);
                return groups;
              }, {} as Record<string, MockEvent[]>)
            ).map(([date, dateEvents]) => (
              <div key={date}>
                {/* date header */}
                <div className="sticky top-0 bg-gray-50 py-3 mb-4 border-b-2 border-blue-500">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {dateEvents.length} event{dateEvents.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* events for this date */}
                <div className="space-y-4">
                  {dateEvents.map((event) => (
                    <EventCard key={event.event_id} event={event} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-gray-500 text-xl mb-2">No upcoming events found</p>
            <p className="text-gray-400 mb-6">
              Try adjusting your filters or check back later
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DailyView;

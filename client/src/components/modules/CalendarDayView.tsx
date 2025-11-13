import React, { useState, useEffect, useContext } from "react";
import { FaSearch, FaChevronDown, FaBookmark } from "react-icons/fa";
import { SlidersHorizontal, X } from "lucide-react";
import { UserContext } from "../App";
import { getMockEvents } from '../../api/mock-events';
import { MockEvent } from "../../types";
import {
  tagCategories,
  tagEvents,
} from "./admin-panel/constants";

type FilterState = {
  selected_tags: string[];
};

function CalendarDayView() {
  const userContext = useContext(UserContext);

  if (!userContext) {
    throw new Error("CalendarDayView must be used within UserContext");
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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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

    // Filter by selected date
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    result = result.filter(event => event.date === selectedDateStr);

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

    // sort by time
    result.sort((a, b) => a.startTime.localeCompare(b.startTime));

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
  }, [filters, searchTerm, events, selectedDate]);

  // Convert time string (HH:MM) to minutes from midnight
  function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Calculate position and height for timeline
  function getEventStyles(event: MockEvent) {
    const startMinutes = timeToMinutes(event.startTime);
    const endMinutes = timeToMinutes(event.endTime);

    // Calendar starts at 8:00 AM (480 minutes) and ends at 5:00 AM next day (1740 minutes total span)
    const calendarStart = 8 * 60; // 8:00 AM
    const hourHeight = 80; // pixels per hour

    // Calculate position from top (in pixels)
    const top = ((startMinutes - calendarStart) / 60) * hourHeight;

    // Calculate height
    let duration = endMinutes - startMinutes;
    if (duration < 0) duration += 24 * 60; // Handle overnight events
    const height = (duration / 60) * hourHeight;

    return { top, height };
  }

  // Generate hour labels for timeline
  function generateHourLabels() {
    const hours = [];
    for (let i = 8; i <= 29; i++) { // 8 AM to 5 AM next day
      const hour = i % 24;
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const period = hour < 12 ? 'AM' : 'PM';
      hours.push({ value: i, display: `${String(displayHour).padStart(2, '0')}:00` });
    }
    return hours;
  }

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

  const hourLabels = generateHourLabels();

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
          Showing {filteredEvents.length} of {events.filter(e => e.date === selectedDate.toISOString().split('T')[0]).length} events
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
        {/* Search Bar and Date Selector */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder={
                isMobileView
                  ? "Search by club or event name"
                  : "Search by club or event name"
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-appdev-blue-dark focus:border-appdev-blue-dark"
            />
            <FaSearch className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400" />
          </div>
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value + 'T00:00:00'))}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-appdev-blue-dark focus:border-appdev-blue-dark"
          />
          <button
            onClick={toggleMobileSidebar}
            className="md:hidden p-2 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-100"
            aria-label="Open filters"
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>

        {/* Calendar Header */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h2 className="text-3xl font-bold text-gray-900">
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </h2>
        </div>

        {/* Timeline Calendar */}
        <div className="bg-white rounded-lg shadow">
          <div className="flex">
            {/* Time labels */}
            <div className="flex-shrink-0 w-20 border-r border-gray-200">
              {hourLabels.map((hour) => (
                <div
                  key={hour.value}
                  className="h-20 border-b border-gray-100 flex items-start justify-end pr-2 pt-1"
                  style={{ height: '80px' }}
                >
                  <span className="text-xs text-gray-500">{hour.display}</span>
                </div>
              ))}
            </div>

            {/* Events timeline */}
            <div className="flex-grow relative" style={{ minHeight: `${hourLabels.length * 80}px` }}>
              {/* Hour lines */}
              {hourLabels.map((hour, index) => (
                <div
                  key={hour.value}
                  className="absolute left-0 right-0 border-b border-gray-100"
                  style={{ top: `${index * 80}px`, height: '80px' }}
                />
              ))}

              {/* Events */}
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => {
                  const { top, height } = getEventStyles(event);
                  // Assign color based on category
                  const colorClasses = event.isRegistered
                    ? 'bg-appdev-pink-light border-appdev-pink-dark'
                    : 'bg-appdev-blue-light border-appdev-blue-dark';

                  return (
                    <div
                      key={event.event_id}
                      className={`absolute left-2 right-2 ${colorClasses} border-l-4 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden`}
                      style={{
                        top: `${top}px`,
                        height: `${Math.max(height, 60)}px`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-grow min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">
                            {event.name}
                          </h3>
                          <p className="text-xs text-gray-600 truncate">
                            {event.organizerName}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {event.startTime} - {event.endTime}
                          </p>
                          {height > 100 && (
                            <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                              {event.location}
                            </p>
                          )}
                        </div>
                        {event.isRegistered && (
                          <FaBookmark className="text-appdev-pink-dark flex-shrink-0" size={12} />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📅</div>
                    <p className="text-gray-500">No events on this day</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarDayView;

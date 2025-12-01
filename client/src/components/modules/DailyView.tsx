import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaSearch, FaChevronDown, FaBookmark } from "react-icons/fa";
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

type DailyViewMode = 'list' | 'calendar';
type CalendarMode = 'day' | 'week';

function DailyView() {
  const userContext = useContext(UserContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  if (!userContext) {
    throw new Error("DailyView must be used within UserContext");
  }

  const { userId } = userContext;

  // Initialize state from URL parameters or use defaults
  const [viewMode, setViewMode] = useState<DailyViewMode>(() => {
    const view = searchParams.get('view');
    return (view === 'list' || view === 'calendar') ? view : 'list';
  });

  const [calendarMode, setCalendarMode] = useState<CalendarMode>(() => {
    const mode = searchParams.get('mode');
    return (mode === 'day' || mode === 'week') ? mode : 'day';
  });

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      const parsedDate = new Date(dateParam + 'T00:00:00');
      return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
    }
    return new Date();
  });
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
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const d = new Date();
    const day = d.getDay(); // Sunday = 0
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  });
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

  // Update URL when view mode, calendar mode, or selected date changes
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);

    newParams.set('view', viewMode);

    if (viewMode === 'calendar') {
      newParams.set('mode', calendarMode);
      newParams.set('date', selectedDate.toISOString().split('T')[0]);
    } else {
      newParams.delete('mode');
      newParams.delete('date');
    }

    setSearchParams(newParams, { replace: true });
  }, [viewMode, calendarMode, selectedDate]);

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

    // For list view: show all upcoming events from today onwards
    // For calendar view: show events based on calendar mode (day/week)
    if (viewMode === 'list') {
      // List view: show events in the currently selected week (Monday - Sunday)
      const startIso = weekStart.toISOString().split('T')[0];
      const endIso = addDays(weekStart, 6).toISOString().split('T')[0];
      result = result.filter((event) => event.date >= startIso && event.date <= endIso);
    } else {
      const selectedDateStr = selectedDate.toISOString().split('T')[0];
      result = result.filter(event => {
        // Show events that start on this day
        if (event.date === selectedDateStr) return true;

        // Check if this is a multi-day event that continues into this day
        const eventDate = new Date(event.date + 'T00:00:00');
        const eventStartMinutes = timeToMinutes(event.startTime);
        const eventEndMinutes = timeToMinutes(event.endTime);

        let duration = eventEndMinutes - eventStartMinutes;
        if (duration === 0) duration = 24 * 60; // 24-hour event
        else if (duration < 0) duration += 24 * 60; // Spans past midnight

        // Calculate if event extends to the next day
        if (eventStartMinutes + duration > 24 * 60) {
          const nextDay = new Date(eventDate);
          nextDay.setDate(nextDay.getDate() + 1);
          const nextDayStr = nextDay.toISOString().split('T')[0];
          return nextDayStr === selectedDateStr;
        }

        return false;
      });
    } else {
      // Week view: show events for the entire week (Sunday - Saturday)
      const weekStart = new Date(selectedDate);
      weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekStartStr = weekStart.toISOString().split('T')[0];
      const weekEndStr = weekEnd.toISOString().split('T')[0];

      result = result.filter(event => {
        // Show events that start within this week
        if (event.date >= weekStartStr && event.date <= weekEndStr) return true;

        // Check if this is a multi-day event that continues into this week
        const eventDate = new Date(event.date + 'T00:00:00');
        const eventStartMinutes = timeToMinutes(event.startTime);
        const eventEndMinutes = timeToMinutes(event.endTime);

        let duration = eventEndMinutes - eventStartMinutes;
        if (duration === 0) duration = 24 * 60; // 24-hour event
        else if (duration < 0) duration += 24 * 60; // Spans past midnight

        // Calculate if event extends into this week
        if (eventStartMinutes + duration > 24 * 60) {
          const nextDay = new Date(eventDate);
          nextDay.setDate(nextDay.getDate() + 1);
          const nextDayStr = nextDay.toISOString().split('T')[0];
          return nextDayStr >= weekStartStr && nextDayStr <= weekEndStr;
        }

        return false;
      });
    }

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

  function handleEventClick(eventId: string) {
    navigate(`/events/${eventId}`);
  }

  useEffect(() => {
    if (events.length > 0) {
      applyFilters(events, filters, searchTerm);
    }
  }, [filters, searchTerm, events, viewMode, selectedDate, weekStart]);

  function addDays(date: Date, days: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function getStartOfWeek(d: Date) {
    const copy = new Date(d);
    const day = copy.getDay(); // Sunday = 0
    copy.setDate(copy.getDate() - day);
    copy.setHours(0, 0, 0, 0);
    return copy;
  }

  function isoDate(d: Date) {
    return d.toISOString().split('T')[0];
  }

  function prevWeek() {
    const todayStart = getStartOfWeek(new Date());
    const min = addDays(todayStart, -14); // allow up to 2 weeks in past
    setWeekStart((s: Date) => {
      const candidate = addDays(s, -7);
      return candidate < min ? min : candidate;
    });
  }

  function nextWeek() {
    setWeekStart((s: Date) => addDays(s, 7));
  }

  function goToThisWeek() {
    const d = new Date();
    const day = d.getDay(); // Sunday = 0
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    setWeekStart(d);
  }

  // Convert time string (HH:MM or HH:MM AM/PM) to minutes from midnight
  function timeToMinutes(time: string): number {
    // Handle AM/PM format
    const timeLower = time.toLowerCase();
    const isPM = timeLower.includes('pm');
    const isAM = timeLower.includes('am');

    // Remove AM/PM and trim
    const timeOnly = time.replace(/\s*(am|pm)/gi, '').trim();
    const timeParts = timeOnly.split(':').map(Number);
    const hours = timeParts[0] || 0;
    const minutes = timeParts[1] || 0;

    let adjustedHours = hours;
    if (isPM && hours !== 12) {
      adjustedHours = hours + 12;
    } else if (isAM && hours === 12) {
      adjustedHours = 0; // 12 AM is midnight
    }

    return adjustedHours * 60 + minutes;
  }

  // Calculate position and height for timeline
  function getEventStyles(event: MockEvent, isCurrentDay: boolean = true) {
    const startMinutes = timeToMinutes(event.startTime);
    let endMinutes = timeToMinutes(event.endTime);

    const calendarStart = 0; // 12:00 AM (midnight)
    const calendarEnd = 24 * 60; // 12:00 AM next day (midnight)
    const hourHeight = 80; // pixels per hour

    let duration = endMinutes - startMinutes;
    // If end time equals start time, it's a 24-hour event
    if (duration === 0) {
      duration = 24 * 60;
    } else if (duration < 0) {
      // Event spans past midnight - add 24 hours
      duration += 24 * 60;
    }

    // Check if this event started on a previous day (continuation event)
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    const eventDate = event.date;
    const isContinuation = eventDate !== selectedDateStr;

    let top, height;

    if (isContinuation) {
      // Event continues from previous day - start at midnight
      top = 0;
      // Calculate remaining duration from the event
      const totalEventDuration = startMinutes + duration;
      const remainingDuration = totalEventDuration - calendarEnd;
      height = (Math.min(remainingDuration, calendarEnd) / 60) * hourHeight;
    } else {
      // Event starts today
      top = ((startMinutes - calendarStart) / 60) * hourHeight;

      // Cap the event at end of day (midnight)
      const eventEndMinutes = startMinutes + duration;
      if (eventEndMinutes > calendarEnd) {
        duration = calendarEnd - startMinutes;
      }

      height = (duration / 60) * hourHeight;
    }

    return { top, height };
  }

  // Generate hour labels for timeline (12 AM to 11 PM)
  function generateHourLabels() {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      const displayHour = i === 0 ? 12 : i > 12 ? i - 12 : i;
      const period = i < 12 ? 'AM' : 'PM';
      hours.push({
        value: i,
        display: `${displayHour}:00 ${period}`
      });
    }
    return hours;
  }

  // Calculate overlapping events and their positions
  function calculateEventLayout(events: MockEvent[]) {
    const selectedDateStr = selectedDate.toISOString().split('T')[0];

    // Sort events, accounting for continuation events starting at midnight
    const sortedEvents = [...events].sort((a, b) => {
      const aIsContinuation = a.date !== selectedDateStr;
      const bIsContinuation = b.date !== selectedDateStr;

      const aStart = aIsContinuation ? 0 : timeToMinutes(a.startTime);
      const bStart = bIsContinuation ? 0 : timeToMinutes(b.startTime);

      if (aStart !== bStart) return aStart - bStart;

      // For events starting at same time, prioritize longer events
      const aEnd = aIsContinuation ? timeToMinutes(a.endTime) : timeToMinutes(a.endTime);
      const bEnd = bIsContinuation ? timeToMinutes(b.endTime) : timeToMinutes(b.endTime);
      return bEnd - aEnd;
    });

    const columns: MockEvent[][] = [];

    sortedEvents.forEach(event => {
      const isContinuation = event.date !== selectedDateStr;
      const eventStart = isContinuation ? 0 : timeToMinutes(event.startTime);
      let eventEnd = timeToMinutes(event.endTime);

      // Handle 24-hour events and events spanning past midnight
      if (eventEnd === eventStart && !isContinuation) {
        eventEnd = 24 * 60; // 24-hour event
      } else if (eventEnd < eventStart && !isContinuation) {
        eventEnd += 24 * 60; // Spans past midnight
      }

      // Cap at end of day
      eventEnd = Math.min(eventEnd, 24 * 60);

      // Find the first column where this event doesn't overlap
      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        const column = columns[i];
        const lastEventInColumn = column[column.length - 1];
        const lastIsContinuation = lastEventInColumn.date !== selectedDateStr;

        // Calculate the end time of the last event in this column
        let lastEventEnd = timeToMinutes(lastEventInColumn.endTime);
        const lastEventStart = lastIsContinuation ? 0 : timeToMinutes(lastEventInColumn.startTime);

        // Handle 24-hour events and events spanning past midnight for the last event
        if (lastEventEnd === lastEventStart && !lastIsContinuation) {
          lastEventEnd = 24 * 60; // 24-hour event
        } else if (lastEventEnd < lastEventStart && !lastIsContinuation) {
          lastEventEnd += 24 * 60; // Spans past midnight
        }

        // Cap at end of day
        lastEventEnd = Math.min(lastEventEnd, 24 * 60);

        if (eventStart >= lastEventEnd) {
          column.push(event);
          placed = true;
          break;
        }
      }

      // If no suitable column found, create a new one
      if (!placed) {
        columns.push([event]);
      }
    });

    // Create a map of event to its position
    const eventPositions = new Map<string, { column: number, totalColumns: number }>();

    columns.forEach((column, columnIndex) => {
      column.forEach(event => {
        eventPositions.set(event.event_id, {
          column: columnIndex,
          totalColumns: columns.length
        });
      });
    });

    return eventPositions;
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

  const hourLabels = viewMode === 'calendar' ? generateHourLabels() : [];
  const eventLayout = viewMode === 'calendar' ? calculateEventLayout(filteredEvents) : new Map();

  // weekFilteredEvents: events within the currently selected week (Monday - Sunday)
  const weekStartIso = weekStart.toISOString().split('T')[0];
  const weekEndIso = addDays(weekStart, 6).toISOString().split('T')[0];
  const weekFilteredEvents = filteredEvents.filter(
    (ev) => ev.date >= weekStartIso && ev.date <= weekEndIso
  );

  // human-friendly week label (e.g. "Nov 30 — Dec 6, 2025")
  const weekEnd = addDays(weekStart, 6);
  const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  // Navigation availability
  const todayStart = getStartOfWeek(new Date());
  const minWeekStart = addDays(todayStart, -14); // 2 weeks ago
  const canPrev = weekStart.getTime() > minWeekStart.getTime();

  // Determine if there are any events after the end of the current week
  // (a) filtered check (kept for reference) — respects current search/filters
  const hasMoreFutureEventsFiltered = events.some((ev: MockEvent) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchesName = ev.name && ev.name.toLowerCase().includes(q);
      const matchesDesc = ev.description && ev.description.toLowerCase().includes(q);
      if (!matchesName && !matchesDesc) return false;
    }
    if (filters.selected_tags && filters.selected_tags.length > 0) {
      if (!ev.tags) return false;
      const eventTags = ev.tags.map((t: string) => t.toLowerCase());
      if (!filters.selected_tags.every((t: string) => eventTags.includes(t.toLowerCase()))) return false;
    }
    return ev.date > weekEndIso;
  });

  // (b) global check — any event in the future regardless of filters
  const hasMoreFutureEventsAll = events.some((ev: MockEvent) => ev.date > weekEndIso);

  // Enable Next if there are any events in the future (ignoring filters)
  const canNext = hasMoreFutureEventsAll;

  return (
    <div className="flex h-screen overflow-hidden relative" style={{ height: 'calc(100vh - 64px)' }}>
      {/* filter panel */}
      <div
        className={`
          fixed top-16 left-0 bottom-0 z-30 w-full max-w-xs bg-white border-r border-gray-300
          transform transition-transform duration-300 ease-in-out
          ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:sticky md:top-16 md:h-screen md:w-64 flex flex-col
        `}
      >
        <div className="flex justify-between items-center mb-1 flex-shrink-0 px-6 pt-6">
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
        <p className="text-xs text-gray-500 mb-2 flex-shrink-0 px-4 pt-2">
          Showing {viewMode === 'list' ? weekFilteredEvents.length : filteredEvents.length} upcoming events
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
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden top-16"
          onClick={toggleMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* main content */}
      <div className="flex-grow overflow-y-auto p-6 w-full bg-gray-50">
        {/* View Toggle and Search Bar */}
        <div className="mb-6 space-y-4">
          {/* View Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Calendar View
              </button>
            </div>
            {viewMode === 'calendar' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    const increment = calendarMode === 'week' ? 7 : 1;
                    newDate.setDate(newDate.getDate() - increment);
                    setSelectedDate(newDate);
                  }}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                  aria-label={calendarMode === 'week' ? 'Previous week' : 'Previous day'}
                >
                  <span className="text-lg">←</span>
                </button>
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value + 'T00:00:00'))}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-appdev-blue-dark focus:border-appdev-blue-dark"
                />
                <button
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    const increment = calendarMode === 'week' ? 7 : 1;
                    newDate.setDate(newDate.getDate() + increment);
                    setSelectedDate(newDate);
                  }}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                  aria-label={calendarMode === 'week' ? 'Next week' : 'Next day'}
                >
                  <span className="text-lg">→</span>
                </button>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="flex items-center justify-between">
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
              {/* Week navigation (visible on all sizes; compact on mobile) */}
              <div className="flex items-center gap-2 ml-0 md:ml-4">
                <button
                  onClick={() => canPrev && prevWeek()}
                  aria-label="Previous week"
                  disabled={!canPrev}
                  aria-disabled={!canPrev}
                  className={`px-2 py-1 md:px-3 md:py-2 rounded text-sm transition-colors ${
                    canPrev
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-200 text-white cursor-not-allowed opacity-60'
                  }`}
                >
                  ←
                </button>
                <button
                  onClick={goToThisWeek}
                  aria-label="This week"
                  className="px-2 py-1 md:px-3 md:py-2 rounded bg-gray-100 text-gray-800 border hover:bg-gray-200 text-sm"
                >
                  This Week
                </button>
                <button
                  onClick={() => canNext && nextWeek()}
                  aria-label="Next week"
                  disabled={!canNext}
                  aria-disabled={!canNext}
                  className={`px-2 py-1 md:px-3 md:py-2 rounded text-sm transition-colors ${
                    canNext
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-200 text-white cursor-not-allowed opacity-60'
                  }`}
                >
                  →
                </button>
                <div className="hidden sm:block ml-3 text-sm text-gray-600">
                  {weekLabel}
                </div>
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

        {/* Conditional rendering based on view mode */}
        {viewMode === 'list' ? (
          <>
          {filteredEvents.length > 0 ? (
          <div className="space-y-8">
            {Object.entries(
              weekFilteredEvents.reduce((groups, event) => {
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
                <div className="bg-gray-50 py-3 mb-4 border-b-2" style={{ borderColor: '#5b8fb9' }}>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
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
            <div className="text-6xl mb-4"></div>
            <p className="text-gray-500 text-xl mb-2">No upcoming events found</p>
            <p className="text-gray-400 mb-6">
              Try adjusting your filters or check back later
            </p>
          </div>
        )
          }
          </>
        ) : (
          <>
            {/* Calendar Header - Week view only */}
            {calendarMode === 'week' && (
              <div className="bg-gray-50 py-3 mb-4 border-b-2 flex items-start justify-between" style={{ borderColor: '#5b8fb9' }}>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {(() => {
                      const weekStart = new Date(selectedDate);
                      weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
                      const weekEnd = new Date(weekStart);
                      weekEnd.setDate(weekStart.getDate() + 6);
                      return `${weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
                    })()}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Day/Week Toggle */}
                <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-300">
                  <button
                    onClick={() => setCalendarMode('day')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      calendarMode === 'day'
                        ? 'bg-appdev-blue-dark text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Day
                  </button>
                  <button
                    onClick={() => setCalendarMode('week')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      calendarMode === 'week'
                        ? 'bg-appdev-blue-dark text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Week
                  </button>
                </div>
              </div>
            )}

            {/* Day view header and toggle */}
            {calendarMode === 'day' && (
              <div className="bg-gray-50 py-3 mb-4 border-b-2 flex items-start justify-between" style={{ borderColor: '#5b8fb9' }}>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Day/Week Toggle */}
                <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-300">
                  <button
                    onClick={() => setCalendarMode('day')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      calendarMode === 'day'
                        ? 'bg-appdev-blue-dark text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Day
                  </button>
                  <button
                    onClick={() => setCalendarMode('week')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      calendarMode === 'week'
                        ? 'bg-appdev-blue-dark text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Week
                  </button>
                </div>
              </div>
            )}

            {/* Timeline Calendar */}
            {calendarMode === 'day' ? (
              <div className="bg-white rounded-lg shadow overflow-hidden max-h-[calc(100vh-280px)] overflow-y-auto">

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
                  {filteredEvents.map((event) => {
                      const { top, height } = getEventStyles(event);
                      const layout = eventLayout.get(event.event_id);
                      const column = layout?.column ?? 0;
                      const totalColumns = layout?.totalColumns ?? 1;

                      // Calculate horizontal positioning for overlapping events
                      const widthPercent = 100 / totalColumns;
                      const leftPercent = (column * widthPercent);

                      const bgColor = event.isRegistered ? '#fecdd3' : '#dbe9f4';
                      const borderColor = event.isRegistered ? '#db2777' : '#5b8fb9';

                      return (
                        <div
                          key={event.event_id}
                          onClick={() => handleEventClick(event.event_id)}
                          className="absolute border-l-4 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                          style={{
                            top: `${top}px`,
                            height: `${Math.max(height, 60)}px`,
                            left: `calc(${leftPercent}% + 8px)`,
                            width: `calc(${widthPercent}% - 16px)`,
                            backgroundColor: bgColor,
                            borderColor: borderColor,
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
                              <FaBookmark className="text-pink-600 flex-shrink-0" size={12} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
              </div>
            ) : (
              // Week View
              <div className="bg-white rounded-lg shadow overflow-hidden max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Sticky Header Row */}
                <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
                  <div className="flex min-w-max overflow-x-auto">
                    {/* Empty corner for time label column */}
                    <div className="flex-shrink-0 w-20 border-r border-gray-200 h-16"></div>

                    {/* Day headers */}
                    {(() => {
                      const weekStart = new Date(selectedDate);
                      weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
                      const headers = [];

                      for (let i = 0; i < 7; i++) {
                        const currentDay = new Date(weekStart);
                        currentDay.setDate(weekStart.getDate() + i);

                        headers.push(
                          <div key={i} className="flex-1 border-r border-gray-200 last:border-r-0 px-2 py-2 text-center" style={{ minWidth: '150px' }}>
                            <div className="text-xs font-semibold text-gray-600">
                              {currentDay.toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                            <div className={`text-lg font-bold ${
                              currentDay.toDateString() === new Date().toDateString()
                                ? 'text-appdev-blue-dark'
                                : 'text-gray-900'
                            }`}>
                              {currentDay.getDate()}
                            </div>
                          </div>
                        );
                      }
                      return headers;
                    })()}
                  </div>
                </div>

                {/* Scrollable content */}
                <div className="overflow-x-auto">
                  <div className="flex min-w-max">
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

                    {/* Days of the week (Sunday - Saturday) */}
                    {(() => {
                    const weekStart = new Date(selectedDate);
                    weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
                    const days = [];

                    for (let i = 0; i < 7; i++) {
                      const currentDay = new Date(weekStart);
                      currentDay.setDate(weekStart.getDate() + i);
                      const dayStr = currentDay.toISOString().split('T')[0];

                      // Filter events for this specific day (including multi-day events)
                      const dayEvents = filteredEvents.filter(event => {
                        // Show events that start on this day
                        if (event.date === dayStr) return true;

                        // Check if this is a multi-day event that continues into this day
                        const eventDate = new Date(event.date + 'T00:00:00');
                        const eventStartMinutes = timeToMinutes(event.startTime);
                        const eventEndMinutes = timeToMinutes(event.endTime);

                        let duration = eventEndMinutes - eventStartMinutes;
                        if (duration === 0) duration = 24 * 60; // 24-hour event
                        else if (duration < 0) duration += 24 * 60; // Spans past midnight

                        // Calculate if event extends to this day
                        if (eventStartMinutes + duration > 24 * 60) {
                          const nextDay = new Date(eventDate);
                          nextDay.setDate(nextDay.getDate() + 1);
                          const nextDayStr = nextDay.toISOString().split('T')[0];
                          return nextDayStr === dayStr;
                        }

                        return false;
                      });

                      const dayEventLayout = calculateEventLayout(dayEvents);

                      days.push(
                        <div key={i} className="flex-1 border-r border-gray-200 last:border-r-0" style={{ minWidth: '150px' }}>
                          {/* Events timeline for this day */}
                          <div className="relative" style={{ minHeight: `${hourLabels.length * 80}px` }}>
                            {/* Hour lines */}
                            {hourLabels.map((hour, index) => (
                              <div
                                key={hour.value}
                                className="absolute left-0 right-0 border-b border-gray-100"
                                style={{ top: `${index * 80}px`, height: '80px' }}
                              />
                            ))}

                            {/* Events */}
                            {dayEvents.map((event) => {
                              // Calculate event styles for this specific day
                              const startMinutes = timeToMinutes(event.startTime);
                              let endMinutes = timeToMinutes(event.endTime);
                              const hourHeight = 80;

                              // Check if this is a continuation event (started on a previous day)
                              const isContinuation = event.date !== dayStr;

                              let top, height;
                              if (isContinuation) {
                                // Event continues from previous day - start at midnight
                                top = 0;
                                const totalDuration = endMinutes - startMinutes;
                                const remainingDuration = (startMinutes + (totalDuration === 0 ? 24 * 60 : totalDuration > 0 ? totalDuration : totalDuration + 24 * 60)) - 24 * 60;
                                height = (Math.min(remainingDuration, 24 * 60) / 60) * hourHeight;
                              } else {
                                // Event starts today
                                top = (startMinutes / 60) * hourHeight;

                                let duration = endMinutes - startMinutes;
                                if (duration === 0) duration = 24 * 60; // 24-hour event
                                else if (duration < 0) duration += 24 * 60; // Spans past midnight

                                // Cap at end of day
                                if (startMinutes + duration > 24 * 60) {
                                  duration = 24 * 60 - startMinutes;
                                }

                                height = (duration / 60) * hourHeight;
                              }

                              const layout = dayEventLayout.get(event.event_id);
                              const column = layout?.column ?? 0;
                              const totalColumns = layout?.totalColumns ?? 1;

                              const widthPercent = 100 / totalColumns;
                              const leftPercent = (column * widthPercent);

                              const bgColor = event.isRegistered ? '#fecdd3' : '#dbe9f4';
                              const borderColor = event.isRegistered ? '#db2777' : '#5b8fb9';

                              return (
                                <div
                                  key={event.event_id}
                                  onClick={() => handleEventClick(event.event_id)}
                                  className="absolute border-l-4 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                                  style={{
                                    top: `${top}px`,
                                    height: `${Math.max(height, 60)}px`,
                                    left: `calc(${leftPercent}% + 2px)`,
                                    width: `calc(${widthPercent}% - 4px)`,
                                    backgroundColor: bgColor,
                                    borderColor: borderColor,
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
                                      <FaBookmark className="text-pink-600 flex-shrink-0" size={12} />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                    return days;
                  })()}
                </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default DailyView;

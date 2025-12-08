import { useState, useEffect } from "react";
import { Event } from "../../../../types";
import { FilterState, DailyViewMode, CalendarMode } from "../types";
import { addDays, timeToMinutes } from "../utils/dateUtils";

export function useFilters(
  events: Event[],
  viewMode: DailyViewMode,
  calendarMode: CalendarMode,
  selectedDate: Date,
  weekStart: Date,
  searchTerm: string
) {
  const [filters, setFilters] = useState<FilterState>({
    selected_tags: [],
  });

  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    membership: true,
    recruiting: true,
    status: true,
  });

  const [isCategorySectionOpen, setIsCategorySectionOpen] = useState<boolean>(true);
  const [isHoveringResetAll, setIsHoveringResetAll] = useState<boolean>(false);

  // Apply filters effect - runs whenever any dependency changes
  useEffect(() => {
    let result = [...events];

    // Helper to get date string from event
    const getEventDateStr = (event: Event) => {
      const date = new Date(event.date);
      return date.toISOString().split('T')[0];
    };

    // Date filtering based on view mode
    if (viewMode === 'list') {
      // List view: show events in the currently selected week (Sunday - Saturday)
      const startIso = weekStart.toISOString().split('T')[0];
      const endIso = addDays(weekStart, 6).toISOString().split('T')[0];
      result = result.filter((event) => {
        const eventDate = getEventDateStr(event);
        return eventDate >= startIso && eventDate <= endIso;
      });
    } else if (viewMode === 'calendar' && calendarMode === 'day') {
      // Day view: show events for selected day
      const selectedDateStr = selectedDate.toISOString().split('T')[0];
      result = result.filter(event => {
        const eventDate = getEventDateStr(event);
        if (eventDate === selectedDateStr) return true;

        // Check multi-day events
        const eventStartMinutes = timeToMinutes(event.date);
        const eventEndMinutes = event.end_time ? timeToMinutes(event.end_time) : eventStartMinutes + (event.duration || 60);

        let duration = eventEndMinutes - eventStartMinutes;
        if (duration === 0) duration = 24 * 60;
        else if (duration < 0) duration += 24 * 60;

        if (eventStartMinutes + duration > 24 * 60) {
          const nextDay = new Date(event.date);
          nextDay.setDate(nextDay.getDate() + 1);
          const nextDayStr = nextDay.toISOString().split('T')[0];
          return nextDayStr === selectedDateStr;
        }

        return false;
      });
    } else if (viewMode === 'calendar' && calendarMode === 'week') {
      // Week view: use the SAME week as list view
      const startIso = weekStart.toISOString().split('T')[0];
      const endIso = addDays(weekStart, 6).toISOString().split('T')[0];

      result = result.filter((event) => {
        const eventDate = getEventDateStr(event);
        return eventDate >= startIso && eventDate <= endIso;
      });
    }

    // Search filtering
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        (event) =>
          (event.title && event.title.toLowerCase().includes(lowerSearchTerm)) ||
          (event.details && event.details.toLowerCase().includes(lowerSearchTerm)) ||
          (event.organizer && event.organizer.toLowerCase().includes(lowerSearchTerm))
      );
    }

    // Tag filtering
    if (filters.selected_tags && filters.selected_tags.length > 0) {
      result = result.filter((event) => {
        if (!event.tags || event.tags.length === 0) return false;
        const eventTags = event.tags.map((tag) => tag.toLowerCase());
        return filters.selected_tags.some((selectedTag) =>
          eventTags.includes(selectedTag.toLowerCase())
        );
      });
    }

    // Sort by date
    result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setFilteredEvents(result);
  }, [
    events,
    viewMode,
    calendarMode,
    selectedDate,
    weekStart,
    searchTerm,
    filters.selected_tags,
  ]);

  function resetFilters() {
    setFilters({ selected_tags: [] });
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

  return {
    filters,
    filteredEvents,
    openSections,
    isCategorySectionOpen,
    setIsCategorySectionOpen,
    isHoveringResetAll,
    setIsHoveringResetAll,
    resetFilters,
    handleTagCheckboxChange,
    toggleSubSection,
  };
}

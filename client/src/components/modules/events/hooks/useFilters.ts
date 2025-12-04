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

  function applyFilters(
    eventsList: Event[] = events,
    currentFilters: FilterState = filters,
    currentSearchTerm: string = searchTerm
  ) {
    let result = [...eventsList];

    // Helper to get date string from event
    const getEventDateStr = (event: Event) => {
      const date = new Date(event.date);
      return date.toISOString().split('T')[0];
    };

    // For list view: show all upcoming events from today onwards
    // For calendar view: show events based on calendar mode (day/week)
    if (viewMode === 'list') {
      // List view: show events in the currently selected week (Sunday - Saturday)
      const startIso = weekStart.toISOString().split('T')[0];
      const endIso = addDays(weekStart, 6).toISOString().split('T')[0];
      result = result.filter((event) => {
        const eventDate = getEventDateStr(event);
        return eventDate >= startIso && eventDate <= endIso;
      });
    } else if (calendarMode === 'day') {
      const selectedDateStr = selectedDate.toISOString().split('T')[0];
      result = result.filter(event => {
        // Show events that start on this day
        const eventDate = getEventDateStr(event);
        if (eventDate === selectedDateStr) return true;

        // Check if this is a multi-day event that continues into this day
        const eventStartMinutes = timeToMinutes(event.date);
        const eventEndMinutes = event.end_time ? timeToMinutes(event.end_time) : eventStartMinutes + (event.duration || 60);

        let duration = eventEndMinutes - eventStartMinutes;
        if (duration === 0) duration = 24 * 60; // 24-hour event
        else if (duration < 0) duration += 24 * 60; // Spans past midnight

        // Calculate if event extends to the next day
        if (eventStartMinutes + duration > 24 * 60) {
          const nextDay = new Date(event.date);
          nextDay.setDate(nextDay.getDate() + 1);
          const nextDayStr = nextDay.toISOString().split('T')[0];
          return nextDayStr === selectedDateStr;
        }

        return false;
      });
    } else {
      // Week view: show events for the entire week (Sunday - Saturday)
      const weekStartDate = new Date(selectedDate);
      weekStartDate.setDate(selectedDate.getDate() - selectedDate.getDay());
      weekStartDate.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStartDate);
      weekEnd.setDate(weekStartDate.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekStartStr = weekStartDate.toISOString().split('T')[0];
      const weekEndStr = weekEnd.toISOString().split('T')[0];

      result = result.filter(event => {
        // Show events that start within this week
        const eventDateStr = getEventDateStr(event);
        if (eventDateStr >= weekStartStr && eventDateStr <= weekEndStr) return true;

        // Check if this is a multi-day event that continues into this week
        const eventDateObj = new Date(event.date);
        const eventStartMinutes = timeToMinutes(event.date);
        const eventEndMinutes = event.end_time ? timeToMinutes(event.end_time) : eventStartMinutes + (event.duration || 60);

        let duration = eventEndMinutes - eventStartMinutes;
        if (duration === 0) duration = 24 * 60; // 24-hour event
        else if (duration < 0) duration += 24 * 60; // Spans past midnight

        // Calculate if event extends into this week
        if (eventStartMinutes + duration > 24 * 60) {
          const nextDay = new Date(eventDateObj);
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
          (event.title && event.title.toLowerCase().includes(lowerSearchTerm)) ||
          (event.details && event.details.toLowerCase().includes(lowerSearchTerm)) ||
          (event.organizer && event.organizer.toLowerCase().includes(lowerSearchTerm))
      );
    }

    if (
      currentFilters.selected_tags &&
      currentFilters.selected_tags.length > 0
    ) {
      result = result.filter((event) => {
        if (!event.tags) return false;
        if (!event.tags || event.tags.length === 0) return false;
        const eventTags = event.tags.map((tag) => tag.name.toLowerCase());
        return currentFilters.selected_tags.every((selectedTag) =>
          eventTags.includes(selectedTag.toLowerCase())
        );
      });
    }

    // sort by date and time (chronological order)
    result.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    setFilteredEvents(result);
  }

  function resetFilters() {
    const defaultFilters = {
      selected_tags: [],
    };
    setFilters(defaultFilters);
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

  useEffect(() => {
    if (events.length > 0) {
      applyFilters(events, filters, searchTerm);
    }
  }, [filters, searchTerm, events, viewMode, selectedDate, weekStart]);

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
    applyFilters,
  };
}

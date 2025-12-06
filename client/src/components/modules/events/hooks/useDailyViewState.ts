import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DailyViewMode, CalendarMode } from "../types";
import { getStartOfWeek } from "../utils/dateUtils";

export function useDailyViewState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [viewMode, setViewMode] = useState<DailyViewMode>(() => {
    const view = searchParams.get("view");
    return view === "calendar" ? "calendar" : "list";
  });

  const [calendarMode, setCalendarMode] = useState<CalendarMode>(() => {
    const mode = searchParams.get("mode");
    return mode === "day" || mode === "week" ? mode : "day";
  });

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const dateParam = searchParams.get("date");
    if (dateParam) {
      const parsedDate = new Date(dateParam + "T00:00:00");
      return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
    }
    return new Date();
  });

  const [weekStart, setWeekStart] = useState<Date>(() => {
    const d = new Date();
    const day = d.getDay(); // Sunday = 0
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // Display date for the date picker (defaults to today, not week start)
  const [displayDate, setDisplayDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Sync state with URL params when browser navigation occurs
  useEffect(() => {
    const view = searchParams.get("view");
    const newViewMode = view === "calendar" ? "calendar" : "list";

    if (newViewMode !== viewMode) {
      setViewMode(newViewMode);
    }

    if (newViewMode === "calendar") {
      const mode = searchParams.get("mode");
      const newCalendarMode = mode === "day" || mode === "week" ? mode : "day";

      if (newCalendarMode !== calendarMode) {
        setCalendarMode(newCalendarMode);
      }

      const dateParam = searchParams.get("date");
      if (dateParam) {
        const parsedDate = new Date(dateParam + "T00:00:00");
        if (!isNaN(parsedDate.getTime())) {
          const currentDateStr = selectedDate.toISOString().split("T")[0];
          if (dateParam !== currentDateStr) {
            setSelectedDate(parsedDate);
          }
        }
      }
    }
  }, [searchParams]);

  // Check for mobile view
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Sync selectedDate with displayDate when switching to calendar view
  useEffect(() => {
    if (viewMode === "calendar") {
      // When switching to calendar, set selectedDate to displayDate
      if (selectedDate.toISOString().split('T')[0] !== displayDate.toISOString().split('T')[0]) {
        setSelectedDate(new Date(displayDate));
      }
    }
  }, [viewMode]);

  // Sync displayDate with selectedDate when in calendar mode and date changes
  useEffect(() => {
    if (viewMode === "calendar") {
      if (displayDate.toISOString().split('T')[0] !== selectedDate.toISOString().split('T')[0]) {
        setDisplayDate(new Date(selectedDate));
      }
    }
  }, [selectedDate, viewMode]);

  // Sync weekStart with selectedDate when switching to list view
  useEffect(() => {
    if (viewMode === "list") {
      const newWeekStart = getStartOfWeek(displayDate);
      if (weekStart.getTime() !== newWeekStart.getTime()) {
        setWeekStart(newWeekStart);
      }
    }
  }, [viewMode, displayDate]);

  // Sync selectedDate with weekStart when switching from list view to calendar
  useEffect(() => {
    if (viewMode === "calendar") {
      const currentWeekStart = getStartOfWeek(displayDate);
      if (currentWeekStart.getTime() !== weekStart.getTime()) {
        setSelectedDate(new Date(displayDate));
      }
    }
  }, [viewMode, weekStart]);

  // Update URL when view mode, calendar mode, or selected date changes
  useEffect(() => {
    const currentView = searchParams.get("view");
    const currentMode = searchParams.get("mode");
    const currentDate = searchParams.get("date");

    // Check if URL already matches current state
    const urlMatchesState =
      currentView === viewMode &&
      (viewMode === "list" ||
        (currentMode === calendarMode &&
         currentDate === selectedDate.toISOString().split("T")[0]));

    // Only update URL if it doesn't match current state
    if (!urlMatchesState) {
      const newParams = new URLSearchParams(searchParams);

      newParams.set("view", viewMode);

      if (viewMode === "calendar") {
        newParams.set("mode", calendarMode);
        newParams.set("date", selectedDate.toISOString().split("T")[0]);
      } else {
        newParams.delete("mode");
        newParams.delete("date");
      }

      setSearchParams(newParams);
    }
  }, [viewMode, calendarMode, selectedDate]);

  function toggleMobileSidebar() {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  }

  return {
    viewMode,
    setViewMode,
    calendarMode,
    setCalendarMode,
    selectedDate,
    setSelectedDate,
    weekStart,
    setWeekStart,
    displayDate,
    setDisplayDate,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    toggleMobileSidebar,
    isMobileView,
    searchTerm,
    setSearchTerm,
  };
}

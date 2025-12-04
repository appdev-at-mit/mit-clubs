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

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Reset to list view when component mounts
  useEffect(() => {
    setViewMode("list");
    const newParams = new URLSearchParams();
    newParams.set("view", "list");
    setSearchParams(newParams, { replace: true });
  }, []);

  // Check for mobile view
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Sync weekStart with selectedDate when switching to list view
  useEffect(() => {
    if (viewMode === "list") {
      const newWeekStart = getStartOfWeek(selectedDate);
      if (weekStart.getTime() !== newWeekStart.getTime()) {
        setWeekStart(newWeekStart);
      }
    }
  }, [viewMode, selectedDate]);

  // Sync selectedDate with weekStart when switching from list view to calendar
  useEffect(() => {
    if (viewMode === "calendar") {
      const currentWeekStart = getStartOfWeek(selectedDate);
      if (currentWeekStart.getTime() !== weekStart.getTime()) {
        setSelectedDate(new Date(weekStart));
      }
    }
  }, [viewMode, weekStart]);

  // Update URL when view mode, calendar mode, or selected date changes
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);

    newParams.set("view", viewMode);

    if (viewMode === "calendar") {
      newParams.set("mode", calendarMode);
      newParams.set("date", selectedDate.toISOString().split("T")[0]);
    } else {
      newParams.delete("mode");
      newParams.delete("date");
    }

    setSearchParams(newParams, { replace: true });
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
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    toggleMobileSidebar,
    isMobileView,
    searchTerm,
    setSearchTerm,
  };
}

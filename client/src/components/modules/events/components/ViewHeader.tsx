import React from "react";
import { FaSearch } from "react-icons/fa";
import { SlidersHorizontal } from "lucide-react";
import { DailyViewMode, CalendarMode } from "../types";

interface ViewHeaderProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  isMobileView: boolean;
  viewMode: DailyViewMode;
  setViewMode: (mode: DailyViewMode) => void;
  toggleMobileSidebar: () => void;
  calendarMode: CalendarMode;
  setCalendarMode: (mode: CalendarMode) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  weekStart: Date;
  setWeekStart: (date: Date) => void;
  displayDate: Date;
  setDisplayDate: (date: Date) => void;
  prevWeek: () => void;
  nextWeek: () => void;
}

export function ViewHeader({
  searchTerm,
  setSearchTerm,
  isMobileView,
  viewMode,
  setViewMode,
  toggleMobileSidebar,
  calendarMode,
  setCalendarMode,
  selectedDate,
  setSelectedDate,
  weekStart,
  setWeekStart,
  displayDate,
  setDisplayDate,
  prevWeek,
  nextWeek,
}: ViewHeaderProps) {
  return (
    <div className="mb-6 space-y-4">
      {/* Row 1: Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Events</h1>
      </div>

      {/* Row 2: Search Bar + List/Calendar Toggle */}
      <div className="flex items-center gap-4">
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

        <button
          onClick={toggleMobileSidebar}
          className="md:hidden p-2 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-100"
          aria-label="Open filters"
        >
          <SlidersHorizontal size={20} />
        </button>
      </div>

      {/* Row 3: Day/Week Toggle (left) + Date Navigation (right) */}
      <div className="flex items-center justify-between min-h-[44px]">
        {/* Left side: Day/Week Toggle (only for calendar view) */}
        <div className="h-[44px] flex items-center">
          {viewMode === 'calendar' && (
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
          )}
        </div>

        {/* Right side: Date Navigation */}
        <div className="flex items-center gap-2 h-[44px]">
          {viewMode === 'list' ? (
            <>
              <button
                onClick={prevWeek}
                className="p-2 h-[44px] w-[44px] flex items-center justify-center border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Previous week"
              >
                ←
              </button>

              <input
                type="date"
                value={displayDate.toISOString().split("T")[0]}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value) {
                    const picked = new Date(value + "T00:00:00");
                    if (!isNaN(picked.getTime())) {
                      // Update display date to the picked date
                      setDisplayDate(picked);
                      // Calculate and update week start (Sunday of that week)
                      const newWeekStart = new Date(picked);
                      newWeekStart.setDate(picked.getDate() - picked.getDay());
                      newWeekStart.setHours(0, 0, 0, 0);
                      setWeekStart(newWeekStart);
                    }
                  }
                }}
                className="h-[44px] min-w-[220px] border border-gray-300 rounded-md focus:ring-appdev-blue-dark focus:border-appdev-blue-dark text-sm px-4 py-2 bg-white"
              />

              <button
                onClick={nextWeek}
                className="p-2 h-[44px] w-[44px] flex items-center justify-center border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Next week"
              >
                →
              </button>
            </>
          ) : calendarMode === 'week' ? (
            <>
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(newDate.getDate() - 7);
                  setSelectedDate(newDate);
                  setDisplayDate(new Date(newDate));
                }}
                className="p-2 h-[44px] w-[44px] flex items-center justify-center border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Previous week"
              >
                ←
              </button>

              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value) {
                    const newDate = new Date(value + "T00:00:00");
                    if (!isNaN(newDate.getTime())) {
                      setSelectedDate(newDate);
                      setDisplayDate(new Date(newDate));
                    }
                  }
                }}
                className="h-[44px] min-w-[220px] border border-gray-300 rounded-md focus:ring-appdev-blue-dark focus:border-appdev-blue-dark text-sm px-4 py-2 bg-white"
              />

              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(newDate.getDate() + 7);
                  setSelectedDate(newDate);
                  setDisplayDate(new Date(newDate));
                }}
                className="p-2 h-[44px] w-[44px] flex items-center justify-center border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Next week"
              >
                →
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(selectedDate.getDate() - 1);
                  setSelectedDate(newDate);
                  setDisplayDate(new Date(newDate));
                }}
                className="p-2 h-[44px] w-[44px] flex items-center justify-center border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Previous day"
              >
                ←
              </button>
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  if (inputValue) {
                    const newDate = new Date(inputValue + 'T00:00:00');
                    if (!isNaN(newDate.getTime())) {
                      setSelectedDate(newDate);
                      setDisplayDate(new Date(newDate));
                    }
                  }
                }}
                className="h-[44px] min-w-[220px] border border-gray-300 rounded-md focus:ring-appdev-blue-dark focus:border-appdev-blue-dark text-sm px-4 py-2"
              />
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(selectedDate.getDate() + 1);
                  setSelectedDate(newDate);
                  setDisplayDate(new Date(newDate));
                }}
                className="p-2 h-[44px] w-[44px] flex items-center justify-center border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Next day"
              >
                →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

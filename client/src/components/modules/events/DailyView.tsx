import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../App";
import { FilterPanel } from "./components/FilterPanel";
import { ViewHeader } from "./components/ViewHeader";
import { ListView } from "./components/ListView";
import { DayCalendar } from "./components/DayCalendar";
import { WeekCalendar } from "./components/WeekCalendar";
import { useDailyViewState } from "./hooks/useDailyViewState";
import { useEvents } from "./hooks/useEvents";
import { useFilters } from "./hooks/useFilters";
import { addDays, generateHourLabels } from "./utils/dateUtils";
import { calculateEventLayout } from "./utils/calendarUtils";

function DailyView() {
  const userContext = useContext(UserContext);
  const navigate = useNavigate();

  if (!userContext) {
    throw new Error("DailyView must be used within UserContext");
  }

  const { userId } = userContext;

  // Custom hooks for state management
  const {
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
    toggleMobileSidebar,
    isMobileView,
    searchTerm,
    setSearchTerm,
  } = useDailyViewState();

  const { events, savedEventIds, loading, toggleSave } = useEvents();

  const {
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
  } = useFilters(events, viewMode, calendarMode, selectedDate, weekStart, searchTerm);

  // Navigation helpers
  function prevWeek() {
    const newWeekStart = addDays(weekStart, -7);
    setWeekStart(newWeekStart);
    // Update display date to stay in sync (move back 7 days)
    setDisplayDate(addDays(displayDate, -7));
  }

  function nextWeek() {
    const newWeekStart = addDays(weekStart, 7);
    setWeekStart(newWeekStart);
    // Update display date to stay in sync (move forward 7 days)
    setDisplayDate(addDays(displayDate, 7));
  }

  // Calculate data for calendar views
  const hourLabels = viewMode === 'calendar' ? generateHourLabels() : [];
  const eventLayout = viewMode === 'calendar' && calendarMode === 'day'
    ? calculateEventLayout(filteredEvents, selectedDate)
    : new Map();

  // Calculate week filtered events for event count in filter panel
  const weekStartIso = weekStart.toISOString().split('T')[0];
  const weekEndIso = addDays(weekStart, 6).toISOString().split('T')[0];
  const weekFilteredEvents = filteredEvents.filter(
    (ev) => {
      const evDate = new Date(ev.date).toISOString().split('T')[0];
      return evDate >= weekStartIso && evDate <= weekEndIso;
    }
  );

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
    <div className="flex h-screen overflow-hidden relative" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Filter panel */}
      <FilterPanel
        isMobileSidebarOpen={isMobileSidebarOpen}
        toggleMobileSidebar={toggleMobileSidebar}
        isHoveringResetAll={isHoveringResetAll}
        setIsHoveringResetAll={setIsHoveringResetAll}
        resetFilters={resetFilters}
        eventCount={viewMode === 'list' ? weekFilteredEvents.length : filteredEvents.length}
        isCategorySectionOpen={isCategorySectionOpen}
        setIsCategorySectionOpen={setIsCategorySectionOpen}
        openSections={openSections}
        toggleSubSection={toggleSubSection}
        filters={filters}
        handleTagCheckboxChange={handleTagCheckboxChange}
      />

      {/* Overlay for mobile sidebar */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden top-16"
          onClick={toggleMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* Main content */}
      <div className="flex-grow overflow-y-auto p-6 w-full bg-gray-50">
        <ViewHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isMobileView={isMobileView}
          viewMode={viewMode}
          setViewMode={setViewMode}
          toggleMobileSidebar={toggleMobileSidebar}
          calendarMode={calendarMode}
          setCalendarMode={setCalendarMode}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          weekStart={weekStart}
          setWeekStart={setWeekStart}
          displayDate={displayDate}
          setDisplayDate={setDisplayDate}
          prevWeek={prevWeek}
          nextWeek={nextWeek}
        />

        {/* Conditional rendering based on view mode */}
        {viewMode === 'list' ? (
          <ListView
            filteredEvents={filteredEvents}
            weekStart={weekStart}
            savedEventIds={savedEventIds}
            toggleSave={toggleSave}
          />
        ) : calendarMode === 'day' ? (
          <DayCalendar
            selectedDate={selectedDate}
            filteredEvents={filteredEvents}
            hourLabels={hourLabels}
            eventLayout={eventLayout}
            savedEventIds={savedEventIds}
            toggleSave={toggleSave}
          />
        ) : (
          <WeekCalendar
            selectedDate={selectedDate}
            filteredEvents={filteredEvents}
            hourLabels={hourLabels}
            savedEventIds={savedEventIds}
            toggleSave={toggleSave}
          />
        )}
      </div>
    </div>
  );
}

export default DailyView;

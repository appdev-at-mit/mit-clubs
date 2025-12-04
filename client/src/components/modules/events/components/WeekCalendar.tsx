import React from "react";
import { useNavigate } from "react-router-dom";
import { FaBookmark } from "react-icons/fa";
import { Event } from "../../../../types";
import { formatTime, formatDate } from "../../../../api/mock-events";
import { HourLabel } from "../types";
import { timeToMinutes } from "../utils/dateUtils";
import { calculateEventLayout } from "../utils/calendarUtils";

interface WeekCalendarProps {
  selectedDate: Date;
  filteredEvents: Event[];
  hourLabels: HourLabel[];
}

export function WeekCalendar({
  selectedDate,
  filteredEvents,
  hourLabels,
}: WeekCalendarProps) {
  const navigate = useNavigate();

  function handleEventClick(eventId: string) {
    navigate(`/events/${eventId}`);
  }

  return (
    <>
      {/* Calendar Header - Week view */}
      <div className="bg-gray-50 py-3 mb-4 border-b-2" style={{ borderColor: '#5b8fb9' }}>
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
      </div>

      {/* Week View */}
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
                  const eventDate = formatDate(event.date);
                  if (eventDate === dayStr) return true;
                  const eventStartMinutes = timeToMinutes(event.date);
                  const eventEndMinutes = event.end_time ? timeToMinutes(event.end_time) : eventStartMinutes + (event.duration || 60);

                  let duration = eventEndMinutes - eventStartMinutes;
                  if (duration === 0) duration = event.duration || 24 * 60; // 24-hour event
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

                const dayEventLayout = calculateEventLayout(dayEvents, currentDay);

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
                        const hourHeight = 80;
                        const eventDate = formatDate(event.date);
                        const startMinutes = timeToMinutes(event.date);
                        let endMinutes = event.end_time ? timeToMinutes(event.end_time) : startMinutes + (event.duration || 60);
                        const isContinuation = eventDate !== dayStr;

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

                        const eventId = event._id || event.title;
                        const layout = dayEventLayout.get(eventId);
                        const column = layout?.column ?? 0;
                        const totalColumns = layout?.totalColumns ?? 1;

                        const widthPercent = 100 / totalColumns;
                        const leftPercent = (column * widthPercent);

                        const bgColor = '#dbe9f4';
                        const borderColor = '#5b8fb9';

                        return (
                          <div
                            key={eventId}
                            onClick={() => handleEventClick(eventId)}
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
                                  {event.title}
                                </h3>
                                <p className="text-xs text-gray-600 truncate">
                                  {event.organizer}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatTime(event.date)} - {event.end_time ? formatTime(event.end_time) : 'TBD'}
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
    </>
  );
}

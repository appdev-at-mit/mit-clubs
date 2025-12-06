import React from "react";
import { useNavigate } from "react-router-dom";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { Event } from "../../../../types";
import { formatTime } from "../../../../api/mock-events";
import { HourLabel, EventLayoutPosition } from "../types";
import { getEventStyles } from "../utils/eventUtils";

interface DayCalendarProps {
  selectedDate: Date;
  filteredEvents: Event[];
  hourLabels: HourLabel[];
  eventLayout: Map<string, EventLayoutPosition>;
  savedEventIds: string[];
  toggleSave: (eventId: string) => void;
}

export function DayCalendar({
  selectedDate,
  filteredEvents,
  hourLabels,
  eventLayout,
  savedEventIds,
  toggleSave,
}: DayCalendarProps) {
  const navigate = useNavigate();

  function handleEventClick(eventId: string) {
    navigate(`/events/${eventId}`);
  }

  return (
    <>
      {/* Day view header */}
      <div className="bg-gray-50 py-3 mb-4 border-b-2" style={{ borderColor: '#5b8fb9' }}>
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
      </div>

      {/* Timeline Calendar */}
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
              const eventId = event._id || event.title;
              const { top, height } = getEventStyles(event, selectedDate);
              const layout = eventLayout.get(eventId);
              const column = layout?.column ?? 0;
              const totalColumns = layout?.totalColumns ?? 1;

              // Calculate horizontal positioning for overlapping events
              const widthPercent = 100 / totalColumns;
              const leftPercent = (column * widthPercent);

              const bgColor = '#dbe9f4';
              const borderColor = '#5b8fb9';
              const isSaved = savedEventIds.includes(eventId);

              return (
                <div
                  key={eventId}
                  onClick={() => handleEventClick(eventId)}
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSave(eventId);
                      }}
                      className="flex-shrink-0"
                    >
                      {isSaved ? (
                        <FaBookmark className="text-appdev-blue" size={16} />
                      ) : (
                        <FaRegBookmark className="text-appdev-blue-dark" size={16} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

import React from 'react';
import { isMultiDayEvent } from './utils/calendarUtils';

const MonthView = ({ date, setDate, events, setViewMode }) => {
  // Get the days in the current month
  const getDaysInMonth = () => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Get the day of the week for the first day of the month (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    // Create an array of day objects for the calendar
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, date: null });
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const nextDate = new Date(year, month, day + 1);

      // Find events for this day - including multi-day events
      const dayEvents = events.filter(event => {
        const eventStartDate = new Date(event.date);
        const eventEndDate = event.end_date ? new Date(event.end_date) : new Date(eventStartDate);

        // Format dates to ignore time component
        const eventStartDay = new Date(eventStartDate.getFullYear(), eventStartDate.getMonth(), eventStartDate.getDate());
        const eventEndDay = new Date(eventEndDate.getFullYear(), eventEndDate.getMonth(), eventEndDate.getDate());
        const dayStart = new Date(year, month, day);
        const dayEnd = new Date(year, month, day, 23, 59, 59);

        // Check if this day falls within the event's date range
        return (dayStart >= eventStartDay && dayStart <= eventEndDay) ||
               (dayEnd >= eventStartDay && dayEnd <= eventEndDay) ||
               (eventStartDay >= dayStart && eventStartDay <= dayEnd) ||
               (eventEndDay >= dayStart && eventEndDay <= dayEnd);
      });

      days.push({
        day,
        date: currentDate,
        events: dayEvents
      });
    }

    return days;
  };

  const days = getDaysInMonth();

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-7 text-center font-medium py-2 bg-gray-50 border-b">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {days.map((dayObj, index) => {
          const isToday = dayObj.date &&
            dayObj.date.getDate() === new Date().getDate() &&
            dayObj.date.getMonth() === new Date().getMonth() &&
            dayObj.date.getFullYear() === new Date().getFullYear();

          // Find multi-day events
          const multiDayEvents = dayObj.events ? dayObj.events.filter(event => isMultiDayEvent(event)) : [];

          // Find single-day events
          const singleDayEvents = dayObj.events ? dayObj.events.filter(event => !isMultiDayEvent(event)) : [];

          return (
            <div
              key={index}
              className={`bg-white p-2 min-h-32 relative cursor-pointer hover:bg-gray-50 transition-colors
                ${dayObj.day === null ? 'bg-gray-100 cursor-default' : ''}
                ${isToday ? 'bg-blue-50' : ''}
              `}
              onClick={() => {
                if (dayObj.day !== null) {
                  setDate(dayObj.date);
                  setViewMode('day');
                }
              }}
            >
              {dayObj.day !== null && (
                <>
                  <div className="font-medium mb-2">{dayObj.day}</div>
                  <div className="flex flex-col gap-1">
                    {/* Show multi-day events first with special styling */}
                    {multiDayEvents.slice(0, 2).map(event => (
                      <div
                        key={`multi-${event.id}`}
                        className="text-xs py-1 px-2 rounded text-white truncate bg-gradient-to-r"
                        style={{
                          backgroundColor: event.clubColor,
                          background: `linear-gradient(90deg, ${event.clubColor} 0%, ${event.clubColor}90 100%)`
                        }}
                      >
                        <span className="mr-1">◆</span> {event.title}
                      </div>
                    ))}

                    {/* Then show single-day events */}
                    {singleDayEvents.slice(0, 2 - Math.min(multiDayEvents.length, 2)).map(event => (
                      <div
                        key={`single-${event.id}`}
                        className="text-xs py-1 px-2 rounded text-white truncate"
                        style={{ backgroundColor: event.clubColor }}
                      >
                        {event.title}
                      </div>
                    ))}

                    {/* Show count of additional events */}
                    {dayObj.events && dayObj.events.length > 2 && (
                      <div className="text-xs text-gray-500 mt-1">+{dayObj.events.length - 2} more</div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;

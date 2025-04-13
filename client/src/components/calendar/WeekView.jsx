import React from 'react';
import EventCard from './EventCard';

const WeekView = ({ date, setDate, events, setViewMode, downloadEventICS }) => {
  // Get days for the current week
  const getDaysInWeek = () => {
    const currentDate = new Date(date);
    const day = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Calculate the date of the first day of the week (Sunday)
    const firstDayOfWeek = new Date(currentDate);
    firstDayOfWeek.setDate(currentDate.getDate() - day);

    const days = [];

    // Add each day of the week
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(firstDayOfWeek);
      currentDay.setDate(firstDayOfWeek.getDate() + i);

      // Find events for this day - including multi-day events
      const dayEvents = events.filter(event => {
        const eventStartDate = new Date(event.date);
        const eventEndDate = event.end_date ? new Date(event.end_date) : new Date(eventStartDate);

        // Format dates to ignore time component
        const eventStartDay = new Date(eventStartDate.getFullYear(), eventStartDate.getMonth(), eventStartDate.getDate());
        const eventEndDay = new Date(eventEndDate.getFullYear(), eventEndDate.getMonth(), eventEndDate.getDate());
        const dayStart = new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate());
        const dayEnd = new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate(), 23, 59, 59);

        // Check if this day falls within the event's date range
        return (dayStart >= eventStartDay && dayStart <= eventEndDay) ||
               (dayEnd >= eventStartDay && dayEnd <= eventEndDay) ||
               (eventStartDay >= dayStart && eventStartDay <= dayEnd) ||
               (eventEndDay >= dayStart && eventEndDay <= dayEnd);
      });

      days.push({
        day: currentDay.getDate(),
        date: new Date(currentDay),
        events: dayEvents
      });
    }

    return days;
  };

  const days = getDaysInWeek();

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-7 text-center">
        {days.map((dayObj, index) => {
          const isToday =
            dayObj.date.getDate() === new Date().getDate() &&
            dayObj.date.getMonth() === new Date().getMonth() &&
            dayObj.date.getFullYear() === new Date().getFullYear();

          return (
            <div
              key={index}
              className={`py-3 flex flex-col items-center
                ${isToday ? 'bg-blue-50' : 'bg-gray-50'}
              `}
            >
              <div className="font-medium">
                {dayObj.date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="text-lg">{dayObj.day}</div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-7 gap-px bg-gray-200 flex-grow">
        {days.map((dayObj, index) => (
          <div
            key={index}
            className="bg-white p-3 overflow-y-auto min-h-64"
            onClick={() => {
              setDate(dayObj.date);
              setViewMode('day');
            }}
          >
            <div className="flex flex-col gap-3">
              {dayObj.events.length > 0 ? (
                dayObj.events.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    downloadEventICS={downloadEventICS}
                  />
                ))
              ) : (
                <div className="text-center py-10 text-gray-400 italic text-sm">
                  No events
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekView;

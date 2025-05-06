import React from 'react';
import EventCard from './EventCard';
import { isDateInEventRange } from './utils/calendarUtils';

const DayView = ({ date, events, downloadEventICS }) => {
  // Get events for the current day
  const getDayEvents = () => {
    return events.filter(event => isDateInEventRange(date, event));
  };

  const dayEvents = getDayEvents();

  return (
    <div className="p-5">
      <div className="flex items-center mb-5">
        <div className="text-2xl font-medium mr-2">
          {date.toLocaleDateString('en-US', { weekday: 'long' })}
        </div>
        <div className="text-2xl">
          {date.toLocaleDateString('en-US', { day: 'numeric' })}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {dayEvents.length > 0 ? (
          dayEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              downloadEventICS={downloadEventICS}
            />
          ))
        ) : (
          <div className="text-center py-10 text-gray-500 italic">No events scheduled for this day</div>
        )}
      </div>
    </div>
  );
};

export default DayView;

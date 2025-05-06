import React from 'react';
import { isMultiDayEvent, formatEventDateRange } from './utils/calendarUtils';

const EventCard = ({ event, downloadEventICS }) => {
  const colorStyle = {
    backgroundColor: `${event.clubColor}20`,
    borderLeftColor: event.clubColor
  };

  // Check if the event is multi-day
  const multiDay = isMultiDayEvent(event);

  return (
    <div
      key={event.id}
      className="p-3 mb-2 rounded shadow-sm border-l-4 relative group"
      style={colorStyle}
    >
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600"
          onClick={(e) => {
            e.stopPropagation();
            downloadEventICS(event);
          }}
          title="Add to Google Calendar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
            <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
          </svg>
        </button>
      </div>
      <div className="text-sm font-semibold">
        {multiDay && (
          <span className="inline-flex items-center bg-purple-100 text-purple-800 text-xs font-medium mr-2 px-2 py-0.5 rounded-full">
            Multi-day
          </span>
        )}
        {formatEventDateRange(event)}
      </div>
      <div className="font-medium text-base">{event.title}</div>
      <div className="text-sm text-gray-600">{event.clubName}</div>
      <div className="text-xs text-gray-500">{event.location}</div>
      {event.description && (
        <div className="text-xs text-gray-600 mt-2 line-clamp-2">{event.description}</div>
      )}
    </div>
  );
};

export default EventCard;

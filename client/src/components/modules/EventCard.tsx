import React from "react";
import { useNavigate } from "react-router-dom";
import defaultImage from "../../assets/default.png";
import { MockEvent } from "../../api/mock-events";

type Props = {
  event: MockEvent;
};

export default function EventCard({ event }: Props) {
  const navigate = useNavigate();

  function handleClick() {
    navigate(`/events/${event.event_id}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  }

  const image = event.imageUrl || defaultImage;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 flex gap-6 cursor-pointer focus:outline-none focus:ring-2 focus:ring-appdev-blue"
    >
      {/* Time Badge - with custom colors */}
      <div
        className="flex-shrink-0 flex flex-col justify-center text-center rounded-lg p-4 min-w-[100px]"
        style={{ backgroundColor: '#dbe9f4' }}
      >
        <div className="text-2xl font-bold" style={{ color: '#2c5f7f' }}>
          {event.startTime}
        </div>
        <div className="text-xs text-gray-500 mt-1">to</div>
        <div className="text-lg font-semibold" style={{ color: '#2c5f7f' }}>
          {event.endTime}
        </div>
      </div>

      <div className="flex-grow">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-2xl font-semibold text-gray-900">{event.name}</h3>
          {event.category && (
            <span className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">
              {event.category}
            </span>
          )}
        </div>

        <div className="space-y-2 mb-3">
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <span className="font-medium">📍</span>
            <span>{event.location}</span>
          </p>
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <span className="font-medium">👥</span>
            <span>Organized by {event.organizerName}</span>
          </p>
          {/* Max attendees display */}
          {event.maxAttendees && (
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <span className="font-medium">✓</span>
              <span>
                {event.attendeeCount}/{event.maxAttendees} attending
              </span>
            </p>
          )}
        </div>

        <p className="text-gray-700 mb-3">{event.description}</p>

        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {event.tags.map((tag) => (
              <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Registration status badge */}
        {event.isRegistered && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <span>✓</span>
            <span>Registered</span>
          </div>
        )}
      </div>

      <div className="hidden md:block w-28 flex-shrink-0">
        <div className="w-28 h-20">
          <img src={image} alt={event.name} className="w-full h-full object-cover rounded-md" />
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import defaultImage from "../../assets/default.png";
import { Event } from "../../types";
import { formatTime } from "../../api/mock-events";
import { FaBookmark } from "react-icons/fa";


type Props = {
  event: Event;
  isSaved: boolean;
  onToggleSave: () => void;
};

export default function EventCard({ event, isSaved, onToggleSave }: Props) {
  const navigate = useNavigate();

  function handleClick() {
    // Use MongoDB _id if available, otherwise use title as fallback
    const eventId = event._id || event.title;
    navigate(`/events/${eventId}`);
  }

  const image = event.imageUrl || defaultImage;

  // Format times - handle both ISO datetime and already formatted times
  const startTime = event.date ? formatTime(event.date) : 'TBD';
  const endTime = event.end_time ? formatTime(event.end_time) : 'TBD';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 flex gap-6 cursor-pointer focus:outline-none focus:ring-2 focus:ring-appdev-blue"
    >
      {/* Time Badge - with custom colors */}
      <div
        className="flex-shrink-0 flex flex-col justify-center text-center rounded-lg p-4 min-w-[100px]"
        style={{ backgroundColor: '#dbe9f4' }}
      >
        <div className="text-2xl font-bold" style={{ color: '#2c5f7f' }}>
          {startTime}
        </div>
        {event.duration && (
          <div className="text-xs text-gray-500 mt-1">{event.duration} min</div>
        )}
        {event.end_time && (
          <>
            <div className="text-xs text-gray-500 mt-1">to</div>
            <div className="text-lg font-semibold" style={{ color: '#2c5f7f' }}>
              {endTime}
            </div>
          </>
        )}
      </div>

      <div className="flex-grow">
        <div className="flex items-start justify-between mb-2">
        <h3 className="text-2xl font-semibold text-gray-900">{event.title}</h3>

        <div className="flex items-center gap-2">
          {/* Bookmark Save Button */}
          <FaBookmark
            size={18}
            className={`cursor-pointer transition-colors ${
              isSaved ? "text-pink-600" : "text-gray-400 hover:text-gray-600"
            }`}
            onClick={(e) => {
              e.stopPropagation();     // prevent navigating to event page
              onToggleSave();
            }}
          />

          {event.source && (
            <span className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">
              {event.source}
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSave(e);
            }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="flex-shrink-0 ml-2"
          >
            {isSaved ? (
              <FaBookmark
                className={`text-2xl transition-colors duration-300 ease-in-out ${
                  isHovering ? "text-appdev-blue-dark" : "text-appdev-blue"
                }`}
              />
            ) : isHovering ? (
              <FaBookmark className="text-appdev-blue text-2xl transition-colors duration-300 ease-in-out" />
            ) : (
              <FaRegBookmark className="text-appdev-blue-dark text-2xl transition-colors duration-300 ease-in-out" />
            )}
          </button>
        </div>
      </div>


        <div className="space-y-2 mb-3">
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <span className="font-medium">📍</span>
            <span>{event.location}</span>
          </p>
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <span className="font-medium">👥</span>
            <span>Organized by {event.organizer}</span>
          </p>
          {event.contact_email && (
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <span className="font-medium">✉️</span>
              <a href={`mailto:${event.contact_email}`} className="text-blue-600 hover:text-blue-700">
                {event.contact_email}
              </a>
            </p>
          )}
          {/* Max attendees display */}
          {event.maxAttendees && (
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <span className="font-medium">✓</span>
              <span>
                {event.attendeeCount || 0}/{event.maxAttendees} attending
              </span>
            </p>
          )}
        </div>

        {event.details && (
          <p className="text-gray-700 mb-3 line-clamp-2">{event.details}</p>
        )}

        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {event.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="hidden md:block w-28 flex-shrink-0">
        <div className="w-28 h-20">
          <img src={image} alt={event.title} className="w-full h-full object-cover rounded-md" />
        </div>
      </div>
    </div>
  );
}

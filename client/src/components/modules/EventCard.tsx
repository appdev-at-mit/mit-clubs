import React from "react";
import { useNavigate } from "react-router-dom";
import defaultImage from "../../assets/default.png";
import { Event } from "../../types";
import { formatTime } from "../../api/mock-events";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";

type Props = {
  event: Event;
  isSaved: boolean;
  onToggleSave: () => void;
};

export default function EventCard({ event, isSaved, onToggleSave }: Props) {
  const navigate = useNavigate();

  function handleClick() {
    if (!event._id) {
      console.warn('Cannot navigate - event missing _id');
      return;
    }
    navigate(`/events/${event._id}`);
  }

  const image = event.imageUrl || defaultImage;
  const startTime = event.date ? formatTime(event.date) : "TBD";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 flex gap-6 cursor-pointer focus:outline-none focus:ring-2 focus:ring-appdev-blue"
    >
      {/* Time Badge - Standardized Width */}
      <div
        className="flex-shrink-0 flex flex-col justify-center text-center rounded-lg p-4 w-[100px]"
        style={{ backgroundColor: "#dbe9f4" }}
      >
        <div className="text-2xl font-bold" style={{ color: "#2c5f7f" }}>
          {startTime}
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow">
        <div className="flex items-start justify-between">
          <div className="flex-grow pr-4">
            {/* Title with Location */}
            <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-baseline gap-2">
              <span>{event.title}</span>
              <span className="text-base font-light italic text-gray-500">
                {event.location}
              </span>
            </h3>

            {/* Organizer */}
            <p className="text-gray-600 mb-1">
              {event.organizer}
            </p>

            {/* Contact Email */}
            {event.contact_email && (
              <p className="text-gray-500 text-sm mb-3">
                <a
                  href={`mailto:${event.contact_email}`}
                  className="hover:text-appdev-blue"
                  onClick={(e) => e.stopPropagation()}
                >
                  {event.contact_email}
                </a>
              </p>
            )}

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {event.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-sm bg-appdev-blue/20 text-appdev-blue-dark font-medium rounded-full px-3 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Event source tag - appears before bookmark */}
            {event.source && (
              <span className="px-2 py-1 text-xs font-semibold rounded-full" style={{ color: "#2c5f7f", backgroundColor: "#dbe9f4" }}>
                {event.source}
              </span>
            )}

            {/* Simple save button - always in the same position */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave();
              }}
              className="flex-shrink-0"
            >
              {isSaved ? (
                <FaBookmark className="text-appdev-blue text-xl" />
              ) : (
                <FaRegBookmark className="text-appdev-blue-dark text-xl" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

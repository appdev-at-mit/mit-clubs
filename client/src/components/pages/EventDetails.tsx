import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEvent, saveEvent, unsaveEvent, getSavedEventIds } from "../../api/events";
import { formatTime, formatDate } from "../../api/mock-events";
import { Event } from "../../types";
import NotFound from "./NotFound";
import Navbar from "../modules/Navbar";
import LoginModal from "../modules/LoginModal";
import defaultImage from "../../assets/default.png";
import { ArrowLeft, MapPin, Clock, Users, Mail } from "lucide-react";
import { FaRegBookmark, FaBookmark } from "react-icons/fa";
import { UserContext } from "../App";

function EventDetails() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const userContext = useContext(UserContext);

  if (!userContext) {
    throw new Error("EventDetails must be used within UserContext");
  }

  const { userId } = userContext;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isHoveringSave, setIsHoveringSave] = useState<boolean>(false);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  useEffect(() => {
    async function load() {
      if (!eventId) return;

      setLoading(true);
      try {
        const found = await getEvent(eventId);
        setEvent(found);

        // Fetch user's saved events IF logged in
        if (userId) {
          const savedIds = await getSavedEventIds();
          if (savedIds && Array.isArray(savedIds)) {
            // Use the actual _id from the loaded event for comparison
            const actualEventId = found._id || eventId;
            setIsSaved(savedIds.includes(actualEventId));
          }
        } else {
          setIsSaved(false);
        }
      } catch (err) {
        console.error("Failed to load event details:", err);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [eventId, userId]);

  // Toggle save function
  async function handleToggleSave() {
    if (!userId) {
      setShowLoginModal(true);
      return;
    }

    if (!event || !event._id) return;

    // Use the MongoDB _id for save/unsave operations
    const actualEventId = event._id;

    try {
      if (!isSaved) {
        await saveEvent(actualEventId);
        // Increment save count
        setEvent((prev) =>
          prev
            ? {
                ...prev,
                saveCount: (prev.saveCount || 0) + 1,
              }
            : null
        );
      } else {
        await unsaveEvent(actualEventId);
        // Decrement save count
        setEvent((prev) =>
          prev
            ? {
                ...prev,
                saveCount: Math.max((prev.saveCount || 0) - 1, 0),
              }
            : null
        );
      }
      setIsSaved(!isSaved);
    } catch (error: any) {
      console.error("Failed to save/unsave event:", error);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-center text-lg">Loading event...</p>
        </div>
      </div>
    );
  }

  if (notFound || !event) {
    return <NotFound />;
  }

  const image = event.imageUrl || defaultImage;

  // Format date and time
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const startTime = formatTime(event.date);
  const endTime = event.end_time ? formatTime(event.end_time) : null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 md:px-8 py-8 relative pt-20 md:pt-28">
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-appdev-blue transition-colors duration-200"
          >
            <ArrowLeft size={15} className="text-gray-500" />
            <span className="font-light text-md">Back to Events</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-3/4 space-y-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="flex-grow overflow-hidden">
                  <h1 className="text-3xl font-bold text-gray-900 break-words hyphens-auto overflow-wrap-anywhere">
                    {event.title}
                  </h1>
                  <p className="text-gray-600 mt-2">{event.organizer}</p>
                  {event.organizer_email && (
                    <p className="text-gray-500 text-sm mt-1">
                      <a href={`mailto:${event.organizer_email}`} className="hover:text-appdev-blue">
                        {event.organizer_email}
                      </a>
                    </p>
                  )}
                  {event.tags && event.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {event.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-sm bg-appdev-blue/20 text-appdev-blue-dark font-medium rounded-full px-3 py-1"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Event Description
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words overflow-hidden">
                {event.details || "No description provided."}
              </p>
            </div>
          </div>

          <div className="w-full lg:w-1/4 space-y-6">
            {/* Bookmark Button */}
            <div className="flex items-center justify-start">
              <button
                onClick={handleToggleSave}
                onMouseEnter={() => setIsHoveringSave(true)}
                onMouseLeave={() => setIsHoveringSave(false)}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {isSaved ? (
                  <FaBookmark
                    className={`text-xl transition-colors duration-300 ease-in-out ${
                      isHoveringSave
                        ? "text-appdev-blue-dark"
                        : "text-appdev-blue"
                    }`}
                  />
                ) : isHoveringSave ? (
                  <FaBookmark className="text-appdev-blue text-xl transition-colors duration-300 ease-in-out" />
                ) : (
                  <FaRegBookmark className="text-appdev-blue-dark text-xl transition-colors duration-300 ease-in-out" />
                )}
                <span className="ml-1">{event.saveCount || 0}</span>
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                  Event Details
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start gap-3">
                    <Clock size={18} className="text-appdev-blue flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">{formattedDate}</div>
                      <div className="text-gray-600">
                        {startTime}
                        {endTime && ` — ${endTime}`}
                        {event.duration && <span className="text-gray-500"> ({event.duration} min)</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-appdev-blue flex-shrink-0 mt-0.5" />
                    <div className="text-gray-700">{event.location}</div>
                  </div>

                  {event.contact_email && (
                    <div className="flex items-start gap-3">
                      <Mail size={18} className="text-appdev-blue flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-gray-700">Contact</div>
                        <a
                          href={`mailto:${event.contact_email}`}
                          className="text-blue-600 hover:text-blue-700 text-xs break-all"
                        >
                          {event.contact_email}
                        </a>
                      </div>
                    </div>
                  )}

                  {event.source && (
                    <div className="flex items-start gap-3">
                      <Users size={18} className="text-appdev-blue flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-gray-700">Source</div>
                        <div className="text-gray-600 text-xs">{event.source}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button className="w-full px-3 py-2 bg-appdev-blue text-white rounded-md hover:bg-blue-700 transition-colors">
                  Register for Event
                </button>
              </div>
            </div>

            {/* Event Metadata */}
            {(event.recievedDate || event.last_modified) && (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                  Event Info
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  {event.recievedDate && (
                    <div>
                      <span className="font-medium">Posted:</span>{" "}
                      {new Date(event.recievedDate).toLocaleDateString()}
                    </div>
                  )}
                  {event.last_modified && (
                    <div>
                      <span className="font-medium">Updated:</span>{" "}
                      {new Date(event.last_modified).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}

export default EventDetails;

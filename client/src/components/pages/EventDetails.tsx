import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMockEvents } from "../../api/mock-events";
import { MockEvent } from "../../types";
import NotFound from "./NotFound";
import Navbar from "../modules/Navbar";
import defaultImage from "../../assets/default.png";
import { ArrowLeft, MapPin, Clock, Users } from "lucide-react";
import {
  getID,
  saveEvent,
  unsaveEvent,
  getSavedEventIds,
} from "../../api/events";

import {
  FaRegBookmark,
  FaBookmark,
} from "react-icons/fa";
import { UserContext } from "../App";



function EventDetails() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const userContext = useContext(UserContext);

  if (!userContext) {
    throw new Error("EventDetails must be used within UserContext");
  }

  const {userId, userEmail} = userContext;
  const [event, setEvent] = useState<MockEvent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isHoveringSave, setIsHoveringSave] = useState<boolean>(false);
  const [notFound, setNotFound] = useState<boolean>(false);

  useEffect(() => {
    async function load() {

      if (!eventId) return;

      setLoading(true);
      try {
        // fetch event details
        const eventResponse = await getID(eventId);
        setEvent(eventResponse);
        // fetch users saved events if logged in
        if (userId) {
            const savedIdsResponse = await getSavedEventIds();
            if (savedIdsResponse && Array.isArray(savedIdsResponse)) {
              setIsSaved(
                savedIdsResponse.some(
                  (saved: { event_id: string }) => saved.event_id === eventId
                )
            );
          }
        } else {
          setIsSaved(false);
        }
      } catch (err: any) {
        console.error("Failed to load event details or save status:", err);
        if (err.response?.status===404){
          setNotFound(true);
        }
        setEvent(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [eventId,userId,userEmail]);


  async function handleToggleSave(){
    if (!eventId) return;
    setIsSaved(!isSaved);
    
    try {
      let response;
      if (!isSaved) {
        response = await saveEvent(eventId);
      } else {
        response = await unsaveEvent(eventId);
        setEvent((prev) => 
      prev
        ? {
            ...prev,
            saveCount: !isSaved
              ? (prev.saveCount || 0) - 1
              : (prev.saveCount || 0) + 1,
          }
        : null
    );
      }

      if (response){
        setEvent(response);
      }
    } catch (error: any) {
      console.error("Failed to save/unsave event:", error);
      setIsSaved(isSaved);
    }
  }

  const tagList =
    event && typeof event.tags === "string"
      ? event.tags.split(/,\s*/).filter((tag: string) => tag)
      : event && Array.isArray(event.tags)
      ? event.tags
      : [];

  /*
    // function to handle image errors
  function handleImageError(e: React.SyntheticEvent<HTMLImageElement>) {
    e.currentTarget.src = defaultImage;
  }

  let fullImageUrl = defaultImage;
  if (event && typeof event.image_url === "string") {
    if (event.image_url.startsWith("/")) {
      fullImageUrl = `https://engage.mit.edu${club.image_url}`;
    } else if (event.image_url) {
      fullImageUrl = event.image_url;
    }
  }
*/

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

  if (notFound) {
    return <NotFound />;
  }

  if (!event) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-center text-xl text-appdev-red">
            Could not load event details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 md:px-8 py-8 relative pt-20 md:pt-28">
        <div className="mb-4">
          <button
            onClick={() => navigate("/events")}
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
                    {event.name}
                  </h1>
                  <p className="text-gray-600 mt-2">{event.organizerName}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tagList.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="text-sm bg-appdev-blue/20 text-appdev-blue-dark font-medium rounded-full px-3 py-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-1/4 space-y-6">
                        <div className="flex items-center justify-start gap-3">
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
                            <span className="ml-1">{event ? event.saveCount || 0 : 0}</span>
                          </button>
                        </div>
                        </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Event Description
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words overflow-hidden">
                {event.description || "No description provided."}
              </p>
            </div>
          </div>
          <div className="w-full lg:w-1/4 space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                  Event Details
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start gap-3">
                    <Clock size={18} className="text-appdev-blue flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">{event.date}</div>
                      <div className="text-gray-600">{event.startTime} — {event.endTime}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-appdev-blue flex-shrink-0 mt-0.5" />
                    <div className="text-gray-700">{event.location}</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users size={18} className="text-appdev-blue flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-gray-700">
                        {event.attendeeCount}
                        {event.maxAttendees ? ` / ${event.maxAttendees}` : ''} attendees
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-2">
                {event.isRegistered ? (
                  <span className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded">
                    ✓ Registered
                  </span>
                ) : (
                  <button className="w-full px-3 py-2 bg-appdev-blue text-white rounded-md hover:bg-blue-700 transition-colors">
                    Register
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );


}

export default EventDetails;

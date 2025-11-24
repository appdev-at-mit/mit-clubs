import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMockEvents, MockEvent } from "../../api/mock-events";
import NotFound from "./NotFound";
import Navbar from "../modules/Navbar";
import defaultImage from "../../assets/default.png";

function EventDetails() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<MockEvent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const all = getMockEvents();
        const found = all.find((e) => e.event_id === eventId) || null;
        setEvent(found);
      } catch (err) {
        console.error("Failed to load event details:", err);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [eventId]);

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

  if (!event) {
    return <NotFound />;
  }

  const image = event.imageUrl || defaultImage;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex-grow container mx-auto px-6 lg:px-12 py-8 relative pt-20 md:pt-28">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <h1 className="text-4xl font-extrabold text-gray-900">{event.name}</h1>
          <div className="text-xl italic text-right text-gray-700">{event.organizerName}</div>
        </div>

        {/* Main grid: description left, info column right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold mb-3">Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{event.description}</p>
            </div>

            <div className="mt-6">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-4 py-2 bg-blue-100 text-appdev-blue-dark rounded-md shadow-sm hover:bg-blue-200"
              >
                Back
              </button>
            </div>
          </div>

          <aside className="lg:col-span-1 space-y-4">
            <div className="bg-white p-6 rounded-lg border border-blue-100 h-32">
              <h3 className="font-semibold mb-2">Event time</h3>
              <div className="text-sm text-gray-700">
                <div>{event.date}</div>
                <div className="mt-1">{event.startTime} — {event.endTime}</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-blue-100 h-32">
              <h3 className="font-semibold mb-2">Event location</h3>
              <div className="text-sm text-gray-700">{event.location}</div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-blue-100 h-40">
              <h3 className="font-semibold mb-2">Some info (perhaps add to calendar)</h3>
              <div className="text-sm text-gray-700">
                <div>Attendees: {event.attendeeCount}{event.maxAttendees ? ` / ${event.maxAttendees}` : ''}</div>
                <div className="mt-3">
                  {event.isRegistered ? (
                    <span className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded">✓ Registered</span>
                  ) : (
                    <button className="px-3 py-2 bg-blue-600 text-white rounded">Register</button>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;

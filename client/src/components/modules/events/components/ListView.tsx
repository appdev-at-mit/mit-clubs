import React from "react";
import { Event } from "../../../../types";
import EventCard from "../../EventCard";
import { formatDate } from "../../../../api/mock-events";
import { addDays } from "../utils/dateUtils";

interface ListViewProps {
  filteredEvents: Event[];
  weekStart: Date;
  savedEventIds: string[];
  toggleSave: (eventId: string) => void;
}

export function ListView({
  filteredEvents,
  weekStart,
  savedEventIds,
  toggleSave
}: ListViewProps) {
  // Filter events for the current week
  const weekStartIso = weekStart.toISOString().split('T')[0];
  const weekEndIso = addDays(weekStart, 6).toISOString().split('T')[0];
  const weekFilteredEvents = filteredEvents.filter(
    (ev) => {
      const evDate = formatDate(ev.date);
      return evDate >= weekStartIso && evDate <= weekEndIso;
    }
  );

  // Group events by date
  const eventsByDate = weekFilteredEvents.reduce((groups, event) => {
    const date = formatDate(event.date);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {} as Record<string, Event[]>);

  // Generate all dates in the week range (including days with no events)
  const allDatesInWeek: string[] = [];
  for (let i = 0; i < 7; i++) {
    const currentDate = addDays(weekStart, i);
    allDatesInWeek.push(currentDate.toISOString().split('T')[0]);
  }

  return (
    <div className="space-y-8">
      {allDatesInWeek.map((date) => {
        const dateEvents = eventsByDate[date] || [];
        return (
          <div key={date}>
            {/* date header */}
            <div className="bg-gray-50 py-3 mb-4 border-b-2" style={{ borderColor: '#5b8fb9' }}>
              <h2 className="text-2xl font-bold text-gray-900">
                {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {dateEvents.length} event{dateEvents.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* events for this date */}
            <div className="space-y-4">
              {dateEvents.map((event) => {
                // Skip events without _id
                if (!event._id) {
                  console.warn('Event missing _id:', event.title);
                  return null;
                }

                return (
                  <EventCard
                    key={event._id}
                    event={event}
                    isSaved={savedEventIds.includes(event._id)}
                    onToggleSave={() => toggleSave(event._id)}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

import { Event } from "../../../../types";
import { formatDate } from "../../../../api/mock-events";
import { timeToMinutes } from "./dateUtils";
import { EventLayoutPosition } from "../types";

export function calculateEventLayout(
  events: Event[],
  selectedDate: Date
): Map<string, EventLayoutPosition> {
  const selectedDateStr = selectedDate.toISOString().split("T")[0];

  // Sort events, accounting for continuation events starting at midnight
  const sortedEvents = [...events].sort((a, b) => {
    const aDate = formatDate(a.date);
    const bDate = formatDate(b.date);
    const aIsContinuation = aDate !== selectedDateStr;
    const bIsContinuation = bDate !== selectedDateStr;
    const aStart = aIsContinuation ? 0 : timeToMinutes(a.date);
    const bStart = bIsContinuation ? 0 : timeToMinutes(b.date);

    if (aStart !== bStart) return aStart - bStart;

    // For events starting at same time, prioritize longer events
    const aEnd = a.end_time
      ? timeToMinutes(a.end_time)
      : aStart + (a.duration || 60);
    const bEnd = b.end_time
      ? timeToMinutes(b.end_time)
      : bStart + (b.duration || 60);
    return bEnd - aEnd;
  });

  const columns: Event[][] = [];

  sortedEvents.forEach((event) => {
    const eventDate = formatDate(event.date);
    const isContinuation = eventDate !== selectedDateStr;
    const eventStart = isContinuation ? 0 : timeToMinutes(event.date);
    let eventEnd = event.end_time
      ? timeToMinutes(event.end_time)
      : eventStart + (event.duration || 60);

    // Handle 24-hour events and events spanning past midnight
    if (eventEnd === eventStart && !isContinuation) {
      eventEnd = 24 * 60; // 24-hour event
    } else if (eventEnd < eventStart && !isContinuation) {
      eventEnd += 24 * 60; // Spans past midnight
    }

    // Cap at end of day
    eventEnd = Math.min(eventEnd, 24 * 60);

    // Find the first column where this event doesn't overlap
    let placed = false;
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];
      const lastEventInColumn = column[column.length - 1];
      const lastDate = formatDate(lastEventInColumn.date);
      const lastIsContinuation = lastDate !== selectedDateStr;
      const lastEventStart = lastIsContinuation
        ? 0
        : timeToMinutes(lastEventInColumn.date);
      let lastEventEnd = lastEventInColumn.end_time
        ? timeToMinutes(lastEventInColumn.end_time)
        : lastEventStart + (lastEventInColumn.duration || 60);

      // Handle 24-hour events and events spanning past midnight for the last event
      if (lastEventEnd === lastEventStart && !lastIsContinuation) {
        lastEventEnd = 24 * 60; // 24-hour event
      } else if (lastEventEnd < lastEventStart && !lastIsContinuation) {
        lastEventEnd += 24 * 60; // Spans past midnight
      }

      // Cap at end of day
      lastEventEnd = Math.min(lastEventEnd, 24 * 60);

      if (eventStart >= lastEventEnd) {
        column.push(event);
        placed = true;
        break;
      }
    }

    // If no suitable column found, create a new one
    if (!placed) {
      columns.push([event]);
    }
  });

  // Create a map of event to its position
  const eventPositions = new Map<string, EventLayoutPosition>();

  columns.forEach((column, columnIndex) => {
    column.forEach((event) => {
      const eventId = event._id || event.title;
      eventPositions.set(eventId, {
        column: columnIndex,
        totalColumns: columns.length,
      });
    });
  });

  return eventPositions;
}

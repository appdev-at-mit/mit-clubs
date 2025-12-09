import { Event } from "../../../../types";
import { formatDate } from "../../../../api/mock-events";
import { timeToMinutes } from "./dateUtils";
import { EventLayoutPosition } from "../types";

export function calculateEventLayout(
  events: Event[],
  selectedDate: Date
): Map<string, EventLayoutPosition> {
  const selectedDateStr = selectedDate.toISOString().split("T")[0];

  // Helper to get event time range
  const getEventTimeRange = (event: Event) => {
    const eventDate = formatDate(event.date);
    const isContinuation = eventDate !== selectedDateStr;
    const start = isContinuation ? 0 : timeToMinutes(event.date);
    let end = event.end_time
      ? timeToMinutes(event.end_time)
      : start + (event.duration || 60);

    // Handle 24-hour events and events spanning past midnight
    if (end === start && !isContinuation) {
      end = 24 * 60;
    } else if (end < start && !isContinuation) {
      end += 24 * 60;
    }
    end = Math.min(end, 24 * 60);

    return { start, end };
  };

  // Sort events: by start time, then by duration (longest first)
  const sortedEvents = [...events].sort((a, b) => {
    const aRange = getEventTimeRange(a);
    const bRange = getEventTimeRange(b);

    if (aRange.start !== bRange.start) {
      return aRange.start - bRange.start;
    }

    // Same start time: longer events first (will be rendered at bottom)
    const aDuration = aRange.end - aRange.start;
    const bDuration = bRange.end - bRange.start;
    return bDuration - aDuration;
  });

  // Track which column each event is placed in
  const eventColumns = new Map<string, number>();
  const columnEndTimes: number[] = [];

  sortedEvents.forEach((event) => {
    const { start, end } = getEventTimeRange(event);
    const eventId = event._id || event.title;

    // Find the leftmost column where this event doesn't overlap
    let targetColumn = -1;
    for (let col = 0; col < columnEndTimes.length; col++) {
      if (start >= columnEndTimes[col]) {
        targetColumn = col;
        break;
      }
    }

    // If no available column, create a new one
    if (targetColumn === -1) {
      targetColumn = columnEndTimes.length;
      columnEndTimes.push(end);
    } else {
      columnEndTimes[targetColumn] = end;
    }

    eventColumns.set(eventId, targetColumn);
  });

  // Calculate totalColumns for each event (how many columns overlap with it)
  const eventPositions = new Map<string, EventLayoutPosition>();

  sortedEvents.forEach((event) => {
    const eventId = event._id || event.title;
    const eventColumn = eventColumns.get(eventId)!;
    const { start, end } = getEventTimeRange(event);

    // Find the rightmost column that has an overlapping event
    let maxColumn = eventColumn;
    sortedEvents.forEach((otherEvent) => {
      const otherId = otherEvent._id || otherEvent.title;
      if (otherId === eventId) return;

      const otherColumn = eventColumns.get(otherId)!;
      const otherRange = getEventTimeRange(otherEvent);

      // Check if there's any time overlap
      if (start < otherRange.end && end > otherRange.start) {
        maxColumn = Math.max(maxColumn, otherColumn);
      }
    });

    eventPositions.set(eventId, {
      column: eventColumn,
      totalColumns: maxColumn + 1,
    });
  });

  return eventPositions;
}

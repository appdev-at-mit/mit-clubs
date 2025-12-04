import { Event } from "../../../../types";
import { formatDate } from "../../../../api/mock-events";
import { timeToMinutes } from "./dateUtils";
import { EventStyles } from "../types";

export function getEventStyles(
  event: Event,
  selectedDate: Date,
  isCurrentDay: boolean = true
): EventStyles {
  const startMinutes = timeToMinutes(event.date);
  const endMinutes = event.end_time
    ? timeToMinutes(event.end_time)
    : startMinutes + (event.duration || 60);

  const calendarStart = 0; // 12:00 AM (midnight)
  const calendarEnd = 24 * 60; // 12:00 AM next day (midnight)
  const hourHeight = 80; // pixels per hour

  let duration = endMinutes - startMinutes;
  // If end time equals start time, it's a 24-hour event
  if (duration === 0) {
    duration = 24 * 60;
  } else if (duration < 0) {
    // Event spans past midnight - add 24 hours
    duration += 24 * 60;
  }

  // Check if this event started on a previous day (continuation event)
  const selectedDateStr = selectedDate.toISOString().split("T")[0];
  const eventDate = formatDate(event.date);
  const isContinuation = eventDate !== selectedDateStr;

  let top, height;

  if (isContinuation) {
    // Event continues from previous day - start at midnight
    top = 0;
    // Calculate remaining duration from the event
    const totalEventDuration = startMinutes + duration;
    const remainingDuration = totalEventDuration - calendarEnd;
    height = (Math.min(remainingDuration, calendarEnd) / 60) * hourHeight;
  } else {
    // Event starts today
    top = ((startMinutes - calendarStart) / 60) * hourHeight;

    // Cap the event at end of day (midnight)
    const eventEndMinutes = startMinutes + duration;
    if (eventEndMinutes > calendarEnd) {
      duration = calendarEnd - startMinutes;
    }

    height = (duration / 60) * hourHeight;
  }

  return { top, height };
}

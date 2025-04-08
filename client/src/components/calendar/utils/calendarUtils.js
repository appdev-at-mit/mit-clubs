// Helper function to format date for iCalendar format
// iCalendar requires dates in format: YYYYMMDDTHHMMSSZ
export const formatDateForICS = (date) => {
    const pad = (num) => (num < 10 ? '0' : '') + num;

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
  };

  // Generate a unique identifier for each iCalendar event
  export const generateUID = () => {
    return 'event_' + Math.random().toString(36).substring(2, 11) +
           Math.random().toString(36).substring(2, 11) + '@universityclubs.com';
  };

  // Helper functions for event date calculations
  export const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  // Check if a date falls within an event's date range
  export const isDateInEventRange = (date, event) => {
    const eventStartDate = new Date(event.date);
    const eventEndDate = event.end_date ? new Date(event.end_date) : new Date(eventStartDate);

    // Format dates to ignore time component
    const eventStartDay = new Date(eventStartDate.getFullYear(), eventStartDate.getMonth(), eventStartDate.getDate());
    const eventEndDay = new Date(eventEndDate.getFullYear(), eventEndDate.getMonth(), eventEndDate.getDate());
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

    // Check if this day falls within the event's date range
    return (dayStart >= eventStartDay && dayStart <= eventEndDay) ||
           (dayEnd >= eventStartDay && dayEnd <= eventEndDay) ||
           (eventStartDay >= dayStart && eventStartDay <= dayEnd) ||
           (eventEndDay >= dayStart && eventEndDay <= dayEnd);
  };

  // Check if an event spans multiple days
  export const isMultiDayEvent = (event) => {
    if (!event.end_date) return false;

    const eventStartDate = new Date(event.date);
    const eventEndDate = new Date(event.end_date);

    return eventStartDate.toDateString() !== eventEndDate.toDateString();
  };

  // Format event time for display
  export const formatEventTime = (dateTimeString) => {
    const eventDate = new Date(dateTimeString);
    return eventDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format event date range for display
  export const formatEventDateRange = (event) => {
    const eventStartDate = new Date(event.date);
    const eventEndDate = event.end_date ? new Date(event.end_date) : new Date(eventStartDate);
    const isMultiDay = eventStartDate.toDateString() !== eventEndDate.toDateString();

    if (isMultiDay) {
      const startStr = eventStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endStr = eventEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${startStr} - ${endStr}`;
    }

    return formatEventTime(event.date);
  };

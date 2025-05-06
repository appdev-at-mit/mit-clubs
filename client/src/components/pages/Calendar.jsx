import React, { useState, useEffect } from 'react';
import CalendarHeader from '../calendar/CalendarHeader';
import CalendarSidebar from '../calendar/CalendarSidebar';
import MonthView from '../calendar/MonthView';
import WeekView from '../calendar/WeekView';
import DayView from '../calendar/DayView';
import { formatDateForICS, generateUID } from '../calendar/utils/calendarUtils';

const Calendar = () => {
  // State for the calendar data
  const [date, setDate] = useState(new Date());
  const [savedClubs, setSavedClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', or 'day'

  // Fetch saved clubs and their events
  useEffect(() => {
    const fetchSavedClubsAndEvents = async () => {
      try {
        setLoading(true);

        // Get the current month's date range for filtering
        const currentDate = new Date(date);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // First day of month
        const startDate = new Date(year, month, 1);
        // Last day of month (0th day of next month is last day of current month)
        const endDate = new Date(year, month + 1, 0);

        // Format dates for the API
        const formattedStartDate = startDate.toISOString();
        const formattedEndDate = endDate.toISOString();

        // Fetch saved clubs
        const clubsResponse = await fetch('/api/saved-clubs');

        if (!clubsResponse.ok) {
          throw new Error('Failed to fetch saved clubs');
        }

        const clubsData = await clubsResponse.json();
        setSavedClubs(clubsData);

        // Fetch events for all saved clubs with date range filter
        const eventsResponse = await fetch(
          `/api/user/saved-clubs/events?start_date=${formattedStartDate}&end_date=${formattedEndDate}`
        );

        if (!eventsResponse.ok) {
          throw new Error('Failed to fetch events');
        }

        const eventsData = await eventsResponse.json();
        setEvents(eventsData.events || []);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchSavedClubsAndEvents();
  }, [date.getMonth(), date.getFullYear()]);

  // Helper function to get a random color based on club ID
  const getRandomColor = (id) => {
    const colors = [
      '#FF5252', '#FF4081', '#E040FB', '#7C4DFF',
      '#536DFE', '#448AFF', '#40C4FF', '#18FFFF',
      '#64FFDA', '#69F0AE', '#B2FF59', '#EEFF41'
    ];

    // Use the club ID to deterministically select a color
    const colorIndex = parseInt(id, 16) % colors.length || 0;
    return colors[colorIndex];
  };

  // Navigate to previous month/week/day
  const prevPeriod = () => {
    const newDate = new Date(date);
    if (viewMode === 'month') {
      newDate.setMonth(date.getMonth() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(date.getDate() - 7);
    } else {
      newDate.setDate(date.getDate() - 1);
    }
    setDate(newDate);
  };

  // Navigate to next month/week/day
  const nextPeriod = () => {
    const newDate = new Date(date);
    if (viewMode === 'month') {
      newDate.setMonth(date.getMonth() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(date.getDate() + 7);
    } else {
      newDate.setDate(date.getDate() + 1);
    }
    setDate(newDate);
  };

  // Return to today
  const goToToday = () => {
    setDate(new Date());
  };

  // Format date for display in the header
  const formatDateHeader = () => {
    const options = {
      month: 'long',
      year: 'numeric'
    };

    if (viewMode === 'week') {
      const weekDays = getWeekDays();
      const firstDay = weekDays[0];
      const lastDay = weekDays[6];

      const firstDayFormatted = firstDay.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });

      const lastDayFormatted = lastDay.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      return `${firstDayFormatted} - ${lastDayFormatted}`;
    } else if (viewMode === 'day') {
      options.weekday = 'long';
      options.day = 'numeric';
    }

    return date.toLocaleDateString('en-US', options);
  };

  // Get the days of the current week (for the header display)
  const getWeekDays = () => {
    const currentDate = new Date(date);
    const day = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Calculate the date of the first day of the week (Sunday)
    const firstDayOfWeek = new Date(currentDate);
    firstDayOfWeek.setDate(currentDate.getDate() - day);

    const weekDays = [];

    // Add each day of the week
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(firstDayOfWeek);
      currentDay.setDate(firstDayOfWeek.getDate() + i);
      weekDays.push(currentDay);
    }

    return weekDays;
  };

  // Function to create an ICS file for an event
  const createEventICS = (event) => {
    const eventDate = new Date(event.date);

    // Use end_date if available, otherwise default to 1 hour duration
    const endDate = event.end_date ? new Date(event.end_date) : (() => {
      const defaultEnd = new Date(eventDate);
      defaultEnd.setHours(defaultEnd.getHours() + 1);
      return defaultEnd;
    })();

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'CALSCALE:GREGORIAN',
      'PRODID:-//University Clubs//Calendar App//EN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${generateUID()}`,
      `DTSTAMP:${formatDateForICS(new Date())}`,
      `DTSTART:${formatDateForICS(eventDate)}`,
      `DTEND:${formatDateForICS(endDate)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description || `${event.clubName} event at ${event.location}`}`,
      `LOCATION:${event.location}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    return icsContent;
  };

  // Function to download an event as ICS file
  const downloadEventICS = (event) => {
    const icsContent = createEventICS(event);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Function to export current view events as ICS file
  const exportCurrentView = () => {
    let eventsToExport = [];

    if (viewMode === 'month') {
      // Get all events for the current month
      const year = date.getFullYear();
      const month = date.getMonth();
      eventsToExport = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getMonth() === month && eventDate.getFullYear() === year;
      });
    } else if (viewMode === 'week') {
      // Get all events for the current week
      const weekDays = getWeekDays();
      const firstDay = weekDays[0];
      const lastDay = weekDays[6];

      eventsToExport = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= firstDay && eventDate <= lastDay;
      });
    } else {
      // Get all events for the current day
      eventsToExport = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getDate() === date.getDate() &&
               eventDate.getMonth() === date.getMonth() &&
               eventDate.getFullYear() === date.getFullYear();
      });
    }

    if (eventsToExport.length === 0) {
      alert('No events to export for the selected time period.');
      return;
    }

    // Create a combined ICS file with all events
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'CALSCALE:GREGORIAN',
      'PRODID:-//University Clubs//Calendar App//EN',
      'METHOD:PUBLISH'
    ];

    eventsToExport.forEach(event => {
      const eventDate = new Date(event.date);
      const endDate = event.end_date ? new Date(event.end_date) : (() => {
        const defaultEnd = new Date(eventDate);
        defaultEnd.setHours(defaultEnd.getHours() + 1);
        return defaultEnd;
      })();

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${generateUID()}`,
        `DTSTAMP:${formatDateForICS(new Date())}`,
        `DTSTART:${formatDateForICS(eventDate)}`,
        `DTEND:${formatDateForICS(endDate)}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description || `${event.clubName} event at ${event.location}`}`,
        `LOCATION:${event.location}`,
        'END:VEVENT'
      );
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;

    const viewPeriod = viewMode === 'month'
      ? date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : viewMode === 'week'
        ? 'Week_' + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    link.setAttribute('download', `Club_Events_${viewPeriod.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Function to export all events (not just the current view)
  const exportEntireCalendar = () => {
    if (events.length === 0) {
      alert('No events to export.');
      return;
    }

    // Create a combined ICS file with all events
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'CALSCALE:GREGORIAN',
      'PRODID:-//University Clubs//Calendar App//EN',
      'METHOD:PUBLISH'
    ];

    events.forEach(event => {
      const eventDate = new Date(event.date);
      const endDate = event.end_date ? new Date(event.end_date) : (() => {
        const defaultEnd = new Date(eventDate);
        defaultEnd.setHours(defaultEnd.getHours() + 1);
        return defaultEnd;
      })();

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${generateUID()}`,
        `DTSTAMP:${formatDateForICS(new Date())}`,
        `DTSTART:${formatDateForICS(eventDate)}`,
        `DTEND:${formatDateForICS(endDate)}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description || `${event.clubName} event at ${event.location}`}`,
        `LOCATION:${event.location}`,
        'END:VEVENT'
      );
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `All_Club_Events.ics`);
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] grid-rows-[auto_1fr] h-screen">
      {/* Header */}
      <CalendarHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        date={date}
        formatDateHeader={formatDateHeader}
        prevPeriod={prevPeriod}
        nextPeriod={nextPeriod}
        goToToday={goToToday}
        exportCurrentView={exportCurrentView}
        exportEntireCalendar={exportEntireCalendar}
      />

      {/* Sidebar */}
      <CalendarSidebar
        savedClubs={savedClubs}
        loading={loading}
        getRandomColor={getRandomColor}
      />

      {/* Calendar Content */}
      <div className="bg-white relative overflow-y-auto">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
            <div className="text-gray-600">Loading calendar events...</div>
          </div>
        ) : (
          <>
            {viewMode === 'month' && (
              <MonthView
                date={date}
                setDate={setDate}
                events={events}
                setViewMode={setViewMode}
              />
            )}
            {viewMode === 'week' && (
              <WeekView
                date={date}
                setDate={setDate}
                events={events}
                setViewMode={setViewMode}
                downloadEventICS={downloadEventICS}
              />
            )}
            {viewMode === 'day' && (
              <DayView
                date={date}
                events={events}
                downloadEventICS={downloadEventICS}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Calendar;

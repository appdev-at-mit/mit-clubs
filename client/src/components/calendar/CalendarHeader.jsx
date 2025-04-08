import React from 'react';

const CalendarHeader = ({
  viewMode,
  setViewMode,
  date,
  formatDateHeader,
  prevPeriod,
  nextPeriod,
  goToToday,
  exportCurrentView,
  exportEntireCalendar
}) => {
  return (
    <div className="col-span-1 md:col-span-2 p-5 border-b">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Club Events Calendar</h1>
        <div className="flex flex-wrap gap-2">
          <button
            className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2"
            onClick={exportCurrentView}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export {viewMode === 'month' ? 'Month' : viewMode === 'week' ? 'Week' : 'Day'}
          </button>
          <button
            className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center gap-2"
            onClick={exportEntireCalendar}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            Export All Events
          </button>
        </div>
      </div>
      <div className="flex flex-wrap justify-between mb-4">
        <div className="flex flex-wrap gap-2 mb-2 md:mb-0">
          <button
            className={`px-3 py-2 border rounded text-sm transition-colors
              ${viewMode === 'month' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 hover:bg-gray-100'}
            `}
            onClick={() => setViewMode('month')}
          >
            Month
          </button>
          <button
            className={`px-3 py-2 border rounded text-sm transition-colors
              ${viewMode === 'week' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 hover:bg-gray-100'}
            `}
            onClick={() => setViewMode('week')}
          >
            Week
          </button>
          <button
            className={`px-3 py-2 border rounded text-sm transition-colors
              ${viewMode === 'day' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 hover:bg-gray-100'}
            `}
            onClick={() => setViewMode('day')}
          >
            Day
          </button>
        </div>
        <div className="flex gap-2">
          <button
            className="px-3 py-2 border rounded text-sm bg-gray-50 hover:bg-gray-100 transition-colors"
            onClick={prevPeriod}
          >
            &lt;
          </button>
          <button
            className="px-3 py-2 border rounded text-sm bg-gray-50 hover:bg-gray-100 transition-colors"
            onClick={goToToday}
          >
            Today
          </button>
          <button
            className="px-3 py-2 border rounded text-sm bg-gray-50 hover:bg-gray-100 transition-colors"
            onClick={nextPeriod}
          >
            &gt;
          </button>
        </div>
      </div>
      <div className="text-lg font-medium text-center">{formatDateHeader()}</div>
    </div>
  );
};

export default CalendarHeader;

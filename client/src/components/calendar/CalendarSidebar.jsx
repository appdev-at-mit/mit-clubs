import React from 'react';

const CalendarSidebar = ({ savedClubs, loading, getRandomColor }) => {
  return (
    <div className="p-5 bg-gray-50 border-r md:h-full overflow-y-auto">
      <h3 className="text-lg font-medium mb-4">My Saved Clubs</h3>
      {loading ? (
        <div className="flex justify-center py-5 text-gray-500">Loading clubs...</div>
      ) : (
        <div className="flex flex-col gap-3">
          {savedClubs.map(club => (
            <div
              key={club.id || club.club_id}
              className="flex items-center p-3 bg-white rounded-md shadow-sm hover:shadow transition-shadow"
            >
              <div
                className="w-3 h-3 rounded-full mr-3"
                style={{ backgroundColor: club.color || getRandomColor(club.id || club.club_id) }}
              ></div>
              <div className="font-medium">{club.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarSidebar;

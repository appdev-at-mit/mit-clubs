import React, { useState, useContext } from "react";
import Navbar from "../modules/Navbar";
import DailyView from "../modules/DailyView";
import WeeklyView from "../modules/WeeklyView";
import { UserContext } from "../App";

function Events() {
  const [currentView, setCurrentView] = useState<'daily' | 'weekly'>('daily');
  const userContext = useContext(UserContext);
  const { userId, userEmail } = userContext;

  if (!userContext) {
    throw new Error("Profile must be used within UserContext");
  }

  if (!userId) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Please log in
            </h1>
            <p className="text-gray-600 mb-6">
              You need to be logged in to view events.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-16 flex-grow">
        {/* outside of daily/weekly view */}
        <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Events</h1>
                <p className="text-gray-600 mt-1">
                  {currentView === 'daily' && 'View events by day'}
                  {currentView === 'weekly' && 'View events by week'}
                </p>
              </div>

              {/* view toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setCurrentView('daily')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    currentView === 'daily'
                      ? 'bg-white text-gray-900 shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setCurrentView('weekly')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    currentView === 'weekly'
                      ? 'bg-white text-gray-900 shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Weekly
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* render based on view */}
        {currentView === 'daily' && <DailyView />}
        {currentView === 'weekly' && <WeeklyView />}
      </div>
    </div>
  );
}

export default Events;

import React from "react";
import Navbar from "../modules/Navbar";
import DailyView from "../modules/DailyView";

function Events() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-16 flex-grow">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Events</h1>
            </div>
          </div>
        </div>

        {/* Daily view */}
        <DailyView />
      </div>
    </div>
  );
}

export default Events;

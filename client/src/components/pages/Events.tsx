import React from "react";
import Navbar from "../modules/Navbar";
import DailyView from "../modules/DailyView";

function Events() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-16 flex-grow">
        {/* Daily view */}
        <DailyView />
      </div>
    </div>
  );
}

export default Events;

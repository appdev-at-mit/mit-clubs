import React, { useState, useContext } from "react";
import Navbar from "../modules/Navbar";
import DailyView from "../modules/DailyView";
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
        {/* Daily view */}
        <DailyView />
      </div>
    </div>
  );
}

export default Events;

import React from "react";
import Navbar from "../modules/Navbar";

function Events() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <div className="flex justify-center py-8 pt-24">
        <div className="space-y-6 max-w-4xl mx-4 md:mx-12 lg:mx-20">
          <h1 className="text-3xl font-medium text-gray-800 mb-8 text-center">
            Events
          </h1>
          <div>
            <p className="text-gray-700">
              Insert Calendar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Events;

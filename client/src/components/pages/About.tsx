import React from "react";
import Navbar from "../modules/Navbar";

const About: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <div className="flex justify-center py-8 pt-24">
        <div className="space-y-6 max-w-4xl mx-4 md:mx-12 lg:mx-20">
          <h1 className="text-3xl font-medium text-gray-800 mb-8 text-center">
            About
          </h1>
          <div>
            <h3 className="text-lg font-medium mb-2 text-gray-900">Overview</h3>
            <p className="text-gray-700">
              Beaver Clubs serves as a platform for connecting students with
              MIT's student organizations. Explore and discover student groups
              throughout the academic year, beyond just Activities Midway.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2 text-gray-900">
              Using Beaver Clubs
            </h3>
            <p className="text-gray-700">
              Find clubs using our search function and filter by categories,
              membership size, and application processes. Click on a club card
              to learn more about the organization.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2 text-gray-900">
              Account Login Benefits
            </h3>
            <p className="text-gray-700 mb-2">
              Creating an account on Beaver Clubs unlocks the following features
              designed to improve your club experience:
            </p>
            <ul className="list-disc pl-8 text-gray-700 space-y-1">
              <li>
                Save clubs to your profile to track organizations that interest
                you
              </li>
              <li>
                Organize your recruitment schedule and application process via a
                calendar
              </li>
              <li>Get recommendations for clubs based on your interests</li>
              <li>Manage your club's profile and membership directory</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2 text-gray-900">
              Editing Organization Profiles
            </h3>
            <p className="text-gray-700">
              To edit a club's information, you need the appropriate permissions
              for that organization. Club administrators can grant editing
              access to other members.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2 text-gray-900">
              Club Leader Tools
            </h3>
            <p className="text-gray-700 mb-2">
              Beaver Clubs provides tools for organization leaders to:
            </p>
            <ul className="list-disc pl-8 text-gray-700 space-y-1">
              <li>Customize and update your club's public profile</li>
              <li>Indicate your recruitment status and application timeline</li>
              <li>Manage your membership directory</li>
              <li>Answer questions from prospective members</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2 text-gray-900">
              Providing Feedback
            </h3>
            <p className="text-gray-700">
              We welcome input from the entire MIT community to help improve
              Beaver Clubs! Your suggestions and feedback drive our development
              process. Questions or ideas to share? Reach out to our team at{" "}
              <a
                href="mailto:fullstack-exec@mit.edu"
                className="text-brand-blue-dark hover:underline"
              >
                fullstack-exec@mit.edu
              </a>
              .
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2 text-gray-900">Our Team</h3>
            <p className="text-gray-700">
              Beaver Clubs is made by a team of students at{" "}
              <a
                href="https://www.mitappdev.com/"
                className="text-brand-blue-dark hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                AppDev@MIT
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

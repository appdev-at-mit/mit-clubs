import React from "react";
import Navbar from "../modules/Navbar";

function About() {
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
              MIT Clubs is an app that helps students discover and learn more
              about MIT's student organizations.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2 text-gray-900">
              Why use MIT Clubs?
            </h3>
            <p className="text-gray-700 mb-2">
              By creating an account, you can:
            </p>
            <ul className="list-disc pl-8 text-gray-700 space-y-1">
              <li>Track your club memberships and clubs that interest you</li>
              <li>Manage your club's profile and membership directory</li>
              <li>
                Coming soon: Organize your recruitment schedule and application
                process via a calendar
              </li>
              <li>
                Coming soon: Get recommendations for clubs based on your
                interests
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2 text-gray-900">
              Why use MIT Clubs as a club leader?
            </h3>
            <p className="text-gray-700 mb-2">
              <a
                href="mailto:fullstack-exec@mit.edu"
                className="text-appdev-blue-dark hover:underline"
              >
                Email the team
              </a>{" "}
              to be added as a leader for your respective organization. By
              creating an account, you can:
            </p>
            <ul className="list-disc pl-8 text-gray-700 space-y-1">
              <li>
                Customize and update your club's profile to help prospective
                members learn more
              </li>
              <li>
                Provide recruitment details to help prospective members plan
                their applications
              </li>
              <li>Answer questions from prospective members</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2 text-gray-900">
              Questions or feedback?
            </h3>
            <p className="text-gray-700">
              We welcome input from the entire MIT community to help improve MIT
              Clubs! Reach out to our team at{" "}
              <a
                href="mailto:fullstack-exec@mit.edu"
                className="text-appdev-blue-dark hover:underline"
              >
                fullstack-exec@mit.edu
              </a>
              .
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2 text-gray-900">Our Team</h3>
            <p className="text-gray-700">
              Thank you to the following members of{" "}
              <a
                href="https://www.mitappdev.com/"
                className="text-appdev-blue-dark hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                AppDev@MIT
              </a>{" "}
              who made this project possible: Hailey Pan, Kara Chou, An Dinh,
              Justin Le, Anna Li, Victoria Park, Sejal Rathi, Bhadra Rupesh,
              Samantha Shih.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;

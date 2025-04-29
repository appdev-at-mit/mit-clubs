import React, { useState, useEffect } from "react";
import { FaSearch, FaFilter } from "react-icons/fa";
import ClubCard from "../modules/ClubCard";
import Navbar from "../modules/Navbar";

const Clubs = () => {
  const [filters, setFilters] = useState({});
  const [clubs, setClubs] = useState([]);
  const [savedClubs, setSavedClubs] = useState(new Set());
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const membershipProcesses = [
    "Open Membership",
    "Tryout Required",
    "Audition Required",
    "Application Required",
    "Application and Interview Required",
  ];

  const sizes = ["less than 20 members", "20 to 50 members", "50 to 100 members", "more than 100"];

  const recruitingCycles = ["Unknown", "Fall Semester", "Spring Semester"];

  // parse size range
  const parseSizeRange = (range) => {
    switch (range) {
      case "less than 20 members":
        return { min: 0, max: 19 };
      case "20 to 50 members":
        return { min: 20, max: 50 };
      case "50 to 100 members":
        return { min: 51, max: 100 };
      case "more than 100":
        return { min: 101, max: Infinity };
      default:
        return { min: 0, max: Infinity };
    }
  };

  useEffect(() => {
    // fetch all clubs
    fetch("http://localhost:3000/api/clubs")
      .then((response) => response.json())
      .then((data) => {
        setClubs(data);
        setFilteredClubs(data);
      })
      .catch((error) => console.error("Error fetching clubs:", error));

    // fetch saved clubs for the user
    fetch("http://localhost:3000/api/saved-clubs", { credentials: "include" })
      .then((response) => {
        if (!response.ok) {
          // If response is not OK (e.g., 401 Unauthorized), just return empty array
          return [];
        }
        return response.json();
      })
      .then((data) => {
        // Ensure data is an array before calling map
        const savedClubIds = new Set(Array.isArray(data) ? data.map((club) => club.club_id) : []);
        setSavedClubs(savedClubIds);
      })
      .catch((error) => {
        console.error("Error fetching saved clubs:", error);
        // Set empty set on error
        setSavedClubs(new Set());
      });
  }, []);

  const applyFilters = () => {
    let result = [...clubs];

    // filter by search term
    if (searchTerm) {
      result = result.filter(
        (club) =>
          club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          club.mission.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // filter by membership process
    if (filters.membership_process && filters.membership_process.length > 0) {
      result = result.filter((club) =>
        filters.membership_process.includes(club.membership_process)
      );
    }

    // filter by size
    if (filters.sizes && filters.sizes.length > 0) {
      result = result.filter((club) => {
        const { min, max } = parseSizeRange(club.type);
        return filters.sizes.some((size) => {
          const range = parseSizeRange(size);
          return club.membersRange >= range.min && club.membersRange <= range.max;
        });
      });
    }

    // filter by recruiting cycle
    if (filters.recruiting_cycle && filters.recruiting_cycle.length > 0) {
      result = result.filter((club) => filters.recruiting_cycle.includes(club.recruiting_cycle));
    }

    // filter by accepting members
    if (filters.is_accepting) {
      result = result.filter((club) => club.is_accepting === true);
    }

    setFilteredClubs(result);
  };

  const resetFilters = () => {
    setFilters({});
    setFilteredClubs(clubs);
  };

  const toggleFilter = (key, value) => {
    setFilters((prev) => {
      const updated = { ...prev };
      if (!updated[key]) updated[key] = [];
      if (updated[key].includes(value)) {
        updated[key] = updated[key].filter((item) => item !== value);
      } else {
        updated[key].push(value);
      }
      return updated;
    });
  };

  const toggleAcceptingMembers = () => {
    setFilters((prev) => ({
      ...prev,
      is_accepting: !prev.is_accepting,
    }));
  };

  useEffect(() => {
    applyFilters();
  }, [filters, searchTerm]);

  return (
    <>
      <Navbar />
      <div className="flex h-screen overflow-hidden border-t border-gray-300">
        {/* Sidebar */}
        <div className="w-full max-w-96 bg-white border-r border-gray-300 overflow-y-auto p-4 pl-10 pt-6">
          <h3 className="text-lg font-bold mb-4">Filters</h3>

          {/* Membership Process */}
          <div className="mb-6 text-md border-b border-gray-300 pb-6">
            <h4 className="font-bold text-gray-500 mb-2">Membership Process</h4>
            {membershipProcesses.map((process) => (
              <div key={process} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.membership_process?.includes(process) || false}
                  onChange={() => toggleFilter("membership_process", process)}
                />
                <label>{process}</label>
              </div>
            ))}
          </div>

          {/* Sizes */}
          <div className="mb-6 text-md border-b border-gray-300 pb-6">
            <h4 className="font-bold text-gray-500 mb-2">Sizes</h4>
            {sizes.map((size) => (
              <div key={size} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.sizes?.includes(size) || false}
                  onChange={() => toggleFilter("sizes", size)}
                />
                <label>{size}</label>
              </div>
            ))}
          </div>

          {/* Recruiting Cycle */}
          <div className="mb-6 text-md border-b border-gray-300 pb-6">
            <h4 className="font-bold text-gray-500 mb-2">Recruiting Cycle</h4>
            {recruitingCycles.map((cycle) => (
              <div key={cycle} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.recruiting_cycle?.includes(cycle) || false}
                  onChange={() => toggleFilter("recruiting_cycle", cycle)}
                />
                <label>{cycle}</label>
              </div>
            ))}
          </div>

          {/* Accepting Members */}
          <div className="mb-6 text-md">
            <h4 className="font-bold text-gray-500 mb-2">Accepting Members</h4>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.is_accepting || false}
                onChange={toggleAcceptingMembers}
              />
              <label>Is Accepting Members</label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button onClick={resetFilters} className="px-4 py-2 bg-gray-300 rounded-md">
              Reset
            </button>
            <button onClick={applyFilters} className="px-4 py-2 bg-blue-500 text-white rounded-md">
              Apply
            </button>
          </div>
        </div>

        {/* Club Grid */}
        <div className="flex-grow overflow-y-auto p-6 w-full bg-gray-50">
          <h1 className="text-3xl font-bold pt-2 pb-4">Browse Clubs</h1>
          {/* Search Bar */}
          <div className="relative mb-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                applyFilters();
              }}
            >
              <input
                type="text"
                placeholder="Search clubs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <FaSearch className="absolute top-2.5 right-4 text-gray-400" />
            </form>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredClubs.map((club) => (
              <ClubCard
                key={club.club_id}
                id={club.club_id}
                name={club.name}
                tags={club.tags}
                isAccepting={club.is_accepting}
                image_url={club.image_url}
                description={club.mission}
                recruitmentProcess={club.membership_process}
                membersRange={club.membersRange}
                isSavedInitially={savedClubs.has(club.club_id)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Clubs;

import React, { useState } from "react";
import { Club } from "../../../types";
import { membershipProcessOptions, recruitmentCycles } from "./constants";

function RecruitmentPage({ club }: { club: Club }) {
  let initialCycles: string[] = [];
  if (club.recruiting_cycle) {
    if (typeof club.recruiting_cycle === "string") {
      initialCycles = [club.recruiting_cycle];
    } else {
      initialCycles = club.recruiting_cycle;
    }
  }

  const [cycles, setCycles] = useState<string[]>(initialCycles);
  const [isActive, setIsActive] = useState(club.is_active || false);
  const [isAccepting, setIsAccepting] = useState(club.is_accepting || false);
  const [membershipProcess, setMembershipProcess] = useState(
    club.membership_process || "Open Membership"
  );

  function toggleCycle(cycle: string) {
    if (cycles.includes(cycle)) {
      setCycles(cycles.filter((c) => c !== cycle));
    } else {
      setCycles([...cycles, cycle]);
    }
  }

  return (
    <div id="recruitment-form">
      <p className="text-gray-600 mb-6">
        Configure your club's recruitment settings, application processes, and
        open recruitment periods.
      </p>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-[150px,1fr] gap-2 md:gap-4 items-start">
          <label className="font-medium text-gray-700">
            Status<span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_accepting"
                checked={isAccepting}
                onChange={(e) => setIsAccepting(e.target.checked)}
                className="h-4 w-4 rounded text-brand-blue-dark focus:ring-brand-blue-dark"
              />
              <label htmlFor="is_accepting" className="ml-2 text-gray-700">
                Currently accepting members
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded text-brand-blue-dark focus:ring-brand-blue-dark"
              />
              <label htmlFor="is_active" className="ml-2 text-gray-700">
                Active
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[150px,1fr] gap-2 md:gap-4 items-start">
          <label className="font-medium text-gray-700">
            Membership<span className="text-red-500">*</span>
          </label>
          <div>
            <select
              id="membership-process"
              className="w-full p-2 border border-gray-300 rounded-md mb-1"
              value={membershipProcess}
              onChange={(e) => setMembershipProcess(e.target.value)}
            >
              {membershipProcessOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Select how new members join your club.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[150px,1fr] gap-2 md:gap-4 items-start">
          <label className="font-medium text-gray-700">
            Recruitment Cycle<span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {recruitmentCycles.map((cycle) => (
              <div key={cycle.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={cycle.id}
                  name="recruitment_cycle"
                  value={cycle.value}
                  checked={cycles.includes(cycle.value)}
                  onChange={() => toggleCycle(cycle.value)}
                  className="h-4 w-4 rounded text-brand-blue-dark focus:ring-brand-blue-dark"
                />
                <label htmlFor={cycle.id} className="ml-2 text-gray-700">
                  {cycle.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecruitmentPage;

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
  const [isAccepting, setIsAccepting] = useState(club.is_accepting);
  let initialMembershipProcess: string[] = [];
  if (club.membership_process) {
    if (Array.isArray(club.membership_process)) {
      initialMembershipProcess = club.membership_process;
    } else {
      initialMembershipProcess = [club.membership_process];
    }
  }
  const [membershipProcess, setMembershipProcess] = useState<string[]>(
    initialMembershipProcess
  );

  function toggleCycle(cycle: string) {
    if (cycles.includes(cycle)) {
      setCycles(cycles.filter((c) => c !== cycle));
    } else {
      setCycles([...cycles, cycle]);
    }
  }

  function toggleMembershipProcess(process: string) {
    if (membershipProcess.includes(process)) {
      setMembershipProcess(membershipProcess.filter((p) => p !== process));
    } else {
      setMembershipProcess([...membershipProcess, process]);
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
            <div>
              <select
                id="is_accepting"
                value={isAccepting === undefined ? "" : isAccepting.toString()}
                onChange={(e) => {
                  if (e.target.value === "") {
                    setIsAccepting(undefined);
                  } else {
                    setIsAccepting(e.target.value === "true");
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded-md mb-2"
              >
                <option value="">Not Set</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
              <p className="text-sm text-gray-500">
                Whether your club is currently accepting new members.
              </p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded text-appdev-blue-dark focus:ring-appdev-blue-dark"
              />
              <label htmlFor="is_active" className="ml-2 text-gray-700">
                Active
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[150px,1fr] gap-2 md:gap-4 items-start">
          <label className="font-medium text-gray-700">
            Membership Process<span className="text-red-500">*</span>
          </label>
          <div>
            <div className="space-y-2">
              {membershipProcessOptions.map((process) => (
                <div key={process} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`membership-${process}`}
                    checked={membershipProcess.includes(process)}
                    onChange={() => toggleMembershipProcess(process)}
                    className="h-4 w-4 rounded text-appdev-blue-dark focus:ring-appdev-blue-dark"
                  />
                  <label
                    htmlFor={`membership-${process}`}
                    className="ml-2 text-gray-700"
                  >
                    {process}
                  </label>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Select all that apply to your club's membership process.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[150px,1fr] gap-2 md:gap-4 items-start">
          <label className="font-medium text-gray-700">
            Recruitment Cycle<span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {["Year-round", "Fall", "Spring", "IAP"].map((cycle) => (
              <div key={cycle} className="flex items-center">
                <input
                  type="checkbox"
                  id={`cycle-${cycle}`}
                  name="recruitment_cycle"
                  value={cycle}
                  checked={cycles.includes(cycle)}
                  onChange={() => toggleCycle(cycle)}
                  className="h-4 w-4 rounded text-appdev-blue-dark focus:ring-appdev-blue-dark"
                />
                <label
                  htmlFor={`cycle-${cycle}`}
                  className="ml-2 text-gray-700"
                >
                  {cycle}
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

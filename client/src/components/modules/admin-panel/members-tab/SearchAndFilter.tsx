import React from "react";
import { Search } from "lucide-react";

type SearchAndFilterProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  roleFilter: string;
  setRoleFilter: (filter: string) => void;
  membersCount: number;
  onAddMember: () => void;
};

function SearchAndFilter({
  searchQuery,
  setSearchQuery,
  roleFilter,
  setRoleFilter,
  membersCount,
  onAddMember,
}: SearchAndFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder={`Search ${membersCount} entries`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-blue"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
        </div>

        <div className="w-full sm:w-64">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-blue appearance-none bg-white"
          >
            <option value="">Filter by Role</option>
            <option value="Co-Chair (Owner)">Co-Chair (Owner)</option>
            <option value="Marketing Chair (Officer)">
              Marketing Chair (Officer)
            </option>
            <option value="Treasurer (Officer)">Treasurer (Officer)</option>
            <option value="Secretary (Officer)">Secretary (Officer)</option>
            <option value="Member (Member)">Member (Member)</option>
          </select>
        </div>
      </div>

      <button
        onClick={onAddMember}
        className="whitespace-nowrap px-3 py-1.5 bg-brand-green-dark text-white rounded-md hover:bg-brand-green-dark/80 transition-all duration-200"
      >
        + Add Member
      </button>
    </div>
  );
}

export default SearchAndFilter;

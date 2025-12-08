import React from "react";
import { FaChevronDown } from "react-icons/fa";
import { SlidersHorizontal, X } from "lucide-react";
import { FilterState } from "../types";

interface FilterPanelProps {
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  isHoveringResetAll: boolean;
  setIsHoveringResetAll: (value: boolean) => void;
  resetFilters: () => void;
  eventCount: number;
  isCategorySectionOpen: boolean;
  setIsCategorySectionOpen: (value: boolean) => void;
  openSections: { [key: string]: boolean };
  toggleSubSection: (sectionName: string) => void;
  filters: FilterState;
  handleTagCheckboxChange: (tag: string) => void;
  tagCategories: Record<string, string[]>; // Dynamic tags from actual events
}

export function FilterPanel({
  isMobileSidebarOpen,
  toggleMobileSidebar,
  isHoveringResetAll,
  setIsHoveringResetAll,
  resetFilters,
  eventCount,
  isCategorySectionOpen,
  setIsCategorySectionOpen,
  openSections,
  toggleSubSection,
  filters,
  handleTagCheckboxChange,
  tagCategories,
}: FilterPanelProps) {
  return (
    <div
      className={`
        fixed top-16 left-0 bottom-0 z-30 w-full max-w-xs bg-white border-r border-gray-300
        transform transition-transform duration-300 ease-in-out
        ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        flex flex-col pt-6 pb-4 px-6 overflow-y-auto
        md:relative md:translate-x-0 md:flex-shrink-0 md:flex md:overflow-y-auto
        md:top-0 md:pt-6 md:bottom-auto md:h-full
        md:max-w-none
        md:w-64 lg:w-80
      `}
    >
      <div className="flex justify-between items-center mb-1 flex-shrink-0">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-appdev-blue-dark" />
          <span className="text-lg font-bold">Filters</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetFilters}
            onMouseEnter={() => setIsHoveringResetAll(true)}
            onMouseLeave={() => setIsHoveringResetAll(false)}
            style={{
              backgroundColor: isHoveringResetAll ? "#E5E7EB" : "#D1D5DB",
              transition: "background-color 0.1s ease",
            }}
            className="hidden md:block px-3 py-1 rounded-md text-xs"
          >
            Reset All
          </button>
          <button
            onClick={toggleMobileSidebar}
            className="md:hidden text-gray-500 hover:text-gray-700"
            aria-label="Close filters"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-2 flex-shrink-0">
        Showing {eventCount} upcoming events
      </p>
      <button
        onClick={resetFilters}
        onMouseEnter={() => setIsHoveringResetAll(true)}
        onMouseLeave={() => setIsHoveringResetAll(false)}
        style={{
          backgroundColor: isHoveringResetAll ? "#E5E7EB" : "#D1D5DB",
          transition: "background-color 0.1s ease",
        }}
        className="md:hidden px-3 py-1 rounded-md text-xs mb-3 self-start"
      >
        Reset All
      </button>
      <div className="flex-grow overflow-y-auto space-y-1 scrollbar-hide">
        {/* Dynamic tag categories */}
        <div className="border-b border-gray-200 pb-2 mb-2 pr-2">
          <button
            onClick={() => setIsCategorySectionOpen(!isCategorySectionOpen)}
            className="flex justify-between items-center w-full py-1.5 text-left font-semibold text-gray-600 hover:text-gray-800"
          >
            <span>Tags</span>
            <FaChevronDown
              size={12}
              className={`transition-transform duration-300 ${
                isCategorySectionOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          <div
            className={`grid transition-all duration-300 ease-in-out ${
              isCategorySectionOpen
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="mt-2 pl-3 space-y-1">
                {tagCategories && Object.entries(tagCategories).map(([category, tags]) => (
                  <div key={category} className="pb-1">
                    <button
                      onClick={() => toggleSubSection(category)}
                      className="flex justify-between items-center w-full py-1 text-left font-medium text-sm text-gray-500 hover:text-gray-700"
                    >
                      <span>{category}</span>
                      <FaChevronDown
                        size={10}
                        className={`transition-transform duration-300 ${
                          openSections[category] ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        openSections[category]
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="mt-1 pl-3 space-y-0.5">
                          {tags.map((tag) => (
                            <div
                              key={tag}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="checkbox"
                                id={`tag-${tag}`}
                                checked={
                                  filters.selected_tags
                                    ? filters.selected_tags.includes(tag)
                                    : false
                                }
                                onChange={() =>
                                  handleTagCheckboxChange(tag)
                                }
                                className="h-3 w-3 rounded text-appdev-blue-dark focus:ring-appdev-blue-dark"
                              />
                              <label
                                htmlFor={`tag-${tag}`}
                                className="text-xs"
                              >
                                {tag}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

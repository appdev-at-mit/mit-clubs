import React, { useRef, useEffect } from "react";
import { X } from "lucide-react";
import { ClubMember } from "../../../../types";
import { availableRoles } from "../constants";

type MemberModalProps = {
  isOpen: boolean;
  isEditMode: boolean;
  member: ClubMember | null;
  onClose: () => void;
  onSave: () => void;
  onMemberChange: (updates: Partial<ClubMember>) => void;
  onRoleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  nameError: string;
  emailError: string;
  roleError: string;
  error: string | null;
};

function MemberModal({
  isOpen,
  isEditMode,
  member,
  onClose,
  onSave,
  onMemberChange,
  onRoleChange,
  nameError,
  emailError,
  roleError,
  error,
}: MemberModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg p-6 w-full max-w-md m-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            {isEditMode ? "Edit Member" : "Add New Member"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 text-appdev-red text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={member.name || ""}
              onChange={(e) => onMemberChange({ name: e.target.value })}
              className={`w-full p-2 border ${
                nameError ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-1 focus:ring-appdev-blue`}
              placeholder={isEditMode ? "" : "Enter member name"}
              required
              maxLength={50}
            />
            <div className="flex justify-between">
              <p className="text-xs text-appdev-red mt-1">{nameError}</p>
              <p className="text-sm text-gray-500 mt-1">
                {(member.name || "").length}/50
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              value={availableRoles.findIndex(
                (r) =>
                  r.role === member.role && r.permissions === member.permissions
              )}
              onChange={onRoleChange}
              className={`w-full p-2 border ${
                roleError ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-1 focus:ring-appdev-blue`}
              required
            >
              {availableRoles.map((roleOption, index) => (
                <option key={index} value={index}>
                  {roleOption.role} ({roleOption.permissions})
                </option>
              ))}
            </select>
            {roleError && (
              <p className="text-xs text-appdev-red mt-1">{roleError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={member.email || ""}
              onChange={(e) => onMemberChange({ email: e.target.value })}
              className={`w-full p-2 border ${
                emailError ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-1 focus:ring-appdev-blue`}
              placeholder={isEditMode ? "" : "Enter member email"}
              required
              maxLength={100}
            />
            <div className="flex justify-between">
              <p className="text-xs text-appdev-red mt-1">{emailError}</p>
              <p className="text-sm text-gray-500 mt-1">
                {(member.email || "").length}/100
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className={`px-4 py-2 text-white rounded-md transition-all duration-200 ${
              isEditMode
                ? "bg-appdev-purple hover:bg-appdev-purple/80"
                : "bg-appdev-green-dark hover:bg-appdev-green-dark/80"
            }`}
          >
            {isEditMode ? "Save Changes" : "Add Member"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MemberModal;

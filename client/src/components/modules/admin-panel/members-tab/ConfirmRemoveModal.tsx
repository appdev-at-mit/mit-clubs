import React from "react";
import { ClubMember } from "../../../../types";

type ConfirmRemoveModalProps = {
  isOpen: boolean;
  member: ClubMember | null;
  onConfirm: () => void;
  onCancel: () => void;
};

function ConfirmRemoveModal({
  isOpen,
  member,
  onConfirm,
  onCancel,
}: ConfirmRemoveModalProps) {
  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">Remove Member</h3>
          <p className="mt-2 text-sm text-gray-600">
            Are you sure you want to remove{" "}
            <span className="font-semibold">{member.name}</span> from the club?
            This action cannot be undone.
          </p>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-appdev-red text-white rounded-md hover:bg-appdev-red/80 transition-all duration-200"
          >
            Remove Member
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmRemoveModal;

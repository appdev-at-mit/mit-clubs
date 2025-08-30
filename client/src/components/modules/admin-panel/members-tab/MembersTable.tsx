import React from "react";
import { Edit, UserX } from "lucide-react";
import { ClubMember } from "../../../../types";

type MembersTableProps = {
  members: ClubMember[];
  onEditMember: (member: ClubMember) => void;
  onRemoveMember: (member: ClubMember) => void;
};

function MembersTable({
  members,
  onEditMember,
  onRemoveMember,
}: MembersTableProps) {
  if (members.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-md">
        <p className="text-gray-600">
          No members yet. Click "Add Member" to add club members.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-white">
          <tr>
            <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title (permissions)
            </th>
            <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {members.map((member) => (
            <tr key={member.id} className="hover:bg-gray-50">
              <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                {member.name}
              </td>
              <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                {member.role} ({member.permissions})
              </td>
              <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                {member.email}
              </td>
              <td className="px-6 py-2 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEditMember(member)}
                  className="text-white bg-brand-green-dark rounded-md px-3 py-1 mr-2 inline-flex items-center"
                >
                  <Edit size={16} className="mr-1" /> Edit
                </button>
                <button
                  onClick={() => onRemoveMember(member)}
                  className="text-white bg-brand-red rounded-md px-3 py-1 inline-flex items-center"
                >
                  <UserX size={16} className="mr-1" /> Kick
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MembersTable;

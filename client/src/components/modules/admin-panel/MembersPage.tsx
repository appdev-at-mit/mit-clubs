import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getClubMembers,
  addClubMember,
  updateClubMember,
  removeClubMember,
} from "../../../api/clubs";
import { Club, ClubMember } from "../../../types";
import { availableRoles } from "./constants";
import SearchAndFilter from "./members-tab/SearchAndFilter";
import MembersTable from "./members-tab/MembersTable";
import Pagination from "./members-tab/Pagination";
import MemberModal from "./members-tab/MemberModal";
import ConfirmRemoveModal from "./members-tab/ConfirmRemoveModal";

function MembersPage({ club }: { club: Club }) {
  const { clubId } = useParams<{ clubId: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [membersPerPage] = useState(10);
  const [editingMember, setEditingMember] = useState<ClubMember | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [roleError, setRoleError] = useState("");

  const [memberToRemove, setMemberToRemove] = useState<ClubMember | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!clubId) return;

      try {
        setIsLoading(true);
        const response = await getClubMembers(clubId);
        setMembers(Array.isArray(response) ? response : []);
        setError(null);
      } catch (err) {
        console.error("Error fetching club members:", err);
        setError("Could not load members");
        setMembers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [clubId]);



  // filter members based on search query and role filter
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      roleFilter === "" ||
      (member.role + " (" + member.permissions + ")")
        .toLowerCase()
        .includes(roleFilter.toLowerCase());
    return matchesSearch && matchesRole;
  });

  // get current members for pagination
  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = filteredMembers.slice(
    indexOfFirstMember,
    indexOfLastMember
  );

  function handlePageChange(pageNumber: number) {
    const maxPage = Math.ceil(filteredMembers.length / membersPerPage);
    if (pageNumber < 1 || pageNumber > maxPage) return;
    setCurrentPage(pageNumber);
  }

  function resetErrors() {
    setNameError("");
    setEmailError("");
    setRoleError("");
    setError(null);
  }

  function handleEditMember(member: ClubMember) {
    resetErrors();
    setEditingMember({ ...member });
    setShowEditModal(true);
  }

  function handleAddMember() {
    resetErrors();
    setEditingMember({
      id: "",
      user_id: "",
      name: "",
      role: "Member",
      permissions: "Member",
      email: "",
      joined_date: new Date(),
    });
    setShowAddModal(true);
  }

  async function handleSaveNewMember() {
    if (!clubId || !editingMember) return;

    setNameError("");
    setEmailError("");
    setRoleError("");

    let hasError = false;

    if (!editingMember.name || editingMember.name.trim() === "") {
      setNameError("Name is required");
      hasError = true;
    } else if (editingMember.name.length > 50) {
      setNameError("Name cannot exceed 50 characters");
      hasError = true;
    } else {
      const nameRegex = /^[A-Za-z\s]+$/;
      if (!nameRegex.test(editingMember.name)) {
        setNameError("Name can only contain alphabetic characters and spaces");
        hasError = true;
      }
    }

    if (!editingMember.email || editingMember.email.trim() === "") {
      setEmailError("Email is required");
      hasError = true;
    } else if (editingMember.email.length > 100) {
      setEmailError("Email cannot exceed 100 characters");
      hasError = true;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editingMember.email)) {
        setEmailError("Please enter a valid email address");
        hasError = true;
      }
    }

    if (!editingMember.role) {
      setRoleError("Role is required");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      const response = await addClubMember(clubId, editingMember);
      setMembers([...members, response.member]);
      setShowAddModal(false);
      setEditingMember(null);
    } catch (error: any) {
      console.error("Error adding member:", error);
      if (error.response && error.response.data.error) {
        if (error.response.data.error.includes("email")) {
          setEmailError(error.response.data.error);
        } else {
          setError(error.response.data.error);
        }
      } else {
        setError("Failed to add member. Please try again.");
      }
    }
  }

  function handleMemberChange(updates: Partial<ClubMember>) {
    if (editingMember) {
      setEditingMember({ ...editingMember, ...updates });
    }
  }

  function handleRoleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selectedRole = availableRoles[parseInt(e.target.value)];
    if (selectedRole && editingMember) {
      setEditingMember({
        ...editingMember,
              role: selectedRole.role,
              permissions: selectedRole.permissions,
      });
    }
  }

  async function handleSaveMemberChanges() {
    if (!clubId || !editingMember || !editingMember.id) return;

    setNameError("");
    setEmailError("");
    setRoleError("");

    let hasError = false;

    if (!editingMember.name || editingMember.name.trim() === "") {
      setNameError("Name is required");
      hasError = true;
    } else if (editingMember.name.length > 50) {
      setNameError("Name cannot exceed 50 characters");
      hasError = true;
    } else {
      const nameRegex = /^[A-Za-z\s]+$/;
      if (!nameRegex.test(editingMember.name)) {
        setNameError("Name can only contain alphabetic characters and spaces");
        hasError = true;
      }
    }

    if (!editingMember.email || editingMember.email.trim() === "") {
      setEmailError("Email is required");
      hasError = true;
    } else if (editingMember.email.length > 100) {
      setEmailError("Email cannot exceed 100 characters");
      hasError = true;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editingMember.email)) {
        setEmailError("Please enter a valid email address");
        hasError = true;
      }
    }

    if (!editingMember.role) {
      setRoleError("Role is required");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      await updateClubMember(clubId, editingMember.id, editingMember);
      setMembers(
        members.map((m) =>
          m.id === editingMember.id ? (editingMember as ClubMember) : m
        )
      );
      setShowEditModal(false);
      setEditingMember(null);
    } catch (error: any) {
      console.error("Error updating member:", error);
      if (error.response && error.response.data.error) {
        if (error.response.data.error.includes("email")) {
          setEmailError(error.response.data.error);
        } else {
          setError(error.response.data.error);
        }
      } else {
        setError("Failed to update member. Please try again.");
      }
    }
  }

  async function handleRemoveMember(member: ClubMember) {
    setMemberToRemove(member);
    setShowConfirmModal(true);
  }

  async function confirmRemoveMember() {
    if (!clubId || !memberToRemove) return;

    try {
      await removeClubMember(clubId, memberToRemove.id);
      setMembers(members.filter((m) => m.id !== memberToRemove.id));
      setShowConfirmModal(false);
      setMemberToRemove(null);
    } catch (error: any) {
      console.error("Error removing member:", error);
      setError(
        error.response?.data?.error ||
          "Failed to remove member. Please try again."
      );
      setShowConfirmModal(false);
    }
  }

  function cancelRemoveMember() {
    setShowConfirmModal(false);
    setMemberToRemove(null);
  }

  if (isLoading) {
    return <div className="text-center py-6">Loading members...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 py-6">{error}</div>;
  }

  return (
    <div id="members-form">
      <div className="mb-6">
        <SearchAndFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          membersCount={members.length}
          onAddMember={handleAddMember}
        />

        <MembersTable
          members={currentMembers}
          onEditMember={handleEditMember}
          onRemoveMember={handleRemoveMember}
        />

        {filteredMembers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredMembers.length}
            itemsPerPage={membersPerPage}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      <MemberModal
        isOpen={showEditModal}
        isEditMode={true}
        member={editingMember}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveMemberChanges}
        onMemberChange={handleMemberChange}
        onRoleChange={handleRoleChange}
        nameError={nameError}
        emailError={emailError}
        roleError={roleError}
        error={error}
      />

      <MemberModal
        isOpen={showAddModal}
        isEditMode={false}
        member={editingMember}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveNewMember}
        onMemberChange={handleMemberChange}
        onRoleChange={handleRoleChange}
        nameError={nameError}
        emailError={emailError}
        roleError={roleError}
        error={error}
      />

      <ConfirmRemoveModal
        isOpen={showConfirmModal}
        member={memberToRemove}
        onConfirm={confirmRemoveMember}
        onCancel={cancelRemoveMember}
      />
    </div>
  );
}

export default MembersPage;

// this page is only accessible to admins to manage initial officers
import React, { useState, useEffect } from "react";

function AdminPanel() {
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState("");
  const [officerEmail, setOfficerEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // check if user is admin
  useEffect(() => {
    fetch("/api/whoami")
      .then((res) => res.json())
      .then((data) => {
        if (!data.isAdmin) {
          window.location.href = "/"; // redirect if not admin
        } else {
          setIsAdmin(true);
        }
      });
  }, []);

  // fetch clubs
  useEffect(() => {
    fetch("/api/clubs")
      .then((res) => res.json())
      .then((data) => setClubs(data))
      .catch((err) => console.error("Error fetching clubs:", err));
  }, []);

  // add officer as admin
  const addOfficer = () => {
    fetch("/api/admin/club-officer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        club_id: selectedClub,
        user_email: officerEmail,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        setOfficerEmail("");
      })
      .catch((err) => console.error("Error adding officer:", err));
  };

  if (!isAdmin) return <div>Loading...</div>;

  return (
    <div>
      <h1>Admin Panel</h1>
      <h2>Add Initial Officers</h2>

      <div>
        <select value={selectedClub} onChange={(e) => setSelectedClub(e.target.value)}>
          <option value="">Select a club</option>
          {clubs.map((club) => (
            <option key={club.club_id} value={club.club_id}>
              {club.name}
            </option>
          ))}
        </select>

        <input
          type="email"
          value={officerEmail}
          onChange={(e) => setOfficerEmail(e.target.value)}
          placeholder="Officer email"
        />

        <button onClick={addOfficer} disabled={!selectedClub || !officerEmail}>
          Add Officer
        </button>
      </div>
    </div>
  );
}

export default AdminPanel;

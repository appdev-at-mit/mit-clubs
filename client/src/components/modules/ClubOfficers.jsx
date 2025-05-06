// shows all officers and lets officers add/remove other officers
import React, { useState, useEffect } from "react";

const ClubOfficers = ({ clubId, isUserOfficer }) => {
  const [officers, setOfficers] = useState([]);
  const [newOfficerEmail, setNewOfficerEmail] = useState("");

  // Fetch officers
  useEffect(() => {
    fetch(`/api/club-officers/${clubId}`)
      .then((res) => res.json())
      .then((data) => setOfficers(data))
      .catch((err) => console.error("Error fetching officers:", err));
  }, [clubId]);

  // Add officer
  const addOfficer = () => {
    fetch("/api/club-officer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ club_id: clubId, user_email: newOfficerEmail }),
    })
      .then((res) => res.json())
      .then(() => {
        // Refresh officers list
        fetch(`/api/club-officers/${clubId}`)
          .then((res) => res.json())
          .then((data) => setOfficers(data));
        setNewOfficerEmail("");
      })
      .catch((err) => console.error("Error adding officer:", err));
  };

  return (
    <div>
      <h3>Club Officers</h3>
      <ul>
        {officers.map((officer) => (
          <li key={officer.user_id._id}>
            {officer.user_id.name} ({officer.role})
            {isUserOfficer && (
              <button onClick={() => removeOfficer(officer.user_id._id)}>Remove</button>
            )}
          </li>
        ))}
      </ul>

      {isUserOfficer && (
        <div>
          <input
            type="email"
            value={newOfficerEmail}
            onChange={(e) => setNewOfficerEmail(e.target.value)}
            placeholder="Officer's email"
          />
          <button onClick={addOfficer}>Add Officer</button>
        </div>
      )}
    </div>
  );
};

export default ClubOfficers;

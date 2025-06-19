import React, { useState } from "react";
import "./RoleSelection.css";

const RoleSelection = ({ onContinue }) => {
  const [role, setRole] = useState("student");

  return (
    <div className="role-selection-container">
      <div className="poll-badge">✦ Intervue Poll</div>
      <h1 className="main-title">
        Welcome to the <span>Live Polling System</span>
      </h1>
      <p className="subtitle">
        Please select the role that best describes you to begin using the live
        polling system
      </p>
      <div className="role-cards">
        <div
          className={`role-card${role === "student" ? " selected" : ""}`}
          onClick={() => setRole("student")}
        >
          <h2>I'm a Student</h2>
          <p>
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry
          </p>
        </div>
        <div
          className={`role-card${role === "teacher" ? " selected" : ""}`}
          onClick={() => setRole("teacher")}
        >
          <h2>I'm a Teacher</h2>
          <p>Submit answers and view live poll results in real-time.</p>
        </div>
      </div>
      <button className="continue-btn" onClick={() => onContinue(role)}>
        Continue
      </button>
    </div>
  );
};

export default RoleSelection;

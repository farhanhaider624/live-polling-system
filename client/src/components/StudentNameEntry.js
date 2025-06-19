import React, { useState } from "react";
import "./StudentNameEntry.css";

const StudentNameEntry = ({ onContinue }) => {
  const [name, setName] = useState(
    () => sessionStorage.getItem("studentName") || ""
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      sessionStorage.setItem("studentName", name.trim());
      onContinue(name.trim());
    }
  };

  return (
    <div className="student-name-entry-container">
      <div className="poll-badge">✦ Intervue Poll</div>
      <h1 className="main-title">
        Let's <span>Get Started</span>
      </h1>
      <p className="subtitle">
        If you're a student, you'll be able to <b>submit your answers</b>,
        participate in live polls, and see how your responses compare with your
        classmates
      </p>
      <form className="name-form" onSubmit={handleSubmit}>
        <label htmlFor="student-name">Enter your Name</label>
        <input
          id="student-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="name-input"
          autoFocus
        />
        <button className="continue-btn" type="submit">
          Continue
        </button>
      </form>
    </div>
  );
};

export default StudentNameEntry;

import React, { useState } from "react";
import { useSocket } from "../contexts/SocketContext";
import { useNavigate } from "react-router-dom";
import "./TeacherDashboard.css";

const DEFAULT_TIMER = 60;

const TeacherDashboard = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [timer, setTimer] = useState(DEFAULT_TIMER);
  const [options, setOptions] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);
  const [showPopup, setShowPopup] = useState(false);

  const handleOptionChange = (idx, value) => {
    setOptions(
      options.map((opt, i) => (i === idx ? { ...opt, text: value } : opt))
    );
  };

  const handleCorrectChange = (idx, isCorrect) => {
    setOptions(
      options.map((opt, i) => (i === idx ? { ...opt, isCorrect } : opt))
    );
  };

  const addOption = () => {
    setOptions([...options, { text: "", isCorrect: false }]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const poll = {
      text: question,
      options: options.map((o) => o.text),
      correct: options.map((o) => o.isCorrect),
      timer,
    };
    socket.emit("teacher:create_poll", poll);
    navigate("/teacher/results");
  };

  return (
    <div className="teacher-dashboard-container">
      <div className="poll-badge">✦ Intervue Poll</div>
      <h1 className="main-title">
        Let's <span>Get Started</span>
      </h1>
      <p className="subtitle">
        you'll have the ability to create and manage polls, ask questions, and
        monitor your students' responses in real-time.
      </p>
      <form id="poll-form" className="poll-form" onSubmit={handleSubmit}>
        <div className="form-row question-row">
          <label className="form-label">Enter your question</label>
          <select
            className="timer-select"
            value={timer}
            onChange={(e) => setTimer(Number(e.target.value))}
          >
            {[60, 45, 30, 15].map((t) => (
              <option key={t} value={t}>
                {t} seconds
              </option>
            ))}
          </select>
        </div>
        <div className="question-area">
          <textarea
            className="question-input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={100}
            placeholder="Type your question here..."
          />
          <div className="char-count">{question.length}/100</div>
        </div>
        <div className="options-header-row">
          <label className="form-label">Edit Options</label>
          <label className="form-label">Is it Correct?</label>
        </div>
        <div className="options-list">
          {options.map((opt, idx) => (
            <div className="option-row" key={idx}>
              <span className="option-number">{idx + 1}</span>
              <input
                className="option-input"
                value={opt.text}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                placeholder={`Option ${idx + 1}`}
              />
              <div className="correct-toggle">
                <label>
                  <input
                    type="radio"
                    name={`correct-${idx}`}
                    checked={opt.isCorrect === true}
                    onChange={() => handleCorrectChange(idx, true)}
                  />
                  Yes
                </label>
                <label>
                  <input
                    type="radio"
                    name={`correct-${idx}`}
                    checked={opt.isCorrect === false}
                    onChange={() => handleCorrectChange(idx, false)}
                  />
                  No
                </label>
              </div>
            </div>
          ))}
        </div>
        <button type="button" className="add-option-btn" onClick={addOption}>
          + Add More option
        </button>
      </form>
      <div className="footer-bar">
        <button className="ask-btn" type="submit" form="poll-form">
          Ask Question
        </button>
      </div>
    </div>
  );
};

export default TeacherDashboard;

import React, { useEffect, useState } from "react";
import { useSocket } from "../contexts/SocketContext";
import { useNavigate } from "react-router-dom";
import PollHistory from "./PollHistory";
import "./TeacherLiveResults.css";

const TeacherLiveResults = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [results, setResults] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Listen for poll question
    socket.on("poll:question", (pollData) => {
      setPoll(pollData);
      setResults([]);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);
    });
    // Listen for results
    socket.on("poll:results", (res) => {
      setResults(res);
    });
    // Listen for participants
    socket.on("participants:update", (list) => {
      setParticipants(list);
    });
    // Listen for poll ended
    socket.on("poll:ended", () => {
      setPoll(null);
      setResults([]);
    });
    // On mount, request current participants and poll
    socket.emit("teacher:request_state");
    return () => {
      socket.off("poll:question");
      socket.off("poll:results");
      socket.off("participants:update");
      socket.off("poll:ended");
    };
  }, [socket]);

  const handleEndPoll = () => {
    socket.emit("teacher:end_poll");
  };

  const handleKick = (id) => {
    socket.emit("teacher:kick_student", id);
  };

  const handleAskNew = () => {
    navigate("/teacher");
  };

  return (
    <div className="teacher-live-results-container">
      <div className="poll-badge">✦ Intervue Poll</div>
      <div className="results-section">
        <div className="poll-header">
          <span className="question-label">Question</span>
          <span className="timer done">Live Results</span>
          <button className="history-btn" onClick={() => setShowHistory(true)}>
            View Poll history
          </button>
        </div>
        {poll ? (
          <>
            <div className="question-box">{poll.text}</div>
            <div className="results-list">
              {poll.options.map((opt, idx) => (
                <div className="result-row" key={idx}>
                  <span className="option-number">{idx + 1}</span>
                  <span className="result-option">{opt}</span>
                  <div className="result-bar-bg">
                    <div
                      className="result-bar"
                      style={{
                        width: `${results && results[idx] ? results[idx] : 0}%`,
                      }}
                    ></div>
                  </div>
                  <span className="result-percent">
                    {results && results[idx] ? results[idx] : 0}%
                  </span>
                </div>
              ))}
            </div>
            <div className="results-footer">
              <button className="end-btn" onClick={handleEndPoll}>
                End Poll
              </button>
              <button className="ask-btn" onClick={handleAskNew}>
                + Ask a new question
              </button>
            </div>
          </>
        ) : (
          <div className="main-title" style={{ textAlign: "center" }}>
            Wait for a poll to be created...
            <button
              className="ask-btn"
              onClick={handleAskNew}
              style={{ marginTop: 24 }}
            >
              + Ask a new question
            </button>
          </div>
        )}
      </div>
      <div className="participants-section">
        <div className="participants-header">Participants</div>
        <div className="participants-list">
          {participants.map((student) => (
            <div className="participant-row" key={student.id}>
              <span className="participant-name">{student.name}</span>
              <button
                className="kick-btn"
                onClick={() => handleKick(student.id)}
              >
                Kick out
              </button>
            </div>
          ))}
        </div>
      </div>
      {showHistory && <PollHistory onClose={() => setShowHistory(false)} />}
      {showPopup && <div className="poll-popup">Poll sent!</div>}
    </div>
  );
};

export default TeacherLiveResults;

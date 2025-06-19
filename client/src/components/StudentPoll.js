import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../contexts/SocketContext";
import Loader from "./Loader";
import "./StudentPoll.css";

const TIMER_SECONDS = 60;

const StudentPoll = () => {
  const socket = useSocket();
  const [poll, setPoll] = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [timer, setTimer] = useState(TIMER_SECONDS);
  const [kicked, setKicked] = useState(false);
  const timerRef = useRef();
  const studentName = sessionStorage.getItem("studentName");

  // Join as student on mount
  useEffect(() => {
    if (studentName) {
      socket.emit("student:join", studentName);
    }
    // Listen for poll question
    socket.on("poll:question", (pollData) => {
      setPoll(pollData);
      setResults(null);
      setSelected(null);
      setSubmitted(false);
      setTimer(pollData.timer || TIMER_SECONDS);
    });
    // Listen for results
    socket.on("poll:results", (res) => {
      setResults(res);
    });
    // Listen for poll ended
    socket.on("poll:ended", () => {
      setPoll(null);
      setResults(null);
      setSelected(null);
      setSubmitted(false);
      setTimer(TIMER_SECONDS);
    });
    // Listen for being kicked
    socket.on("student:kicked", () => {
      setKicked(true);
    });
    return () => {
      socket.off("poll:question");
      socket.off("poll:results");
      socket.off("poll:ended");
      socket.off("student:kicked");
    };
    // eslint-disable-next-line
  }, [socket, studentName]);

  // Timer logic
  useEffect(() => {
    if (!poll || submitted) return;
    if (timer === 0) {
      setSubmitted(true);
      return;
    }
    timerRef.current = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timer, poll, submitted]);

  // Submit answer
  const handleSubmit = (e) => {
    e.preventDefault();
    if (selected !== null && poll) {
      socket.emit("student:submit_answer", {
        pollId: poll.id,
        answerIdx: selected,
      });
      setSubmitted(true);
    }
  };

  if (kicked) {
    return (
      <div className="student-poll-container">
        <div className="poll-badge">✦ Intervue Poll</div>
        <div className="results-section">
          <h2 style={{ textAlign: "center", margin: "40px 0" }}>
            You've been Kicked out !
          </h2>
          <div style={{ color: "var(--gray)", textAlign: "center" }}>
            Looks like the teacher had removed you from the poll system. Please
            try again sometime.
          </div>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="student-poll-container center-content">
        <div className="poll-badge">✦ Intervue Poll</div>
        <div className="waiting-center">
          <Loader />
          <div className="main-title waiting-message">
            Wait for the teacher to ask questions..
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-poll-container">
      <div className="poll-badge">✦ Intervue Poll</div>
      <form className="poll-form" onSubmit={handleSubmit}>
        <div className="poll-header">
          <span className="question-label">Question</span>
          <span className={`timer${timer <= 10 ? " danger" : ""}`}>
            ⏱ {`00:${timer.toString().padStart(2, "0")}`}
          </span>
        </div>
        <div className="question-box">{poll.text}</div>
        <div className="options-list">
          {poll.options.map((opt, idx) =>
            submitted ? (
              <div
                className="result-row"
                key={idx}
                style={{ "--bar-width": `${results ? results[idx] : 0}%` }}
              >
                <span className="option-number">{idx + 1}</span>
                <span className="result-option">{opt}</span>
                <span className="result-percent">
                  {results ? results[idx] : 0}%
                </span>
              </div>
            ) : (
              <label
                key={idx}
                className={`option-radio${selected === idx ? " selected" : ""}`}
              >
                <input
                  type="radio"
                  name="poll-option"
                  value={idx}
                  checked={selected === idx}
                  onChange={() => setSelected(idx)}
                  disabled={submitted}
                />
                <span className="option-number">{idx + 1}</span>
                {opt}
              </label>
            )
          )}
        </div>
        {!submitted && (
          <button
            className="submit-btn"
            type="submit"
            disabled={selected === null}
          >
            Submit
          </button>
        )}
      </form>
    </div>
  );
};

export default StudentPoll;

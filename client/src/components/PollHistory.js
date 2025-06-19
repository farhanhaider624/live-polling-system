import React, { useEffect, useState } from "react";
import "./PollHistory.css";

const PollHistory = ({ onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:4000/poll/history")
      .then((res) => res.json())
      .then((data) => {
        setHistory(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="poll-history-modal">
      <div className="poll-history-content">
        <div className="poll-history-header">
          <span>Poll History</span>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : history.length === 0 ? (
          <div className="no-history">No past polls found.</div>
        ) : (
          <div className="poll-history-list">
            {history.map((poll, idx) => {
              // Calculate results
              const counts = Array(poll.options.length).fill(0);
              Object.values(poll.answers || {}).forEach((ans) => {
                if (typeof ans === "number" && counts[ans] !== undefined)
                  counts[ans]++;
              });
              const total = Object.keys(poll.answers || {}).length || 1;
              const results = counts.map((c) => Math.round((c / total) * 100));
              return (
                <div className="poll-history-item" key={poll.id || idx}>
                  <div className="poll-history-question">
                    <b>Question {idx + 1}:</b> {poll.text}
                  </div>
                  <div className="poll-history-results">
                    {poll.options.map((opt, i) => (
                      <div className="result-row" key={i}>
                        <span className="option-number">{i + 1}</span>
                        <span className="result-option">{opt}</span>
                        <div className="result-bar-bg">
                          <div
                            className="result-bar"
                            style={{ width: `${results[i]}%` }}
                          ></div>
                        </div>
                        <span className="result-percent">{results[i]}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PollHistory;

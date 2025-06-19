import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../contexts/SocketContext";
import "./ChatPopup.css";

const ChatPopup = ({ userName }) => {
  const socket = useSocket();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("chat:message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socket.off("chat:message");
    };
  }, [socket]);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim()) {
      const msg = {
        user: userName || "Anonymous",
        text: input.trim(),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      socket.emit("chat:message", msg);
      setInput("");
    }
  };

  return (
    <div className={`chat-popup${open ? " open" : ""}`}>
      {open ? (
        <div className="chat-window">
          <div className="chat-header">
            <span>Chat</span>
            <button className="chat-close" onClick={() => setOpen(false)}>
              &times;
            </button>
          </div>
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-msg${msg.user === userName ? " self" : ""}`}
              >
                <span className="chat-user">{msg.user}</span>
                <span className="chat-text">{msg.text}</span>
                <span className="chat-time">{msg.time}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form className="chat-input-row" onSubmit={handleSend}>
            <input
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
            />
            <button className="chat-send" type="submit">
              Send
            </button>
          </form>
        </div>
      ) : (
        <button className="chat-fab" onClick={() => setOpen(true)}>
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      )}
    </div>
  );
};

export default ChatPopup;

// Starter file

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// In-memory state
let currentPoll = null;
let students = {};
let answers = {};
let pollHistory = [];

io.on("connection", (socket) => {
  // Student joins
  socket.on("student:join", (name) => {
    students[socket.id] = { name, id: socket.id };
    io.emit("participants:update", Object.values(students));
    if (currentPoll) {
      socket.emit("poll:question", currentPoll);
    }
  });

  // Teacher creates a poll
  socket.on("teacher:create_poll", (poll) => {
    currentPoll = { ...poll, id: Date.now() };
    answers = {};
    io.emit("poll:question", currentPoll);
  });

  // Student submits answer
  socket.on("student:submit_answer", ({ pollId, answerIdx }) => {
    if (currentPoll && pollId === currentPoll.id) {
      answers[socket.id] = answerIdx;
      io.emit("poll:results", getLiveResults());
      // If all students have answered, notify teacher
      if (Object.keys(answers).length === Object.keys(students).length) {
        io.emit("poll:all_answered");
      }
    }
  });

  // Teacher ends poll
  socket.on("teacher:end_poll", () => {
    if (currentPoll) {
      pollHistory.push({ ...currentPoll, answers: { ...answers } });
      currentPoll = null;
      answers = {};
      io.emit("poll:ended");
    }
  });

  // Teacher kicks student
  socket.on("teacher:kick_student", (studentId) => {
    if (students[studentId]) {
      io.to(studentId).emit("student:kicked");
      delete students[studentId];
      delete answers[studentId];
      io.emit("participants:update", Object.values(students));
      io.emit("poll:results", getLiveResults());
    }
  });

  // Chat message
  socket.on("chat:message", (msg) => {
    io.emit("chat:message", msg);
  });

  // Teacher requests current state
  socket.on("teacher:request_state", () => {
    if (currentPoll) {
      socket.emit("poll:question", currentPoll);
    }
    socket.emit("participants:update", Object.values(students));
    if (currentPoll) {
      socket.emit("poll:results", getLiveResults());
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    delete students[socket.id];
    delete answers[socket.id];
    io.emit("participants:update", Object.values(students));
    io.emit("poll:results", getLiveResults());
  });
});

function getLiveResults() {
  if (!currentPoll) return null;
  const counts = Array(currentPoll.options.length).fill(0);
  Object.values(answers).forEach((idx) => {
    if (typeof idx === "number" && counts[idx] !== undefined) counts[idx]++;
  });
  const total = Object.keys(answers).length || 1;
  return counts.map((c) => Math.round((c / total) * 100));
}

app.get("/", (req, res) => {
  res.send("Live Polling System Backend");
});

app.get("/poll/history", (req, res) => {
  res.json(pollHistory);
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import RoleSelection from "./components/RoleSelection";
import StudentNameEntry from "./components/StudentNameEntry";
import TeacherDashboard from "./components/TeacherDashboard";
import StudentPoll from "./components/StudentPoll";
import TeacherLiveResults from "./components/TeacherLiveResults";
import { SocketProvider } from "./contexts/SocketContext";
import ChatPopup from "./components/ChatPopup";

function RoleSelectionWithNav() {
  const navigate = useNavigate();
  const handleContinue = (role) => {
    if (role === "student") navigate("/student");
    else navigate("/teacher");
  };
  return <RoleSelection onContinue={handleContinue} />;
}

function StudentFlowWithName() {
  const navigate = useNavigate();
  const studentName = sessionStorage.getItem("studentName");
  if (!studentName) {
    return <StudentNameEntry onContinue={() => navigate(0)} />;
  }
  return (
    <>
      <StudentPoll />
      <ChatPopup userName={studentName} />
    </>
  );
}

function App() {
  const teacherName = "Teacher";
  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<RoleSelectionWithNav />} />
          <Route path="/student" element={<StudentFlowWithName />} />
          <Route
            path="/teacher"
            element={
              <>
                <TeacherDashboard />
                <ChatPopup userName={teacherName} />
              </>
            }
          />
          <Route
            path="/teacher/results"
            element={
              <>
                <TeacherLiveResults />
                <ChatPopup userName={teacherName} />
              </>
            }
          />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;

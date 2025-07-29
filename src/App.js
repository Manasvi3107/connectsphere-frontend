import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { AuthProvider } from "./context/AuthContext";
import { DarkModeProvider } from "./context/DarkModeContext";
import PrivateRoute from "./utils/PrivateRoute";
import PublicRoute from "./utils/PublicRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import Messages from "./pages/Messages";
import Navbar from "./components/Navbar";
import Explore from "./pages/Explore";

function AppContent({ darkMode, setDarkMode }) {
  const location = useLocation();

  return (
    <>
      {/* Hide Navbar on Landing, Messages, Login, Register */}
      {!["/", "/messages", "/login", "/register"].includes(location.pathname) && (
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      )}

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard darkMode={darkMode} setDarkMode={setDarkMode} />
            </PrivateRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <PrivateRoute>
              <Messages darkMode={darkMode} setDarkMode={setDarkMode} />
            </PrivateRoute>
          }
        />
        <Route
          path="/explore"
          element={
            <PrivateRoute>
              <Explore darkMode={darkMode} setDarkMode={setDarkMode} />
            </PrivateRoute>
          }
        />
        <Route
          path="*"
          element={
            <p className="text-center mt-10 text-gray-500">404 - Page Not Found</p>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  return (
    <DarkModeProvider>
      <AuthProvider>
        <Router>
          <AppContent darkMode={darkMode} setDarkMode={setDarkMode} />
        </Router>
      </AuthProvider>
      <ToastContainer position="top-right" />
    </DarkModeProvider>
  );
}

export default App;

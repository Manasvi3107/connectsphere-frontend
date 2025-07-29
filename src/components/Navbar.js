import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api"; // 🔥 Make sure API is set up with base URL
import { debounce } from "lodash"; // npm install lodash

const Navbar = ({ collapsed, setCollapsed, darkMode, setDarkMode }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // 🔍 Search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/messages" ||
    location.pathname === "/landing";

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // 🔍 Debounced search
  const debouncedSearch = debounce(async (text) => {
    try {
      if (text.trim()) {
        const res = await API.get(`/user/search?q=${text}`);
        setResults(res.data);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
    }
  }, 300);

  useEffect(() => {
    debouncedSearch(query);
    return debouncedSearch.cancel;
  }, [query]);

  const handleSelectUser = (userId) => {
    setQuery("");
    setResults([]);
    navigate(`/profile/${userId}`);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 sm:px-6 z-40 transition-all duration-300 ease-in-out
        ${
          isAuthPage
            ? ""
            : collapsed
            ? "sm:ml-20"
            : "sm:ml-72"
        }
        ${
          darkMode
            ? "bg-gray-800/80 backdrop-blur-lg text-gray-100 shadow-lg"
            : "bg-white/60 backdrop-blur-lg text-gray-900 shadow-md"
        }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col leading-tight ml-2">
          <Link
            to="/"
            className={`font-bold text-lg tracking-wide ${
              darkMode ? "text-white" : "text-pink-900"
            } hover:text-pink-900 transition-colors`}
          >
            <b>ConnectSphere</b>
          </Link>
        </div>
      </div>

      {/* 🔍 Search Bar */}
      {!isAuthPage && (
        <div className="relative w-full max-w-xs mx-4 hidden sm:block">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full px-3 py-2 rounded border shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
          />
          {results.length > 0 && (
            <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow max-h-60 overflow-y-auto">
              {results.map((u) => (
                <div
                  key={u._id}
                  onClick={() => handleSelectUser(u._id)}
                  className="flex items-center px-3 py-2 gap-2 hover:bg-gray-100 cursor-pointer"
                >
                  <img
                    src={u.profilePic || "https://ui-avatars.com/api/?name=User"}
                    alt="user"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium">{u.username}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mobile toggle */}
      <div className="sm:hidden">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`focus:outline-none ${
            darkMode ? "text-white" : "text-gray-800"
          }`}
        >
          {menuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Menu */}
      <div
        className={`${
          menuOpen ? "block" : "hidden"
        } absolute top-16 left-0 right-0 bg-white sm:bg-transparent sm:static sm:flex sm:items-center sm:gap-4 sm:justify-end sm:space-x-4 ${
          darkMode ? "sm:text-gray-100" : "sm:text-gray-900"
        }`}
      >
        <Link
          to="/dashboard"
          onClick={() => setMenuOpen(false)}
          className={`block px-4 py-2 sm:inline hover:underline transition-colors ${
            darkMode ? "text-gray-300" : "text-pink-700"
          }`}
        >
          Home
        </Link>

        <button
          onClick={() => {
            setDarkMode(!darkMode);
            setMenuOpen(false);
          }}
          className={`block px-4 py-2 sm:inline rounded-xl shadow transition-colors w-full sm:w-auto ${
            darkMode
              ? "bg-pink-400 text-white hover:bg-pink-500"
              : "bg-gray-700 text-white hover:bg-gray-600"
          }`}
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>

        {user && (
          <button
            onClick={handleLogout}
            className={`block px-4 py-2 sm:inline rounded-xl shadow transition-colors w-full sm:w-auto ${
              darkMode
                ? "bg-red-600 text-white hover:bg-red-500"
                : "bg-pink-400 text-white hover:bg-red-500"
            }`}
          >
            Logout ⎋
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

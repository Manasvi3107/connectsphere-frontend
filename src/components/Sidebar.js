import React, { useEffect, useState, useContext } from "react";
import ConnectSphereLogo from "./ConnectSphereLogo";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api";
import { toast } from "react-toastify";

const Sidebar = ({
  profile,
  name,
  setName,
  bio,
  setBio,
  preview,
  handleImageUpload,
  handleSave,
  logout,
  darkMode,
  setDarkMode,
  collapsed,
  setCollapsed,
  viewedUserId,
  setViewedUserId,
}) => {
  const { user } = useContext(AuthContext);
  const [viewedProfile, setViewedProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  // ✅ Restore viewedUserId on refresh
  useEffect(() => {
    const storedId = localStorage.getItem("viewedUserId");
    if (storedId && !viewedUserId) {
      setViewedUserId(storedId);
    }
  }, [viewedUserId, setViewedUserId]);

  // ✅ Fetch viewed user profile or reset to self
  useEffect(() => {
    if (!viewedUserId || viewedUserId === user?._id) {
      setViewedProfile(null);
      localStorage.removeItem("viewedUserId");
      if (viewedUserId === user?._id) {
        setViewedUserId(null);
      }
      return;
    }

    const fetchViewedProfile = async () => {
      try {
        const res = await API.get(`/users/${viewedUserId}`);
        setViewedProfile(res.data);
        setIsFollowing(res.data.followers?.includes(user._id));
        localStorage.setItem("viewedUserId", viewedUserId);
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        toast.error("Could not load user profile");
      }
    };

    fetchViewedProfile();
  }, [viewedUserId, user?._id, setViewedUserId]);

  const handleFollowToggle = async () => {
    try {
      const endpoint = isFollowing
        ? `/users/${viewedUserId}/unfollow`
        : `/users/${viewedUserId}/follow`;

      await API.put(endpoint);
      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? "Unfollowed ❌" : "Followed ✅");
    } catch (err) {
      console.error("Follow/Unfollow error:", err);
      toast.error("Action failed");
    }
  };

  const editingMyProfile = !viewedProfile;

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-50 flex flex-col justify-between shadow-xl transition-all duration-500 ${
        collapsed ? "w-20 p-2" : "w-72 p-4"
      } ${
        darkMode
          ? "bg-gray-900/80 backdrop-blur-md text-gray-100"
          : "bg-pink-50/80 backdrop-blur-md text-gray-900"
      }`}
    >
      {/* Logo & Collapse */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-shrink-0">
          <ConnectSphereLogo
            width={collapsed ? 50 : 80}
            height={collapsed ? 50 : 80}
            className="ml-50"
          />
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`text-lg rounded-full w-8 h-8 flex items-center justify-center transition shadow ${
            darkMode
              ? "bg-gray-700 hover:bg-gray-600 text-white"
              : "bg-pink-400 hover:bg-pink-500 text-white"
          }`}
        >
          {collapsed ? "➡" : "⬅"}
        </button>
      </div>

      {/* Profile Section */}
      <div className="flex flex-col items-center mt-4">
        <img
          src={
            viewedProfile
              ? viewedProfile.profilePicture ||
                "https://ui-avatars.com/api/?name=User&background=random"
              : preview ||
                profile?.profilePicture ||
                "https://ui-avatars.com/api/?name=User&background=random"
          }
          alt="Profile"
          className="w-32 h-32 rounded-3xl border-4 shadow-lg object-cover border-pink-300"
        />

        {/* Editable Fields */}
        {editingMyProfile && !collapsed && (
          <>
            <input
              className={`mt-4 w-full text-center p-2 rounded-lg font-semibold border focus:outline-none focus:ring-2 transition ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white focus:ring-gray-400"
                  : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-pink-400"
              }`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />

            <textarea
              rows="2"
              placeholder="Add a bio..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={`mt-2 w-full p-2 rounded-lg text-center border focus:outline-none focus:ring-2 transition ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white focus:ring-gray-400"
                  : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-pink-400"
              }`}
            />

            <label
              className={`mt-2 w-full text-center cursor-pointer py-2 rounded-lg border-dashed border-2 ${
                darkMode
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border-pink-300 text-pink-600 hover:bg-pink-100"
              }`}
            >
              <input type="file" className="hidden" onChange={handleImageUpload} />
              📷 Upload Picture
            </label>
          </>
        )}

        {/* Viewed User Info */}
        {viewedProfile && !collapsed && (
          <div className="mt-3 text-center">
            <h2 className="text-xl font-bold">{viewedProfile.name}</h2>
            <p className="text-sm opacity-80">{viewedProfile.bio}</p>

            {viewedProfile._id !== user._id && (
              <button
                onClick={handleFollowToggle}
                className={`mt-3 px-4 py-2 rounded-full font-semibold shadow ${
                  isFollowing
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}

            <button
              onClick={() => {
                setViewedUserId(null);
                localStorage.removeItem("viewedUserId");
              }}
              className="mt-2 px-3 py-1 bg-gray-500 text-white rounded-full shadow hover:bg-gray-600"
            >
              Close Profile ✖
            </button>
          </div>
        )}
      </div>

      {/* Buttons for Self */}
      {!collapsed && editingMyProfile && (
        <div className="flex flex-col mt-6 space-y-3">
          <button
            onClick={handleSave}
            className="w-full bg-pink-500 text-white py-2 rounded-lg shadow hover:bg-pink-600 transition"
          >
            Save 💾
          </button>
          <button
            onClick={logout}
            className="w-full bg-red-500 text-white py-2 rounded-lg shadow hover:bg-red-600 transition"
          >
            Logout 🔓
          </button>
          <Link
            to="/messages"
            className="block text-center bg-blue-500 text-white rounded-lg py-2 shadow hover:bg-blue-600 transition"
          >
            💬 Messages
          </Link>
        </div>
      )}

      {/* My Profile Button */}
      {!collapsed && viewedProfile && (
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setViewedUserId(null);
              localStorage.removeItem("viewedUserId");
            }}
            className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-600 transition"
          >
            ✏️ My Profile
          </button>
        </div>
      )}

      {/* Dark Mode */}
      {!collapsed && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full px-4 py-2 rounded-lg shadow transition ${
              darkMode
                ? "bg-pink-300 text-gray-900 hover:bg-pink-400"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;

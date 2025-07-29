import React, { useEffect, useState, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PostForm from '../components/PostForm';
import PostList from '../components/PostList';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  const { logout, updateUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reloadPosts, setReloadPosts] = useState(false);

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('darkMode') === 'true'
  );
  const [collapsed, setCollapsed] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get('/users/me'); // ✅ Corrected route
        setProfile(res.data);
        setName(res.data.name);
        setBio(res.data.bio || '');
        setProfilePicture(res.data.profilePicture || '');
      } catch (err) {
        console.error('Profile fetch failed', err);
        toast.error('Failed to fetch profile 😢');
        logout();
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [logout, navigate]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleSave = async () => {
    try {
      const updatedData = { name, bio, profilePicture };

      const res = await API.put('/users/me', updatedData);
      setProfile(res.data);
      setName(res.data.name);
      setBio(res.data.bio || '');
      setProfilePicture(res.data.profilePicture || '');
      updateUser(res.data);

      toast.success('Profile updated 🌸');
      setReloadPosts((prev) => !prev);
    } catch (err) {
      console.error('Update failed', err);
      toast.error('Failed to update profile 😢');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'unsigned_preset');

    try {
      const res = await fetch(
        'https://api.cloudinary.com/v1_1/divs3vwtz/image/upload',
        {
          method: 'POST',
          body: formData,
        }
      );
      const data = await res.json();
      if (data.secure_url) {
        setProfilePicture(data.secure_url);
        toast.success('Image uploaded! 🎉');
      } else {
        throw new Error(data.error?.message || 'Cloudinary upload failed');
      }
    } catch (err) {
      console.error('Upload error', err);
      toast.error('Image upload failed 💔');
    }
  };

  const handlePostCreated = () => setReloadPosts((prev) => !prev);
  const handlePostDeleted = () => setReloadPosts((prev) => !prev);

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <p className="text-gray-700 dark:text-gray-200 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className={`relative flex h-screen overflow-hidden ${darkMode ? 'dark' : ''}`}>
      <div
        className="absolute inset-0 bg-cover bg-center z-[-1]"
        style={{
          backgroundImage: `url('/assets/background-doodles.png')`,
          filter: 'blur(6px)',
        }}
      />

      <Navbar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        user={profile}
      />

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        profile={profile}
        name={name}
        setName={setName}
        bio={bio}
        setBio={setBio}
        preview={preview}
        handleImageUpload={handleImageUpload}
        handleSave={handleSave}
        logout={logout}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        user={profile}
      />

      <main
        className="transition-all duration-300 flex justify-center items-start flex-1 overflow-y-auto no-scrollbar"
        style={{
          marginLeft: collapsed ? '80px' : '300px',
          padding: '1.5rem',
        }}
      >
        <div
          className={`w-full max-w-5xl rounded-2xl shadow-lg backdrop-blur-md transition-all duration-500 ${
            darkMode
              ? 'bg-gray-900/70 text-gray-100'
              : 'bg-white/80 text-gray-900'
          }`}
          style={{
            paddingTop: '50px',
          }}
        >
          <div className="p-6">
            <h2 className="text-4xl font-extrabold mb-6 text-center">
              Hello, {profile.name}! 🏡
            </h2>
            <PostList
              reload={reloadPosts}
              onPostDeleted={handlePostDeleted}
              darkMode={darkMode}
            />
          </div>
          <div className="sticky bottom-0 z-10">
            <PostForm
              onPostCreated={handlePostCreated}
              darkMode={darkMode}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Profile = ({ viewedUser }) => {
  const { user } = useContext(AuthContext);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (viewedUser.followers.includes(user._id)) {
      setIsFollowing(true);
    }
  }, [viewedUser, user]);

  const handleFollowToggle = async () => {
    try {
      const endpoint = isFollowing
        ? `/users/${viewedUser._id}/unfollow`
        : `/users/${viewedUser._id}/follow`;

      const res = await API.put(endpoint, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      toast.success(res.data.message);
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error(err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="p-4 rounded-lg shadow">
      <h2 className="text-2xl font-bold">{viewedUser.name}</h2>
      <p className="text-gray-600">{viewedUser.bio}</p>

      {user._id !== viewedUser._id && (
        <button
          onClick={handleFollowToggle}
          className={`mt-4 px-4 py-2 rounded text-white ${
            isFollowing ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isFollowing ? 'Unfollow' : 'Follow'}
        </button>
      )}

      <div className="mt-4 flex gap-4">
        <span>👥 Followers: {viewedUser.followers.length}</span>
        <span>➡️ Following: {viewedUser.following.length}</span>
      </div>
    </div>
  );
};

export default Profile;

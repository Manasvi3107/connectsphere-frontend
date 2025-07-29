import React, { useState, useContext } from 'react';
import API from '../api';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';

const PostForm = ({ onPostCreated, darkMode }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false); // 🌟 New collapsed state

  const uploadImage = async (file) => {
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
        return data.secure_url;
      } else {
        throw new Error(data.error?.message || 'Cloudinary upload failed');
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      toast.error(`Image upload failed: ${err.message}`);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) {
      toast.warn('Please add content or an image');
      return;
    }

    setLoading(true);

    let uploadedImageUrl = '';
    if (image) {
      uploadedImageUrl = await uploadImage(image);
      if (!uploadedImageUrl) {
        setLoading(false);
        return;
      }
    }

    try {
      const res = await API.post('/posts', { content, image: uploadedImageUrl });
      toast.success('Post shared successfully 🎉');
      setContent('');
      setImage(null);
      setPreview(null);
      onPostCreated?.(); // Notify parent
      setCollapsed(true); // Collapse after posting ✅
    } catch (err) {
      console.error('Post creation error:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`transition-all duration-500 rounded-xl shadow-md ${
        darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
      } ${collapsed ? 'p-2' : 'p-4'} mb-4`}
    >
      {/* Collapse Button */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`text-sm px-3 py-1 rounded-full shadow ${
            darkMode
              ? 'bg-gray-600 text-white hover:bg-gray-500'
              : 'bg-pink-400 text-white hover:bg-pink-500'
          }`}
        >
          {collapsed ? '➕ Create Post' : '⬅ Collapse'}
        </button>
      </div>

      {!collapsed && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className={`w-full border rounded-md p-3 focus:outline-none focus:ring transition ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-pink-400'
                : 'bg-gray-100 border-gray-300 text-gray-900 focus:ring-pink-400'
            }`}
          />
          {preview && (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setPreview(null);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 text-xs shadow hover:bg-red-600"
              >
                ✖
              </button>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setImage(file);
                setPreview(URL.createObjectURL(file));
              }
            }}
            className={`w-full file:rounded-lg file:cursor-pointer transition ${
              darkMode
                ? 'file:bg-gray-700 file:text-gray-100'
                : 'file:bg-pink-100 file:text-gray-900'
            }`}
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-semibold transition-colors ${
              loading
                ? 'bg-pink-300 cursor-not-allowed'
                : 'bg-pink-500 hover:bg-pink-600'
            }`}
          >
            {loading ? 'Posting...' : 'Share Post'}
          </button>
        </form>
      )}
    </div>
  );
};

export default PostForm;

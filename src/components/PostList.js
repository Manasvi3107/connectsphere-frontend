import React, { useEffect, useState, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const PostList = ({ reload, onPostDeleted, darkMode, setViewedUserId }) => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await API.get('/posts');
        setPosts(res.data);
      } catch (err) {
        console.error('Error fetching posts:', err.response?.data || err.message);
        toast.error(err.response?.data?.message || 'Failed to load posts 😢');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [reload]);

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const token = localStorage.getItem('token');
      await API.delete(`/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success('Post deleted successfully 🗑️');
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      onPostDeleted?.();
    } catch (err) {
      console.error('Delete failed:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Failed to delete post 💔');
    }
  };

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in to like posts 🔒');
        return;
      }

      const res = await API.put(`/posts/${postId}/like`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, likes: res.data.likes, likeCount: res.data.likes.length } : p
        )
      );
    } catch (err) {
      console.error('❌ Like failed:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Failed to like post 💔');
    }
  };

  const handleCommentChange = (postId, value) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: value }));
  };

  const handleCommentSubmit = async (postId) => {
    const commentText = commentInputs[postId]?.trim();
    if (!commentText) return toast.error('Please enter a comment ✍️');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in to comment 🔒');
        return;
      }

      const res = await API.post(
        `/posts/${postId}/comment`,
        { text: commentText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, comments: res.data.comments, commentCount: res.data.comments.length }
            : p
        )
      );
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
      toast.success('Comment added 💬');
    } catch (err) {
      console.error('Comment failed:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Failed to add comment 💔');
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in to delete comments 🔒');
        return;
      }

      await API.delete(`/posts/${postId}/comment/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                comments: p.comments.filter((c) => c._id !== commentId),
                commentCount: p.commentCount - 1,
              }
            : p
        )
      );
      toast.success('Comment deleted 🗑️');
    } catch (err) {
      console.error('❌ Comment delete failed:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Failed to delete comment 💔');
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500">Loading posts...</p>;
  }

  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <p className="text-center text-gray-500">No posts found 📝</p>
      ) : (
        posts.map((post) => {
          const postUserId = post.user?._id || post.userId; // fallback
          const postUserName = post.user?.name || 'Unknown User';
          const isMyPost = postUserId === user?._id;

          return (
            <div
              key={post._id}
              className={`p-4 rounded-xl shadow-md transition-colors ${
                darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'
              }`}
            >
              {/* 👇 Make the author clickable to open that profile in sidebar */}
              <h3
                className="font-bold mb-2 cursor-pointer hover:underline"
                onClick={() => {
                  if (!setViewedUserId) return;
                  if (isMyPost) {
                    setViewedUserId(null); // show edit mode
                  } else {
                    setViewedUserId(postUserId); // show viewed profile
                  }
                }}
              >
                {postUserName}
              </h3>

              <p>{post.content}</p>
              {post.image && (
                <img
                  src={post.image}
                  alt="Post"
                  className="mt-2 rounded-lg max-h-64 object-cover mx-auto"
                />
              )}
              <div className="flex justify-between items-center mt-4 gap-2">
                <button
                  onClick={() => handleLike(post._id)}
                  className={`px-3 py-1 rounded-full font-medium shadow transition-colors ${
                    darkMode
                      ? 'bg-gray-700 text-pink-300 hover:bg-gray-600'
                      : 'bg-pink-200 text-pink-700 hover:bg-pink-300'
                  }`}
                >
                  ❤️ Like ({post.likeCount ?? post.likes.length})
                </button>

                <button
                  onClick={() =>
                    setCommentInputs((prev) => ({
                      ...prev,
                      [post._id]: prev[post._id] !== undefined ? undefined : '',
                    }))
                  }
                  className={`px-3 py-1 rounded-full font-medium shadow transition-colors ${
                    darkMode
                      ? 'bg-blue-700 text-white hover:bg-blue-600'
                      : 'bg-blue-200 text-blue-800 hover:bg-blue-300'
                  }`}
                >
                  💬 Comment ({post.commentCount ?? post.comments.length})
                </button>

                {isMyPost && (
                  <button
                    onClick={() => handleDelete(post._id)}
                    className={`px-3 py-1 rounded-full font-medium shadow transition-colors ${
                      darkMode
                        ? 'bg-red-700 text-white hover:bg-red-600'
                        : 'bg-red-200 text-red-800 hover:bg-red-300'
                    }`}
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>

              {/* Comment Box */}
              {commentInputs[post._id] !== undefined && (
                <div
                  className={`mt-3 p-3 rounded-lg transition-colors ${
                    darkMode
                      ? 'bg-gray-800 text-gray-100'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <input
                    type="text"
                    value={commentInputs[post._id]}
                    onChange={(e) =>
                      handleCommentChange(post._id, e.target.value)
                    }
                    placeholder="Write a comment..."
                    className={`w-full rounded-lg px-3 py-2 mt-1 border focus:outline-none transition-colors ${
                      darkMode
                        ? 'bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <button
                    onClick={() => handleCommentSubmit(post._id)}
                    className={`mt-2 px-3 py-1 rounded-full font-medium shadow ${
                      darkMode
                        ? 'bg-green-700 text-white hover:bg-green-600'
                        : 'bg-green-200 text-green-800 hover:bg-green-300'
                    }`}
                  >
                    ➕ Add Comment
                  </button>

                  {/* Display comments */}
                  {post.comments?.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {post.comments.map((c, index) => (
                        <div
                          key={index}
                          className={`flex items-start gap-2 rounded-lg p-2 ${
                            darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-800'
                          }`}
                        >
                          {c.user?.profilePicture ? (
                            <img
                              src={c.user.profilePicture}
                              alt="Profile"
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white">
                              {c.user?.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-semibold">{c.user?.name || 'Anonymous'}:</span>{' '}
                              {c.text}
                            </p>
                          </div>
                          {(user?._id === c.user?._id || user?._id === post.user?._id) && (
                            <button
                              onClick={async () => {
                                try {
                                  const token = localStorage.getItem('token');
                                  const res = await API.delete(`/posts/${post._id}/comment/${c._id}`, {
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                    },
                                  });

                                  setPosts((prev) =>
                                    prev.map((p) =>
                                      p._id === post._id
                                        ? { ...p, comments: res.data.comments, commentCount: res.data.comments.length }
                                        : p
                                    )
                                  );

                                  toast.success('Comment deleted 🗑️');
                                } catch (err) {
                                  console.error('Comment delete failed:', err);
                                  toast.error(err.response?.data?.message || 'Failed to delete comment');
                                }
                              }}
                              className="text-sm text-red-500 hover:text-red-700"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default PostList;

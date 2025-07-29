import React, { useState, useEffect, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Post = ({ post, onLikeToggle }) => {
  const { user } = useContext(AuthContext);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    // Check if the current user has liked this post
    setLiked(post.likes.includes(user._id));
  }, [post.likes, user._id]);

  const toggleLike = async () => {
    try {
      await API.post(`/posts/${post._id}/like`);
      setLiked((prev) => !prev);
      setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
      onLikeToggle?.(); // optional callback to refresh parent state
    } catch (err) {
      console.error('Failed to toggle like:', err);
      toast.error('Failed to toggle like ❤️‍🔥');
    }
  };

  const fetchComments = async () => {
    if (showComments) {
      setShowComments(false);
      return; // toggle off
    }

    setLoadingComments(true);
    try {
      const res = await API.get(`/posts/${post._id}/comments`);
      setComments(res.data);
      setShowComments(true);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      toast.error('Failed to load comments 💬');
    } finally {
      setLoadingComments(false);
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await API.post(`/posts/${post._id}/comments`, {
        text: commentText,
      });
      setComments((prev) => [...prev, res.data]);
      setCommentText('');
      toast.success('Comment added successfully 📝');
    } catch (err) {
      console.error('Failed to add comment:', err);
      toast.error('Could not add comment ❌');
    }
  };

  return (
    <div className="border rounded-xl p-4 my-3 bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-shadow duration-300">
      {/* Post Content */}
      <p className="text-gray-800 dark:text-gray-200 mb-2">{post.content}</p>
      {post.image && (
  <div className="flex justify-center my-3">
    <img
      src={post.image}
      alt="Post"
      className="w-72 h-72 rounded-lg object-cover shadow-md" // medium size
    />
  </div>
)}

      {/* Action Buttons */}
      <div className="flex items-center mt-3 space-x-4">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1 px-4 py-2 rounded-full font-medium transition duration-200 ${
            liked
              ? 'bg-pink-500 text-white hover:bg-pink-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {liked ? '❤️ Liked' : '🤍 Like'} ({likesCount})
        </button>

        <button
          onClick={fetchComments}
          className="flex items-center gap-1 px-4 py-2 rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition duration-200"
        >
          💬 Comments ({comments.length})
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 border-t pt-3">
          {loadingComments ? (
            <p className="text-gray-500 text-sm">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No comments yet. Be the first to comment! ✨
            </p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment._id}
                className="border-b py-1 flex gap-2 items-start text-gray-800 dark:text-gray-300"
              >
                <span className="font-semibold">{comment.userName}:</span>
                <span>{comment.text}</span>
              </div>
            ))
          )}

          {/* Add Comment Form */}
          <form onSubmit={addComment} className="mt-3 flex gap-2">
            <input
              type="text"
              className="flex-1 p-2 border rounded-full border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-full bg-pink-500 text-white hover:bg-pink-600 transition duration-200"
            >
              Post 🚀
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Post;

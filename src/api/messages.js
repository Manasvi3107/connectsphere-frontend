import API from '../api'; // ✅ point to src/api.js directly

export const sendMessage = async (receiverId, content) => {
  const res = await API.post('/messages', { receiverId, content });
  return res.data;
};

export const getMessagesWithUser = async (userId) => {
  const res = await API.get(`/messages/${userId}`);
  return res.data;
};

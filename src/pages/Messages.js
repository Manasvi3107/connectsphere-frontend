import React, { useEffect, useState, useRef } from "react";
import API from "../api";
import socket from "../socket";
import { AuthContext } from "../context/AuthContext";
import EmojiPicker from "emoji-picker-react";
import moment from "moment";

const Messages = () => {
  const { user } = React.useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeTab, setActiveTab] = useState("chats");
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true"
  );
  const [attachment, setAttachment] = useState(null);
  const [showOptions, setShowOptions] = useState(null); // 🆕

  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.emit("joinRoom", { userId: user._id });
    socket.on("onlineUsers", (users) => setOnlineUsers(users));

    return () => {
      socket.off("onlineUsers");
      //API.patch("/users/lastActive"); // 🆕 update last seen on leave
    };
  }, [user]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/users");
        const filtered = res.data.filter((u) => u._id !== user._id);
        setUsers(filtered);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchUsers();
  }, [user]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await API.get("/messages");
        setChats(res.data);
      } catch (err) {
        console.error("Failed to fetch chats:", err);
      }
    };
    fetchChats();
  }, []);

  const fetchMessages = async (chatUserId) => {
    try {
      const res = await API.get(`/messages/${chatUserId}`);
      setMessages(res.data);
      scrollToBottom();
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    fetchMessages(chat._id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !attachment) return;
    try {
      let res;
      if (attachment) {
        const formData = new FormData();
        formData.append("receiverId", selectedChat._id);
        formData.append("content", newMessage.trim());
        formData.append("attachments", attachment);
        res = await API.post("/messages", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        const payload = {
          receiverId: selectedChat._id,
          content: newMessage.trim(),
        };
        res = await API.post("/messages", payload);
      }

      socket.emit("newMessage", res.data);
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
      setAttachment(null);
      scrollToBottom();
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const handleTyping = () => {
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    setTimeout(() => {
      let now = new Date().getTime();
      if (now - lastTypingTime >= 3000) {
        socket.emit("stopTyping", selectedChat._id);
        setTyping(false);
      }
    }, 3000);
  };

  const handleEmojiSelect = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
  };

  const isUserOnline = (userId) => onlineUsers.includes(userId);

  const handleDeleteMessage = async (messageId) => {
    try {
      await API.delete(`/messages/${messageId}`);
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    } catch (err) {
      console.error("Delete message failed:", err);
    }
  };

  const handleEditMessage = async (messageId, newContent) => {
    try {
      const res = await API.patch(`/messages/${messageId}`, {
        content: newContent,
      });
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? res.data.data : msg))
      );
      setShowOptions(null);
    } catch (err) {
      console.error("Edit message failed:", err);
    }
  };

  return (
    <div
      className={`flex h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Sidebar */}
      <div
        className={`w-1/4 border-r flex flex-col ${
          darkMode ? "bg-gray-800" : "bg-gray-100"
        }`}
      >
        {/* Tabs & Dark Mode */}
        <div className="flex justify-between items-center p-2">
          <div className="flex w-full">
            <button
              onClick={() => setActiveTab("chats")}
              className={`flex-1 p-3 font-semibold ${
                activeTab === "chats"
                  ? "bg-pink-500 text-white rounded-t-lg"
                  : darkMode
                  ? "bg-gray-700 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Chats
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex-1 p-3 font-semibold ${
                activeTab === "users"
                  ? "bg-pink-500 text-white rounded-t-lg"
                  : darkMode
                  ? "bg-gray-700 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              All Users
            </button>
          </div>
          {/* Dark Mode Toggle */}
          <label className="ml-2 flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => {
                setDarkMode(!darkMode);
                localStorage.setItem("darkMode", !darkMode);
              }}
              className="hidden"
            />
            <div
              className={`w-10 h-5 rounded-full flex items-center ${
                darkMode ? "bg-pink-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow transform ${
                  darkMode ? "translate-x-5" : "translate-x-1"
                } transition-transform`}
              ></div>
            </div>
          </label>
        </div>

        {/* Chat/User List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {(activeTab === "chats" ? chats : users).map((item) => (
            <div
              key={item._id}
              onClick={() => handleSelectChat(item)}
              className={`p-3 rounded cursor-pointer hover:bg-pink-100 ${
                selectedChat?._id === item._id
                  ? "bg-pink-500"
                  : darkMode
                  ? "bg-gray-700"
                  : ""
              }`}
            >
              <div className="flex justify-between items-center">
                <span>{item.name}</span>
                <span
                  className={`text-xs ${
                    isUserOnline(item._id)
                      ? "text-green-400"
                      : darkMode
                      ? "text-gray-300"
                      : "text-gray-400"
                  }`}
                >
                  {isUserOnline(item._id)
                    ? "Online"
                    : `Last seen ${moment(item.lastActive).fromNow()}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div
        className="flex-1 flex flex-col relative"
        style={{
          backgroundImage: "url('/assets/background-doodles.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backdropFilter: "blur(6px)",
            backgroundColor: darkMode
              ? "rgba(0,0,0,0.5)"
              : "rgba(255,255,255,0.3)",
          }}
        ></div>

        <div className="relative flex flex-col h-full">
          {/* Chat Header */}
          <div
            className={`p-4 border-b ${
              darkMode ? "bg-gray-800" : "bg-gray-50"
            } relative z-10`}
          >
            {selectedChat ? (
              <div className="font-bold">
                {selectedChat.name}{" "}
                <span
                  className={`text-xs ${
                    isUserOnline(selectedChat._id)
                      ? "text-green-400"
                      : darkMode
                      ? "text-gray-300"
                      : "text-gray-400"
                  }`}
                >
                  {isUserOnline(selectedChat._id)
                    ? "Online"
                    : `Last seen ${moment(
                        selectedChat.lastActive
                      ).fromNow()}`}
                </span>
              </div>
            ) : (
              <div>Select a chat to start messaging</div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 relative z-10">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex relative ${
                  msg.sender._id === user._id
                    ? "justify-end"
                    : "justify-start"
                } mb-2`}
              >
                <div
                  className={`p-2 rounded-lg max-w-xs relative ${
                    msg.sender._id === user._id
                      ? "bg-pink-500 text-white"
                      : darkMode
                      ? "bg-gray-700 text-white"
                      : "bg-gray-300 text-black"
                  }`}
                  onClick={() =>
                    setShowOptions(showOptions === msg._id ? null : msg._id)
                  }
                >
                  {msg.content}
                  {/* Edit/Delete Options */}
                  {showOptions === msg._id && (
                    <div
                      className={`absolute top-full right-0 mt-1 bg-white border rounded shadow-md ${
                        darkMode ? "bg-gray-800 text-white" : "text-black"
                      }`}
                    >
                      <button
                        className="block px-3 py-1 hover:bg-gray-200 w-full text-left"
                        onClick={() =>
                          handleEditMessage(
                            msg._id,
                            prompt("Edit message:", msg.content)
                          )
                        }
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="block px-3 py-1 hover:bg-gray-200 w-full text-left"
                        onClick={() => handleDeleteMessage(msg._id)}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className={`p-4 border-t flex gap-2 ${
              darkMode ? "bg-gray-800" : "bg-gray-50"
            } relative z-10`}
          >
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-2xl"
            >
              😊
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-16">
                <EmojiPicker onEmojiClick={handleEmojiSelect} />
              </div>
            )}
            <input
              type="file"
              onChange={(e) => setAttachment(e.target.files[0])}
              className="hidden"
              id="fileUpload"
            />
            <label htmlFor="fileUpload" className="cursor-pointer">
              📎
            </label>
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleTyping}
              className={`flex-1 border rounded p-2 focus:outline-none ${
                darkMode ? "bg-gray-700 text-white" : "bg-white text-black"
              }`}
            />
            <button
              onClick={handleSendMessage}
              className="bg-pink-500 text-white px-4 py-2 rounded"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;

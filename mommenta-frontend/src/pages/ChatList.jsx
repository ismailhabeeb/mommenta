// src/pages/ChatList.jsx
import { useEffect, useState, useContext } from "react";
import { useSocket } from "../context/SocketContext";
import { fetchConversations, getCurrentUser } from "../services";
import { useAuth } from "../context/AuthContext";

export default function ChatList({ onSelectChat, activeChatId }) {
  const [conversations, setConversations] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const socket = useSocket();
  // const currentUser = getCurrentUser();
      const { user: currentUser } = useAuth();
  

  // 🟢 Fetch conversations on mount
  useEffect(() => {
    const loadChats = async () => {
      try {
        const { data } = await fetchConversations();
        setConversations(data);
        console.log(data)
      } catch (err) {
        console.error("Error fetching conversations:", err);
      } finally {
        setLoading(false);
      }
    };
    loadChats();
  }, []);

  // ⚡ Listen for online user updates
  useEffect(() => {
    if (!socket) return;

    socket.on("onlineUsers", (users) => setOnlineUsers(users));

    return () => socket.off("onlineUsers");
  }, [socket]);

  // ✉️ Update chat previews in real-time
  useEffect(() => {
    if (!socket) return;

    socket.on("receiveMessage", (message) => {
      setConversations((prev) => {
        const updated = [...prev];
        const idx = updated.findIndex((c) => c._id === message.chatId);

        if (idx >= 0) {
          updated[idx].lastMessage = {
            text: message.text,
            createdAt: message.createdAt,
            sender: { _id: message.senderId },
          };
          // Move updated chat to top
          const [chat] = updated.splice(idx, 1);
          updated.unshift(chat);
        }
        return updated;
      });
    });

    return () => socket.off("receiveMessage");
  }, [socket]);

  // ✍️ Typing indicator
  useEffect(() => {
    if (!socket) return;

    socket.on("userTyping", ({ chatId, senderId }) => {
      setTypingUsers((prev) => {
        if (!prev.includes(chatId)) return [...prev, chatId];
        return prev;
      });
    });

    socket.on("userStopTyping", ({ chatId }) => {
      setTypingUsers((prev) => prev.filter((id) => id !== chatId));
    });

    return () => {
      socket.off("userTyping");
      socket.off("userStopTyping");
    };
  }, [socket]);

  const isOnline = (userId) => onlineUsers.includes(userId);
  const isTyping = (chatId) => typingUsers.includes(chatId);

  // 🕓 Loading state
  if (loading)
    return <div className="p-4 text-gray-500">Loading chats...</div>;

  if (conversations.length === 0)
    return <div className="p-4 text-gray-500">No conversations yet</div>;

  return (
    <div className="w-full md:w-80 border-r border-gray-200 h-full overflow-y-auto bg-white dark:bg-gray-900 dark:text-gray-100">
      <h2 className="p-4 text-xl font-semibold border-b">Chats</h2>

      {conversations.map((chat) => {
        const otherUser = chat.members.find((m) => m._id !==  currentUser?._id );
        const lastMsg = chat.lastMessage?.text || "No messages yet";

        return (
          <div
            key={chat._id}
            onClick={() => onSelectChat(chat)}
            className={`flex items-center  gap-3 p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition ${
              activeChatId === chat._id ? "bg-gray-100" : ""
            }`}
          >
            {/* Avatar + Online status */}
            <div className="relative">
              <img
                src={otherUser?.profilePic || "https://api.dicebear.com/9.x/thumbs/svg?seed=placeholder"}
                alt={otherUser?.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              {isOnline(otherUser?._id) && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-white"></span>
              )}
            </div>

            {/* Chat info */}
            <div className="flex-1">
              <p className="font-medium text-gray-800">{otherUser?.username}</p>

              {isTyping(chat._id) ? (
                <p className="text-sm italic text-blue-500">Typing...</p>
              ) : (
                <p className="text-sm text-gray-500 truncate">{lastMsg}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

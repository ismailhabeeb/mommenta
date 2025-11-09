import { useEffect, useRef, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { fetchMessages, sendMessage, markMessagesRead } from "../services";
import { useAuth } from "../context/AuthContext";
import Icon from "@mdi/react";
import {
  mdiArrowLeft,
  mdiSend,
  mdiEmoticonOutline,
  mdiPaperclip,
} from "@mdi/js";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatRoom({ activeChat, onBack }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const { user: currentUser } = useAuth();
  const socket = useSocket();
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const chatId = activeChat?._id;
  const receiver = activeChat?.members.find((m) => m._id !== currentUser?._id);

  // 🟢 Fetch messages
  useEffect(() => {
    if (!chatId) return;
    const loadMessages = async () => {
      try {
        const { data } = await fetchMessages(chatId);
        setMessages(data);
        await markMessagesRead(chatId);
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    };
    loadMessages();
  }, [chatId]);

  // ⚡ Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("receiveMessage", (message) => {
      if (message.chatId === chatId) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      }
    });

    socket.on("userTyping", ({ chatId: typingChatId }) => {
      if (typingChatId === chatId) setIsTyping(true);
    });

    socket.on("userStopTyping", ({ chatId: typingChatId }) => {
      if (typingChatId === chatId) setIsTyping(false);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("userTyping");
      socket.off("userStopTyping");
    };
  }, [socket, chatId]);

  // ✍️ Handle typing
  const handleTyping = (e) => {
    setText(e.target.value);
    if (socket && chatId) {
      socket.emit("userTyping", { chatId, senderId: currentUser._id });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("userStopTyping", { chatId, senderId: currentUser._id });
      }, 1500);
    }
  };

  // 🚀 Send message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const { data } = await sendMessage(chatId, { text });
      setMessages((prev) => [...prev, data]);
      setText("");
      scrollToBottom();
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // 📎 Handle file upload (placeholder)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("File selected:", file.name);
      // Upload logic later...
    }
  };

  // 😀 Toggle emoji picker (placeholder)
  const handleEmojiSelect = (emoji) => {
    setText((prev) => prev + emoji);
    setShowEmoji(false);
  };

  // 🔽 Scroll helper
  const scrollToBottom = () => {
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  };

  useEffect(scrollToBottom, [messages]);

  // 🧩 No chat selected
  if (!activeChat)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50 dark:bg-gray-900"
      >
        Select a chat to start messaging
      </motion.div>
    );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={chatId}
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-gray-600 dark:text-gray-300 hover:text-brand transition"
            >
              <Icon path={mdiArrowLeft} size={1} />
            </button>
            <div className="relative">
              <img
                src={receiver?.profilePic || "/default-avatar.png"}
                alt={receiver?.username}
                className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">
                {receiver?.username}
              </h2>
              {isTyping ? (
                <p className="text-xs text-brand animate-pulse">typing...</p>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Online
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto max-h-[calc(80vh-150px)] px-4 py-3 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
          {loading ? (
            <p className="text-gray-500 dark:text-gray-400">
              Loading messages...
            </p>
          ) : (
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${
                    msg.sender._id === currentUser._id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow transition ${
                      msg.sender._id === currentUser._id
                        ? "bg-gradient-to-r from-brand-gradientStart to-brand-gradientEnd text-white rounded-br-none"
                        : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                    <div className="text-[10px] text-gray-400 mt-1 text-right">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          <div ref={bottomRef}></div>
        </div>

        {/* Input Area */}
        <form
          onSubmit={handleSend}
          className="flex items-center gap-3 p-3 border-t bg-white dark:bg-gray-800 dark:border-gray-700 sticky bottom-0"
        >
          <label className="text-gray-500 dark:text-gray-300 hover:text-brand transition cursor-pointer">
            <Icon path={mdiPaperclip} size={1} />
            <input type="file" className="hidden" onChange={handleFileUpload} />
          </label>

          <button
            type="button"
            onClick={() => setShowEmoji((prev) => !prev)}
            className="text-gray-500 dark:text-gray-300 hover:text-brand transition"
          >
            <Icon path={mdiEmoticonOutline} size={1} />
          </button>

          <input
            type="text"
            value={text}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 border rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-brand/30 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
          />

          <button
            type="submit"
            className="bg-gradient-to-r from-brand-gradientStart to-brand-gradientEnd hover:opacity-90 text-white p-2 rounded-full transition shadow-sm"
          >
            <Icon path={mdiSend} size={1} />
          </button>
        </form>

        {/* Emoji Picker (Placeholder UI) */}
        {showEmoji && (
          <div className="absolute bottom-16 left-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl shadow-lg p-3 z-20 text-lg flex gap-2 flex-wrap max-w-[300px]">
            {["😀", "😂", "😍", "😎", "🥰", "😅", "😭", "🤔"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiSelect(emoji)}
                className="hover:scale-110 transition"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

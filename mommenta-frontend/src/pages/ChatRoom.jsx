import { useEffect, useRef, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { fetchMessages, sendMessage, markMessagesRead } from "../services";
import { useAuth } from "../context/AuthContext";
import EmojiPicker from "emoji-picker-react";
import Icon from "@mdi/react";
import {
  mdiArrowLeft,
  mdiSend,
  mdiEmoticonOutline,
  mdiPaperclip,
  mdiClose,
  mdiFileOutline,
} from "@mdi/js";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatRoom({ activeChat, onBack }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [files, setFiles] = useState([]);
  const [viewer, setViewer] = useState(null); // 🧩 Modal viewer
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

  // ✍️ Typing
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

    // block empty send
    if (!text.trim() && files.length === 0) return;

    const formData = new FormData();
    formData.append("text", text?.trim() || "");

    files.forEach((file) => formData.append("media", file));

    try {
      // optional: show sending state
      // setSending(true);

      const { data } = await sendMessage(chatId, formData);

      // append message to UI
      setMessages((prev) => [...prev, data]);

      // reset UI
      setText("");
      setFiles([]);

      scrollToBottom();
    } catch (err) {
      console.error("Error sending message:", err);
      // toast.error("Failed to send message");
    } finally {
      // setSending(false);
    }
  };



  // 📎 Handle multiple file uploads
  const handleFileUpload = (e) => {
    const selected = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selected]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 😀 Emoji Picker
  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  // 🔽 Scroll helper
  const scrollToBottom = () => {
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  };
  useEffect(scrollToBottom, [messages]);

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


  // ----------------------------------------------------------------
  // MEDIA VIEWER CONTENT
  // ----------------------------------------------------------------
  const renderMedia = (m) => {
    if (!m.media) return null;

    return m.media.map((file, i) => {
      const type = file.mediaType;

      return (
        <div key={i} className="mt-2">
          {type === "image" && (
            <img
              src={file.mediaUrl}
              className="w-48 rounded-xl cursor-pointer"
              onClick={() => setViewer(file)}
            />
          )}

          {type === "video" && (
            <video
              src={file.mediaUrl}
              controls
              className="w-48 rounded-xl cursor-pointer"
              onClick={() => setViewer(file)}
            />
          )}

          {type !== "image" && type !== "video" && (
            <a
              href={file.mediaUrl}
              target="_blank"
              className="block p-2 bg-gray-200 rounded-lg underline"
            >
              {file.mediaUrl.split("/").pop()}
            </a>
          )}
        </div>
      );
    });
  };
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
        <div className="flex-1 overflow-y-auto min-h-[calc(78vh-145px)] max-h-[calc(80vh-150px)] px-4 py-3 space-y-3 scrollbar-hide">
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
                  className={`flex ${msg.sender._id === currentUser._id
                    ? "justify-end"
                    : "justify-start"
                    }`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow transition ${msg.sender._id === currentUser._id
                      ? "bg-brand text-white rounded-br-none"
                      : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none"
                      }`}
                  >
                    {msg.text && <p>{msg.text}</p>}
                    {renderMedia(msg)}

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

        {/* Multiple File Preview before send */}
        {files.length > 0 && (
          <div className="absolute bottom-20 left-0 right-0 flex flex-wrap gap-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
            {files.map((file, i) => {
              const preview = URL.createObjectURL(file);
              return (
                <div
                  key={i}
                  className="relative w-16 h-16 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
                >
                  {file.type.startsWith("image/") ? (
                    <img
                      src={preview}
                      alt=""
                      className="object-cover w-full h-full"
                    />
                  ) : file.type.startsWith("video/") ? (
                    <video src={preview} className="object-cover w-full h-full" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-xs text-gray-500 dark:text-gray-300">
                      <Icon path={mdiFileOutline} size={1} />
                    </div>
                  )}
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full hover:bg-black"
                  >
                    <Icon path={mdiClose} size={0.7} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal File Viewer */}
        <AnimatePresence>
          {viewer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
              onClick={() => setViewer(null)}
            >
              <div
                className="relative max-w-3xl w-full px-4"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setViewer(null)}
                  className="absolute top-4 right-4 text-white bg-black/60 p-2 rounded-full hover:bg-black"
                >
                  <Icon path={mdiClose} size={1} />
                </button>
                {viewer.endsWith(".mp4") ? (
                  <video src={viewer} controls className="w-full rounded-lg" />
                ) : viewer.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  <img
                    src={viewer}
                    alt="viewer"
                    className="w-full rounded-lg object-contain max-h-[80vh]"
                  />
                ) : (
                  <iframe
                    src={viewer}
                    className="w-full h-[80vh] rounded-lg bg-white"
                    title="Document Viewer"
                  ></iframe>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <form
          onSubmit={handleSend}
          className="flex items-end gap-3 p-3 border-t bg-white dark:bg-gray-800 dark:border-gray-700 sticky bottom-0"
        >
          <label className="text-gray-500 dark:text-gray-300 hover:text-brand transition cursor-pointer">
            <Icon path={mdiPaperclip} size={1} />
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          <button
            type="button"
            onClick={() => setShowEmoji((prev) => !prev)}
            className="text-gray-500 dark:text-gray-300 hover:text-brand transition"
          >
            <Icon path={mdiEmoticonOutline} size={1} />
          </button>

          <textarea
            value={text}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 max-h-[120px] min-h-[45px] border rounded-lg px-4 py-2 resize-none outline-none focus:ring-2 focus:ring-brand/30 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 scrollbar-hide"
          />

          <button
            type="submit"
            className="bg-brand hover:bg-brand-accent text-white p-2 rounded-full transition shadow-sm"
          >
            <Icon path={mdiSend} size={1} />
          </button>
        </form>

        {/* Emoji Picker */}
        {showEmoji && (
          <div className="absolute bottom-16 left-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl shadow-lg z-20">
            <EmojiPicker
              theme={
                document.documentElement.classList.contains("dark")
                  ? "dark"
                  : "light"
              }
              onEmojiClick={handleEmojiClick}
            />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}



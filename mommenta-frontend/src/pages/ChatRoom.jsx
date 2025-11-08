import { useEffect, useRef, useState, useContext } from "react";
import { useSocket } from "../context/SocketContext";
import {
    fetchMessages,
    sendMessage,
    markMessagesRead,
    getCurrentUser,
} from "../services";
import { useAuth } from "../context/AuthContext";

export default function ChatRoom({ activeChat, onBack }) {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useAuth();

    const socket = useSocket();
    //   const currentUser = getCurrentUser();
    const bottomRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const chatId = activeChat?._id;
    //   console.log(chatId)
    //   console.log(currentUser)
    const receiver = activeChat?.members.find(
        (m) => m._id !== currentUser?._id
    );

    // 🟢 Fetch messages when chat changes
    useEffect(() => {
        console.log(currentUser)

        if (!chatId) return;

        const loadMessages = async () => {
            try {
                const { data } = await fetchMessages(chatId);
                console.log(data)
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

    // ⚡ Listen for incoming messages
    useEffect(() => {
        if (!socket) return;

        socket.on("receiveMessage", (message) => {
            if (message.chatId === chatId) {
                setMessages((prev) => [...prev, message]);
                scrollToBottom();
            }
        });

        return () => socket.off("receiveMessage");
    }, [socket, chatId]);

    // ✍️ Handle typing indicator emit
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

    // 🚀 Send a message
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

    // 🔽 Scroll to bottom helper
    const scrollToBottom = () => {
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };

    useEffect(scrollToBottom, [messages]);

    if (!activeChat)
        return <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a chat to start messaging
        </div>;

    return (
        <div className="flex-1 flex flex-col bg-gray-50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-white">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="md:hidde text-gray-600">
                        ←
                    </button>
                    <img
                        src={receiver?.profilePic || "/default-avatar.png"}
                        alt={receiver?.username}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <h2 className="font-semibold text-gray-800">{receiver?.username}</h2>
                </div>
            </div>

            {/* Messages */}
            <div className=" min-h-0 overflow-y-auto max-h-80">
                <div className="flex-1  px-4 py-3 space-y-3 ">
                    {loading ? (
                        <p className="text-gray-500">Loading messages...</p>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg._id}
                                className={`flex ${msg.sender._id === currentUser._id ? "justify-end" : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`max-w-xs px-4 py-2 rounded-2xl text-sm shadow ${msg.sender._id === currentUser._id
                                            ? "bg-blue-500 text-white"
                                            : "bg-white text-gray-800"
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
                            </div>
                        ))
                    )}
                    <div ref={bottomRef}></div>
                </div>
            </div>
            {/* Input box */}
            <form
                onSubmit={handleSend}
                className="flex items-center gap-3 p-3 border-t bg-white"
            >
                <input
                    type="text"
                    value={text}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                    className="flex-1 border rounded-full px-4 py-2 outline-none focus:ring focus:ring-blue-100"
                />
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition"
                >
                    Send
                </button>
            </form>
        </div>
    );
}

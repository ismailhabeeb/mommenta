// src/context/ChatDrawerContext.jsx
import { createContext, useContext, useState } from "react";

const ChatDrawerContext = createContext();

export const ChatDrawerProvider = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);

  const openChatDrawer = (chat) => {
    setIsDrawerOpen(true);
    if (chat) setActiveChat(chat);
  };

  const closeChat = () => {
    setIsDrawerOpen(false);
    setActiveChat(null);
  };

  return (
    <ChatDrawerContext.Provider
      value={{
        isDrawerOpen,
        activeChat,
        setActiveChat,
        openChatDrawer,
        closeChat,
      }}
    >
      {children}
    </ChatDrawerContext.Provider>
  );
};

export const useChatDrawer = () => useContext(ChatDrawerContext);

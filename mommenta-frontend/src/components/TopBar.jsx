// src/components/TopBar.jsx
import Icon from "@mdi/react";
import { mdiMessageOutline, mdiClose } from "@mdi/js";
import logo from "../assets/images/logo.png";
import ChatList from "../pages/ChatList";
import ChatRoom from "../pages/ChatRoom";
import { useChatDrawer } from "../context/ChatDrawerContext";
import LogoAnimated from "./Logo";

export default function TopBar() {
  const { isDrawerOpen, activeChat, setActiveChat, openChatDrawer, closeChat } =
    useChatDrawer();

  const toggleChatPanel = () => {
    if (isDrawerOpen) closeChat();
    else openChatDrawer();
  };

  const handleBack = () => setActiveChat(null);

  return (
    <>
      {/* 🔹 Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 shadow-md flex items-center justify-between px-6 z-50">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <LogoAnimated
            size={50}
            strokeWidth={10}
            className="w-20 h-20 sm:w-24 sm:h-24"
          />
          {/* <img src={logo} alt="Mommenta" className="w-10 h-10" /> */}
          <span className="font-bold text-xl text-gray-800 dark:text-gray-100">
            Mommenta
          </span>
        </div>

        {/* Center Search */}
        <div className="hidden md:flex flex-1 justify-center">
          <input
            type="text"
            placeholder="Search..."
            className="w-1/2 px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-4">
          <Icon
            path={mdiMessageOutline}
            size={1.5}
            className="text-gray-600 dark:text-gray-300 cursor-pointer hover:text-brand transition"
            onClick={toggleChatPanel}
          />
        </div>
      </div>

      {/* 🔹 Chat Drawer */}
      {isDrawerOpen && (
        <div className="fixed top-16 right-0 w-full md:w-[400px] h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-lg z-40 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {activeChat ? "Chat" : "Messages"}
            </h2>
            <Icon
              path={mdiClose}
              size={1.2}
              className="text-gray-600 dark:text-gray-300 cursor-pointer hover:text-red-500 transition"
              onClick={toggleChatPanel}
            />
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-hidden">
            {activeChat ? (
              <ChatRoom activeChat={activeChat} onBack={handleBack} />
            ) : (
              <ChatList
                onSelectChat={setActiveChat}
                activeChatId={activeChat?._id}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

// src/context/SocketContext.jsx
// import { createContext, useContext, useEffect, useState } from "react";
// import { io } from "socket.io-client";
// import { useAuth } from "./AuthContext";
// import { useNotifications } from "./NotificationContext";

// const SocketContext = createContext();

// export const SocketProvider = ({ children }) => {
//   const { user } = useAuth();
//   const { addNotification } = useNotifications();
//   const [socket, setSocket] = useState(null);

//   useEffect(() => {
//     if (user) {
//       const s = io("http://localhost:5000"); // 👈 your backend URL
//       setSocket(s);

//       s.emit("register", user._id);

//       s.on("newNotification", (notification) => {
//         addNotification(notification); // 👈 adds it to your notification state
//       });

//       return () => {
//         s.disconnect();
//       };
//     }
//   }, [user]);

//   return (
//     <SocketContext.Provider value={{ socket }}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

// export const useSocket = () => useContext(SocketContext);


import React, { createContext, useContext, useEffect, useState } from "react";
import { initSocket } from "../socket";
import { useAuth } from "./AuthContext";
import { useNotifications } from "./NotificationContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children, }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (user?._id) {
      const s = initSocket(localStorage.getItem("token"));
      s.emit("join", user._id);
      setSocket(s);

      s.on("newNotification", (notification) => {
        addNotification(notification); // 👈 adds it to your notification state
      });
      s.on("connect", () => console.log("🔌 Connected to socket:", s.id));
      s.on("disconnect", () => console.log("❌ Disconnected from socket"));

      return () => {
        s.disconnect();
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

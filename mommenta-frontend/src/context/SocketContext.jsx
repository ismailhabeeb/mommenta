import { useEffect, useState } from "react";
import { initSocket } from "../socket";
import { useAuth } from "./useAuth";
import { useNotifications } from "./useNotifications";
import SocketContext from "./socketContextValue";

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!user?._id && !user?.id) {
      setSocket(null);
      return;
    }

    const s = initSocket(localStorage.getItem("token"));
    setSocket(s);

    const onNotification = (notification) => addNotification(notification);
    s.on("newNotification", onNotification);

    return () => {
      s.off("newNotification", onNotification);
      s.disconnect();
    };
  }, [user, addNotification]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

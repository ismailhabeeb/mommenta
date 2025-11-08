import { getToken } from "./services";
import { io } from "socket.io-client";

const SOCKET_URL =  "http://localhost:5000";

export const initSocket = () => {
  const token = getToken();
  const socket = io(SOCKET_URL, {
    withCredentials: true,
    auth: { token },
  });
  return socket;
};

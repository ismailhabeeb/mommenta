import { getToken } from "./services";
import { io } from "socket.io-client";

// const SOCKET_URL =  "http://localhost:5000";
const SOCKET_URL =  "https://mommenta.onrender.com"; // production

export const initSocket = () => {
  const token = getToken();
  const socket = io(SOCKET_URL, {
    withCredentials: true,
    auth: { token },
  });
  return socket;
};

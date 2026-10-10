import { getToken } from "./services";
import { io } from "socket.io-client";

const API_URL =
  import.meta.env.VITE_API_URL || "https://mommenta.onrender.com/api";
const SOCKET_URL = API_URL.replace(/\/api\/?$/, "");

export const initSocket = (token = getToken()) => {
  const socket = io(SOCKET_URL, {
    withCredentials: true,
    auth: { token },
  });
  return socket;
};

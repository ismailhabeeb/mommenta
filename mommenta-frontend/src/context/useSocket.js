import { useContext } from "react";
import SocketContext from "./socketContextValue";

export const useSocket = () => useContext(SocketContext);

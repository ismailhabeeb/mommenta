import { useContext } from "react";
import ChatDrawerContext from "./chatDrawerContextValue";

export const useChatDrawer = () => useContext(ChatDrawerContext);

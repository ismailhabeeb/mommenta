import React from "react";
import Icon from "@mdi/react";
import { mdiHome, mdiMagnify, mdiAccount, mdiMessage, mdiCog } from "@mdi/js";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around py-2 md:top-0 md:flex-col md:w-16 md:h-screen">
      <Link to="/home"><Icon path={mdiHome} size={1} /></Link>
      <Link to="/explore"><Icon path={mdiMagnify} size={1} /></Link>
      <Link to="/messages"><Icon path={mdiMessage} size={1} /></Link>
      <Link to="/profile"><Icon path={mdiAccount} size={1} /></Link>
      <Link to="/settings"><Icon path={mdiCog} size={1} /></Link>
    </nav>
  );
}

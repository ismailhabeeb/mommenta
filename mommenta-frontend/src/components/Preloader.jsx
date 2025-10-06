import { motion } from "framer-motion"; // for smooth animation
import { mdiCamera } from "@mdi/js";
import Icon from "@mdi/react";
import logo from "/src/assets/images/logo.png"

export default function Preloader() {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center"
      >
        {/* Logo Icon */}
        <img src={logo} className="w-50" alt="" />
        {/* <Icon path={mdiCamera} size={3} color="#111827" /> */}
        {/* App Name */}
        <h1 className="text-2xl font-bold mt-4 text-gray-800">Mommenta</h1>
      </motion.div>
    </div>
  );
}

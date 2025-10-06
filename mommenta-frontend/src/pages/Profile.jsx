import Icon from "@mdi/react";
import { mdiCog, mdiHeartOutline, mdiCommentOutline } from "@mdi/js";
import image1 from "../assets/images/Maud.jpg";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage(mee) {
    const { user } = useAuth();
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-8">
        <img
          src={user.profilePic || "/default-avatar.png"}
          alt="profile"
          className="w-32 h-32 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">{user.username}</h2>
            <Link to={"/edit-profile"} className="btn-primary text-sm">Edit Profile</Link>
            <Link to={"/settings"} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
              <Icon path={mdiCog} size={1} />
            </Link>
          </div>
          <div className="flex gap-6 mt-3 text-gray-700 dark:text-gray-300">
            <span><b>12</b> posts</span>
            <span><b>{user.followers.length}</b> followers</span>
            <span><b>200</b> following</span>
          </div>
          <div className="mt-3">
            <p className="font-medium">Full Name</p>
            <p className="text-sm">📍 Lagos | 🌍 Developer | 🎨 Designer</p>
            <a href="https://example.com" className="text-brand text-sm">example.com</a>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t mt-6" />

      {/* Tabs */}
      <div className="flex justify-center gap-12 mt-3 text-sm font-medium">
        <button className="pb-2 border-b-2 border-brand">Posts</button>
        <button className="pb-2 border-b-2 border-transparent hover:border-gray-400">Saved</button>
        <button className="pb-2 border-b-2 border-transparent hover:border-gray-400">Tagged</button>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-3 gap-1 mt-4">
        {Array.from({ length: 9 }).map((_, idx) => (
          <div key={idx} className="relative group">
            <img
              src={image1}
              alt="post"
              className="w-full h-40 object-cover"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white gap-4 text-sm transition">
              <span className="flex items-center gap-1">
                <Icon path={mdiHeartOutline} size={0.9} />
                120
              </span>
              <span className="flex items-center gap-1">
                <Icon path={mdiCommentOutline} size={0.9} />
                34
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

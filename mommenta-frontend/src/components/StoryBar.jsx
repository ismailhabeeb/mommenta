import Icon from "@mdi/react";
import { mdiPlus } from "@mdi/js";

export default function StoryBar() {
  const stories = [
    { id: 1, user: "You", avatar: "https://i.pravatar.cc/100?img=12" },
    { id: 2, user: "Zara", avatar: "https://i.pravatar.cc/100?img=22" },
    { id: 3, user: "Khalid", avatar: "https://i.pravatar.cc/100?img=32" },
    { id: 4, user: "Lina", avatar: "https://i.pravatar.cc/100?img=42" },
    { id: 5, user: "David", avatar: "https://i.pravatar.cc/100?img=52" },
    { id: 6, user: "Aisha", avatar: "https://i.pravatar.cc/100?img=62" },
    { id: 7, user: "Gisha", avatar: "https://i.pravatar.cc/100?img=62" },
    { id: 8, user: "Aisha", avatar: "https://i.pravatar.cc/100?img=62" },
    { id: 9, user: "tisha", avatar: "https://i.pravatar.cc/100?img=62" },
    { id: 10, user: "Hisha", avatar: "https://i.pravatar.cc/100?img=62" },
  ];

  return (
    <div className="flex space-x-4 px-4 py-3 overflow-x-auto scrollbar-hide bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200/30 dark:border-gray-700/30 rounded-2xl shadow-sm">
      {stories.map((story) => (
        <div key={story.id} className="flex flex-col items-center shrink-0">
          <div
            className={`relative p-[2px] rounded-full ${
              story.user === "You"
                ? "bg-gradient-to-tr from-blue-500 via-purple-500 to-white"
                : "bg-gradient-to-tr from-pink-500 via-white to-white"
            }`}
          >
            <img
              src={story.avatar}
              alt={story.user}
              className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-gray-900"
            />

            {story.user === "You" && (
              <div className="absolute bottom-0 right-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full p-1.5 shadow-md">
                <Icon path={mdiPlus} size={0.5} color="white" />
              </div>
            )}
          </div>

          <p className="text-xs mt-2 text-gray-700 dark:text-gray-300 truncate w-16 text-center">
            {story.user}
          </p>
        </div>
      ))}
    </div>
  );
}

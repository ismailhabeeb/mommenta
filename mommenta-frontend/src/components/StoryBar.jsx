import Icon from "@mdi/react";
import { mdiPlus } from "@mdi/js";

export default function StoryBar() {
  const stories = [
    { id: 1, user: "You", avatar: "https://i.pravatar.cc/100?img=12" },
    { id: 2, user: "Zara", avatar: "https://i.pravatar.cc/100?img=22" },
    { id: 3, user: "Khalid", avatar: "https://i.pravatar.cc/100?img=32" },
    { id: 4, user: "Lina", avatar: "https://i.pravatar.cc/100?img=42" },
    { id: 5, user: "David", avatar: "https://i.pravatar.cc/100?img=52" },
  ];

  return (
    <div className="flex space-x-4 p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-x-auto scrollbar-hide">
      {stories.map((story) => (
        <div key={story.id} className="flex flex-col items-center">
          <div className="relative">
            <img
              src={story.avatar}
              alt={story.user}
              className="w-16 h-16 rounded-full border-2 border-pink-500 object-cover"
            />
            {story.user === "You" && (
              <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1">
                <Icon path={mdiPlus} size={0.6} color="white" />
              </div>
            )}
          </div>
          <p className="text-xs mt-1">{story.user}</p>
        </div>
      ))}
    </div>
  );
}

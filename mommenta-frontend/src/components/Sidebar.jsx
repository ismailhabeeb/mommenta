import { Link } from "react-router-dom";

export default function Sidebar({ userD }) {
  const suggestions = [
    { id: 1, user: "Aisha", avatar: "https://i.pravatar.cc/100?img=11" },
    { id: 2, user: "Omar", avatar: "https://i.pravatar.cc/100?img=21" },
    { id: 3, user: "Fatima", avatar: "https://i.pravatar.cc/100?img=31" },
  ];

  return (
    <div className="sticky top-6 space-y-5 dark:text-gray-300">

      {/* Profile Preview */}
      <Link to={`/profile/${userD._id}`}>
        <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <img
            src={userD.profilePic || "https://api.dicebear.com/9.x/thumbs/svg?seed=placeholder"}
            alt="me"
            className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{userD.username}</p>
            <p className="text-xs text-gray-400 truncate">@{userD.username}</p>
          </div>
        </div>
      </Link>

      {/* Divider */}
      <div className="border-t border-gray-100 dark:border-gray-800" />

      {/* Suggestions */}
      <div>
        <div className="flex justify-between items-center mb-3 px-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Suggestions for you
          </p>
          <button className="text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors">
            See All
          </button>
        </div>

        <div className="space-y-1">
          {suggestions.map((s) => (
            <div
              key={s.id}
              className="gap-3 flex items-center justify-between items-center px-2 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <img
                  src={s.avatar}
                  alt={s.user}
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold leading-tight">{s.user}</p>
                  <p className="text-xs text-gray-400">Suggested for you</p>
                </div>
              </div>
              <button className="text-xs font-semibold text-blue-500 hover:text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-3 py-1.5 rounded-full transition-colors">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
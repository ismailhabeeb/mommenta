import { Link } from "react-router-dom";

export default function Sidebar({ userD }) {
  const suggestions = [
    { id: 1, user: "Aisha", avatar: "https://i.pravatar.cc/100?img=11" },
    { id: 2, user: "Omar", avatar: "https://i.pravatar.cc/100?img=21" },
    { id: 3, user: "Fatima", avatar: "https://i.pravatar.cc/100?img=31" },
  ];
    // const [preview, setPreview] = useState("");
  
// useEffect(() => {
//     if (user?.profilePic) {
//       setPreview(user.profilePic);
//     }
//   }, [user]);
  return (
    <div className="sticky top-6 space-y-6 dark:text-gray-300">
      {/* Profile Preview */}
      <Link to={`/profile/${userD._id}`}>

        <div className="flex items-center space-x-3">
          <img
            src={userD.profilePic ||"https://api.dicebear.com/9.x/thumbs/svg?seed=placeholder"}
            alt="me"
            className="w-12 h-12 rounded-full"
          />
          <div>
            <p className="font-semibold">{userD.username}</p>
            <p className="text-sm text-gray-500">@{userD.username}</p>
          </div>
        </div>
      </Link>

      {/* Suggestions */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-semibold text-gray-500">Suggestions for you</p>
          <button className="text-xs font-bold">See All</button>
        </div>
        {suggestions.map((s) => (
          <div key={s.id} className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <img src={s.avatar} alt={s.user} className="w-10 h-10 rounded-full" />
              <p className="text-sm font-semibold">{s.user}</p>
            </div>
            <button className="text-xs text-blue-500 font-bold">Follow</button>
          </div>
        ))}
      </div>
    </div>
  );
}

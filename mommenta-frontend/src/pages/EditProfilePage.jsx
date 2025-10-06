import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../services";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [formData, setFormData] = useState({
    username: user?.username || "",
    bio: user?.bio || "",
    location: user?.location || "",
    profilePic: null,
  });

  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Set initial profile picture safely
  useEffect(() => {
    if (user?.profilePic) {
      setPreview(user.profilePic);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profilePic: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      const res = await updateProfile(formDataToSend);
      alert("Profile updated successfully!");

      // ✅ Update Auth context and localStorage
      setUser(res.data.user || res.data);
      localStorage.setItem("user", JSON.stringify(res.data.user || res.data));

      navigate(`/profile/${user.username}`);
    } catch (err) {
      console.error("Profile update failed:", err);
      alert("Error updating profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800 dark:text-gray-100">
        Edit Profile
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Profile Picture */}
        <div className="flex flex-col items-center">
          <label htmlFor="profilePic" className="cursor-pointer relative group">
            <img
              src={preview || "/default-avatar.png"}
              alt="Preview"
              className="w-28 h-28 rounded-full object-cover border-4 border-brand transition-transform group-hover:scale-105"
            />
            <div className="absolute bottom-0 bg-black bg-opacity-60 text-white text-xs py-1 px-2 rounded-b-full opacity-0 group-hover:opacity-100 transition">
              Change
            </div>
          </label>
          <input
            id="profilePic"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Username */}
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:text-white"
        />

        {/* Bio */}
        <textarea
          name="bio"
          placeholder="Bio"
          rows="3"
          value={formData.bio}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:text-white"
        ></textarea>

        {/* Location */}
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:text-white"
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand text-white py-2 rounded-lg hover:bg-brand-accent transition disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

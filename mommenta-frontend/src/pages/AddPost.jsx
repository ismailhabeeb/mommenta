// src/pages/AddPost.jsx
import { useState, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import Icon from "@mdi/react";
import { mdiImage, mdiVideo, mdiCamera, mdiEmoticonOutline } from "@mdi/js";
import toast from "react-hot-toast";
import { createPost } from "../services"; // must accept FormData and attach token in request

export default function AddPost() {
    const [caption, setCaption] = useState("");
    const [media, setMedia] = useState([]); // File[]
    const [showEmoji, setShowEmoji] = useState(false);
    const [loading, setLoading] = useState(false);
    const textareaRef = useRef(null);
    const emojiPickerRef = useRef(null);

    // Set page title on mount
    useEffect(() => {
        document.title = "Add New Post | MomentApp";
    }, []);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        setMedia((prev) => [...prev, ...files]);
        e.currentTarget.value = null; // reset input
    };

    const handleEmojiClick = (emojiData) => {
        const emoji = emojiData?.emoji ?? emojiData;
        setCaption((p) => p + emoji);
        textareaRef.current?.focus();
        setShowEmoji(false);
    };

    const removeMediaAt = (idx) => {
        setMedia((prev) => prev.filter((_, i) => i !== idx));
    };

    useEffect(() => {
        return () => {
            media.forEach((f) => {
                try {
                    URL.revokeObjectURL(f.preview);
                } catch { }
            });
        };
    }, []);

    const highlightHashtags = (text) =>
        text
            ? text.replace(/#(\w+)/g, `<span class="text-blue-500 font-semibold">#$1</span>`)
            : "What's happening?";

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!caption.trim() && media.length === 0) return;

        const formData = new FormData();
        formData.append("caption", caption);
        media.forEach((file) => formData.append("media", file));

        setLoading(true);
        try {
            await createPost(formData);
            setCaption("");
            setMedia([]);
            toast.success("✅ Post uploaded successfully!");
        } catch (err) {
            console.error("Upload failed", err);
            const msg = err?.response?.data?.msg ?? "Failed to upload post";
            toast.error("❌ " + msg);
        } finally {
            sessionStorage.removeItem("homePosts");
            sessionStorage.removeItem("homeScrollY");
            sessionStorage.removeItem("homePage");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-black p-6">
            {/* Page header */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Create a Post
            </h1>

            <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-2xl relative"
            >
                {/* Caption + preview */}
                <div className="relative w-full">
                    <div
                        className="absolute top-0 left-0 w-full p-3 pointer-events-none whitespace-pre-wrap break-words text-gray-400"
                        dangerouslySetInnerHTML={{ __html: highlightHashtags(caption) }}
                    />
                    <textarea
                        ref={textareaRef}
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="What's happening?"
                        className="relative w-full resize-none outline-none p-3 pr-10 bg-transparent text-gray-900 dark:text-gray-100 caret-blue-500 min-h-[88px] max-h-44"
                    />
                    <button
                        type="button"
                        onClick={() => setShowEmoji((s) => !s)}
                        className="absolute bottom-3 right-3 text-yellow-500 hover:scale-110 transition-transform"
                        aria-label="Toggle emoji picker"
                    >
                        <Icon path={mdiEmoticonOutline} size={1} />
                    </button>

                    {showEmoji && (
                        <div
                            ref={emojiPickerRef}
                            className="absolute right-0 bottom-14 z-50 shadow-lg"
                            style={{ transform: "translateY(-0.25rem)" }}
                        >
                            <EmojiPicker onEmojiClick={handleEmojiClick} />
                        </div>
                    )}
                </div>

                {/* Media preview */}
                {media.length > 0 && (
                    <div className="mt-4 columns-2 sm:columns-3 gap-3 [column-fill:_balance]">
                        {media.map((file, idx) => {
                            const preview = file.preview || URL.createObjectURL(file);
                            if (!file.preview) file.preview = preview;

                            return (
                                <div
                                    key={idx}
                                    className="mb-3 break-inside-avoid relative rounded-xl overflow-hidden shadow-md hover:rotate-1 hover:scale-[1.02] transition-transform"
                                >
                                    <button
                                        type="button"
                                        onClick={() => removeMediaAt(idx)}
                                        className="absolute z-10 right-2 top-2 bg-black/50 text-white rounded-full p-1 hover:bg-black"
                                    >
                                        ✕
                                    </button>

                                    {file.type.startsWith("video") ? (
                                        <video src={preview} controls className="w-full rounded-xl" />
                                    ) : (
                                        <img src={preview} alt={`preview-${idx}`} className="w-full rounded-xl object-cover" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between mt-4">
                    <div className="flex gap-4">
                        <label className="cursor-pointer" aria-label="Add images">
                            <Icon path={mdiImage} size={1} className="text-blue-500" />
                            <input type="file" accept="image/*" multiple hidden onChange={handleFileChange} />
                        </label>

                        <label className="cursor-pointer" aria-label="Add videos">
                            <Icon path={mdiVideo} size={1} className="text-purple-500" />
                            <input type="file" accept="video/*" multiple hidden onChange={handleFileChange} />
                        </label>

                        <label className="cursor-pointer" aria-label="Use camera">
                            <Icon path={mdiCamera} size={1} className="text-green-500" />
                            <input
                                type="file"
                                accept="image/*,video/*"
                                capture="environment"
                                hidden
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-5 py-2 rounded-xl font-semibold shadow ${loading ? "opacity-70 cursor-not-allowed" : "hover:scale-105 transition-transform"
                            }`}
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                        ) : (
                            "Post"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

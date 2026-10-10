import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "@mdi/react";
import {
  mdiArrowLeft,
  mdiArrowRight,
  mdiClose,
  mdiDeleteOutline,
  mdiEyeOutline,
  mdiPause,
  mdiPlay,
  mdiLoading,
  mdiSend,
  mdiVolumeHigh,
  mdiVolumeOff,
} from "@mdi/js";
import toast from "react-hot-toast";
import {
  deleteStory,
  fetchStoryViewers,
  replyToStory,
  viewStory,
} from "../services";
import { useAuth } from "../context/useAuth";

const IMAGE_DURATION = 6000;
const VIDEO_MAX_DURATION = 30000;

const relativeTime = (date) => {
  const elapsed = Math.max(0, Date.now() - new Date(date).getTime());
  const minutes = Math.floor(elapsed / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const avatarFallback = (username) =>
  `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(username || "mommenta")}`;

export default function StoryViewer({ group, groups = [group], onClose, onViewed, onDeleted }) {
  const { user: currentUser } = useAuth();
  const [activeGroupId, setActiveGroupId] = useState(group?.user?._id);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [viewers, setViewers] = useState(null);
  const [viewersLoading, setViewersLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const videoRef = useRef(null);
  const closeButtonRef = useRef(null);
  const dialogRef = useRef(null);
  const elapsedRef = useRef(0);
  const advancingRef = useRef(false);
  const activeGroup = groups.find((item) => item.user?._id === activeGroupId) || group;
  const stories = activeGroup?.stories || [];
  const story = stories[storyIndex];
  const storyId = story?._id;
  const storyType = story?.type;
  const activeGroupIndex = groups.findIndex((item) => item.user?._id === activeGroupId);
  const isOwner = activeGroup?.user?._id === (currentUser?._id || currentUser?.id);
  const hasPreviousStory = storyIndex > 0 || activeGroupIndex > 0;
  const hasNextStory = storyIndex < stories.length - 1 || activeGroupIndex < groups.length - 1;

  const goNext = useCallback(() => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    elapsedRef.current = 0;
    setProgress(0);
    setViewers(null);
    if (storyIndex < stories.length - 1) setStoryIndex((index) => index + 1);
    else {
      const groupIndex = groups.findIndex((item) => item.user?._id === activeGroupId);
      const nextGroup = groups[groupIndex + 1];
      if (nextGroup) {
        setActiveGroupId(nextGroup.user._id);
        setStoryIndex(0);
      } else onClose();
    }
  }, [activeGroupId, groups, onClose, storyIndex, stories.length]);

  const goPrevious = useCallback(() => {
    advancingRef.current = false;
    elapsedRef.current = 0;
    setProgress(0);
    setViewers(null);
    if (storyIndex > 0) setStoryIndex((index) => index - 1);
    else {
      const groupIndex = groups.findIndex((item) => item.user?._id === activeGroupId);
      const previousGroup = groups[groupIndex - 1];
      if (previousGroup) {
        setActiveGroupId(previousGroup.user._id);
        setStoryIndex(previousGroup.stories.length - 1);
      }
    }
  }, [activeGroupId, groups, storyIndex]);

  useEffect(() => {
    if (!storyId) {
      onClose();
      return;
    }
    elapsedRef.current = 0;
    advancingRef.current = false;
    setProgress(0);
    setMediaLoading(true);
    if (!isOwner) {
      viewStory(storyId).then(() => onViewed(storyId)).catch((error) => {
        if (error.response?.status === 404) {
          toast.error("This story has expired.");
          onDeleted(storyId);
        }
        else console.error("Unable to record story view:", error);
      });
    }
  }, [isOwner, onClose, onDeleted, onViewed, storyId]);

  useEffect(() => {
    if (paused || !storyId || mediaLoading) return undefined;
    const duration = storyType === "video" ? VIDEO_MAX_DURATION : IMAGE_DURATION;
    const timer = window.setInterval(() => {
      elapsedRef.current = Math.min(duration, elapsedRef.current + 50);
      setProgress((elapsedRef.current / duration) * 100);
      if (elapsedRef.current >= duration) goNext();
    }, 50);
    return () => window.clearInterval(timer);
  }, [goNext, mediaLoading, paused, storyId, storyType]);

  useEffect(() => {
    if (!videoRef.current) return;
    if (paused) videoRef.current.pause();
    else if (storyType === "video") {
      videoRef.current.play().catch((error) => {
        if (error.name !== "NotAllowedError") {
          console.error("Story video playback failed:", error);
        }
        setPaused(true);
      });
    }
  }, [paused, storyId, storyType]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowRight") goNext();
      else if (event.key === "ArrowLeft") goPrevious();
      else if (event.code === "Space" && !["INPUT", "TEXTAREA"].includes(event.target.tagName)) {
        event.preventDefault();
        setPaused((value) => !value);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrevious, onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    return () => video?.pause();
  }, [storyId]);

  useEffect(() => {
    const handleTab = (event) => {
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", handleTab);
    return () => window.removeEventListener("keydown", handleTab);
  }, []);

  const showViewers = async () => {
    if (viewers) {
      setViewers(null);
      return;
    }
    setViewersLoading(true);
    try {
      const { data } = await fetchStoryViewers(story._id);
      setViewers(data);
    } catch (error) {
      console.error("Unable to load story viewers:", error);
      toast.error(error.response?.data?.msg || "Unable to load viewers.");
    } finally {
      setViewersLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this story?")) return;
    try {
      const { data } = await deleteStory(story._id);
      toast.success(data.mediaCleanupPending
        ? "Story deleted, but media cleanup needs attention."
        : "Story deleted.");
      onDeleted(story._id);
      if (stories.length === 1) onClose();
      else {
        setStoryIndex((index) => Math.max(0, Math.min(index, stories.length - 2)));
        setProgress(0);
      }
    } catch (error) {
      console.error("Unable to delete story:", error);
      toast.error(error.response?.data?.msg || "Unable to delete story.");
    }
  };

  const handleReply = async (event) => {
    event.preventDefault();
    if (!reply.trim() || sendingReply) return;
    setSendingReply(true);
    try {
      await replyToStory(story._id, { text: reply.trim() });
      setReply("");
      toast.success("Reply sent.");
    } catch (error) {
      console.error("Unable to reply to story:", error);
      toast.error(error.response?.data?.msg || "Unable to send reply.");
    } finally {
      setSendingReply(false);
    }
  };

  if (!story) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-0 sm:p-4"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${activeGroup.user?.fullName || activeGroup.user?.username || "User"}'s story`}
        className="relative flex h-[100dvh] w-full max-w-[min(100vw,28rem)] flex-col overflow-hidden bg-gray-950 text-white sm:h-[min(92dvh,52rem)] sm:rounded-2xl sm:shadow-2xl"
        onPointerDown={() => setPaused(true)}
        onPointerUp={() => setPaused(false)}
        onPointerCancel={() => setPaused(false)}
      >
        <div className="absolute inset-x-0 top-0 z-20 flex gap-1 px-3 pt-3" aria-label="Story progress">
          {stories.map((item, index) => (
            <div key={item._id} className="h-0.5 flex-1 overflow-hidden rounded bg-white/35">
              <div
                className="h-full bg-white transition-[width] duration-75 motion-reduce:transition-none"
                style={{
                  width: index < storyIndex ? "100%" : index === storyIndex ? `${progress}%` : "0%",
                }}
              />
            </div>
          ))}
        </div>

        <header className="absolute inset-x-0 top-3 z-20 flex items-center gap-2 px-3 pt-2">
          <img
            src={activeGroup.user?.profilePic || avatarFallback(activeGroup.user?.username)}
            alt=""
            className="h-9 w-9 rounded-full border border-white/50 object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {activeGroup.user?.fullName || activeGroup.user?.username || "Member"}
            </p>
            <p className="text-xs text-white/75">{relativeTime(story.createdAt)}</p>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setPaused((value) => !value);
            }}
            aria-label={paused ? "Resume story" : "Pause story"}
            className="rounded-full p-2 hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            <Icon path={paused ? mdiPlay : mdiPause} size={0.9} aria-hidden="true" />
          </button>
          {story.type === "video" && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setMuted((value) => !value);
              }}
              aria-label={muted ? "Unmute story video" : "Mute story video"}
              className="rounded-full p-2 hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <Icon path={muted ? mdiVolumeOff : mdiVolumeHigh} size={0.9} aria-hidden="true" />
            </button>
          )}
          {isOwner && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showViewers();
              }}
              aria-label={`View ${story.viewCount || 0} story viewers`}
              className="flex items-center gap-1 rounded-full px-2 py-2 text-sm hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <Icon path={mdiEyeOutline} size={0.9} aria-hidden="true" />
              {story.viewCount || 0}
            </button>
          )}
          {isOwner && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleDelete();
              }}
              aria-label="Delete this story"
              className="rounded-full p-2 hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <Icon path={mdiDeleteOutline} size={0.95} aria-hidden="true" />
            </button>
          )}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
            aria-label="Close story viewer"
            className="rounded-full p-2 hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            <Icon path={mdiClose} size={1} aria-hidden="true" />
          </button>
        </header>

        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
          {story.type === "video" ? (
            <video
              key={story._id}
              ref={videoRef}
              src={story.mediaUrl}
              autoPlay
              playsInline
              muted={muted}
              onLoadedData={() => setMediaLoading(false)}
              onEnded={goNext}
              onError={() => {
                setMediaLoading(false);
                toast.error("This story video couldn't be played.");
              }}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <img
              key={story._id}
              src={story.mediaUrl}
              alt={story.caption || "Story"}
              onLoad={() => setMediaLoading(false)}
              onError={() => {
                setMediaLoading(false);
                toast.error("This story image couldn't be loaded.");
              }}
              className="max-h-full max-w-full object-contain"
            />
          )}
          {mediaLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/25" role="status" aria-label="Loading story media">
              <Icon
                path={mdiLoading}
                size={1.5}
                className="animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            </div>
          )}
          {story.caption && (
            <p className="absolute bottom-5 left-4 right-4 z-10 rounded-lg bg-black/45 px-3 py-2 text-center text-sm shadow">
              {story.caption}
            </p>
          )}

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              goPrevious();
            }}
            disabled={!hasPreviousStory}
            aria-label="Previous story"
            className="absolute inset-y-14 left-0 z-10 flex w-1/5 items-center justify-start px-2 text-white/70 hover:text-white disabled:opacity-0 sm:w-14"
          >
            <Icon path={mdiArrowLeft} size={1.1} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              goNext();
            }}
            aria-label={hasNextStory ? "Next story" : "Close story"}
            className="absolute inset-y-14 right-0 z-10 flex w-1/5 items-center justify-end px-2 text-white/70 hover:text-white sm:w-14"
          >
            <Icon path={mdiArrowRight} size={1.1} aria-hidden="true" />
          </button>

          {isOwner && viewers !== null && (
            <aside className="absolute bottom-16 left-3 right-3 z-20 max-h-48 overflow-y-auto rounded-xl bg-gray-950/95 p-3 shadow-lg">
              <h3 className="mb-2 text-sm font-semibold">
                Viewers{viewersLoading ? "…" : ` (${viewers.length})`}
              </h3>
              {!viewersLoading && viewers.length === 0 && (
                <p className="text-sm text-white/70">No views yet.</p>
              )}
              <ul className="space-y-2">
                {viewers.map(({ user: viewer, viewedAt }) => (
                  <li key={viewer._id} className="flex items-center gap-2 text-sm">
                    <img src={viewer.profilePic || avatarFallback(viewer.username)} alt="" className="h-7 w-7 rounded-full object-cover" />
                    <span className="truncate">{viewer.fullName || viewer.username}</span>
                    {viewedAt && <time className="ml-auto shrink-0 text-xs text-white/60">{relativeTime(viewedAt)}</time>}
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>

        {!isOwner && (
          <form onSubmit={handleReply} className="relative z-20 flex items-center gap-2 border-t border-white/15 bg-gray-950 px-3 py-3">
            <label htmlFor="story-reply" className="sr-only">Reply to story</label>
            <input
              id="story-reply"
              value={reply}
              onChange={(event) => setReply(event.target.value.slice(0, 1000))}
              onFocus={() => setPaused(true)}
              onBlur={() => setPaused(false)}
              placeholder="Reply to story..."
              className="min-w-0 flex-1 rounded-full border border-white/40 bg-transparent px-4 py-2 text-sm text-white placeholder:text-white/60 focus:border-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={!reply.trim() || sendingReply}
              aria-label="Send story reply"
              className="rounded-full p-2 text-purple-200 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white disabled:opacity-40"
            >
              <Icon path={mdiSend} size={0.95} aria-hidden="true" />
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

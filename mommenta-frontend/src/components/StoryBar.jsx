import { useCallback, useEffect, useState } from "react";
import Icon from "@mdi/react";
import { mdiPlus, mdiRefresh } from "@mdi/js";
import { fetchStories } from "../services";
import { useAuth } from "../context/useAuth";
import StoryComposer from "./StoryComposer";
import StoryViewer from "./StoryViewer";

const avatarFallback = (username) =>
  `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(username || "mommenta")}`;

export default function StoryBar() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [viewingGroup, setViewingGroup] = useState(null);

  const loadStories = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await fetchStories();
      setGroups(data);
    } catch (requestError) {
      console.error("Unable to load stories:", requestError);
      setError("Stories couldn't be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  const ownStory = groups.find(
    (group) => group.user?._id === (user?._id || user?.id)
  );

  const updateViewed = useCallback((storyId) => {
    setGroups((current) => current.map((group) => {
      const stories = group.stories.map((story) =>
        story._id === storyId ? { ...story, viewed: true } : story
      );
      return {
        ...group,
        stories,
        hasUnviewed: group.user?._id === (user?._id || user?.id)
          ? false
          : stories.some((story) => !story.viewed),
      };
    }));
  }, [user?._id, user?.id]);

  const removeStory = useCallback((storyId) => {
    setGroups((current) => current
      .map((group) => ({
        ...group,
        stories: group.stories.filter((story) => story._id !== storyId),
      }))
      .filter((group) => group.stories.length > 0)
    );
  }, []);

  const handleViewerClose = useCallback(() => setViewingGroup(null), []);

  const handleStoryDeleted = useCallback((storyId) => {
    removeStory(storyId);
    setViewingGroup((current) => current
      ? { ...current, stories: current.stories.filter((story) => story._id !== storyId) }
      : null
    );
  }, [removeStory]);

  return (
    <section
      aria-label="Stories"
      className="rounded-2xl border border-gray-200 bg-white px-3 py-3 dark:border-gray-800 dark:bg-gray-900 sm:px-4"
    >
      {loading ? (
        <div className="flex gap-4 overflow-hidden py-1" aria-label="Loading stories" aria-busy="true">
          {[0, 1, 2, 3, 4].map((item) => (
            <div key={item} className="flex w-[4.25rem] shrink-0 flex-col items-center gap-2">
              <div className="h-14 w-14 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="h-2 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-3 flex items-center justify-between gap-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
              <p role="alert">{error}</p>
              <button
                type="button"
                onClick={loadStories}
                className="flex shrink-0 items-center gap-1 font-semibold underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
              >
                <Icon path={mdiRefresh} size={0.75} aria-hidden="true" />
                Retry
              </button>
            </div>
          )}
          {!error && groups.length === 0 && (
            <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
              No active stories yet. Share a moment to get started.
            </p>
          )}
          <div className="flex snap-x gap-3 overflow-x-auto overscroll-x-contain pb-1 sm:gap-4">
            <div className="flex w-[4.25rem] shrink-0 flex-col items-center gap-1.5">
              <div className="relative h-14 w-14">
                <button
                  type="button"
                  onClick={() => ownStory && setViewingGroup(ownStory)}
                  disabled={!ownStory}
                  aria-label={ownStory ? "View your story" : "No active story"}
                  className={`h-14 w-14 rounded-full p-[2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                    ownStory ? "bg-gradient-to-br from-brand to-pink-500" : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  <img
                    src={user?.profilePic || avatarFallback(user?.username)}
                    alt=""
                    className="h-full w-full rounded-full border-2 border-white object-cover dark:border-gray-900"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => setComposerOpen(true)}
                  aria-label={ownStory ? "Add another story" : "Create your story"}
                  className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-brand text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand dark:border-gray-900"
                >
                  <Icon path={mdiPlus} size={0.75} aria-hidden="true" />
                </button>
              </div>
              <span className="max-w-full truncate text-center text-xs text-gray-700 dark:text-gray-300">
                Your story
              </span>
            </div>

            {groups.filter((group) => group.user?._id !== (user?._id || user?.id)).map((group) => {
              const displayName = group.user?.fullName || group.user?.username || "Member";
              return (
                <button
                  key={group.user?._id}
                  type="button"
                  onClick={() => setViewingGroup(group)}
                  aria-label={`View ${displayName}'s stories${group.hasUnviewed ? ", unviewed" : ", viewed"}`}
                  className="flex w-[4.25rem] shrink-0 snap-start flex-col items-center gap-1.5 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  <span className={`h-14 w-14 rounded-full p-[2px] ${
                    group.hasUnviewed
                      ? "bg-gradient-to-br from-brand via-purple-500 to-pink-500"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}>
                    <img
                      src={group.user?.profilePic || avatarFallback(group.user?.username)}
                      alt=""
                      className="h-full w-full rounded-full border-2 border-white object-cover dark:border-gray-900"
                    />
                  </span>
                  <span className="max-w-full truncate text-center text-xs text-gray-700 dark:text-gray-300">
                    {displayName}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {composerOpen && (
        <StoryComposer
          onClose={() => setComposerOpen(false)}
          onCreated={async () => {
            setComposerOpen(false);
            await loadStories();
          }}
        />
      )}
      {viewingGroup && (
        <StoryViewer
          group={viewingGroup}
          groups={groups}
          onClose={handleViewerClose}
          onViewed={updateViewed}
          onDeleted={handleStoryDeleted}
        />
      )}
    </section>
  );
}

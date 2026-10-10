import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PostCard from "../components/PostCard";
import {
  fetchExplorePosts,
  fetchTrendingHashtags,
  searchUsers,
} from "../services";

export default function Explore() {
  const [posts, setPosts] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [activeHashtag, setActiveHashtag] = useState("");
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([fetchExplorePosts(), fetchTrendingHashtags()])
      .then(([postResponse, hashtagResponse]) => {
        if (!active) return;
        setPosts(postResponse.data);
        setHashtags(hashtagResponse.data);
        setError("");
      })
      .catch((requestError) => {
        if (!active) return;
        console.error("Unable to load Explore:", requestError);
        setError("Explore could not be loaded. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      setUsers([]);
      setSearchError("");
      return undefined;
    }

    let active = true;
    const timer = window.setTimeout(() => {
      searchUsers(normalizedQuery)
        .then(({ data }) => {
          if (active) {
            setUsers(data);
            setSearchError("");
          }
        })
        .catch((requestError) => {
          if (!active) return;
          console.error("User search failed:", requestError);
          setSearchError("Search is unavailable right now.");
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  const filteredPosts = useMemo(
    () =>
      activeHashtag
        ? posts.filter((post) => post.hashtags?.includes(activeHashtag))
        : posts,
    [activeHashtag, posts]
  );

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 dark:bg-black dark:text-gray-100 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-brand">
            Discover
          </p>
          <h1 className="text-3xl font-heading font-semibold sm:text-4xl">Explore Mommenta</h1>
          <p className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
            Find people and moments from across the community.
          </p>
        </header>

        <section aria-labelledby="people-search-heading" className="mb-8">
          <label
            id="people-search-heading"
            htmlFor="people-search"
            className="mb-2 block text-sm font-semibold"
          >
            Find people
          </label>
          <input
            id="people-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by username"
            className="input max-w-xl"
          />
          {searchError && <p role="alert" className="mt-2 text-sm text-red-600">{searchError}</p>}
          {query.trim() && !searchError && (
            <div className="mt-3 max-w-xl divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white dark:divide-gray-700 dark:border-gray-800 dark:bg-gray-900">
              {users.length ? (
                users.map((person) => (
                  <Link
                    key={person._id}
                    to={`/profile/${person._id}`}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand dark:hover:bg-gray-800"
                  >
                    <img
                      src={person.profilePic || "https://api.dicebear.com/9.x/thumbs/svg?seed=placeholder"}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <span className="font-medium">{person.username}</span>
                  </Link>
                ))
              ) : (
                <p className="p-3 text-sm text-gray-500">No matching people.</p>
              )}
            </div>
          )}
        </section>

        <section aria-labelledby="trending-heading" className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="trending-heading" className="text-lg font-semibold">Trending hashtags</h2>
            {activeHashtag && (
              <button
                type="button"
                onClick={() => setActiveHashtag("")}
                className="text-sm font-medium text-brand hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {hashtags.map((hashtag) => (
              <button
                key={hashtag._id}
                type="button"
                aria-pressed={activeHashtag === hashtag._id}
                onClick={() =>
                  setActiveHashtag((current) => current === hashtag._id ? "" : hashtag._id)
                }
                className={`rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${
                  activeHashtag === hashtag._id
                    ? "border-brand bg-brand text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-brand dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                }`}
              >
                {hashtag._id} <span className="ml-1 opacity-70">{hashtag.count}</span>
              </button>
            ))}
            {!loading && hashtags.length === 0 && (
              <p className="text-sm text-gray-500">No trending hashtags yet.</p>
            )}
          </div>
        </section>

        <section aria-labelledby="popular-posts-heading">
          <h2 id="popular-posts-heading" className="mb-4 text-lg font-semibold">
            {activeHashtag ? `Posts tagged ${activeHashtag}` : "Popular this week"}
          </h2>
          {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
          {loading ? (
            <div className="space-y-4" aria-label="Loading popular posts">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-72 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
              ))}
            </div>
          ) : filteredPosts.length ? (
            <div className="mx-auto max-w-2xl space-y-5">
              {filteredPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            !error && (
              <p className="rounded-2xl border border-dashed border-gray-300 px-6 py-12 text-center text-sm text-gray-500 dark:border-gray-700">
                {activeHashtag ? "No posts match this hashtag yet." : "No popular posts yet."}
              </p>
            )
          )}
        </section>
      </div>
    </main>
  );
}

import { useEffect, useState, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import StoryBar from "../components/StoryBar";
import PostCard from "../components/PostCard";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";
import DesktopNav from "../components/DesktopNav";
import TopBar from "../components/TopBar";
import SkeletonLoader from "../components/SkeletonLoader";

import { fetchPosts } from "../services";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  const [posts, setPosts] = useState(() => {
    // ✅ Restore posts from session storage if available
    const cached = sessionStorage.getItem("homePosts");
    return cached ? JSON.parse(cached) : [];
  });

  const [loading, setLoading] = useState(posts.length === 0);
  const [page, setPage] = useState(() => Number(sessionStorage.getItem("homePage")) || 1);
  const [hasMore, setHasMore] = useState(true);

  const scrollContainerRef = useRef(null);

  // Fetch posts with pagination
  const loadPosts = async (nextPage = page) => {
    try {
      const data = await fetchPosts(nextPage, 10);

      setPosts((prev) => {
        const combined = nextPage === 1 ? data.posts : [...prev, ...data.posts];
        // ✅ Save posts to session storage
        sessionStorage.setItem("homePosts", JSON.stringify(combined));
        return combined;
      });

      setHasMore(data.hasMore);
      setLoading(false);

      // ✅ Save page progress
      sessionStorage.setItem("homePage", nextPage.toString());
    } catch (err) {
      console.error("Error loading posts:", err);
      setLoading(false);
    }
  };

  // Load posts if not already cached
  useEffect(() => {
    if (posts.length === 0) loadPosts();
  }, []);

  // ✅ Restore scroll position
  useEffect(() => {
    const savedScroll = sessionStorage.getItem("homeScrollY");
    if (savedScroll) {
      window.scrollTo(0, parseFloat(savedScroll));
    }

    const handleScroll = () => {
      sessionStorage.setItem("homeScrollY", window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading && posts.length === 0) {
    return <SkeletonLoader />;
  }

  return (
    <div className="relative bg-gray-50 dark:bg-black min-h-screen pt-16">
      <TopBar />

      {/* Left Sidebar */}
      <div className="hidden lg:flex fixed left-6 top-20 w-64 h-[calc(100vh-5rem)]">
        <Sidebar  userD={user}/>
      </div>

      {/* Right Sidebar / DesktopNav */}
      <DesktopNav username={user.username} />

      {/* Center Feed */}
      <div className="flex justify-center w-full pt-4 pb-16">
        <div
          className="flex flex-col max-w-2xl w-full mx-6 lg:mx-0 lg:ml-80 lg:mr-32 space-y-6 overflow-y-auto"
          ref={scrollContainerRef}
        >
          <StoryBar />

          <InfiniteScroll
            dataLength={posts.length}
            next={() => {
              const nextPage = page + 1;
              setPage(nextPage);
              loadPosts(nextPage);
            }}
            hasMore={hasMore}
            loader={<p className="text-center text-gray-500 py-4">Loading more...</p>}
            endMessage={<p className="text-center text-gray-500 py-4">No more posts.</p>}
          >
            <div className="space-y-1">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                  />
                ))
              ) : (
                <p className="text-center text-gray-500">No posts available.</p>
              )}
            </div>
          </InfiniteScroll>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav username={user.username} className="lg:hidden" />
    </div>
  );
}

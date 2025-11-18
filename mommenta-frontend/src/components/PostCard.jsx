import Icon from "@mdi/react";
import {
  mdiHeartOutline,
  mdiCommentOutline,
  mdiShareOutline,
  mdiBookmarkOutline,
  mdiEmoticonOutline,
  mdiVolumeMute,
  mdiVolumeHigh,
} from "@mdi/js";
import { useState, useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import { Link } from "react-router-dom";

// highlight hashtags in caption
function renderCaption(text = "") {
  if (typeof text !== "string") return null;
  return text.split(" ").map((word, idx) =>
    word.startsWith("#") ? (
      <span
        key={idx}
        className="text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline"
      >
        {word}{" "}
      </span>
    ) : (
      word + " "
    )
  );
}



export default function PostCard({ post, currentusername, onUpdateComments }) {
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const commentsContainerRef = useRef(null);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const videoRefs = useRef([]);
  const observer = useRef(null);
const [captionExpanded, setCaptionExpanded] = useState(false);


function renderLongCaption(caption) {
  if (!caption) return "";

  const maxLength = 150; // length before "Read more"

  // If caption is short, return normal highlighted caption
  if (caption.length <= maxLength) return renderCaption(caption);

  return (
    <>
      {captionExpanded
        ? renderCaption(caption)
        : renderCaption(caption.substring(0, maxLength) + "...")}

      <span
        className="text-[12px] text-blue-400 dark:text-blue-400 cursor-pointer ml-1 font-small"
        onClick={() => setCaptionExpanded(!captionExpanded)}
      >
        {captionExpanded ? "Read less" : "Read more"}
      </span>
    </>
  );
}
  // comment functions
  const handlePostComment = () => {
    if (!comment.trim()) return;
    const newComment = { id: Date.now(), user: "You", text: comment };
    onUpdateComments?.(post._id, newComment);
    setComment("");
  };

  useEffect(() => {
    if (commentsContainerRef.current) {
      commentsContainerRef.current.scrollTop =
        commentsContainerRef.current.scrollHeight;
    }
  }, [post.comments, showComments]);

  const toggleCommentExpand = (id) =>
    setExpandedComments((prev) => ({ ...prev, [id]: !prev[id] }));

  const renderCommentText = (c) => {
    const isExpanded = expandedComments[c.id];
    if (c.text.length > 100) {
      return (
        <>
          {isExpanded ? c.text : c.text.substring(0, 100) + "... "}
          <span
            className="text-blue-600 dark:text-blue-400 cursor-pointer ml-1"
            onClick={() => toggleCommentExpand(c.id)}
          >
            {isExpanded ? "Show less" : "Show more"}
          </span>
        </>
      );
    }
    return c.text;
  };

  const mediaItems = post.media || [];

  // autoplay video on scroll into view
  useEffect(() => {
    if (!videoRefs.current) return;

    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            video.play().catch(() => { });
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.6 }
    );

    videoRefs.current.forEach((v) => v && observer.current.observe(v));

    return () => observer.current?.disconnect();
  }, [mediaItems]);

  return (
    <div className="bg-white dark:text-gray-300 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden mb-1 w-full group transition-all ">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link to={`/profile/${post.user?._id}`} className="flex items-center">
          <img
            src={post.user?.profilePic || "https://api.dicebear.com/9.x/thumbs/svg?seed=placeholder"}
            alt={post.user?.username || "user"}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="ml-3">
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {post.user?.username}
            </p>
            <p className="text-xs text-gray-500">
              @{post.user?.username?.toLowerCase()}
            </p>
          </div>
        </Link>
        <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          •••
        </button>
      </div>

      {/* Media Carousel */}
      {mediaItems.length > 0 && (
        <div className="relative">
          {/* Swiper main */}
          <Swiper
            modules={[Navigation, Pagination, Thumbs]}
            spaceBetween={10}
            slidesPerView={1}
            navigation={{
              enabled: true,
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            }}
            pagination={{ clickable: true }}
            thumbs={{ swiper: thumbsSwiper }}
            onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
            className="w-full rounded-lg"
          >
            {mediaItems.map((m, i) => (
              <SwiperSlide key={i}>
                {m.mediaType?.startsWith("video") ? (
                  <div className="relative">
                    <video
                      ref={(el) => (videoRefs.current[i] = el)}
                      src={m.mediaUrl}
                      muted={muted}
                      playsInline
                      className="w-full h-auto max-h-[600px] object-cover rounded-lg"
                    />
                    <button
                      onClick={() => setMuted((prev) => !prev)}
                      className="absolute top-3 right-3 bg-black/60 rounded-full p-2 text-white hover:bg-black/80"
                    >
                      <Icon
                        path={muted ? mdiVolumeMute : mdiVolumeHigh}
                        size={1}
                      />
                    </button>
                  </div>
                ) : (
                  <img
                    src={m.mediaUrl}
                    alt={`media-${i}`}
                    className="w-full h-auto max-h-[600px] object-cover rounded-lg"
                  />
                )}
              </SwiperSlide>
            ))}

            {/* Hide navigation buttons on mobile */}
            <div className="hidden md:block swiper-button-next after:!text-white"></div>
            <div className="hidden md:block swiper-button-prev after:!text-white"></div>
          </Swiper>

          {/* Thumbnails Overlay */}
          {mediaItems.length > 1 && (
            <div
              className="
                absolute bottom-2 left-0 right-0 z-20
                bg-black/40 backdrop-blur-sm rounded-b-lg
                transition-opacity duration-300
                opacity-100 md:opacity-0 md:group-hover:opacity-100
              "
            >
              <Swiper
                modules={[Thumbs]}
                onSwiper={setThumbsSwiper}
                spaceBetween={6}
                slidesPerView={Math.min(mediaItems.length, 6)}
                watchSlidesProgress
                className="px-3 py-2"
              >
                {mediaItems.map((m, i) => (
                  <SwiperSlide key={i} className="cursor-pointer">
                    <div
                      className={`rounded-lg border-2 w-fit ${i === activeIndex
                        ? "border-white"
                        : "border-transparent opacity-80 hover:opacity-100"
                        } transition`}
                    >
                      {m.mediaType?.startsWith("video") ? (
                        <video
                          src={m.mediaUrl}
                          className="w-12 h-12 md:w-10 md:h-10 object-cover rounded-md"
                          muted
                        />
                      ) : (
                        <img
                          src={m.mediaUrl}
                          alt={`thumb-${i}`}
                          className="w-12 h-12 md:w-10 md:h-10 object-cover rounded-md"
                        />
                      )}
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center px-4 py-3 ">
        <div className="flex space-x-4 text-gray-900 dark:text-gray-100 bg-white/30 dark:bg-gray-900/30 backdrop-blur-lg border border-gray-200/40 dark:border-gray-700/40 shadow-lg rounded-3xl px-2 py-1">
          <Icon path={mdiHeartOutline} size={1.3} className="cursor-pointer hover:text-pink-500" />
          <Icon
            path={mdiCommentOutline}
            size={1.3}
            className="cursor-pointer hover:text-blue-500"
            onClick={() => setShowComments(!showComments)}
          />
          <Icon path={mdiShareOutline} size={1.3} className="cursor-pointer hover:text-green-500" />
        </div>
        <div className="bg-white/30 dark:bg-gray-900/30 backdrop-blur-lg border border-gray-200/40 dark:border-gray-700/40 shadow-lg rounded-3xl px-2 py-1">
          <Icon path={mdiBookmarkOutline} size={1.3} className="cursor-pointer hover:text-purple-500 " />
        </div>
      </div>

      {/* Caption */}
      <div className="px-4 text-sm text-gray-900 dark:text-gray-100">
        <p className="font-semibold mb-1 text-purple">{post?.like || 0} likes</p>
        <p className="w-full p-1 rounded-2xl">
          <span className="font-semibold mr-2 bg-gray-200 dark:bg-gray-500 px-2 rounded-3xl">{post.user?.username}</span>
          {/* {renderCaption(post.caption)} */}
          {renderLongCaption(post.caption)}

        </p>
        <div className="text-[10px] text-gray-400 mt-1 text-right">
          {new Date(post?.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      {/* Comments */}
      {showComments && (
        <div
          ref={commentsContainerRef}
          className="px-4 mt-2 max-h-40 overflow-y-auto text-sm text-gray-800 dark:text-gray-200 space-y-1"
        >
          {post.comments?.length > 0 ? (
            post.comments.map((c) => (
              <p key={c.id}>
                <span className="font-semibold mr-2">{c.user}</span>
                {renderCommentText(c)}
              </p>
            ))
          ) : (
            <p className="text-gray-500 text-xs">No comments yet. Be the first!</p>
          )}
        </div>
      )}

      {/* Comment Input */}
      {showComments && (
        <div className="flex items-center border-t border-gray-200 dark:border-gray-800 px-4 py-2 mt-1">
          <Icon
            path={mdiEmoticonOutline}
            size={1.2}
            className="text-gray-500 cursor-pointer mr-2"
          />
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500"
          />
          <button
            onClick={handlePostComment}
            disabled={!comment.trim()}
            className={`ml-2 text-sm font-semibold ${comment.trim()
              ? "text-blue-500"
              : "text-gray-400 cursor-default"
              }`}
          >
            Post
          </button>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import Icon from "@mdi/react";
import {
  mdiCog,
  mdiHeartOutline,
  mdiCommentOutline,
  mdiMessageOutline,
  mdiClose,
} from "@mdi/js";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  startConversation,
  fetchProfile,
  followUser,
  unfollowUser,
  fetchFollowRequests,
  acceptFollowRequest,
  declineFollowRequest,
} from "../services";
import image1 from "../assets/images/Maud.jpg";
import ChatRoom from "./ChatRoom";
import { useChatDrawer } from "../context/useChatDrawer";
import Preloader from "../components/Preloader";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user: currentUser } = useAuth();
  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [followRequests, setFollowRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingChat, setCreatingChat] = useState(false);

  // ✅ Modal state
  const [showChatModal, setShowChatModal] = useState(false);
  // const [activeChat, setActiveChat] = useState(null);

    const { setActiveChat, activeChat } = useChatDrawer();
  
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const res = await fetchProfile(id);
        const data = res.data;
        setProfile({
          ...data.user,
          posts: data.posts,
          isFollowing: data.isFollowing,
          isOwner: data.isOwner,
          isPrivate: data.isPrivate,
          postsCount: data.postsCount,
          followerCount: data.followerCount,
          followingCount: data.followingCount,
        });
        setIsFollowing(data.isFollowing || false);
        setIsPending(data.isPending || false);
        if (data.isOwner) {
          const { data: requests } = await fetchFollowRequests();
          setFollowRequests(requests);
        } else {
          setFollowRequests([]);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadProfile();
  }, [id, currentUser]);

  const handleFollowToggle = async () => {
    try {
      if (isFollowing || isPending) {
        const { data } = await unfollowUser(profile._id);
        setIsFollowing(false);
        setIsPending(Boolean(data.isPending));
      } else {
        const { data } = await followUser(profile._id);
        setIsFollowing(Boolean(data.isFollowing));
        setIsPending(Boolean(data.isPending));
      }
    } catch (err) {
      console.error("Follow/unfollow failed:", err);
      toast.error(err.response?.data?.msg || "Unable to update follow status.");
    }
  };

  const respondToFollowRequest = async (requester, accept) => {
    try {
      if (accept) {
        await acceptFollowRequest(requester._id);
        setProfile((current) => ({
          ...current,
          followerCount: (current.followerCount || current.followers?.length || 0) + 1,
          followers: [...(current.followers || []), requester],
        }));
      } else {
        await declineFollowRequest(requester._id);
      }
      setFollowRequests((current) =>
        current.filter((request) => request._id !== requester._id)
      );
    } catch (err) {
      console.error("Follow request update failed:", err);
      toast.error(err.response?.data?.msg || "Unable to update follow request.");
    }
  };

  // ✅ Open chat modal directly
  const handleMessageClick = async () => {
    try {
      setCreatingChat(true);
      const res = await startConversation(profile._id);
      // setActiveChat(res.data);
      setActiveChat(res.data);
      // openChatDrawer(res.data); // open drawer and load chat
      setShowChatModal(true);
    } catch (err) {
      console.error("Error accessing chat:", err);
      toast.error(err.response?.data?.message || "Unable to open this conversation.");
    } finally {
      setCreatingChat(false);
    }
  };

  const closeChatModal = () => {
    setShowChatModal(false);
    setActiveChat(null);
  };

  if (loading) return <div className="text-center py-10"><Preloader/></div>;
  if (!profile) return <div className="text-center py-10">Profile not found.</div>;

  const isOwner = currentUser?._id === profile._id;

  return (
    <div className="relative max-w-4xl mx-auto px-4 py-6 dark:text-gray-300">
      {/* Header */}
      <div className="flex items-center gap-8">
        <img
          src={profile.profilePic || "https://api.dicebear.com/9.x/thumbs/svg?seed=placeholder"}
          alt="profile"
          className="w-32 h-32 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">{profile.username}</h2>

            {isOwner ? (
              <>
                <Link to="/edit-profile" className="btn-primary text-sm">
                  Edit Profile
                </Link>
                <Link
                  to="/settings"
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <Icon path={mdiCog} size={1} />
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={handleFollowToggle}
                  className={`text-sm px-4 py-1 rounded-lg border transition ${
                    isFollowing || isPending
                      ? "bg-gray-200 dark:bg-gray-700"
                      : "bg-brand text-white"
                  }`}
                >
                  {isFollowing ? "Unfollow" : isPending ? "Requested" : "Follow"}
                </button>

                <button
                  onClick={handleMessageClick}
                  disabled={creatingChat}
                  className="text-sm px-4 py-1 rounded-lg border border-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1"
                >
                  <Icon path={mdiMessageOutline} size={0.8} />
                  {creatingChat ? "Opening..." : "Message"}
                </button>
              </>
            )}
          </div>

          <div className="flex gap-6 mt-3 text-gray-700 dark:text-gray-300">
            <span>
              <b>{profile.postsCount ?? profile.posts?.length ?? 0}</b> posts
            </span>
            <span>
              <b>{profile.followerCount ?? profile.followers?.length ?? 0}</b> followers
            </span>
            <span>
              <b>{profile.followingCount ?? profile.following?.length ?? 0}</b> following
            </span>
          </div>

          <div className="mt-3 dark:text-gray-300">
            <p className="font-medium">{profile.fullName || "No name provided"}</p>
            {profile.bio && <p className="text-sm">{profile.bio}</p>}
            {profile.website && (
              <a
                href={profile.website}
                className="text-brand text-sm"
                target="_blank"
                rel="noreferrer"
              >
                {profile.website}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t mt-6" />

      {profile.isOwner && followRequests.length > 0 && (
        <section aria-labelledby="follow-requests-heading" className="mt-5 rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
          <h3 id="follow-requests-heading" className="mb-3 font-semibold">
            Follow requests ({followRequests.length})
          </h3>
          <ul className="space-y-3">
            {followRequests.map((request) => (
              <li key={request._id} className="flex items-center gap-3">
                <img
                  src={request.profilePic || "https://api.dicebear.com/9.x/thumbs/svg?seed=placeholder"}
                  alt=""
                  className="h-9 w-9 rounded-full object-cover"
                />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{request.username}</span>
                <button
                  type="button"
                  onClick={() => respondToFollowRequest(request, true)}
                  className="rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => respondToFollowRequest(request, false)}
                  className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Decline
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {profile.isPrivate && !profile.isOwner && !isFollowing && (
        <p className="mt-6 rounded-xl bg-gray-100 p-4 text-center text-sm text-gray-600 dark:bg-gray-900 dark:text-gray-300">
          This account is private. Send a follow request to see its posts.
        </p>
      )}

      {/* Tabs */}
      <div className="flex justify-center gap-12 mt-3 text-sm font-medium dark:text-gray-300">
        <button className="pb-2 border-b-2 border-brand dark:text-gray-300">Posts</button>
        <button className="pb-2 border-b-2 border-transparent hover:border-gray-400">
          Saved
        </button>
        <button className="pb-2 border-b-2 border-transparent hover:border-gray-400">
          Tagged
        </button>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-3 gap-1 mt-4">
        {profile.posts?.length > 0 ? (
          profile.posts.map((post, idx) => (
            <div key={idx} className="relative group">
              {post.media?.[0] ? (
                post.media[0].mediaType.startsWith("video") ? (
                  <video
                    src={post.media[0].mediaUrl}
                    className="w-full h-40 object-cover"
                    muted
                    loop
                    autoPlay
                  />
                ) : (
                  <img
                    src={post.media[0].mediaUrl}
                    alt="post"
                    className="w-full h-40 object-cover"
                  />
                )
              ) : (
                <img
                  src={image1}
                  alt="post"
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white gap-4 text-sm transition">
                <span className="flex items-center gap-1">
                  <Icon path={mdiHeartOutline} size={0.9} />{" "}
                  {post.likes?.length || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Icon path={mdiCommentOutline} size={0.9} />{" "}
                  {post.comments?.length || 0}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center text-gray-500 py-10">
            No posts yet.
          </div>
        )}
      </div>

      {/* ✅ Chat Modal */}
      {showChatModal && activeChat && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md h-[600px] flex flex-col shadow-lg relative">
            <button
              className="absolute top-3 right-3 text-gray-600 dark:text-gray-300 hover:text-red-500"
              onClick={closeChatModal}
            >
              <Icon path={mdiClose} size={1} />
            </button>

            <ChatRoom activeChat={activeChat} onBack={closeChatModal} />
          </div>
        </div>
      )}
    </div>
  );
}

import API from "./api";
export const getToken = () => localStorage.getItem("token");
/* ================================
   AUTH
================================ */
export const signup = (data) => API.post("/auth/register", data);                   //done
export const login = (data) => API.post("/auth/login", data);                       //done
export const logout = () => API.post("/auth/logout");
export const getCurrentUser = () => API.get("/auth/me");                            //done

/* ================================
   USERS
================================ */
export const fetchProfile = (userId, page = 1, limit = 9) =>
  API.get(`/users/${userId}?page=${page}&limit=${limit}`);
export const updateProfile = (data) => API.put("/users/update", data);              //done
export const followUser = (userId) => API.put(`/users/${userId}/follow`);
export const unfollowUser = (userId) => API.put(`/users/${userId}/unfollow`);
export const fetchFollowRequests = () => API.get("/users/follow-requests");
export const acceptFollowRequest = (userId) =>
  API.put(`/users/follow-requests/${userId}/accept`);
export const declineFollowRequest = (userId) =>
  API.delete(`/users/follow-requests/${userId}`);
export const fetchFollowers = (userId) => API.get(`/users/${userId}/followers`);
export const fetchFollowing = (userId) => API.get(`/users/${userId}/following`);


/* ================================
   POSTS
================================ */
export const createPost = (formData) =>API.post("/posts", formData );               //done
export const fetchPosts = async (page = 1, limit = 10) => {                         //done
  const { data } = await API.get(`/posts?page=${page}&limit=${limit}`);
  return data;
};
export const fetchPostById = (id) => API.get(`/posts/${id}`);
export const deletePost = (id) => API.delete(`/posts/${id}`);
export const editPost = (id, data) => API.put(`/posts/${id}`, data);
export const likePost = (id) => API.put(`/posts/${id}/like`);
export const addComment = (postId, data) =>
  API.post(`/posts/${postId}/comment`, data);
export const fetchComments = (postId) => API.get(`/posts/${postId}/comments`);

/* ================================
   STORIES
================================ */
export const createStory = (data, config) => API.post("/stories", data, config);
export const fetchStories = () => API.get("/stories");
export const fetchUserStories = (userId) => API.get(`/stories/user/${userId}`);
export const deleteStory = (id) => API.delete(`/stories/${id}`);
export const viewStory = (storyId) => API.post(`/stories/${storyId}/view`);
export const replyToStory = (storyId, data) =>
  API.post(`/stories/${storyId}/reply`, data);
export const fetchStoryViewers = (storyId) =>
  API.get(`/stories/${storyId}/viewers`);

/* ================================
   CHAT / MESSAGES
================================ */
export const fetchConversations = () => API.get("/messages/conversations");
export const fetchMessages = (chatId) => API.get(`/messages/${chatId}`);
export const sendMessage = (chatId, data) =>
  API.post(`/messages/${chatId}`, data);
export const startConversation = (userId) =>
  API.post(`/messages/start/${userId}`);
export const markMessagesRead = (chatId) =>
  API.put(`/messages/${chatId}/read`);



/* ================================
   EXPLORE
================================ */
export const fetchExplorePosts = () => API.get("/explore/posts");
export const fetchTrendingUsers = () => API.get("/explore/users");
export const fetchTrendingStories = () => API.get("/explore/stories");

/* ================================
   HASHTAGS
================================ */
export const fetchPostsByHashtag = (tag) => API.get(`/hashtags/${tag}`);
export const fetchTrendingHashtags = () => API.get("/explore/hashtags");

/* ================================
   NOTIFICATIONS
================================ */
export const fetchNotifications = () => API.get("/notifications");
export const markAsRead = (notifId) =>
  API.put(`/notifications/${notifId}/read`);
export const markAllNotificationsAsRead = () =>
  API.put("/notifications/read-all");
export const clearNotifications = () => API.delete("/notifications");

/* ================================
   SAVE / BOOKMARKS
================================ */
export const savePost = (postId) => API.post(`/saves/${postId}`);
export const unsavePost = (postId) => API.delete(`/saves/${postId}`);
export const fetchSavedPosts = () => API.get("/saves");

/* ================================
   SEARCH
================================ */
export const searchUsers = (query) =>
  API.get(`/search?q=${encodeURIComponent(query)}`);
export const searchPosts = (query) =>
  API.get(`/search/posts?q=${encodeURIComponent(query)}`);
export const searchHashtags = (query) =>
  API.get(`/search/hashtags?q=${encodeURIComponent(query)}`);

/* ================================
   SETTINGS
================================ */
export const updateSettings = (data) => API.put("/settings/profile", data);
export const changePassword = (data) => API.put("/settings/password", data);
export const updatePrivacy = (data) => API.put("/settings/privacy", data);

/* ================================
   ADMIN
================================ */
export const fetchAllUsers = () => API.get("/admin/users");
export const blockUser = (userId) => API.put(`/admin/ban/${userId}`);
export const unblockUser = (userId) => API.put(`/admin/unban/${userId}`);
export const fetchAllPosts = () => API.get("/admin/posts");
export const deletePostAdmin = (postId) => API.delete(`/admin/post/${postId}`);

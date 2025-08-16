/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef, useMemo } from "react";
import PropTypes from "prop-types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { FaUserAlt, FaTrophy, FaCommentDots } from "react-icons/fa";
import { toast } from "sonner"; // ensure you have <Toaster /> mounted at app root

// Ranking component
const RankingList = ({ users }) => (
  <div className="bg-white/95 rounded-2xl border border-emerald-200 shadow-sm p-6">
    <div className="flex items-center justify-center gap-2 mb-5">
      <FaTrophy className="text-yellow-500 w-5 h-5" />
      <h2 className="text-xl font-bold text-emerald-700">Top Contributors</h2>
    </div>
    <ul className="divide-y divide-slate-100">
      {users.map((user, index) => (
        <li
          key={user.username}
          className="py-3 flex items-center gap-3 hover:bg-emerald-50/40 rounded-xl px-2 transition"
        >
          <span className="text-base font-bold text-emerald-700 w-6 text-right">
            {index + 1}.
          </span>
          <div className="flex-1">
            <div className="font-semibold text-slate-800">{user.username}</div>
            <div className="text-xs text-slate-500">{user.likes} Likes</div>
          </div>
        </li>
      ))}
    </ul>
  </div>
);
RankingList.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      username: PropTypes.string.isRequired,
      likes: PropTypes.number.isRequired,
    })
  ).isRequired,
};

// Ranking logic
const calculateUserRanking = (posts) => {
  const userLikes = {};
  posts.forEach(({ username, likes }) => {
    userLikes[username] = (userLikes[username] || 0) + likes;
  });
  return Object.entries(userLikes)
    .map(([username, likes]) => ({ username, likes }))
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 5);
};

const Forum = () => {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState({}); // { [postId]: 'like' | 'dislike' | undefined }
  const [error, setError] = useState("");
  const [comments, setComments] = useState({});
  const [showComments, setShowComments] = useState({});
  const [ranking, setRanking] = useState([]);
  const loadingRef = useRef(false);

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const res = await fetch(
          "https://agritech-hub-b8if.onrender.com/api/forum/posts",
          { signal: controller.signal }
        );
        clearTimeout(timeout);
        const data = await res.json();
        if (res.ok) {
          setPosts(data);
        } else {
          setError(t("error_loading_posts"));
        }
      } catch (err) {
        console.error("Error:", err);
        setError(t("error_fetching_posts"));
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    };
    fetchPosts();
  }, [t]);

  // Ranking
  useEffect(() => {
    if (posts.length) setRanking(calculateUserRanking(posts));
  }, [posts]);

  const fetchComments = async (postId) => {
    if (comments[postId]) return;
    try {
      const res = await fetch(
        `https://agritech-hub-b8if.onrender.com/api/forum/posts/${postId}/comments`
      );
      const data = await res.json();
      if (res.ok) {
        setComments((prev) => ({ ...prev, [postId]: data }));
      }
    } catch {
      setError(t("error_fetching_comments"));
    }
  };

  const toggleComments = (postId) => {
    if (!showComments[postId] && !comments[postId]) {
      fetchComments(postId);
    }
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    const content = newPost.trim();
    if (!content) return setError(t("error_empty_post"));
    setLoading(true);
    try {
      const res = await fetch(
        "https://agritech-hub-b8if.onrender.com/api/forum/posts",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, username: "Anonymous" }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setPosts((prev) => [data, ...prev]);
        setNewPost("");
        toast.success(t("Post created"));
      } else {
        setError(t("error_creating_post"));
        toast.error(t("error_creating_post"));
      }
    } catch {
      setError(t("error_submitting_post"));
      toast.error(t("error_submitting_post"));
    } finally {
      setLoading(false);
    }
  };

  // Like/Dislike handlers with toast and count update
  const handleLike = async (postId) => {
    // Prevent double action on same post
    if (acting[postId]) return;
    setActing((prev) => ({ ...prev, [postId]: "like" }));
    try {
      const res = await fetch(
        `https://agritech-hub-b8if.onrender.com/api/forum/posts/${postId}/like`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error || t("Failed to like post"));
        return;
      }
      // Update counts (use returned counts or fallback)
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                likes:
                  typeof data.likes === "number" ? data.likes : p.likes + 1,
                dislikes:
                  typeof data.dislikes === "number"
                    ? data.dislikes
                    : p.dislikes,
              }
            : p
        )
      );
      toast.success(t("Liked the post") + " 👍");
    } catch (e) {
      toast.error(t("Could not like the post"));
    } finally {
      setActing((prev) => ({ ...prev, [postId]: undefined }));
    }
  };

  const handleDislike = async (postId) => {
    if (acting[postId]) return;
    setActing((prev) => ({ ...prev, [postId]: "dislike" }));
    try {
      const res = await fetch(
        `https://agritech-hub-b8if.onrender.com/api/forum/posts/${postId}/dislike`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error || t("Failed to dislike post"));
        return;
      }
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                dislikes:
                  typeof data.dislikes === "number"
                    ? data.dislikes
                    : p.dislikes + 1,
                likes:
                  typeof data.likes === "number" ? data.likes : p.likes,
              }
            : p
        )
      );
      toast.success(t("Disliked the post") + " 👎");
    } catch (e) {
      toast.error(t("Could not dislike the post"));
    } finally {
      setActing((prev) => ({ ...prev, [postId]: undefined }));
    }
  };

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    const commentText = e.target.comment.value.trim();
    if (!commentText) return;
    try {
      const res = await fetch(
        `https://agritech-hub-b8if.onrender.com/api/forum/posts/${postId}/comment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comment: commentText, username: "Anonymous" }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setComments((prev) => ({
          ...prev,
          [postId]: [data, ...(prev[postId] || [])],
        }));
        e.target.reset();
        toast.success(t("Comment added"));
      } else {
        toast.error(t("Failed to add comment"));
      }
    } catch {
      setError(t("error_adding_comment"));
      toast.error(t("error_adding_comment"));
    }
  };

  const isEmpty = useMemo(
    () => !loading && posts.length === 0 && !error,
    [loading, posts, error]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50/60 px-4 py-8">
      <div className="mx-auto w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main forum */}
        <div className="bg-white/95 rounded-2xl border border-emerald-200 shadow-sm">
          {/* Top bar */}
          <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between p-6 border-b border-slate-100">
            <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-700 tracking-tight">
              {t("community_forum")}
            </h1>
            <div className="flex items-center gap-2">
              <label htmlFor="lang" className="text-sm text-slate-600">
                {t("Language")}
              </label>
              <select
                id="lang"
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                defaultValue={i18n.language || "en"}
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="bn">বাংলা</option>
              </select>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mx-6 mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 text-center">
              ⚠️ {error}
            </div>
          )}

          {/* New Post */}
          <div className="p-6">
            <form onSubmit={handlePostSubmit} className="space-y-3">
              <Input
                type="text"
                placeholder={t("post_placeholder")}
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="border border-emerald-300 bg-emerald-50 rounded-lg px-4 py-3 text-base"
                aria-label={t("post_placeholder")}
              />
              <Button
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-base py-2.5 rounded-lg disabled:opacity-60"
                disabled={loading}
              >
                {loading ? t("posting") : t("post_button")}
              </Button>
            </form>
          </div>

          {/* Feed */}
          <div className="p-6 pt-0 space-y-5">
            {loading && posts.length === 0 && (
              <div className="grid gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse h-24 bg-slate-100 rounded-lg border border-slate-200"
                  />
                ))}
              </div>
            )}

            {isEmpty && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-8 text-center text-slate-600">
                {t("No posts yet. Be the first to share something!")}
              </div>
            )}

            {posts.map((post) => {
              const actingType = acting[post.id];
              const likeDisabled = actingType === "like";
              const dislikeDisabled = actingType === "dislike";

              return (
                <div
                  key={post.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow transition"
                >
                  {/* Post header */}
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-100 ring-1 ring-emerald-200">
                      <FaUserAlt className="text-emerald-700" />
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold text-slate-900">
                        {post.username}
                      </p>
                      <p className="text-xs text-slate-500">
                        {post.createdAt
                          ? new Date(post.createdAt).toLocaleString()
                          : ""}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-slate-800 leading-relaxed">
                    {post.content}
                  </p>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-6 text-sm text-slate-600 mt-4">
                    <button
                      type="button"
                      onClick={() => handleLike(post.id)}
                      disabled={likeDisabled}
                      className={`transition ${
                        likeDisabled
                          ? "opacity-60 cursor-not-allowed"
                          : "hover:text-emerald-700"
                      }`}
                      title="Likes"
                      aria-disabled={likeDisabled}
                    >
                      👍 {post.likes}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDislike(post.id)}
                      disabled={dislikeDisabled}
                      className={`transition ${
                        dislikeDisabled
                          ? "opacity-60 cursor-not-allowed"
                          : "hover:text-rose-600"
                      }`}
                      title="Dislikes"
                      aria-disabled={dislikeDisabled}
                    >
                      👎 {post.dislikes}
                    </button>

                    <button
                      type="button"
                      className="flex items-center gap-2 text-sky-700 hover:text-sky-800 transition"
                      onClick={() => toggleComments(post.id)}
                      aria-expanded={!!showComments[post.id]}
                      aria-controls={`comments-${post.id}`}
                    >
                      <FaCommentDots /> {t("comments")}
                    </button>
                  </div>

                  {/* Comments */}
                  {showComments[post.id] && (
                    <div id={`comments-${post.id}`} className="mt-5">
                      <h4 className="font-semibold text-slate-800 mb-3">
                        💬 {t("comments")}
                      </h4>
                      <ul className="space-y-3">
                        {(comments[post.id] || []).map((comment) => (
                          <li
                            key={comment.id}
                            className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3"
                          >
                            <p className="text-sm font-bold text-emerald-800">
                              {comment.username}
                            </p>
                            <p className="text-sm text-slate-700">
                              {comment.comment}
                            </p>
                          </li>
                        ))}
                      </ul>

                      {/* New comment form */}
                      <form
                        onSubmit={(e) => handleCommentSubmit(e, post.id)}
                        className="mt-4 flex flex-col gap-2"
                      >
                        <Input
                          type="text"
                          name="comment"
                          placeholder={t("add_comment")}
                          required
                          className="bg-white border border-emerald-200 rounded-lg px-3 py-2"
                          aria-label={t("add_comment")}
                        />
                        <Button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg py-2">
                          {t("post_comment")}
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Ranking */}
        <aside className="w-full lg:sticky lg:top-6 h-fit">
          <RankingList users={ranking} />
          <div className="mt-6 bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-sm text-emerald-900">
            💡 Tip: Share clear titles and practical details to help others learn faster.
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Forum;

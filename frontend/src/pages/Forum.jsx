import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { FaUserAlt, FaTrophy, FaCommentDots } from "react-icons/fa";

// 🏆 Ranking Component
const RankingList = ({ users }) => (
  <div className="bg-white rounded-2xl shadow-md p-6">
    <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">
      🏆 Top Contributors
    </h2>
    <ul className="space-y-5">
      {users.map((user, index) => (
        <li key={user.username} className="flex items-center gap-3">
          <span className="text-lg font-bold text-green-600">{index + 1}.</span>
          <FaTrophy className="text-yellow-500 w-5 h-5" />
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800">{user.username}</span>
            <span className="text-sm text-gray-500">{user.likes} 👍 Likes</span>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

// 🧠 Ranking Logic
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
  const [error, setError] = useState("");
  const [comments, setComments] = useState({});
  const [showComments, setShowComments] = useState({});
  const [ranking, setRanking] = useState([]);
  const loadingRef = useRef(false);

  // Fetch Posts
  useEffect(() => {
    const fetchPosts = async () => {
      if (loadingRef.current) return;

      loadingRef.current = true;
      setLoading(true);
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const res = await fetch("https://agritech-hub-b8if.onrender.com/api/forum/posts", {
          signal: controller.signal,
        });
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
      const res = await fetch(`https://agritech-hub-b8if.onrender.com/api/forum/posts/${postId}/comments`);
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
      const res = await fetch("https://agritech-hub-b8if.onrender.com/api/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, username: "Anonymous" }),
      });

      const data = await res.json();
      if (res.ok) {
        setPosts([data, ...posts]);
        setNewPost("");
      } else {
        setError(t("error_creating_post"));
      }
    } catch {
      setError(t("error_submitting_post"));
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    const commentText = e.target.comment.value.trim();
    if (!commentText) return;

    try {
      const res = await fetch(`https://agritech-hub-b8if.onrender.com/api/forum/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: commentText, username: "Anonymous" }),
      });
      const data = await res.json();
      if (res.ok) {
        setComments((prev) => ({
          ...prev,
          [postId]: [data, ...(prev[postId] || [])],
        }));
        e.target.reset();
      }
    } catch {
      setError(t("error_adding_comment"));
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row gap-6 p-6 bg-gradient-to-br from-green-50 to-white">
      {/* Left: Main Forum */}
      <div className="flex-1 bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-green-700">{t("community_forum")}</h1>
          <select
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            className="border border-green-500 py-2 px-4 rounded-lg bg-green-100 shadow-sm"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="bn">বাংলা</option>
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg border border-red-300 mb-4 text-center">
            ⚠️ {error}
          </div>
        )}

        {/* New Post Form */}
        <form onSubmit={handlePostSubmit} className="mb-6 space-y-2">
          <Input
            type="text"
            placeholder={t("post_placeholder")}
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="border border-green-500 bg-green-50 rounded-lg px-4 py-3 text-lg"
          />
          <Button className="w-full bg-green-700 hover:bg-green-800 text-white text-lg py-2 rounded-lg">
            {loading ? t("posting") : t("post_button")}
          </Button>
        </form>

        {/* Post Feed */}
        <div className="space-y-6">
          {loading && posts.length === 0 ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse h-24 bg-gray-200 rounded-lg" />
              ))}
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-gray-50 border border-green-200 rounded-lg p-6 shadow-sm">
                {/* Post Header */}
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-200">
                    <FaUserAlt className="text-gray-700" />
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold">{post.username}</p>
                    <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-gray-800 text-base mb-4">{post.content}</p>

                {/* Post Actions */}
                <div className="flex gap-6 text-sm text-gray-600 mt-2">
                  <span className="hover:text-green-600 cursor-pointer">👍 {post.likes}</span>
                  <span className="hover:text-red-600 cursor-pointer">👎 {post.dislikes}</span>
                  <span
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 cursor-pointer"
                    onClick={() => toggleComments(post.id)}
                  >
                    <FaCommentDots /> {t("comments")}
                  </span>
                </div>

                {/* Comments */}
                {showComments[post.id] && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-700 mb-3">💬 Comments</h4>
                    <ul className="space-y-4">
                      {(comments[post.id] || []).map((comment) => (
                        <li
                          key={comment.id}
                          className="bg-white border border-gray-200 rounded-lg p-3"
                        >
                          <p className="text-sm font-bold text-green-700">{comment.username}</p>
                          <p className="text-sm text-gray-700">{comment.comment}</p>
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
                        className="bg-green-50 border border-green-300 rounded-lg px-3 py-2"
                      />
                      <Button className="w-full bg-green-700 hover:bg-green-800 text-white rounded-lg py-2">
                        {t("post_comment")}
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 📊 Ranking */}
      <aside className="w-full lg:w-1/4">
        <RankingList users={ranking} />
      </aside>
    </div>
  );
};

export default Forum;

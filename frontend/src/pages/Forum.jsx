import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { FaUserAlt, FaTrophy, FaCommentDots } from "react-icons/fa";

// Ranking List Component
const RankingList = ({ users }) => (
  <div className="bg-white rounded-xl shadow-lg p-8">
    <h2 className="text-2xl font-bold text-blue-700 mb-4">Top Users</h2>
    <ul className="space-y-4">
      {users.map((user, index) => (
        <li key={index} className="flex items-center space-x-2">
          <span className="font-semibold">{index + 1}.</span>
          <FaTrophy className="text-yellow-500" />
          <span className="font-semibold">{user.username}</span>
          <span className="text-gray-600">- {user.likes} likes</span>
        </li>
      ))}
    </ul>
  </div>
);

// Calculate user ranking based on likes from posts
const calculateUserRanking = (posts) => {
  const userLikes = {};

  // Aggregate likes for each user based on their posts
  posts.forEach((post) => {
    const { username, likes } = post;
    if (userLikes[username]) {
      userLikes[username] += likes;
    } else {
      userLikes[username] = likes;
    }
  });

  // Convert to an array of objects and sort in descending order by likes
  const ranking = Object.entries(userLikes)
    .map(([username, likes]) => ({ username, likes }))
    .sort((a, b) => b.likes - a.likes);

  return ranking;
};

const Forum = () => {
  const { t, i18n } = useTranslation();

  // State variables
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [comments, setComments] = useState({});
  const [showComments, setShowComments] = useState({});
  const [ranking, setRanking] = useState([]);

  // Fetch forum posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await fetch("https://agritech-hub-b8if.onrender.com/api/forum/posts");
        const data = await response.json();
        if (response.ok) {
          setPosts(data);
        } else {
          setError(t("error_loading_posts"));
        }
      } catch (err) {
        setError(t("error_fetching_posts"));
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [t]);

  // Calculate ranking whenever posts change
  useEffect(() => {
    const ranking = calculateUserRanking(posts);
    setRanking(ranking);
  }, [posts]);

  // Fetch comments for a specific post
  const fetchComments = async (postId) => {
    try {
      const response = await fetch(`https://agritech-hub-b8if.onrender.com/api/forum/posts/${postId}/comments`);
      const data = await response.json();
      if (response.ok) {
        setComments((prev) => ({ ...prev, [postId]: data }));
      }
    } catch {
      setError(t("error_fetching_comments"));
    }
  };

  // Toggle the display of comments for a post
  const toggleComments = (postId) => {
    if (!showComments[postId]) {
      fetchComments(postId);
    }
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  // Handle submission of a new post
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) {
      setError(t("error_empty_post"));
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("https://agritech-hub-b8if.onrender.com/api/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newPost, username: "Anonymous" }),
      });
      if (response.ok) {
        const addedPost = await response.json();
        setPosts([addedPost, ...posts]);
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

  // Handle submission of a new comment for a post
  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    const commentText = e.target.comment.value.trim();
    if (!commentText) return;
    try {
      const response = await fetch(`https://agritech-hub-b8if.onrender.com/api/forum/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: commentText, username: "Anonymous" }),
      });
      if (response.ok) {
        const newComment = await response.json();
        setComments((prev) => ({
          ...prev,
          [postId]: [newComment, ...(prev[postId] || [])],
        }));
        e.target.reset();
      }
    } catch {
      setError(t("error_adding_comment"));
    }
  };

  return (
    <div className="min-h-screen flex flex-row gap-6 p-6 bg-gray-100">
      {/* Left Side: Main Forum Content */}
      <div className="flex-1 bg-white rounded-xl shadow-lg p-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-green-700">{t("community_forum")}</h1>
          <select
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            className="border border-green-500 py-2 px-4 rounded-lg bg-green-50 shadow-sm"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="bn">বাংলা</option>
          </select>
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* New Post Form */}
        <form onSubmit={handlePostSubmit} className="mb-6">
          <Input
            type="text"
            placeholder={t("post_placeholder")}
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="border border-green-500 py-3 px-4 w-full text-lg rounded-lg bg-green-50 shadow-sm focus:ring-green-500"
          />
          <Button className="w-full bg-green-700 hover:bg-green-800 active:bg-green-900 text-white py-3 text-lg rounded-lg shadow-md mt-2">
            {loading ? t("posting") : t("post_button")}
          </Button>
        </form>

        {/* Posts List */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="p-6 bg-gray-50 rounded-lg shadow-md">
              {/* Post Header */}
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-200">
                  <FaUserAlt className="text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-lg">{post.username}</p>
                  <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Post Content */}
              <p className="text-lg text-gray-700 mb-4">{post.content}</p>

              {/* Post Actions */}
              <div className="flex space-x-6 mt-4">
                <button className="text-green-700 hover:text-green-900">👍 {post.likes}</button>
                <button className="text-red-700 hover:text-red-900">👎 {post.dislikes}</button>
                <button
                  className="text-blue-700 hover:text-blue-900 flex items-center"
                  onClick={() => toggleComments(post.id)}
                >
                  <FaCommentDots className="mr-2" /> {t("comments")}
                </button>
              </div>

              {/* Comments Section */}
              {showComments[post.id] && (
                <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
                  <h3 className="font-semibold text-lg">{t("comments")}</h3>
                  <ul className="space-y-4">
                    {(comments[post.id] || []).map((comment) => (
                      <li key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-700 font-medium">{comment.username}:</p>
                        <p className="text-gray-600">{comment.comment}</p>
                      </li>
                    ))}
                  </ul>
                  <form onSubmit={(e) => handleCommentSubmit(e, post.id)} className="mt-4">
                    <Input
                      type="text"
                      name="comment"
                      placeholder={t("add_comment")}
                      className="border border-green-500 py-2 px-4 w-full rounded-xl bg-green-50"
                    />
                    <Button className="mt-2 w-full bg-green-700 hover:bg-green-800 text-white py-2 rounded-lg">
                      {t("post_comment")}
                    </Button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Side: Ranking List */}
      <div className="w-1/4">
        <RankingList users={ranking} />
      </div>
    </div>
  );
};

export default Forum;

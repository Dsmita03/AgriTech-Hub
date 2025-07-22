import express from 'express';
import { db } from '../config/firebase.js'; // Initialized Firebase Firestore
import admin from 'firebase-admin';         // Admin SDK (for timestamps, increments)

const router = express.Router();

// 🟩 GET: All forum posts (sorted by newest)
router.get('/posts', async (req, res) => {
  try {
    const snapshot = await db
      .collection('forumPosts')
      .orderBy('createdAt', 'desc')
      .get();

    const posts = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || null,
      };
    });

    res.status(200).json(posts);
  } catch (err) {
    console.error("❌ Error fetching posts:", err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// 🟩 POST: Create a new forum post
router.post('/posts', async (req, res) => {
  const { content, username } = req.body;

  if (!content?.trim() || !username?.trim()) {
    return res.status(400).json({ error: "Content and username are required" });
  }

  try {
    const newPost = {
      username,
      content,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      likes: 0,
      dislikes: 0,
    };

    const docRef = await db.collection('forumPosts').add(newPost);
    const savedDoc = await docRef.get();

    res.status(201).json({
      id: savedDoc.id,
      ...savedDoc.data(),
      createdAt: savedDoc.data()?.createdAt?.toDate() || null,
    });
  } catch (err) {
    console.error("❌ Error creating post:", err);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// 🟩 POST: Like a post
router.post('/posts/:id/like', async (req, res) => {
  const { id } = req.params;

  try {
    const postRef = db.collection('forumPosts').doc(id);
    await postRef.update({
      likes: admin.firestore.FieldValue.increment(1)
    });
    res.status(200).json({ message: "👍 Post liked successfully" });
  } catch (err) {
    console.error("❌ Error liking post:", err);
    res.status(500).json({ error: "Failed to like post" });
  }
});

// 🟩 POST: Dislike a post
router.post('/posts/:id/dislike', async (req, res) => {
  const { id } = req.params;

  try {
    const postRef = db.collection('forumPosts').doc(id);
    await postRef.update({
      dislikes: admin.firestore.FieldValue.increment(1)
    });
    res.status(200).json({ message: "👎 Post disliked successfully" });
  } catch (err) {
    console.error("❌ Error disliking post:", err);
    res.status(500).json({ error: "Failed to dislike post" });
  }
});

// 🟩 GET: Comments for a specific post
router.get('/posts/:id/comments', async (req, res) => {
  const { id } = req.params;

  try {
    const postRef = db.collection('forumPosts').doc(id);
    const postSnap = await postRef.get();

    if (!postSnap.exists) {
      return res.status(404).json({ error: "Post not found" });
    }

    const commentsSnapshot = await postRef
      .collection('comments')
      .orderBy('createdAt', 'desc')
      .get();

    const comments = commentsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || null,
      };
    });

    res.status(200).json(comments);
  } catch (err) {
    console.error("❌ Error fetching comments:", err);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// 🟩 POST: Add comment to post
router.post('/posts/:id/comment', async (req, res) => {
  const { id } = req.params;
  const { comment, username } = req.body;

  if (!comment?.trim() || !username?.trim()) {
    return res.status(400).json({ error: "Comment and username are required" });
  }

  try {
    const postRef = db.collection('forumPosts').doc(id);
    const postSnap = await postRef.get();

    if (!postSnap.exists) {
      return res.status(404).json({ error: "Post not found" });
    }

    const newComment = {
      comment,
      username,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const commentRef = await postRef.collection('comments').add(newComment);
    const savedComment = await commentRef.get();

    res.status(201).json({
      id: savedComment.id,
      ...savedComment.data(),
      createdAt: savedComment.data()?.createdAt?.toDate() || null,
    });
  } catch (err) {
    console.error("❌ Error adding comment:", err);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// 🔴 Fallback Route
router.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default router;

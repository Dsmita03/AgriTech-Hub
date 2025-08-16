import express from 'express';
import { db } from '../config/firebase.js'; // Your initialized Firestore (Admin SDK)
import admin from 'firebase-admin';

const router = express.Router();

// Convenience alias
const { FieldValue, Timestamp } = admin.firestore;

// Helpers
const isString = (v) => typeof v === 'string';
const norm = (s) => (isString(s) ? s.trim() : '');
const toJsDate = (ts) => (ts instanceof Timestamp ? ts.toDate() : null);

// GET: All forum posts (sorted by newest)
router.get('/posts', async (req, res) => {
  try {
    const snapshot = await db
      .collection('forumPosts')
      .orderBy('createdAt', 'desc')
      .get();

    const posts = snapshot.docs.map((doc) => {
      const data = doc.data() || {};
      return {
        id: doc.id,
        ...data,
        createdAt: toJsDate(data.createdAt),
      };
    });

    res.status(200).json(posts);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

//  POST: Create a new forum post
router.post('/posts', async (req, res) => {
  const content = norm(req.body?.content);
  const username = norm(req.body?.username);

  if (!content || !username) {
    return res.status(400).json({ error: 'Content and username are required' });
  }
  if (content.length > 5_000) {
    return res.status(400).json({ error: 'Content exceeds 5,000 characters' });
  }
  if (username.length > 100) {
    return res.status(400).json({ error: 'Username exceeds 100 characters' });
  }

  try {
    const newPost = {
      username,
      content,
      createdAt: FieldValue.serverTimestamp(),
      likes: 0,
      dislikes: 0,
    };

    const docRef = await db.collection('forumPosts').add(newPost);
    const savedDoc = await docRef.get();
    const data = savedDoc.data() || {};

    res.status(201).json({
      id: savedDoc.id,
      ...data,
      createdAt: toJsDate(data.createdAt),
    });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// POST: Like a post
router.post('/posts/:id/like', async (req, res) => {
  const { id } = req.params;
  try {
    const postRef = db.collection('forumPosts').doc(id);
    const snap = await postRef.get();
    if (!snap.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Ensure likes field exists; increment is safe on missing but we can initialize for clarity
    await postRef.update({
      likes: FieldValue.increment(1),
      // Optionally ensure dislikes exists
      dislikes: FieldValue.increment(0),
    });

    res.status(200).json({ message: '👍 Post liked successfully' });
  } catch (err) {
    console.error('Error liking post:', err);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

// POST: Dislike a post
router.post('/posts/:id/dislike', async (req, res) => {
  const { id } = req.params;
  try {
    const postRef = db.collection('forumPosts').doc(id);
    const snap = await postRef.get();
    if (!snap.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    await postRef.update({
      dislikes: FieldValue.increment(1),
      likes: FieldValue.increment(0),
    });

    res.status(200).json({ message: '👎 Post disliked successfully' });
  } catch (err) {
    console.error('Error disliking post:', err);
    res.status(500).json({ error: 'Failed to dislike post' });
  }
});

// GET: Comments for a specific post
router.get('/posts/:id/comments', async (req, res) => {
  const { id } = req.params;

  try {
    const postRef = db.collection('forumPosts').doc(id);
    const postSnap = await postRef.get();
    if (!postSnap.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const commentsSnapshot = await postRef
      .collection('comments')
      .orderBy('createdAt', 'desc')
      .get();

    const comments = commentsSnapshot.docs.map((doc) => {
      const data = doc.data() || {};
      return {
        id: doc.id,
        ...data,
        createdAt: toJsDate(data.createdAt),
      };
    });

    res.status(200).json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

//  POST: Add comment to post
router.post('/posts/:id/comment', async (req, res) => {
  const { id } = req.params;
  const comment = norm(req.body?.comment);
  const username = norm(req.body?.username);

  if (!comment || !username) {
    return res.status(400).json({ error: 'Comment and username are required' });
  }
  if (comment.length > 2_500) {
    return res.status(400).json({ error: 'Comment exceeds 2,500 characters' });
  }
  if (username.length > 100) {
    return res.status(400).json({ error: 'Username exceeds 100 characters' });
  }

  try {
    const postRef = db.collection('forumPosts').doc(id);
    const postSnap = await postRef.get();
    if (!postSnap.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const newComment = {
      comment,
      username,
      createdAt: FieldValue.serverTimestamp(),
    };

    const commentRef = await postRef.collection('comments').add(newComment);
    const savedComment = await commentRef.get();
    const data = savedComment.data() || {};

    res.status(201).json({
      id: savedComment.id,
      ...data,
      createdAt: toJsDate(data.createdAt),
    });
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Fallback Route
router.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default router;

import express from 'express';
import { db } from '../config/firebase.js'; // Firebase initialized
import admin from 'firebase-admin'; // Ensure Firebase Admin SDK is imported

const router = express.Router();

// Route to fetch all forum posts (sorted by newest first)
router.get('/posts', async (req, res) => {
  try {
    const snapshot = await db.collection('forumPosts')
      .orderBy('createdAt', 'desc') // Sort by latest posts first
      .get();

    const posts = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt ? data.createdAt.toDate() : null, // Convert Firestore Timestamp to Date
      };
    });

    res.status(200).json(posts);
  } catch (err) {
    console.error("Error fetching posts: ", err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// Route to create a new post
router.post('/posts', async (req, res) => {
  const { content, username } = req.body; // Include username in request

  if (!content || !username) {
    return res.status(400).json({ error: "Content and username are required" });
  }

  try {
    const newPost = {
      username,
      content,
      createdAt: admin.firestore.FieldValue.serverTimestamp(), // Set server timestamp
      likes: 0, // Initialize likes count
      dislikes: 0, // Initialize dislikes count
    };

    const docRef = await db.collection('forumPosts').add(newPost);
    const post = await docRef.get();
    res.status(201).json({ id: post.id, ...post.data(), createdAt: post.data().createdAt.toDate() }); // Convert timestamp to Date
  } catch (err) {
    console.error("Error creating post: ", err);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// Route to like a post
router.post('/posts/:id/like', async (req, res) => {
  const { id } = req.params;

  try {
    const postRef = db.collection('forumPosts').doc(id);
    await postRef.update({
      likes: admin.firestore.FieldValue.increment(1),
    });
    res.status(200).json({ message: "Post liked successfully" });
  } catch (err) {
    console.error("Error liking post: ", err);
    res.status(500).json({ error: "Failed to like post" });
  }
});

// Route to dislike a post
router.post('/posts/:id/dislike', async (req, res) => {
  const { id } = req.params;

  try {
    const postRef = db.collection('forumPosts').doc(id);
    await postRef.update({
      dislikes: admin.firestore.FieldValue.increment(1),
    });
    res.status(200).json({ message: "Post disliked successfully" });
  } catch (err) {
    console.error("Error disliking post: ", err);
    res.status(500).json({ error: "Failed to dislike post" });
  }
});

// Route to fetch comments of a specific post
router.get('/posts/:id/comments', async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the post exists before fetching comments
    const postRef = db.collection('forumPosts').doc(id);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return res.status(404).json({ error: "Post not found" });
    }

    const commentsSnapshot = await postRef.collection('comments').orderBy('createdAt', 'desc').get();

    if (commentsSnapshot.empty) {
      return res.status(200).json([]); // Return an empty array instead of 404
    }

    const comments = commentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : null, // Convert Firestore Timestamp to Date
    }));

    res.status(200).json(comments);
  } catch (err) {
    console.error("Error fetching comments: ", err);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// Route to comment on a post
router.post('/posts/:id/comment', async (req, res) => {
  const { id } = req.params;
  const { comment, username } = req.body; // Include comment content and username

  if (!comment || !username) {
    return res.status(400).json({ error: "Comment and username are required" });
  }

  try {
    const postRef = db.collection('forumPosts').doc(id);
    const newComment = {
      username,
      comment,
      createdAt: admin.firestore.FieldValue.serverTimestamp(), // Server timestamp for comments
    };

    // Add the comment to the 'comments' subcollection
    await postRef.collection('comments').add(newComment);

    res.status(201).json({ message: "Comment added successfully" });
  } catch (err) {
    console.error("Error adding comment: ", err);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// Handle 404 errors for undefined routes
router.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default router;

import admin from 'firebase-admin';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Debugging: Check if FIREBASE_SERVICE_ACCOUNT is being loaded
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error("❌ ERROR: FIREBASE_SERVICE_ACCOUNT is not set in .env file!");
  process.exit(1); // Stop execution if the variable is missing
}

// Parse the environment variable correctly
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// Fix private key format (remove extra escape characters)
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
} else {
  admin.app();
}

const db = admin.firestore();

export { db };

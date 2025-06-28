// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Your Firebase config object
// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "aibridge-73844.firebaseapp.com",
  projectId: "aibridge-73844",
  storageBucket: "aibridge-73844.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage and Auth
export const storage = getStorage(app);
export const auth = getAuth(app);
export default app;
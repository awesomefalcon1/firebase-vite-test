// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCW9zYFnCKMqMFHsswQZc5a1nZR21wskq8",
  authDomain: "syntaxual-ai-ed4a2.firebaseapp.com",
  projectId: "syntaxual-ai-ed4a2",
  storageBucket: "syntaxual-ai-ed4a2.firebasestorage.app",
  messagingSenderId: "233797958232",
  appId: "1:233797958232:web:b2c67d4e5c1968e9d1682d",
  measurementId: "G-ZSL04RFCRR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const analytics = getAnalytics(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;
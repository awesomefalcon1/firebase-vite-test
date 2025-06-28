import { auth } from './firebase-config.js';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

export class AuthService {
  constructor() {
    this.currentUser = null;
    this.onAuthStateChangedCallback = null;
  }

  setAuthStateCallback(callback) {
    this.onAuthStateChangedCallback = callback;
  }

  init() {
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      if (this.onAuthStateChangedCallback) {
        this.onAuthStateChangedCallback(user);
      }
    });
  }

  async signInAnonymously() {
    try {
      const result = await signInAnonymously(auth);
      console.log('Signed in anonymously:', result.user.uid);
      return result.user;
    } catch (error) {
      console.error('Anonymous sign-in failed:', error);
      throw error;
    }
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }

  getCurrentUser() {
    return this.currentUser;
  }
}
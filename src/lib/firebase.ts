
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "susu-dashboard",
  appId: "1:5691523884:web:5edac010b66c199348a289",
  storageBucket: "susu-dashboard.firebasestorage.app",
  apiKey: "AIzaSyB8UGS2zjxeCAeHHs6oceWIuXhZ-OaL-4w",
  authDomain: "susu-dashboard.firebaseapp.com",
  messagingSenderId: "5691523884"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };

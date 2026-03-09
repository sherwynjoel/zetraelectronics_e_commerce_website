import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyB7r9NJ3BVwItC37_e4n7zpZ7VLorR9Qec",
    authDomain: "zetraelectronics-c55c1.firebaseapp.com",
    projectId: "zetraelectronics-c55c1",
    storageBucket: "zetraelectronics-c55c1.firebasestorage.app",
    messagingSenderId: "8320225117",
    appId: "1:8320225117:web:d7708f9669f7d1a20822b4",
    measurementId: "G-0ES14GTG5Q"
};

// Initialize Firebase (using a singleton pattern to prevent Next.js hot-reload errors)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider, signInWithPopup };

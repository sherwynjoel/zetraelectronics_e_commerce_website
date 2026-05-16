import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyB7r9NJ3BVwItC37_e4n7zpZ7VLorR9Qec",
    authDomain: "zetraelectronics-c55c1.firebaseapp.com",
    projectId: "zetraelectronics-c55c1",
    storageBucket: "zetraelectronics-c55c1.firebasestorage.app",
    messagingSenderId: "8320225117",
    appId: "1:8320225117:web:5cafe2a7b8522b3c0822b4",
    measurementId: "G-6Q7D4M0YRZ"
};

// Initialize Firebase (using a singleton pattern to prevent Next.js hot-reload errors)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export function isMobileBrowser(): boolean {
    if (typeof navigator === "undefined") return false;
    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

export { app, auth, googleProvider, signInWithPopup, signInWithRedirect, getRedirectResult };

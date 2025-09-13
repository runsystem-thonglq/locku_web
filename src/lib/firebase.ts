import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { initializeAppCheck } from "firebase/app-check";
// import { ReCaptchaV3Provider } from "firebase/app-check";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCvQu0k8Qt6ugLGuw9Pe7O_8Z55uBzPY84",
  authDomain: "lockettt-1be52.firebaseapp.com",
  projectId: "lockettt-1be52",
  storageBucket: "lockettt-1be52.firebasestorage.app",
  messagingSenderId: "940478761197",
  appId: "1:940478761197:web:d58fbeb2eb2bf2cf7fe4e4",
  measurementId: "G-Q83V6038FH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// // Khởi tạo App Check
// const appCheck = initializeAppCheck(app, {
//   provider: new ReCaptchaV3Provider("123456789"), // 👈 key lấy từ console
//   isTokenAutoRefreshEnabled: true, // tự động refresh token
// });

// Patch fetch to log headers
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const [url, options] = args;

  // Log request before sending
  if (options?.headers) {
    console.log("🔥 Request URL:", url);
    console.log("🔥 Headers:", options.headers);
  }

  const response = await originalFetch(...args);

  // Log response headers
  const clone = response.clone();
  clone.headers.forEach((val, key) => {
    if (
      key.toLowerCase().startsWith("x-") ||
      ["content-type"].includes(key.toLowerCase())
    ) {
      console.log(`🔹 Response Header [${key}]:`, val);
    }
  });

  return response;
};

// Auth functions
export const signInAnonymouslyUser = async () => {
  try {
    const result = await signInAnonymously(auth);
    console.log("✅ Signed in anonymously:", result.user.uid);
    return result;
  } catch (error) {
    console.error("❌ Anonymous sign-in failed:", error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log("✅ Signed out successfully");
  } catch (error) {
    console.error("❌ Sign-out failed:", error);
    throw error;
  }
};

// Auth state listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export default app;

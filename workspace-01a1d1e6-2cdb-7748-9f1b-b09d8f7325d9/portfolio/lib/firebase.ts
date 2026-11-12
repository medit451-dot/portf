import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

// Firebase web configuration is intentionally public. Security is enforced by
// Firebase Authentication rules and by the provider settings in the console.
// Environment variables make it easy to use another project in production.
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyD2XFJXdciYgVLdqDXOQGNeQGcy6f7bp-Y",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "portfolio-23104.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "portfolio-23104",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "portfolio-23104.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "204890031860",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:204890031860:web:b3be8f3d972e43efd880a1",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-4QX1WPD4BV",
};

let app: FirebaseApp | undefined;

function getFirebaseApp(): FirebaseApp {
  if (app) return app;
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return app;
}

/**
 * Auth is created only in the browser. This module is imported by a client
 * component, but the guard also keeps server rendering safe.
 */
export function getFirebaseAuth(): Auth | null {
  if (typeof window === "undefined") return null;
  return getAuth(getFirebaseApp());
}

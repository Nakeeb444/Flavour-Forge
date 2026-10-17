import { getApp, getApps, initializeApp } from "firebase/app";

export const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ??
    "AIzaSyAxZL9uxoXJXo07IXzGdcr40caAdOsQWY4",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ??
    "flavour-forge-ff313.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "flavour-forge-ff313",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "519485143032",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ??
    "1:519485143032:web:9bb2ea60c2b964466a080d",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "G-DGEKJK5M09",
};

export const firestoreDatabaseId = "default";
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

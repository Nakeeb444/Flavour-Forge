"use client";

import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import { getAnalytics, isSupported, logEvent } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getMessaging, getToken, isSupported as isMessagingSupported, onMessage } from "firebase/messaging";
import { app, firebaseConfig, firestoreDatabaseId } from "@/lib/src/lib/firebase";

export const auth = getAuth(app);
export const firestore = getFirestore(app, firestoreDatabaseId);
export const functions = getFunctions(app, "asia-south2");

let appCheckInitialized = false;
let analyticsPromise;

export function initializeAppProtection() {
  if (typeof window === "undefined" || appCheckInitialized) return;

  const siteKey = process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY;
  if (!siteKey) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "Firebase App Check is not initialized. Set NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY before production deployment.",
      );
    }
    return;
  }

  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });
  appCheckInitialized = true;
}

export async function trackEvent(name, parameters) {
  if (typeof window === "undefined") return;
  try {
    analyticsPromise ??= isSupported().then((supported) =>
      supported ? getAnalytics(app) : null,
    );
    const analytics = await analyticsPromise;
    if (analytics) logEvent(analytics, name, parameters);
  } catch (error) {
    console.error("Firebase Analytics could not record an event.", error);
  }
}

async function hashToken(token) {
  const bytes = new TextEncoder().encode(token);
  const digest = await window.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export async function enablePushNotifications() {
  if (!process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY) {
    throw new Error(
      "Configure Firebase App Check before enabling push notifications.",
    );
  }
  const supported = await isMessagingSupported();
  if (!supported) {
    throw new Error("Push notifications are not supported in this browser.");
  }
  if (!("Notification" in window)) {
    throw new Error("This browser does not support notifications.");
  }
  if (!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY) {
    throw new Error("Configure NEXT_PUBLIC_FIREBASE_VAPID_KEY to enable notifications.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Allow notifications in your browser to continue.");
  }

  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
  );
  const token = await getToken(getMessaging(app), {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });
  if (!token) throw new Error("Firebase did not return a notification token.");
  return { token, tokenHash: await hashToken(token) };
}

export async function listenForForegroundMessages(callback) {
  if (!(await isMessagingSupported())) return () => {};
  return onMessage(getMessaging(app), (payload) => callback(payload));
}

export { firebaseConfig };

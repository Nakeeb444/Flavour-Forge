const { getApps, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const { setGlobalOptions } = require("firebase-functions");
const { HttpsError, onCall } = require("firebase-functions/v2/https");

const app = getApps().length ? getApps()[0] : initializeApp();
const firestore = getFirestore(app, "default");

setGlobalOptions({ maxInstances: 10, region: "asia-south2" });

exports.sendTestNotification = onCall(
  { enforceAppCheck: true },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in to enable notifications.");
    }

    const devices = await firestore
      .collection("users")
      .doc(request.auth.uid)
      .collection("devices")
      .limit(500)
      .get();
    const registrations = devices.docs.map((device) => ({
      ref: device.ref,
      token: device.data().token,
    })).filter(({ token }) => typeof token === "string" && token.length > 0);

    if (registrations.length === 0) return { sent: 0 };

    const result = await getMessaging().sendEachForMulticast({
      tokens: registrations.map(({ token }) => token),
      notification: {
        title: "Flavour Forge",
        body: "Push notifications are enabled for your account.",
      },
      webpush: { notification: { icon: "/favicon.png" } },
    });

    const staleTokens = registrations
      .filter((_, index) => {
        const errorCode = result.responses[index].error?.code;
        return [
          "messaging/invalid-registration-token",
          "messaging/registration-token-not-registered",
        ].includes(errorCode);
      })
      .map(({ ref }) => ref.delete());
    await Promise.all(staleTokens);

    return { sent: result.successCount };
  },
);

import { getToken, onMessage } from "firebase/messaging";
import { messaging, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export const requestFirebaseToken = async (userId) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (currentToken) {
        console.log('✅ [Push] FCM Token:', currentToken);
        // Save token to user profile
        await setDoc(doc(db, "users", userId), {
          fcmToken: currentToken,
          updatedAt: new Date()
        }, { merge: true });
        return currentToken;
      } else {
        console.warn('❌ No registration token available. Request permission to generate one.');
      }
    }
  } catch (err) {
    console.error('❌ An error occurred while retrieving token:', err);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('🔔 [Push] Foreground message received:', payload);
      resolve(payload);
    });
  });

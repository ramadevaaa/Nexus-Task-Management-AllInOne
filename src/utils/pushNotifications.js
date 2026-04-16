import { getToken, onMessage } from "firebase/messaging";
import { messaging, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export const requestFirebaseToken = async (userId) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('⚠️ [Push] Notification permission denied.');
      return null;
    }

    if (!VAPID_KEY) {
      console.error('❌ [Push] VAPID Key missing in .env!');
      return null;
    }

    const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
    
    if (currentToken) {
      console.log('✅ [Push] FCM Token secured.');
      
      try {
        // Save token to user profile in Firestore
        await setDoc(doc(db, "users", userId), {
          fcmToken: currentToken,
          updatedAt: new Date()
        }, { merge: true });
        console.log('💾 [Push] Token saved to Firestore.');
        return currentToken;
      } catch (dbErr) {
        console.error('❌ [Push] Failed to save token to database (Check Firestore Rules):', dbErr);
      }
    } else {
      console.warn('❌ [Push] No registration token available.');
    }
  } catch (err) {
    console.error('❌ [Push] Error during token retrieval process:', err);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('🔔 [Push] Foreground message received:', payload);
      resolve(payload);
    });
  });

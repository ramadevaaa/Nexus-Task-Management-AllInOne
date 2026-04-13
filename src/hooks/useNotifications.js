import { useState, useCallback } from 'react';
import { messaging, db } from '../firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

export const useNotifications = (user) => {
  const [permission, setPermission] = useState(Notification.permission);
  const [token, setToken] = useState(null);

  const requestPermission = useCallback(async () => {
    try {
      console.log('Requesting permission...');
      const status = await Notification.requestPermission();
      setPermission(status);

      if (status === 'granted') {
        // Replace with your VAPID KEY from Firebase Console
        // Project Settings -> Cloud Messaging -> Web Push certificates
        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
        
        if (!vapidKey) {
          console.error('VAPID Key is missing in .env (VITE_FIREBASE_VAPID_KEY)');
          return;
        }

        const currentToken = await getToken(messaging, { vapidKey });
        
        if (currentToken) {
          console.log('FCM Token:', currentToken);
          setToken(currentToken);

          // Save token to User's Firestore document
          if (user?.uid) {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
              fcmTokens: arrayUnion(currentToken)
            });
          }
        }
      }
    } catch (error) {
      console.error('Notification permission/token error:', error);
    }
  }, [user]);

  // Handle messages when app is in foreground
  const initForegroundListener = useCallback(() => {
    return onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      // You can show a custom toast or alert here
      new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: '/favicon.svg'
      });
    });
  }, []);

  return { permission, token, requestPermission, initForegroundListener };
};

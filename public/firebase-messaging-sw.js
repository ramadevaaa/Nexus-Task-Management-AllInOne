importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Nexus Firebase configuration (Service Worker)
firebase.initializeApp({
  apiKey: "AIzaSyAHRONCp74MeMqZ70SOhaU3RlFWwcO7FEM",
  authDomain: "nexus-167e9.firebaseapp.com",
  projectId: "nexus-167e9",
  storageBucket: "nexus-167e9.firebasestorage.app",
  messagingSenderId: "313836006635",
  appId: "1:313836006635:web:75513ef70e893cd96722ae"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message received:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.svg',
    tag: payload.data?.id || 'nexus-push',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

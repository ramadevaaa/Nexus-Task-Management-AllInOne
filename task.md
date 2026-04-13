# Nexus Project Roadmap

## Phase 6: Nexus Vault (Current)
- [ ] Create "Nexus Vault" section below the Task Queue.
- [ ] Add "+" action button with multi-type options (Notes, Ideas, Learning Media).
- [ ] Implement `VaultCard` component for grid-based display.
- [ ] Setup Firestore logic for storing and retrieving Vault items.
- [ ] Add "Convert to Task" functionality for rapid ideation.

## Phase 7: PWA & Native Notifications (Planned)
- [ ] **Notification Explanation:**
    - **Kenapa notif ga muncul pas web ditutup?** Browser (terutama iOS/Android) mematikan proses JavaScript saat tab tidak aktif untuk hemat baterai.
    - **Solusinya?** 
        1. **PWA (Add to Home Screen):** User harus menambah aplikasi ke home screen agar punya akses background yang lebih luas.
        2. **Service Worker:** Script khusus yang berjalan di background browser.
        3. **Push API (FCM):** Menggunakan Firebase Cloud Messaging untuk mengirim sinyal "bangun" ke HP meskipun app sedang ditutup (seperti Google Calendar).
- [ ] Install `vite-plugin-pwa` dan configure service worker.
- [ ] Create Web App Manifest dan generate PWA icons (192, 512).
- [ ] Enable Firestore Persistence (Offline access).
- [ ] Set up Firebase Cloud Messaging (FCM) for Native Push Notifications.

## Phase 8: Timer & Spotify Refinements (Current)
- [x] Fix Timer Pause behavior (Stay at current minute).
- [ ] Add Custom Playlist support in Spotify Player.
- [ ] Add Input field for Spotify URL transformation.

## Phase 8: Security & Privacy (Planned)
- [ ] **Firebase Security Rules:** Implement strict server-side rules to prevent unauthorized data access.
- [ ] **Privacy Mode (End-to-End Encryption):** Implement client-side encryption for sensitive task data.
- [ ] **Data Anonymization:** Ensure user-identifiable information is separated.

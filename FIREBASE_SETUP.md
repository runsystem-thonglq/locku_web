# Firebase Setup with Logging

This project is configured with Firebase Web SDK and includes request/response header logging for debugging purposes.

## Features

- ✅ Firebase Authentication with anonymous sign-in
- ✅ Request/Response header logging
- ✅ Zustand state management
- ✅ Protected routes
- ✅ Modern UI with Tailwind CSS

## Firebase Configuration

The Firebase config is set up in `src/lib/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyCvQu0k8Qt6ugLGuw9Pe7O_8Z55uBzPY84",
  authDomain: "lockettt-1be52.firebaseapp.com",
  projectId: "lockettt-1be52",
  storageBucket: "lockettt-1be52.firebasestorage.app",
  messagingSenderId: "940478761197",
  appId: "1:940478761197:web:d58fbeb2eb2bf2cf7fe4e4",
  measurementId: "G-Q83V6038FH",
};
```

## Request Logging

The app patches the global `fetch` function to log all Firebase requests and responses:

- **Request logs**: Shows URL and headers before sending
- **Response logs**: Shows important response headers (X-\* and Content-Type)

## How to Test

1. Start the development server: `npm run dev`
2. Open the app in your browser
3. Click "Continue Anonymously" to sign in
4. Open Developer Tools → Console
5. You should see Firebase request logs like:

```
🔥 Request URL: https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=...
🔥 Headers: {
  "Content-Type": "application/json",
  "X-Client-Version": "Web/12.2.1",
  "X-Firebase-GMPID": "1:940478761197:web:d58fbeb2eb2bf2cf7fe4e4",
  "X-Firebase-Client": "H4sIAAAAA...",
  "X-Firebase-AppCheck": "eyJhbGciOiJSUzI1NiIs..."
}
🔹 Response Header [content-type]: application/json; charset=utf-8
```

## State Management

The app uses Zustand for state management:

- **Auth Store**: `src/stores/authStore.ts`
- **Firebase Service**: `src/lib/firebase.ts`
- **Protected Routes**: `src/components/ProtectedRoute.tsx`

## Project Structure

```
src/
├── lib/
│   └── firebase.ts          # Firebase config and auth functions
├── stores/
│   └── authStore.ts         # Zustand auth store
├── components/
│   ├── HomeScreen.tsx       # Main dashboard
│   ├── LoginForm.tsx        # Anonymous sign-in form
│   └── ProtectedRoute.tsx   # Route protection
└── app/
    └── page.tsx             # Main page with ProtectedRoute
```

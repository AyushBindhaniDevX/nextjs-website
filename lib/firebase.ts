// lib/firebase.ts
import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getStorage } from 'firebase/storage'
// WARNING: These are your project's public-facing keys.
// Ensure you have strong security rules in your Firebase console.
const firebaseConfig = {
  apiKey: "AIzaSyCnA0ZVxqFoP0HgOJazks691wnrnpbS4_8",
  authDomain: "expo-exo.firebaseapp.com",
  databaseURL: "https://expo-exo-default-rtdb.firebaseio.com",
  projectId: "expo-exo",
  storageBucket: "expo-exo.firebasestorage.app",
  messagingSenderId: "487683331313",
  appId: "1:487683331313:web:a988d106d962790415c550",
  measurementId: "G-W0VNCFKS7L"
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig)

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(firebaseApp)

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(firebaseApp)

// For backward compatibility
export const getFirebaseDb = () => database
export const getFirebaseStorage = () => storage
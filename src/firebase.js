// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Add this

const firebaseConfig = {
  apiKey: "AIzaSyCJr3azdt0Z_DxOEp6aK6Ierorm3nm22JA",
  authDomain: "event-management-fb520.firebaseapp.com",
  projectId: "event-management-fb520",
  storageBucket: "event-management-fb520.firebasestorage.app",
  messagingSenderId: "511736427007",
  appId: "1:511736427007:web:7b03241f5f688780d3f7ca",
  measurementId: "G-8R361EY3P1",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // Export auth

export { app, db, auth };
console.log("Firebase initialized:", { app, db, auth });
// Optional: Emulator setup (comment out for production)
import { connectFirestoreEmulator } from "firebase/firestore";
import { connectAuthEmulator } from "firebase/auth";

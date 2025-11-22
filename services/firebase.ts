import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// See instructions in the chat to get these keys from console.firebase.google.com
const firebaseConfig = {
  apiKey: "AIzaSyA52PMQ-VzUi_bJc_QECyDHzrY6_9ij4nA",
  authDomain: "student-sphere-d1191.firebaseapp.com",
  projectId: "student-sphere-d1191",
  storageBucket: "student-sphere-d1191.firebasestorage.app",
  messagingSenderId: "6070573208",
  appId: "1:6070573208:web:83677a6f3d01fe16d598ed",
  measurementId: "G-2JDWQNKWZZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore (Database)
export const db = getFirestore(app);
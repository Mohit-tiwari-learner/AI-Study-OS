import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCK4XB32ibje0MIKcRpw4wi-mwSyAjSz_Q",
  authDomain: "ai-study-os-eb3b4.firebaseapp.com",
  projectId: "ai-study-os-eb3b4",
  storageBucket: "ai-study-os-eb3b4.firebasestorage.app",
  messagingSenderId: "628142736402",
  appId: "1:628142736402:web:a604feab14d83f3b5404cb",
  measurementId: "G-Y42678KPE4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only on client side in browser)
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export { analytics };

export default app;

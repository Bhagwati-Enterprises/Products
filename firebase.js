// Bhagwati Enterprises - Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyDm5d9A4gT8-yPBHXbbe1oRfwnuIsD5Pas",
  authDomain: "bhagwati-enterprises-1be1a.firebaseapp.com",
  projectId: "bhagwati-enterprises-1be1a",
  storageBucket: "bhagwati-enterprises-1be1a.firebasestorage.app",
  messagingSenderId: "227916203233",
  appId: "1:227916203233:web:a82c34d307bc95744463a0",
  measurementId: "G-HDCPYHP4ZY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

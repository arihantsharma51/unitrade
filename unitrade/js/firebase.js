// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBr6VRZJO5PTo61w9Pyu0hYJ6kFHkaPmao",
  authDomain: "unitrade-f0f0d.firebaseapp.com",
  projectId: "unitrade-f0f0d",
  storageBucket: "unitrade-f0f0d.firebasestorage.app",
  messagingSenderId: "744192961256",
  appId: "1:744192961256:web:a85459687e4776f264f75d",
  measurementId: "G-FC86W4456B"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

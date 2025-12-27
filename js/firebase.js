// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
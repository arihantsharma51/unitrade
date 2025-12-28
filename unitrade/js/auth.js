import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const email = document.getElementById("email");
const password = document.getElementById("password");
const role = document.getElementById("role");
const msg = document.getElementById("msg");

document.getElementById("signupBtn").onclick = async () => {
  try {
    const userCred = await createUserWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );

    await setDoc(doc(db, "users", userCred.user.uid), {
      email: email.value,
      role: role.value,
      successRate: 100,
      badDeals: 0,
      createdAt: new Date()
    });

    msg.innerText = "Signup successful!";
    window.location.href = "dashboard.html";
  } catch (err) {
    msg.innerText = err.message;
  }
};

document.getElementById("loginBtn").onclick = async () => {
  try {
    await signInWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );

    msg.innerText = "Login successful!";
    window.location.href = "dashboard.html";
  } catch (err) {
    msg.innerText = err.message;
  }
};

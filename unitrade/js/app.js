import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const snap = await getDoc(doc(db, "users", user.uid));

  if (!snap.exists()) {
    document.getElementById("loading").innerText = "User data missing";
    return;
  }

  const role = snap.data().role;

  document.getElementById("loading").style.display = "none";
  ["buyer", "seller", "broker"].forEach(r => {
    document.getElementById(r).style.display = "none";
  });

  document.getElementById(role).style.display = "block";
});

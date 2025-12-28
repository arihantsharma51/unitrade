import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   GLOBAL STATE
========================= */
window._fbToUser = null;
window._fbRequest = null;

/* =========================
   DOM ELEMENTS
========================= */
const welcome = document.getElementById("welcome");
const buyerDiv = document.getElementById("buyer");
const sellerDiv = document.getElementById("seller");
const brokerDiv = document.getElementById("broker");

/* =========================
   AUTH + ROLE HANDLER
========================= */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) return;

  const role = snap.data().role;

  buyerDiv.style.display = "none";
  sellerDiv.style.display = "none";
  brokerDiv.style.display = "none";

  welcome.innerText = `Welcome ${role.toUpperCase()}`;

  if (role === "buyer") {
    buyerDiv.style.display = "block";
    initBuyer();
    loadBuyerRequests();
  }

  if (role === "seller") {
    sellerDiv.style.display = "block";
    initSeller();
    loadSellerRequests();
  }

  if (role === "broker") {
    brokerDiv.style.display = "block";
    initBroker();
  }
});

/* =========================
   BUYER
========================= */
function initBuyer() {
  const searchBtn = document.getElementById("searchBtn");
  const productsList = document.getElementById("productsList");

  searchBtn.onclick = async () => {
    productsList.innerHTML = "Loading...";

    const q = query(
      collection(db, "products"),
      where("location.scope", "==", document.getElementById("filterScope").value),
      where("location.value", "==", document.getElementById("filterValue").value.trim()),
      where("status", "==", "available")
    );

    const snap = await getDocs(q);
    productsList.innerHTML = snap.empty ? "No products found" : "";

    snap.forEach(d => {
      const p = d.data();
      productsList.innerHTML += `
        <div>
          <b>${p.title}</b> ₹${p.price}<br/>
          <button onclick="sendRequest('${d.id}','${p.sellerId}')">
            Request to Buy
          </button>
        </div>
      `;
    });
  };
}

/* =========================
   SEND REQUEST (🔥 FIXED)
========================= */
window.sendRequest = async (productId, sellerId) => {
  await addDoc(collection(db, "requests"), {
    productId,
    sellerId,
    buyerId: auth.currentUser.uid,
    brokerId: null,              // 🔥 REQUIRED FOR BROKER
    status: "pending",
    createdAt: serverTimestamp()
  });

  alert("Request sent 🚀");
};

/* =========================
   BUYER REQUESTS
========================= */
async function loadBuyerRequests() {
  const list = document.getElementById("buyerRequests");
  if (!list) return;

  const q = query(
    collection(db, "requests"),
    where("buyerId", "==", auth.currentUser.uid)
  );

  const snap = await getDocs(q);
  list.innerHTML = snap.empty ? "No requests yet" : "";

  snap.forEach(d => {
    const r = d.data();
    list.innerHTML += `
      <div>
        Status: <b>${r.status}</b><br/>
        ${
          r.status === "accepted"
            ? `<button onclick="openFeedback('${r.sellerId}','${d.id}')">
                Give Feedback
              </button>`
            : ""
        }
      </div>
    `;
  });
}

/* =========================
   SELLER
========================= */
function initSeller() {
  const btn = document.getElementById("addProductBtn");

  btn.onclick = async () => {
    const title = document.getElementById("pTitle").value;
    const desc = document.getElementById("pDesc").value;
    const condition = document.getElementById("pCondition").value;
    const price = Number(document.getElementById("pPrice").value);
    const scope = document.getElementById("pScope").value;
    const scopeValue = document.getElementById("pScopeValue").value.trim();
    const msg = document.getElementById("sellerMsg");

    if (!title || !price || !scopeValue) {
      msg.innerText = "Fill all required fields";
      return;
    }

    await addDoc(collection(db, "products"), {
      title,
      description: desc,
      condition,
      price,
      location: { scope, value: scopeValue },
      sellerId: auth.currentUser.uid,
      status: "available",
      createdAt: serverTimestamp()
    });

    msg.innerText = "Product added successfully 🔥";
  };
}

/* =========================
   SELLER REQUESTS
========================= */
async function loadSellerRequests() {
  const list = document.getElementById("sellerRequests");

  const q = query(
    collection(db, "requests"),
    where("sellerId", "==", auth.currentUser.uid),
    where("status", "==", "pending")
  );

  const snap = await getDocs(q);
  list.innerHTML = snap.empty ? "No pending requests" : "";

  snap.forEach(d => {
    list.innerHTML += `
      <div>
        Buyer: ${d.data().buyerId}<br/>
        <button onclick="acceptRequest('${d.id}')">Accept</button>
        <button onclick="rejectRequest('${d.id}')">Reject</button>
      </div>
    `;
  });
}

window.acceptRequest = async (id) => {
  await updateDoc(doc(db, "requests", id), {
    status: "accepted",
    brokerId: null
  });

  loadSellerRequests();
};


window.rejectRequest = async (id) => {
  await updateDoc(doc(db, "requests", id), { status: "rejected" });
  loadSellerRequests();
};

/* =========================
   BROKER (🔥 WORKING)
========================= */
function initBroker() {
  loadAvailableDeals();
  loadMyDeals();
}

async function loadAvailableDeals() {
  const box = document.getElementById("brokerDeals");
  box.innerHTML = "Loading available deals...";

  const q = query(
    collection(db, "requests"),
    where("status", "==", "accepted"),
    where("brokerId", "==", null)
  );

  const snap = await getDocs(q);
  box.innerHTML = snap.empty ? "No open deals" : "";

  snap.forEach(d => {
    const r = d.data();
    box.innerHTML += `
      <div>
        Product: ${r.productId}<br/>
        Buyer: ${r.buyerId}<br/>
        Seller: ${r.sellerId}<br/>
        <button onclick="claimDeal('${d.id}')">Claim Deal</button>
      </div>
    `;
  });
}

async function loadMyDeals() {
  const box = document.getElementById("myBrokerDeals");
  box.innerHTML = "Loading your deals...";

  const q = query(
    collection(db, "requests"),
    where("brokerId", "==", auth.currentUser.uid),
    where("status", "==", "in_progress")
  );

  const snap = await getDocs(q);
  box.innerHTML = snap.empty ? "No active deals" : "";

  snap.forEach(d => {
    box.innerHTML += `
      <div>
        Deal ID: ${d.id}<br/>
        <button onclick="completeDeal('${d.id}')">Complete Deal</button>
      </div>
    `;
  });
}

window.claimDeal = async (id) => {
  await updateDoc(doc(db, "requests", id), {
    brokerId: auth.currentUser.uid,
    status: "in_progress"
  });
  loadAvailableDeals();
  loadMyDeals();
};

window.completeDeal = async (id) => {
  await updateDoc(doc(db, "requests", id), { status: "completed" });
  loadMyDeals();
};

/* =========================
   FEEDBACK
========================= */
window.openFeedback = (toUserId, requestId) => {
  window._fbToUser = toUserId;
  window._fbRequest = requestId;
  document.getElementById("fbMsg").innerText = "Ready to submit feedback";
};

document.getElementById("sendFeedbackBtn").onclick = async () => {
  const rating = Number(document.getElementById("fbRating").value);
  const comment = document.getElementById("fbComment").value;
  const msg = document.getElementById("fbMsg");

  if (!window._fbToUser || !window._fbRequest) {
    msg.innerText = "Click Give Feedback first";
    return;
  }

  await addDoc(collection(db, "feedbacks"), {
    fromUserId: auth.currentUser.uid,
    toUserId: window._fbToUser,
    requestId: window._fbRequest,
    rating,
    comment,
    createdAt: serverTimestamp()
  });

  msg.innerText = "Feedback submitted ✅";
};

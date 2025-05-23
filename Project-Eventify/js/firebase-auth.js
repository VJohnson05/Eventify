import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
  const firebaseConfig = {
    apiKey: "AIzaSyCFqA-ND0ZUPI-zeXJDPia4FlbYUkFFi_g",
    authDomain: "planitnow-4.firebaseapp.com",
    databaseURL: "https://planitnow-4-default-rtdb.firebaseio.com",
    projectId: "planitnow-4",
    storageBucket: "planitnow-4.appspot.com",
    messagingSenderId: "459500688850",
    appId: "1:459500688850:web:8654582d843e0e4979a40b",
    measurementId: "G-NEBHY93TQW",
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  const db = getDatabase(app);
  const ADMIN_EMAIL = "admin@gmail.com";

  // Fetch user roles from DB
  async function getUserRoles(uid) {
    const dbRef = ref(db);
    try {
      const snapshot = await get(child(dbRef, `users/${uid}`));
      return snapshot.exists() ? snapshot.val().roles || {} : {};
    } catch (error) {
      console.error("Error fetching roles:", error);
      return {};
    }
  }

  // Redirect based on role
  function redirectBasedOnRole(roles) {
    if (roles.admin) {
      window.location.href = "admin-dashboard.html";
    } else if (roles.client && roles.vendor) {
      window.location.href = "select-role.html";
    } else if (roles.client) {
      window.location.href = "client-dashboard.html";
    } else if (roles.vendor) {
      window.location.href = "vendor-dashboard.html";
    } else {
      alert("Unknown or missing role.");
    }
  }

  // Google Login
  document.getElementById("google-login")?.addEventListener("click", async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const roles = await getUserRoles(user.uid);
      redirectBasedOnRole(roles);
    } catch (error) {
      alert("Google login failed: " + error.message);
    }
  });

  // Google Register
  document.getElementById("google-register")?.addEventListener("click", async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const roleCheckboxes = document.querySelectorAll('input[name="role"]:checked');
      if (roleCheckboxes.length === 0) {
        alert("Please select at least one role before clicking Google Register.");
        return;
      }

      const roles = {};
      roleCheckboxes.forEach((checkbox) => {
        roles[checkbox.value] = true;
      });

      if (roles.admin && user.email !== ADMIN_EMAIL) {
        alert("Only authorized users can register as admin.");
        return;
      }

      await set(ref(db, "users/" + user.uid), {
        username: user.displayName || "Google User",
        email: user.email,
        roles: roles,
      });

      alert("Registered with Google successfully.");
      redirectBasedOnRole(roles);
    } catch (error) {
      alert("Google registration failed: " + error.message);
    }
  });

  // Email Login
  document.getElementById("login-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const roles = await getUserRoles(userCredential.user.uid);
      redirectBasedOnRole(roles);
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  });

  // Email Register
  document.getElementById("register-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    const roleCheckboxes = document.querySelectorAll('input[name="role"]:checked');
    if (roleCheckboxes.length === 0) {
      alert("Please select at least one role.");
      return;
    }

    const roles = {};
    roleCheckboxes.forEach((checkbox) => {
      roles[checkbox.value] = true;
    });

    if (roles.admin && email !== ADMIN_EMAIL) {
      alert("Only authorized users can register as admin.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await set(ref(db, "users/" + userCredential.user.uid), {
        username,
        email,
        roles,
      });

      alert("Registration successful!");
      redirectBasedOnRole(roles);
    } catch (error) {
      alert("Registration failed: " + error.message);
    }
  });
});
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

// Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Handle user authentication and role logic
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const snapshot = await get(child(ref(db), `users/${user.uid}`));
            if (snapshot.exists()) {
                const userData = snapshot.val();
                const roles = userData.roles || {};
                const roleCount = Object.keys(roles).length;

                // Check if user has the 'client' role
                if (!roles.client) {
                    alert("Access denied. You are not a client.");
                    window.location.href = "auth.html"; // Or redirect to a common page
                    return;
                }

                // Show username
                const usernameDisplay = document.getElementById("username");
                if (user.displayName) {
                    usernameDisplay.textContent = `Welcome, ${user.displayName}`;
                } else if (userData.username) {
                    usernameDisplay.textContent = `Welcome, ${userData.username}`;
                } else {
                    usernameDisplay.textContent = `Welcome, User`;
                }

                // Show or hide switch role button
                const switchBtn = document.getElementById("switch-role-btn");
                if (switchBtn && roleCount < 2) {
                    switchBtn.style.display = "none";
                }
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }

        // Handle logout
        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                auth.signOut().then(() => {
                    window.location.href = "auth.html";
                }).catch((error) => {
                    console.error("Logout error:", error);
                    alert("Failed to log out. Please try again.");
                });
            });
        }
    } else {
        alert("You must be logged in.");
        window.location.href = "auth.html";
    }
});
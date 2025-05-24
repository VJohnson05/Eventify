// Feedback Form Submission 
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js"; 
import { getDatabase, ref, push, get } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js"; 
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// Firebase config 
const firebaseConfig = { 
    apiKey: "AIzaSyCFqA-ND0ZUPI-zeXJDPia4FlbYUkFFi_g", 
    authDomain: "planitnow-4.firebaseapp.com", 
    databaseURL: "https://planitnow-4-default-rtdb.firebaseio.com", 
    projectId: "planitnow-4", 
    storageBucket: "planitnow-4.appspot.com", 
    messagingSenderId: "459500688850", 
    appId: "1:459500688850:web:8654582d843e0e4979a40b", 
    measurementId: "G-NEBHY93TQW" 
};

// Initialize Firebase 
const app = initializeApp(firebaseConfig); 
const db = getDatabase(app); 
const auth = getAuth(app);

// Show dashboard links based on roles
const adminLink = document.getElementById("admin-dashboard-link"); 
const clientLink = document.getElementById("client-dashboard-link"); 
const vendorLink = document.getElementById("vendor-dashboard-link");

onAuthStateChanged(auth, async (user) => { 
    if (user) { try { 
        // Fetch user roles from Firebase 
        const userRef = ref(db, `users/${user.uid}`); 
        const snapshot = await get(userRef); 
        const userData = snapshot.val(); 
        const roles = userData?.roles || {};

// Show dashboard links based on roles
        if (roles.admin) {
            adminLink.style.display = "block";
        }
        if (roles.client) {
            clientLink.style.display = "block";
        }
        if (roles.vendor) {
            vendorLink.style.display = "block";
        }
    } catch (error) {
        console.error("Failed to fetch user roles:", error);
    }
} else {
    adminLink.style.display = "none";
    clientLink.style.display = "none";
    vendorLink.style.display = "none";
}

});
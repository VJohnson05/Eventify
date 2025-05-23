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
    clientLink.style.display = "none";
    vendorLink.style.display = "none";
}

});

// Feedback form submission 
const feedbackForm = document.getElementById("feedback-form"); 
feedbackForm.addEventListener("submit", async (e) => { 
    e.preventDefault();

const rating = document.getElementById("rating").value;
const message = document.getElementById("message").value.trim();

// Use currentUser to get logged-in user
    const user = auth.currentUser;

    if (user) {
        try {
            // Fetch user data (to get userName)
            const userRef = ref(db, `users/${user.uid}`);
            const snapshot = await get(userRef);
            const userData = snapshot.val();
            const userName = userData?.username || "Anonymous";

            // Save feedback with userId and userName
            const feedbackRef = ref(db, "feedback/");
            await push(feedbackRef, {
                userId: user.uid,
                userName: userName,
                rating,
                message,
                submittedAt: new Date().toISOString()
            });

            alert("Thank you for your feedback!");
            feedbackForm.reset();

        } catch (error) {
            console.error("Feedback submission failed:", error);
            alert("Failed to submit feedback. Please try again.");
        }
    } else {
        alert("Please log in to submit your feedback.");
        window.location.href = "auth.html";
    }
});
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js"; 
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js"; 
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

// DOM Elements 
const bookingList = document.getElementById("client-bookings");

// Load Client Bookings 
onAuthStateChanged(auth, (user) => { 
    if (!user) {
        console.log("User not authenticated. Redirecting to login.");
        window.location.href = "auth.html";
        return;
    }

    console.log("User authenticated:", user.uid);
    const userRef = ref(db, `users/${user.uid}`);

    onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        const roles = userData?.roles || {};
        if (!roles.client) {
            alert("You need to have a client account to view your bookings.");
            window.location.href = "auth.html";
            return;
        }
        console.log("Loading client bookings...");
        const bookingsRef = ref(db, `bookings`);
        onValue(bookingsRef, (snapshot) => {
 
let bookings = [];
snapshot.forEach((vendorSnap) => {
    vendorSnap.forEach((bookingSnap) => {
        const bookingData = bookingSnap.val();
        if (bookingData.clientId === user.uid) {
            bookings.push(bookingData);
        }
    });
});

// Sort by bookingDate in descending order
bookings.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

// Render sorted bookings
if (bookings.length > 0) {
    let bookingsHTML = bookings.map(bookingData => `
        <div class="booking-item">
            <h3>${bookingData.serviceName}</h3>
            <p><strong>Price:</strong> ₹${bookingData.servicePrice}</p>
            <p><strong>Event Date:</strong> ${bookingData.eventDate}</p>
            <p><strong>Location:</strong> ${bookingData.eventLocation}</p>
            <p><strong>Guest Count:</strong> ${bookingData.guestCount}</p>
            <p><strong>Special Requirements:</strong> ${bookingData.specialRequirements || "None"}</p>
            <p><strong>Contact Info:</strong> ${bookingData.contactInfo}</p>
            <p><strong>Booking Date:</strong> ${new Date(bookingData.bookingDate).toLocaleString()}</p>
            <p><strong>Status:</strong> <span class="status-badge ${bookingData.status.replace(/\s+/g, '-').toLowerCase()}">${bookingData.status}</span></p>
        </div>
    `).join("");
    bookingList.innerHTML = bookingsHTML;
} else {
    bookingList.innerHTML = "<p>No bookings found.</p>";
}
    }, (error) => {
        console.error("Error loading bookings:", error);
        bookingList.innerHTML = "<p>Failed to load bookings. Please try again later.</p>";
    });

    }, (error) => {
        console.error("Error fetching user data:", error);
        alert("Failed to load user data. Please try again later.");
        window.location.href = "auth.html";
    });
});
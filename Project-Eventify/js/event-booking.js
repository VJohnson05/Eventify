// Check Authentication and Role 
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getDatabase, ref, onValue, push } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// Firebase config 
const firebaseConfig = { 
    apiKey: "AIzaSyCFqA-ND0ZUPI-zeXJDPia4FlbYUkFFi_g", 
    authDomain: "planitnow-4.firebaseapp.com", 
    databaseURL: "https://planitnow-4-default-rtdb.firebaseio.com", 
    projectId: "planitnow-4", 
    torageBucket: "planitnow-4.appspot.com", 
    messagingSenderId: "459500688850", 
    appId: "1:459500688850:web:8654582d843e0e4979a40b", 
    measurementId: "G-NEBHY93TQW" };

// Initialize Firebase 
const app = initializeApp(firebaseConfig); 
const db = getDatabase(app); 
const auth = getAuth(app);

// Role Check 
onAuthStateChanged(auth, (user) => { 
    if (user) { console.log("User is authenticated:", user.uid); 
        const userRef = ref(db, `users/${user.uid}`);

onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        console.log("User data:", userData);
        const roles = userData?.roles || {};

        // Only allow users with client role to access
        if (roles.client || (roles.client && roles.vendor)) {
            console.log("User is authorized to book services.");
        } else {
            alert("You need to have a client account to book services.");
            window.location.href = "auth.html";
        }
    }, (error) => {
        console.error("Error fetching user data:", error);
    });
} else {
    // Redirect to login if not authenticated
    console.log("User is not authenticated, redirecting to login.");
    window.location.href = "auth.html";
}

});

// Set Minimum Event Date 
window.addEventListener("load", () => { 
    const eventDateInput = document.getElementById("event-date"); 
    const today = new Date().toISOString().split("T")[0]; eventDateInput.setAttribute("min", today);

// Pre-fill Vendor Details from URL 
const urlParams = new URLSearchParams(window.location.search); 
const vendorId = urlParams.get("vendorId"); 
const serviceName = urlParams.get("serviceName"); 
const servicePrice = urlParams.get("servicePrice");

if (vendorId && serviceName && servicePrice) {
    document.getElementById("vendor-id").value = vendorId;
    document.getElementById("service-name").value = decodeURIComponent(serviceName);
    document.getElementById("service-price").value = decodeURIComponent(servicePrice);

    // Display vendor info
    const vendorInfo = `${decodeURIComponent(serviceName)} - ₹${decodeURIComponent(servicePrice)}`;
    document.getElementById("vendor-info").textContent = vendorInfo;
} else {
    console.error("Vendor details are missing in the URL.");
}

});

// Handle Booking Form Submission 
const bookingForm = document.getElementById("booking-form");

bookingForm.addEventListener("submit", (e) => { e.preventDefault();

const clientName = document.getElementById("client-name").value;
const eventDate = document.getElementById("event-date").value; 
const eventLocation = document.getElementById("event-location").value; 
const guestCount = document.getElementById("guest-count").value; 
const specialRequirements = document.getElementById("special-requirements").value; 
const contactInfo = document.getElementById("contact-info").value;

// Get the vendor ID from URL
const urlParams = new URLSearchParams(window.location.search);
const vendorId = urlParams.get("vendorId");
const serviceName = urlParams.get("serviceName");
const servicePrice = urlParams.get("servicePrice");

if (!vendorId || !serviceName || !servicePrice) {
    alert("Vendor details are missing. Please try again.");
    return;
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        // Save booking details to Firebase
        const bookingRef = ref(db, `bookings/${vendorId}`);
        push(bookingRef, {
            clientId: user.uid,
            clientName,
            vendorId,
            serviceName: decodeURIComponent(serviceName),
            servicePrice: decodeURIComponent(servicePrice),
            eventDate,
            eventLocation,
            guestCount,
            specialRequirements,
            contactInfo,
            bookingDate: new Date().toISOString(),
            status: "Pending"
        }).then(() => {
            alert("Booking confirmed!");
            window.location.href = "thank-you.html";
        }).catch((error) => {
            console.error("Booking failed:", error);
            alert("Booking failed. Please try again.");
        });

    } else {
        window.location.href = "auth.html";
    }
});

});
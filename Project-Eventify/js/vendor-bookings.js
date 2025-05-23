import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";
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
const bookingList = document.getElementById("vendor-bookings");

// Load Vendor Bookings
onAuthStateChanged(auth, (user) => {
    if (!user) {
        console.log("User not authenticated. Redirecting to login.");
        window.location.href = "auth.html";
        return;
    }

    console.log("Vendor authenticated:", user.uid);
    const userRef = ref(db, `users/${user.uid}`);

    onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        const roles = userData?.roles || {};

        if (!roles.vendor) {
            alert("You need to have a vendor account to view your bookings.");
            window.location.href = "auth.html";
            return;
        }

        console.log("Loading vendor bookings...");
        const bookingsRef = ref(db, `bookings/${user.uid}`);
        onValue(bookingsRef, (snapshot) => {
            let bookingsHTML = "";
            let bookings = [];

            snapshot.forEach((bookingSnap) => {
                const bookingData = bookingSnap.val();
                bookingData.bookingId = bookingSnap.key; // Store ID for later use
                bookings.push(bookingData);
            });

            if (bookings.length > 0) {
                // Sort by bookingDate descending
                bookings.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

                bookings.forEach((bookingData) => {
                    const clientName = bookingData.clientName || "Unknown Client";

                    const statuses = ["Pending Confirmation", "Confirmed", "Declined", "In Progress", "Completed", "Cancelled"];
                    let statusOptions = statuses.map(status => 
                        `<option value="${status}" ${bookingData.status === status ? "selected" : ""}>${status}</option>`
                    ).join("");

                    bookingsHTML += `
                        <div class="booking-item">
                            <h3>${bookingData.serviceName}</h3>
                            <p><strong>Price:</strong> ₹${bookingData.servicePrice}</p>
                            <p><strong>Client:</strong> ${clientName}</p>
                            <p><strong>Event Date:</strong> ${bookingData.eventDate}</p>
                            <p><strong>Location:</strong> ${bookingData.eventLocation}</p>
                            <p><strong>Guest Count:</strong> ${bookingData.guestCount}</p>
                            <p><strong>Contact Info:</strong> ${bookingData.contactInfo}</p>
                            <p><strong>Special Requirements:</strong> ${bookingData.specialRequirements || "None"}</p>
                            <p><strong>Booking Date:</strong> ${new Date(bookingData.bookingDate).toLocaleString()}</p>
                            <p><strong>Status:</strong> <span class="status-badge ${bookingData.status.replace(/\s+/g, '-').toLowerCase()}">${bookingData.status}</span></p>

                            <div class="booking-status">
                                <label for="status-select-${bookingData.bookingId}"><strong>Update Status:</strong></label>
                                <select id="status-select-${bookingData.bookingId}" onchange="updateBookingStatus('${user.uid}', '${bookingData.bookingId}', this.value)">
                                    <option value="" disabled>Change Status</option>
                                    ${statusOptions}
                                </select>
                            </div>
                        </div>
                    `;
                });

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

window.updateBookingStatus = (vendorId, bookingId, newStatus) => {
    const bookingRef = ref(db, `bookings/${vendorId}/${bookingId}`);
    update(bookingRef, { status: newStatus })
        .then(() => {
            alert("Booking status updated successfully.");
        })
        .catch((error) => {
            console.error("Error updating booking status:", error);
            alert("Failed to update booking status. Please try again later.");
        });
};
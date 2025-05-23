// Admin Dashboard - User Management 
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js"; 
import { getDatabase, ref, onValue, update, remove, get, child } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js"; 
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
const userTable = document.getElementById("user-table"); 
const serviceTable = document.getElementById("service-table");
const usernameDisplay = document.getElementById("username"); 
const logoutBtn = document.getElementById("logout-btn");
const userSearchInput = document.getElementById("user-search");
const serviceSearchInput = document.getElementById("service-search");

// Handle user authentication and role logic 
onAuthStateChanged(auth, async (user) => { 
    if (user) { 
        try { 
            const snapshot = await get(child(ref(db), `users/${user.uid}`)); 
            if (snapshot.exists()) { 
                const userData = snapshot.val();

// === ADMIN ACCESS CHECK ===
                const ADMIN_UID = "q5SzFYYu7Ef1qOw1XNgfy1blD0U2"; // admin UID
                if (user.uid !== ADMIN_UID) {
                    alert("Access denied. Admins only.");
                    auth.signOut().then(() => {
                    window.location.href = "auth.html";
                 });
                return;
                }

// Display the username
            const displayName = user.displayName || userData.username || "User";
            usernameDisplay.textContent = `${displayName}`;

            // Load all users
            loadUsers();
        } else {
            alert("User data not found. Please contact support.");
            auth.signOut();
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        alert("Failed to load user data. Please try again later.");
    }

    // Logout
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

// Load Users with Search Support
function loadUsers() {
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
        const searchTerm = userSearchInput.value.trim().toLowerCase();
        userTable.innerHTML = "";
        snapshot.forEach((userSnap) => {
            const user = userSnap.val();
            const username = user.username || "Unknown";
            const email = user.email || "Unknown";

            // Only include users that match the search term
            if (username.toLowerCase().includes(searchTerm) || email.toLowerCase().includes(searchTerm)) {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${userSnap.key}</td>
                    <td>${username}</td>
                    <td>${email}</td>
                    <td>${Object.keys(user.roles || {}).join(", ") || "None"}</td>
                    <td>
                        <button class="edit-btn" data-id="${userSnap.key}">Edit</button>
                        <button class="delete-btn" data-id="${userSnap.key}">Delete</button>
                    </td>`;
                userTable.appendChild(row);
            }
        });
    });
}

// Event Delegation for Edit and Delete Buttons 
userTable.addEventListener("click", (event) => { 
    const target = event.target; 
    const userId = target.dataset.id;

if (target.classList.contains("edit-btn")) {
    editUser(userId);
} else if (target.classList.contains("delete-btn")) {
    deleteUser(userId);
}

});

// Edit User 
function editUser(userId) {
    const newRoles = prompt("Enter roles (client, vendor, or both, separate with a comma):")
        .trim()
        .toLowerCase()
        .split(",")
        .map(role => role.trim());

    if (newRoles.length) {
        const roles = {
            client: newRoles.includes("client") || null,
            vendor: newRoles.includes("vendor") || null,
        };

        const userRef = ref(db, `users/${userId}/roles`);
        update(userRef, roles)
            .then(() => alert("User roles updated successfully."))
            .catch((error) => alert("Failed to update user roles: " + error.message));
    }
}

// Delete User 
function deleteUser(userId) { 
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) { 
        const userRef = ref(db, `users/${userId}`); 
        remove(userRef) 
        .then(() => alert("User deleted successfully.")) 
        .catch((error) => alert("Failed to delete user: " + error.message)); } }

// Load Vendor Services with Search Support
function loadVendorServices() {
    const servicesRef = ref(db, "services");
    onValue(servicesRef, (snapshot) => {
        const searchTerm = serviceSearchInput.value.trim().toLowerCase();
        serviceTable.innerHTML = "";
        snapshot.forEach((vendorSnap) => {
            const vendorId = vendorSnap.key;
            const services = vendorSnap.val();
            Object.keys(services).forEach((serviceId) => {
                const service = services[serviceId];
                const serviceName = service.name.toLowerCase();
                const serviceCategory = service.category.toLowerCase();

                // Only include services that match the search term
                if (serviceName.includes(searchTerm) || serviceCategory.includes(searchTerm)) {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${vendorId}</td>
                        <td>${service.name}</td>
                        <td>${service.category}</td>
                        <td>${service.price}</td>
                        <td>
                            <button class="edit-service-btn" data-vendor-id="${vendorId}" data-service-id="${serviceId}">Edit</button>
                            <button class="delete-service-btn" data-vendor-id="${vendorId}" data-service-id="${serviceId}">Delete</button>
                        </td>`;
                    serviceTable.appendChild(row);
                }
            });
        });
    });
}
    
// Event Delegation for Edit and Delete Buttons 
serviceTable.addEventListener("click", (event) => { 
    const target = event.target; 
    const vendorId = target.dataset.vendorId; 
    const serviceId = target.dataset.serviceId;

if (target.classList.contains("edit-service-btn")) {
    editService(vendorId, serviceId);
} else if (target.classList.contains("delete-service-btn")) {
    deleteService(vendorId, serviceId);
}

});

// Edit Service 
function editService(vendorId, serviceId) { 
    const newName = prompt("Enter new service name:").trim(); 
    const newCategory = prompt("Enter new category:").trim(); 
    const newPrice = prompt("Enter new price:").trim();

if (newName && newCategory && newPrice) {
    const serviceRef = ref(db, `services/${vendorId}/${serviceId}`);
    update(serviceRef, { name: newName, category: newCategory, price: newPrice })
        .then(() => alert("Service updated successfully."))
        .catch((error) => alert("Failed to update service: " + error.message));
}

}

// Delete Service 
function deleteService(vendorId, serviceId) {
     if (confirm("Are you sure you want to delete this service? This action cannot be undone.")) { 
        const serviceRef = ref(db, `services/${vendorId}/${serviceId}`); 
        remove(serviceRef) 
        .then(() => alert("Service deleted successfully.")) 
        .catch((error) => alert("Failed to delete service: " + error.message)); } }

// Dashboard Overview Counts
function updateDashboardCounts() {
    const usersRef = ref(db, "users");
    const servicesRef = ref(db, "services");

    // Total Users
    onValue(usersRef, (snapshot) => {
        let totalUsers = 0;
        let activeVendors = 0;
        snapshot.forEach((userSnap) => {
            const userData = userSnap.val();
            totalUsers++;
            if (userData.roles && userData.roles.vendor) {
                activeVendors++;
            }
        });
        document.getElementById("total-users").textContent = totalUsers;
        document.getElementById("active-vendors").textContent = activeVendors;
    });

    // Total Services
    onValue(servicesRef, (snapshot) => {
        let totalServices = 0;
        snapshot.forEach((vendorSnap) => {
            totalServices += Object.keys(vendorSnap.val()).length;
        });
        document.getElementById("total-services").textContent = totalServices;
    });
}

// Load Feedback with Real-time Updates
function loadFeedback() {
    const feedbackRef = ref(db, "feedback");
    onValue(feedbackRef, (snapshot) => {
        const feedbackTable = document.getElementById("feedback-table");
        feedbackTable.innerHTML = "";
        
        snapshot.forEach((feedbackSnap) => {
            const feedbackId = feedbackSnap.key;
            const feedback = feedbackSnap.val();
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${feedbackId}</td>
                <td>${feedback.userName || "Unknown"}</td>
                <td>${feedback.message}</td>
                <td>${feedback.rating}</td>
                <td>
                    <button class="delete-feedback-btn" data-id="${feedbackId}">Delete</button>
                </td>`;
            feedbackTable.appendChild(row);
        });
    });
}

// Event Delegation for Feedback Delete Buttons
document.getElementById("feedback-table").addEventListener("click", (event) => {
    const target = event.target;
    const feedbackId = target.dataset.id;

    if (target.classList.contains("delete-feedback-btn")) {
        deleteFeedback(feedbackId);
    }
});

// Delete Feedback
function deleteFeedback(feedbackId) {
    if (confirm("Are you sure you want to delete this feedback? This action cannot be undone.")) {
        const feedbackRef = ref(db, `feedback/${feedbackId}`);
        remove(feedbackRef)
            .then(() => alert("Feedback deleted successfully."))
            .catch((error) => alert("Failed to delete feedback: " + error.message));
    }
}

// Initialize Page
loadUsers();
loadVendorServices();
loadFeedback();
updateDashboardCounts();

// Real-time search for users
userSearchInput.addEventListener("input", loadUsers);

// Real-time search for services
serviceSearchInput.addEventListener("input", loadVendorServices);
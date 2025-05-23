// Browse Services Script
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getDatabase, ref, onValue, get } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";
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
const vendorContainer = document.getElementById("vendor-container");
const clientLink = document.getElementById("client-dashboard-link");
const vendorLink = document.getElementById("vendor-dashboard-link");
const authLink = document.getElementById("auth-link");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");

// Role-based Navigation
onAuthStateChanged(auth, async (user) => { 
    if (clientLink && vendorLink) { 
        if (user) { 
            try { 
                const userRef = ref(db, `users/${user.uid}`); 
                const snapshot = await get(userRef); 
                const userData = snapshot.val(); 
                const roles = userData?.roles || {};

                // Show dashboard links based on roles
                clientLink.style.display = roles.client ? "block" : "none";
                vendorLink.style.display = roles.vendor ? "block" : "none";

                // Hide login link when the user is logged in
                if (authLink) authLink.style.display = "none";

            } catch (error) {
                console.error("Failed to fetch user roles:", error);
            }
        } else {
            clientLink.style.display = "none";
            vendorLink.style.display = "none";

            // Show login link when the user is not logged in
            if (authLink) authLink.style.display = "inline-block";
        }
    }
});

// Load Services
const loadServices = (filterText = "", filterCategory = "") => {
    const servicesRef = ref(db, "services");
    onValue(servicesRef, (snapshot) => {
        vendorContainer.innerHTML = "";
        const categories = new Set();

        snapshot.forEach((userSnap) => {
            const userServices = userSnap.val();

            if (userServices && typeof userServices === 'object') {
                Object.entries(userServices).forEach(([serviceId, service]) => {
                    if (
                        (!filterText || service.name.toLowerCase().includes(filterText.toLowerCase())) &&
                        (!filterCategory || service.category === filterCategory)
                    ) {
                        const images = Array.isArray(service.imageUrls) && service.imageUrls.length > 0 ? service.imageUrls : ['images/placeholder.png'];
                        let imageSlides = images.map((url, index) => `
                            <img src="${url}" alt="${service.name}" class="slide ${index === 0 ? 'active' : ''}">
                        `).join("");

                        // Check if the service is available
                        const isAvailable = service.available !== false;
                        const bookButton = isAvailable
                            ? `<button onclick="location.href='event-booking.html?vendorId=${userSnap.key}&serviceName=${encodeURIComponent(service.name)}&servicePrice=${encodeURIComponent(service.price)}'">
                                Book Vendor
                                </button>`
                            : `<button disabled class="unavailable">Vendor Unavailable</button>`;

                        const serviceCard = document.createElement("div");
                        serviceCard.classList.add("vendor-card");
                        serviceCard.innerHTML = `
                            <div class="image-slider">
                                ${imageSlides}
                                <button class="arrow left">&lt;</button>
                                <button class="arrow right">&gt;</button>
                            </div>
                            <h3>${service.name}</h3>  
                            <p class="description">${service.description}</p>
                            <div class="details">  
                            <p class="category">Category: ${service.category}</p> 
                            <p class="price">Price: ₹${service.price}</p>
                            </div>  
                            ${bookButton}
                        `;
                        vendorContainer.appendChild(serviceCard);

                        if (service.category) {
                            categories.add(service.category);
                        }
                    }
                });
            }
        });

// Populate category filter
const currentCategory = categoryFilter.value; // Save selected value
categoryFilter.innerHTML = '<option value="">All Categories</option>' + 
    Array.from(categories).map(cat => `<option value="${cat}">${cat}</option>`).join("");

// Restore selected value
categoryFilter.value = currentCategory;

    });
};

// Initialize Page
loadServices();

// Set up search and filter event listeners
searchInput.addEventListener("input", () => loadServices(searchInput.value, categoryFilter.value));
categoryFilter.addEventListener("change", () => loadServices(searchInput.value, categoryFilter.value));

// Image Slider Logic
vendorContainer.addEventListener("click", (e) => {
    const button = e.target.closest(".arrow");
    if (!button) return;

    const slider = button.closest(".image-slider");
    const slides = Array.from(slider.querySelectorAll(".slide"));
    const activeIndex = slides.findIndex(slide => slide.classList.contains("active"));

    let newIndex = activeIndex + (button.classList.contains("right") ? 1 : -1);
    if (newIndex < 0) newIndex = slides.length - 1;
    if (newIndex >= slides.length) newIndex = 0;

    slides[activeIndex].classList.remove("active");
    slides[newIndex].classList.add("active");
});
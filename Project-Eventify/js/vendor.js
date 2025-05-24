import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js"; 
import { getDatabase, ref, set, get, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js"; 
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

// Store Image URLs
let imageUrls = [];

// Entry point 
const initializeVendorDashboard = () => { 
  onAuthStateChanged(auth, (user) => { 
  if (user) { 
    const userRef = ref(db, `users/${user.uid}`); 
    get(userRef).then((snapshot) => { 
      const userData = snapshot.val(); 
      const roles = userData?.roles || {};
      
    // Check if the user has vendor access
    if (!roles.vendor) {
      alert("Access Denied: You are not authorized to access the Vendor Dashboard.");
      window.location.href = "auth.html"; // or redirect to a general page
      return; // Stop further execution
    }
      
      const switchBtn = document.getElementById("switch-role-btn"); 
      if (switchBtn) { 
        switchBtn.style.display = roles.client && roles.vendor ? "block" : "none"; 
      } 

      // Show the logged-in username
      const usernameDisplay = document.getElementById("username");
      if (user.displayName) {
        usernameDisplay.textContent = `Welcome, ${user.displayName}`;
      } else if (userData && userData.username) {
        usernameDisplay.textContent = `Welcome, ${userData.username}`;
      }

      // Logout button functionality
      const logoutBtn = document.getElementById("logout-btn");
      logoutBtn.addEventListener("click", () => {
        auth.signOut().then(() => {
          window.location.href = "auth.html";
        }).catch((error) => {
          console.error("Logout error:", error);
          alert("Failed to log out. Please try again.");
        });
      });
    }); 

    loadServices(user.uid); 
    setupFormHandlers(user.uid); 
  } else { 
    alert("You are signed out, Log in to continue."); 
    window.location.href = "auth.html"; 
  } 
});
};

// Handle form UI and submission 
const setupFormHandlers = (uid) => { 
  const toggleBtn = document.getElementById("toggle-service-form-btn"); 
  const form = document.getElementById("service-form"); 
  const widgetBtn = document.getElementById("upload-widget-btn");

  if (!toggleBtn || !form || !widgetBtn) return;

  toggleBtn.addEventListener("click", () => { 
    form.style.display = form.style.display === "none" ? "block" : "none"; 
  });

  // Initialize the Cloudinary Upload Widget if not already initialized
  window.widget = cloudinary.createUploadWidget(
  {
    cloudName: "dtlvsfrji",
    uploadPreset: "planitnow",
    sources: ["local", "url"],
    multiple: true,
    clientAllowedFormats: ["jpg", "jpeg", "png", "gif"],
    resourceType: "image",
    cropping: false,
    transformation: [
      {
        width: 500,
        height: 500,
        crop: "fill",
        gravity: "auto"
      }
    ]
  },
  (error, result) => {
    if (error) {
      console.error("Upload error:", error);
    } else if (result.event === "success") {
      const imageUrl = result.info.secure_url;
      imageUrls.push(imageUrl);
      
      // Add the image preview
      const previewContainer = document.getElementById("image-preview");
      const imgWrapper = document.createElement("div");
      imgWrapper.style.display = "inline-block";
      imgWrapper.style.position = "relative";
      imgWrapper.style.margin = "10px";

      const img = document.createElement("img");
      img.src = imageUrl;
      img.alt = "Uploaded Image";
      img.style.width = "120px";
      img.style.borderRadius = "8px";

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "❌";
      deleteBtn.style.position = "absolute";
      deleteBtn.style.top = "5px";
      deleteBtn.style.right = "5px";
      deleteBtn.style.backgroundColor = "#ff4d4d";
      deleteBtn.style.color = "#fff";
      deleteBtn.style.border = "none";
      deleteBtn.style.borderRadius = "50%";
      deleteBtn.style.cursor = "pointer";

      // Remove image from both the UI and the array
      deleteBtn.addEventListener("click", () => {
        imageUrls = imageUrls.filter((url) => url !== imageUrl);
        imgWrapper.remove();
      });

      imgWrapper.appendChild(img);
      imgWrapper.appendChild(deleteBtn);
      previewContainer.appendChild(imgWrapper);
    }
  }
);

  widgetBtn.addEventListener("click", () => { 
    window.widget.open(); 
  });

  form.addEventListener("submit", async (e) => { 
    e.preventDefault();

    const name = document.getElementById("service-title").value.trim();
    const description = document.getElementById("service-description").value.trim();
    const category = document.getElementById("service-category").value.trim();
    const price = document.getElementById("service-price").value.trim();

    if (!name || !description || !category || !price || imageUrls.length === 0) {
      alert("Please fill all fields and upload at least one image.");
      return;
    }

    const serviceId = form.dataset.editServiceId;
    const service = {
      name,
      description,
      category,
      price: Number(price),
      available: true,
      imageUrls
    };

    try {
      if (serviceId) {
        // Update existing service
        await update(ref(db, `services/${uid}/${serviceId}`), service);
        form.removeAttribute("data-edit-service-id");
        alert("Service updated successfully.");
      } else {
        // Add new service
        await push(ref(db, `services/${uid}`), service);
        alert("Service saved successfully.");
      }
      form.reset();
      imageUrls = [];
      document.getElementById("image-preview").innerHTML = "";
      form.style.display = "none";
    } catch (err) {
      console.error("Failed to save or update service", err);
      alert("Failed to save or update service. Try again.");
    }
  }); 
};

// Load Vendor Services 
const loadServices = (uid) => { 
  const serviceList = document.getElementById("service-list"); 
  const servicesRef = ref(db, `services/${uid}`);

  if (!serviceList) return;

  onValue(servicesRef, (snapshot) => { 
    serviceList.innerHTML = "";

    if (!snapshot.exists()) {
      serviceList.innerHTML = "<p>No services added yet.</p>";
      return;
    }

    snapshot.forEach((childSnap) => {
      const service = childSnap.val();
      const id = childSnap.key;

      const serviceDiv = document.createElement("div");
      serviceDiv.classList.add("service-item");
      serviceDiv.innerHTML = `
        <h3>${service.name}</h3>
        ${service.imageUrls.map((url) => `<img src="${url}" alt="${service.name}" style="max-width: 200px; border-radius: 8px;" />`).join('')}
        <p>${service.description}</p>
        <p>Category: ${service.category}</p>
        <p>Price: ₹${service.price}</p>
        <p>Status: <span id="status-${id}">${service.available ? "Available" : "Unavailable"}</span></p>
        <button onclick="toggleAvailability('${uid}', '${id}')" class="action-btn toggle-btn">Toggle Availability</button>
        <button onclick="editService('${uid}', '${id}')" class="action-btn edit-btn">Edit</button>
        <button onclick="deleteService('${uid}', '${id}')" class="action-btn delete-btn">Delete</button>
      `;
      serviceList.appendChild(serviceDiv);
    });

  }); 
};

// Edit Service 
window.editService = async (uid, serviceId) => { 
  const serviceRef = ref(db, `services/${uid}/${serviceId}`); 
  const snapshot = await get(serviceRef); 
  const service = snapshot.val();

  if (!service) return;

  // Fill the form with existing service data 
  document.getElementById("service-title").value = service.name; 
  document.getElementById("service-description").value = service.description; 
  document.getElementById("service-category").value = service.category; 
  document.getElementById("service-price").value = service.price; 
  imageUrls = service.imageUrls;

  // Show form and set edit mode 
  const form = document.getElementById("service-form"); 
  form.dataset.editServiceId = serviceId; 
  form.style.display = "block";
  
  // Scroll to the form smoothly
  form.scrollIntoView({ behavior: "smooth", block: "start" });

  // Show existing images with delete buttons
  const previewContainer = document.getElementById("image-preview"); 
  previewContainer.innerHTML = ""; // Clear previous previews
  imageUrls.forEach((url, index) => {
    const imgWrapper = document.createElement("div");
    imgWrapper.style.display = "inline-block";
    imgWrapper.style.position = "relative";
    imgWrapper.style.margin = "10px";

    const img = document.createElement("img"); 
    img.src = url; 
    img.alt = "Uploaded Image"; 
    img.style.width = "120px"; 
    img.style.borderRadius = "8px"; 

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.style.position = "absolute";
    deleteBtn.style.top = "5px";
    deleteBtn.style.right = "5px";
    deleteBtn.style.backgroundColor = "#ff4d4d";
    deleteBtn.style.color = "#fff";
    deleteBtn.style.border = "none";
    deleteBtn.style.borderRadius = "50%";
    deleteBtn.style.cursor = "pointer";
    deleteBtn.addEventListener("click", () => {
      // Remove the image from the imageUrls array
      imageUrls.splice(index, 1);
      imgWrapper.remove();
    });

    imgWrapper.appendChild(img);
    imgWrapper.appendChild(deleteBtn);
    previewContainer.appendChild(imgWrapper);
  });
};

// Toggle Service Availability
window.toggleAvailability = async (uid, serviceId) => { 
  const serviceRef = ref(db, `services/${uid}/${serviceId}`); 
  const snapshot = await get(serviceRef); 
  const service = snapshot.val(); 
  const updatedStatus = !service.available; 
  await update(serviceRef, { available: updatedStatus }); 
  document.getElementById(`status-${serviceId}`).textContent = updatedStatus ? "Available" : "Unavailable"; 
};

// Delete Service
window.deleteService = async (uid, serviceId) => { 
  const confirmDelete = confirm("Are you sure you want to delete this service?");
  if (!confirmDelete) return;

  try {
    const serviceRef = ref(db, `services/${uid}/${serviceId}`);
    await remove(serviceRef);
    alert("Service deleted successfully.");
  } catch (err) {
    console.error("Failed to delete service", err);
    alert("Failed to delete service. Try again.");
  }
};

// Start dashboard logic 
initializeVendorDashboard();


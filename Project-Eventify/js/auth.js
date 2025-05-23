document.addEventListener("DOMContentLoaded", function () {
  const loginContainer = document.getElementById("login-container");
  const registerContainer = document.getElementById("register-container");
  const toggleBtn = document.getElementById("toggle-btn");

  // Set initial state
  let isLoginVisible = true;

  toggleBtn.addEventListener("click", function () {
    isLoginVisible = !isLoginVisible;
    loginContainer.style.display = isLoginVisible ? "block" : "none";
    registerContainer.style.display = isLoginVisible ? "none" : "block";
    toggleBtn.textContent = isLoginVisible
      ? "Don't have an account? Register here"
      : "Already have an account? Login here";
  });
});
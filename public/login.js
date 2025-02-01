// Utility functions for validation
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
 
// Store access token
function storeAccessToken(accessToken) {
  sessionStorage.setItem("access_token", accessToken);
}
 
// Get stored access token
function getAccessToken() {
  return sessionStorage.getItem("access_token");
}
 
// Fetch and display user's family name
async function fetchFamilyName() {
  const accessToken = getAccessToken();
  const familyNameElement = document.querySelector("#family-name-display");
 
  if (!familyNameElement) {
    console.error("❌ Element with ID 'family-name-display' not found in HTML.");
    return;
  }
 
  if (!accessToken) {
    console.warn("⚠️ No access token found. User might not be logged in.");
    familyNameElement.textContent = "Not logged in";
    return;
  }
 
  try {
    familyNameElement.textContent = "Fetching..."; // Indicate loading
 
    console.log("🔍 Fetching family name with access token:", accessToken);
 
    const response = await fetch(
      "https://oxbrng5c0c.execute-api.ap-southeast-1.amazonaws.com/dev1/familyname",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "get_family_name",
          accessToken: accessToken,
        }),
      }
    );
 
    const responseText = await response.text();
    console.log("📩 Raw Response Text:", responseText);
 
    const result = JSON.parse(responseText);
    console.log("📜 Parsed Response JSON:", result);
 
    if (response.ok) {
      const parsedBody = JSON.parse(result.body);
      console.log("✅ Fetched Family Name:", parsedBody.family_name);
 
      familyNameElement.textContent = `Welcome, ${parsedBody.family_name}`;
    } else {
      console.error("❌ Failed to fetch family name:", result.message);
      familyNameElement.textContent = "Failed to load name";
    }
  } catch (error) {
    console.error("❌ Error fetching family name:", error);
    familyNameElement.textContent = "Error loading name";
  }
}
 
// Handle form submission
async function submitForm(email, password, mfaCode, session) {
  const payload = { action: "sign_in", email, password };
 
  if (mfaCode && session) {
    payload.mfa_code = mfaCode;
    payload.session = session;
  }
 
  try {
    console.log("📤 Sending login request:", payload);
 
    const response = await fetch(
      "https://oxbrng5c0c.execute-api.ap-southeast-1.amazonaws.com/dev1/familyname",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
 
    const result = await response.json();
    console.log("📥 Response received:", result);
 
    if (response.ok && result.statusCode === 200) {
      const parsedBody = JSON.parse(result.body);
      console.log("✅ Tokens received:", parsedBody);
 
      // Store tokens in sessionStorage
      storeAccessToken(parsedBody.accessToken);
      sessionStorage.setItem("id_token", parsedBody.idToken);
      sessionStorage.setItem("refresh_token", parsedBody.refreshToken);
 
      Swal.fire({
        title: "🎉 Success!",
        text: "Welcome back! Fetching your details...",
        icon: "success",
        confirmButtonText: "Let's go!",
      }).then(() => {
        fetchFamilyName(); // Fetch user's family name after login
        window.location.href = "panel.html"; // Redirect to dashboard
      });
    } else if (response.ok && result.statusCode === 202) {
      const session = result.session;
      console.log("🔐 MFA required. Session token:", session);
 
      Swal.fire({
        title: "🔐 MFA Required",
        text: "Enter your MFA code from your authenticator app.",
        icon: "info",
        confirmButtonText: "Got it!",
      });
 
      document.querySelector(".mfa-section").style.display = "block";
      document.querySelector("#login-button").textContent = "Verify MFA";
      document.querySelector("#login-button").setAttribute("data-session", session);
    } else {
      if (result.statusCode === 403 || (result.message && result.message.toLowerCase().includes("invalid mfa code"))) {
        displayError("Invalid MFA code. Please try again.");
      } else if (result.statusCode === 401 || (result.message && result.message.toLowerCase().includes("invalid email or password"))) {
        displayError("Invalid email or password. Please check and try again.");
      } else {
        displayError(result.message || "Something went wrong. Please try again.");
      }
    }
  } catch (error) {
    console.error("❌ An error occurred:", error);
    displayError("Unable to connect to the server. Please check your internet and try again.");
  }
}
 
// Display error message creatively
function displayError(message) {
  Swal.fire({
    title: "❌ Oops!",
    text: message,
    icon: "error",
    confirmButtonText: "Try Again",
  });
}
 
// Login form logic
document.addEventListener("DOMContentLoaded", () => {
  const formOpenBtn = document.querySelector("#form-open");
  const signInLink = document.querySelector("#sign-in");
  const homeSection = document.querySelector(".home");
  const formCloseBtn = document.querySelector(".form_close");
  const pwShowHide = document.querySelectorAll(".pw_hide");
  const loginButton = document.querySelector("#login-button");
  const mfaSection = document.querySelector(".mfa-section");
  const emailInput = document.querySelector("#email");
  const passwordInput = document.querySelector("#password");
  const mfaInput = document.querySelector("#mfa");
 
  // Open login form
  const openLoginForm = () => {
    homeSection.classList.add("show");
    document.body.classList.add("blur-background");
  };
 
  // Close login form
  formCloseBtn.addEventListener("click", () => {
    homeSection.classList.remove("show");
    document.body.classList.remove("blur-background");
  });
 
  // Attach event listeners
  formOpenBtn.addEventListener("click", openLoginForm);
  signInLink.addEventListener("click", (e) => {
    e.preventDefault();
    openLoginForm();
  });
 
  // Toggle password visibility
  pwShowHide.forEach((icon) => {
    icon.addEventListener("click", () => {
      const getPwInput = icon.parentElement.querySelector("input");
      if (getPwInput.type === "password") {
        getPwInput.type = "text";
        icon.classList.replace("uil-eye-slash", "uil-eye");
      } else {
        getPwInput.type = "password";
        icon.classList.replace("uil-eye", "uil-eye-slash");
      }
    });
  });
 
  // Handle login and MFA validation
  loginButton.addEventListener("click", async (e) => {
    e.preventDefault();
 
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const mfaCode = mfaInput.value.trim();
    const session = loginButton.getAttribute("data-session");
 
    // Input validation
    if (!email) {
      displayError("Please enter your email address.");
      return;
    }
 
    if (!validateEmail(email)) {
      displayError("Your email address seems invalid. Please check and try again.");
      return;
    }
 
    if (!password && !session) {
      displayError("Password is required. Don't leave it blank!");
      return;
    }
 
    if (session && !mfaCode) {
      displayError("MFA code is required to proceed.");
      return;
    }
 
    // Submit the form
    await submitForm(email, password, mfaCode, session);
  });
 
  // Fetch family name if logged in
  if (getAccessToken()) {
    fetchFamilyName();
  }
});
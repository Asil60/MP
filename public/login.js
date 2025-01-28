// Utility functions for validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  // Handle form submission
  async function submitForm(email, password, mfaCode, session) {
    const payload = { email, password };
  
    if (mfaCode && session) {
      payload.mfa_code = mfaCode;
      payload.session = session;
    }
  
    try {
      const response = await fetch(
        "https://mg7x1m87e3.execute-api.ap-southeast-1.amazonaws.com/dev1/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
  
      const result = await response.json();
      console.log("Response:", result);
  
      // Ensure only one message is shown based on the exact response
      if (response.ok && result.statusCode === 200) {
        const parsedBody = JSON.parse(result.body);
        console.log("Tokens received:", parsedBody);
  
        sessionStorage.setItem("id_token", parsedBody.idToken);
        sessionStorage.setItem("access_token", parsedBody.accessToken);
        sessionStorage.setItem("refresh_token", parsedBody.refreshToken);
  
        Swal.fire({
          title: "🎉 Success!",
          text: "Welcome back! Redirecting you now...",
          icon: "success",
          confirmButtonText: "Let's go!",
        }).then(() => {
          window.location.href = "anotherPage.html";
        });
      } else if (response.ok && result.statusCode === 202) {
        const session = result.session;
        console.log("MFA required. Session token:", session);
  
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
        // Display server error message directly if available
        displayError(result.message || "Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error("An error occurred:", error);
      displayError("Unable to connect to the server. Please check your internet and try again.");
    }
  }
  
  // Display error message creatively (ensures only one alert is shown)
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
  });
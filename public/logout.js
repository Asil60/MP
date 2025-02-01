// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
    // Get the logout button by its ID
    const logoutButton = document.getElementById("logoutButton");
  
    if (logoutButton) {
      logoutButton.addEventListener("click", async () => {
        console.log("Logout button clicked!"); // Debug: Ensure the button click is detected
        await signOut(); // Call the signOut function
      });
    } else {
      console.error("Logout button not found in the DOM."); // Debug: Element missing
    }
  });
  
// SignOut function
async function signOut() {
    try {
        const accessToken = sessionStorage.getItem("access_token");

        if (!accessToken) {
            Swal.fire({
                title: "⚠ Already Signed Out",
                text: "No active session found.",
                icon: "warning",
                confirmButtonText: "OK",
            }).then(() => {
        
            window.location.href = "index.html"; // Redirect to dashboard
          });
            return;
        }

        const response = await fetch("https://oxbrng5c0c.execute-api.ap-southeast-1.amazonaws.com/dev1/familyname", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                action: "sign_out",
                accessToken: accessToken,
            }),
        });

        const result = await response.json();
        console.log("Logout response:", result); // Debug: Check the API response

        if (response.ok) {
            Swal.fire({
                title: "👋 Signed Out",
                text: result.message || "You have been successfully logged out.",
                icon: "success",
                confirmButtonText: "OK",
            }).then((result) => {
                if (result.isConfirmed) {
                    sessionStorage.clear(); // Clear session storage after user confirmation
                    window.location.href = "index.html"; // Redirect to login page
                }
            });
        } else {
            Swal.fire({
                title: "❌ Logout Failed",
                text: result.message || "Failed to log out. Please try again.",
                icon: "error",
                confirmButtonText: "Try Again",
            });
        }
    } catch (error) {
        console.error("An error occurred during logout:", error);
        Swal.fire({
            title: "⚠ Error",
            text: "An error occurred while logging out. Please try again.",
            icon: "error",
            confirmButtonText: "OK",
        });
    }
}

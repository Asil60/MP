// Function to fetch ModSecurity Alerts
async function fetchModSecurityAlerts() {
    try {
      const response = await fetch("/modsecurity-attacks"); // Update API URL if needed
      const data = await response.json();
   
      if (!data || data.length === 0) {
        console.warn("⚠️ No ModSecurity attack logs available.");
        document.getElementById("alert-box").innerHTML = "<p>No security threats detected.</p>";
        return;
      }
   
      const alertBox = document.getElementById("alert-box");
      if (!alertBox) {
        console.error("❌ Error: 'alert-box' not found in the DOM!");
        return;
      }
   
      alertBox.innerHTML = ""; // Clear previous alerts
   
      data.forEach(alert => {
        const div = document.createElement("div");
        div.className = "alert";
        div.innerHTML = `<strong>⚠️ ALERT:</strong> Possible SQL Injection detected!<br>
          🕒 <strong>Time:</strong> ${alert.transaction.time_stamp}<br>
          📌 <strong>IP:</strong> ${alert.transaction.client_ip}<br>
          🔗 <strong>URI:</strong> ${alert.transaction.request.uri}<br>
          📝 <strong>Message:</strong> ${alert.transaction.messages[0]?.message || "Unknown alert"}`;
   
        alertBox.prepend(div);
      });
    } catch (error) {
      console.error("❌ Error fetching ModSecurity alerts:", error);
    }
  }
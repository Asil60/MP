// Function to fetch ModSecurity Alerts
document.addEventListener("DOMContentLoaded", function () {
    const alertBox = document.getElementById("alert-box");
 
    if (!alertBox) {
        console.error("❌ Error: 'alert-box' not found in the DOM!");
        return;
    }
 
    async function fetchModSecurityAlerts() {
        try {
            const response = await fetch("/modsecurity-attacks");
            const data = await response.json();
 
            if (!data || data.length === 0) {
                console.warn("⚠️ No ModSecurity attack logs available.");
                alertBox.innerHTML = "<p>No security threats detected.</p>";
                return;
            }
 
            alertBox.innerHTML = "";
 
            data.forEach(alert => {
                const attackMessage = JSON.stringify(alert).toLowerCase();
                let alertsToShow = [];
 
                if (attackMessage.match(/union select|select.*from|drop table|--/)) {
                    alertsToShow.push({
                        icon: "🛑",
                        type: "SQL Injection Attempt",
                    });
                }
 
                if (attackMessage.match(/onerror|<script>|<\/script>/)) {
                    alertsToShow.push({
                        icon: "🚨",
                        type: "Cross-Site Scripting (XSS) Attempt",
                    });
                }
 
                if (alertsToShow.length === 0) {
                    alertsToShow.push({
                        icon: "⚠️",
                        type: "Unknown Threat",
                    });
                }
 
                alertsToShow.forEach(alertType => {
                    const div = document.createElement("div");
                    div.className = "alert";
                    div.innerHTML = `<strong>${alertType.icon} ALERT:</strong> Possible ${alertType.type} detected!<br>
                        🕒 <strong>Time:</strong> ${alert.transaction.time_stamp}<br>
                        📌 <strong>IP:</strong> ${alert.transaction.client_ip}<br>
                        🔗 <strong>URI:</strong> ${alert.transaction.request.uri}<br>
                        📝 <strong>Message:</strong> ${alert.transaction.messages[0]?.message || "No detailed message available"}`;
 
                    alertBox.prepend(div);
 
                    // **Create Incident Ticket if it hasn't been processed**
                    createIncidentTicket(alert, alertType.type);
                });
            });
        } catch (error) {
            console.error("❌ Error fetching ModSecurity alerts:", error);
            alertBox.innerHTML = "<p class='error'>Error fetching security alerts. Please try again later.</p>";
        }
    }
 
    function createIncidentTicket(alert, attackType) {
        const tickets = JSON.parse(localStorage.getItem("incidentTickets")) || [];
        let processedAlerts = JSON.parse(localStorage.getItem("processedAlerts")) || [];
 
        // Unique alert identifier (Combination of IP + URI + timestamp)
        const alertID = `${alert.transaction.client_ip}-${alert.transaction.request.uri}-${alert.transaction.time_stamp}`;
 
        // **Check if alert has already been processed**
        if (processedAlerts.includes(alertID)) {
            console.log(`🚫 Alert already processed: ${alertID}`);
            return;
        }
 
        // Create new incident ticket
        const ticket = {
            id: `INC-${Date.now()}`, // Unique ticket ID
            type: attackType,
            time: alert.transaction.time_stamp,
            ip: alert.transaction.client_ip,
            uri: alert.transaction.request.uri,
            message: alert.transaction.messages[0]?.message || "No message",
            status: "Pending",
        };
 
        tickets.push(ticket);
        localStorage.setItem("incidentTickets", JSON.stringify(tickets));
 
        // **Mark alert as processed**
        processedAlerts.push(alertID);
        localStorage.setItem("processedAlerts", JSON.stringify(processedAlerts));
 
        console.log(`✅ Incident ticket created for alert: ${alertID}`);
    }
 
    fetchModSecurityAlerts();
  });
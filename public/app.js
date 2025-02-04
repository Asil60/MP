// Global flag to track Live mode activation
let isLiveModeActive = true; // Live mode is enabled by default
let liveUpdateInterval;
let requestsErrorsChart;

// Function to fetch CPU usage
async function fetchCPUUsage() {
  try {
    const response = await fetch("/cpu-usage");
    const data = await response.json();
    if (!data || data.length === 0) throw new Error("No CPU data available.");

    let rawValue = parseFloat(data[0].value[1]);
    document.getElementById("cpu-usage").textContent = `${rawValue.toFixed(3)}`;

    const now = new Date();
    document.getElementById("cpu-refresh-time").textContent = `Last updated at ${now.toLocaleTimeString()}`;
  } catch (error) {
    console.error("Error fetching CPU usage data:", error);
    document.getElementById("cpu-usage").textContent = "Error fetching data.";
    document.getElementById("cpu-refresh-time").textContent = "";
  }
}
// Function to fetch Nginx status
async function fetchNginxStatus() {
  try {
    const response = await fetch("/nginx-status");
    const data = await response.json();

    if (data.status === undefined) throw new Error("No Nginx status data available.");

    const nginxStatus = data.status === 1 ? "ON" : "OFF";
    document.getElementById("nginx-status").textContent = nginxStatus;

    const now = new Date();
    document.getElementById("nginx-refresh-time").textContent = `Last updated at ${now.toLocaleTimeString()}`;
  } catch (error) {
    console.error("Error fetching Nginx status:", error);
    document.getElementById("nginx-status").textContent = "Error fetching data.";
    document.getElementById("nginx-refresh-time").textContent = "";
  }
}

// Function to enable Live Mode (Resumes updates for all panels)
function enableLiveMode() {
  isLiveModeActive = true;
  document.getElementById("timeframe").value = "live"; // Set dropdown to "Live"
  fetchAllData(); // Fetch all data immediately
  startLiveUpdates(); // Start continuous updates
}

// Function to disable Live Mode (Stops updates when a timeframe is selected)
function disableLiveMode() {
  isLiveModeActive = false;
  clearInterval(liveUpdateInterval); // Stop live updates
}

// Function to start Live Mode updates for all panels
function startLiveUpdates() {
  clearInterval(liveUpdateInterval); // Ensure no duplicate intervals
  liveUpdateInterval = setInterval(() => {
    if (isLiveModeActive) {
      fetchAllData(); // Update all panels
    }
  }, 10000); // Update every 10 seconds
}

// Function to fetch CPU usage for a selected timeframe
async function fetchCPUUsageForRange(start) {
  try {
    const response = await fetch(`/cpu-usage-range?start=${start}`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch average CPU usage.");
    }

    const average = result.average;
    document.getElementById("cpu-usage").textContent = `${average}%`;

    const now = new Date();
    document.getElementById("cpu-refresh-time").textContent = `Data fetched for range starting at: ${new Date(start * 1000).toLocaleString()}`;
  } catch (error) {
    console.error("Error fetching average CPU usage:", error);
    document.getElementById("cpu-usage").textContent = "Error fetching data for selected range.";
    document.getElementById("cpu-refresh-time").textContent = "";
  }
}

// Function to fetch RAM usage for a selected timeframe
async function fetchRAMUsageForRange(start) {
  try {
    const response = await fetch(`/ram-usage-range?start=${start}`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch average RAM usage.");
    }

    const average = result.average;
    document.getElementById("ram-usage").textContent = `${average}%`;

    const now = new Date();
    document.getElementById("ram-refresh-time").textContent = `Data fetched for range starting at: ${new Date(start * 1000).toLocaleString()}`;
  } catch (error) {
    console.error("Error fetching average RAM usage:", error);
    document.getElementById("ram-usage").textContent = "Error fetching data.";
    document.getElementById("ram-refresh-time").textContent = "";
  }
}

// Function to fetch Root FS usage for a selected timeframe
async function fetchRootFSUsageForRange(start) {
  try {
    const response = await fetch(`/root-fs-usage-range?start=${start}`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch average Root FS usage.");
    }

    const average = result.average;
    document.getElementById("root-fs-usage").textContent = `${average}%`;

    const now = new Date();
    document.getElementById("root-fs-refresh-time").textContent = `Data fetched for range starting at: ${new Date(start * 1000).toLocaleString()}`;
  } catch (error) {
    console.error("Error fetching average Root FS usage:", error);
    document.getElementById("root-fs-usage").textContent = "Error fetching data.";
    document.getElementById("root-fs-refresh-time").textContent = "";
  }
}
// Function to fetch and update Requests & Errors for a selected timeframe
async function fetchRequestsErrorsForRange(start) {
  try {
    isLiveModeActive = false; // Disable automatic updates when timeframe is selected

    const response = await fetch(`/requests-errors-range?start=${start}`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch requests & errors data.");
    }

    updateRequestsErrorsChart(result.data);
  } catch (error) {
    console.error("Error fetching Requests & Errors range data:", error);
  }
}

/// Function to update the Requests & Errors chart
function updateRequestsErrorsChart(data) {
  if (!data || data.length === 0) {
    console.error("No data available for the chart.");
    return;
  }

  // Combine all timestamps and values into a single dataset
  const allTimestamps = data.timestamps || [];
  const allValues = data.values || [];

  if (!allTimestamps.length || !allValues.length) {
    console.error("Invalid data structure: Missing timestamps or values.");
    return;
  }

  // Update or create the chart
  if (requestsErrorsChart) {
    // Update existing chart
    requestsErrorsChart.data.labels = allTimestamps;
    requestsErrorsChart.data.datasets[0].data = allValues;
    requestsErrorsChart.update();
  } else {
    // Create a new chart
    const ctx = document.getElementById("requestsErrorsChart").getContext("2d");
    requestsErrorsChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: allTimestamps,
        datasets: [
          {
            label: "Total Requests & Errors",
            data: allValues,
            borderColor: "rgb(135, 27, 230)",
            backgroundColor: "rgba(160, 37, 217, 0.2)",
            fill: true,
            tension: 0.2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top" },
          title: { display: true, text: "Total Requests & Errors Over Time" },
        },
        scales: {
          x: {
            type: "category",
            ticks: {
              display: false, // Hide x-axis labels
            },
            title: {
              display: true, // Show x-axis title
              text: "Time", // Add "Time" as the x-axis title
            },
          },
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }
}


// Function to fetch Requests & Errors data and update the chart
async function fetchAndUpdateRequestsErrorsChart(startTimestamp) {
  try {
    const response = await fetch(`/requests-errors-range?start=${startTimestamp}`);
    const result = await response.json();

    if (!result.success) {
      console.error("Error fetching requests/errors data:", result.error);
      return;
    }

    // Update the chart with the received data
    updateRequestsErrorsChart(result.data);
  } catch (error) {
    console.error("Error fetching or updating the chart:", error.message);
  }
}

// Example: Call the function with a start timestamp (e.g., 7 days ago)
const startTimestamp = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60; // 7 days ago
fetchAndUpdateRequestsErrorsChart(startTimestamp);


// Function to fetch all system data (Used in Live Mode)
function fetchAllData() {
  fetchCPUUsage();
  fetchRAMUsage();
  fetchRootFSUsage();
  fetchServerUptime();
  fetchAndUpdateChart();
  fetchNginxStatus();
  fetchStatusCodes();
  fetchRemoteIPData();
  fetchModSecurityLogs();
  fetchNginxLogs();
  fetchModSecurityAlerts();
}

// Add event listener for dropdown change
document.getElementById("timeframe").addEventListener("change", function () {
  const selectedOption = this.value;

  if (selectedOption === "live") {
    enableLiveMode(); // Activate live updates for all panels
  } else {
    disableLiveMode(); // Stop live updates

    const timeframe = Number(selectedOption);
    const now = Math.floor(Date.now() / 1000);
    const start = now - timeframe;

    fetchCPUUsageForRange(start); // Fetch data for the selected timeframe
    fetchRAMUsageForRange(start);
    fetchRootFSUsageForRange(start);
    fetchRequestsErrorsForRange(start);
  }
});

// Function to fetch RAM usage
async function fetchRAMUsage() {
  try {
    const response = await fetch("/ram-usage");
    const data = await response.json();
    if (!data || data.length === 0) throw new Error("No RAM data available.");

    let rawValue = parseFloat(data[0].value[1]);
    document.getElementById("ram-usage").textContent = `${rawValue.toFixed(1)}%`;

    const now = new Date();
    document.getElementById("ram-refresh-time").textContent = `Last updated at ${now.toLocaleTimeString()}`;
  } catch (error) {
    console.error("Error fetching RAM usage data:", error);
    document.getElementById("ram-usage").textContent = "Error fetching data.";
    document.getElementById("ram-refresh-time").textContent = "";
  }
}

// Function to fetch Root FS usage
async function fetchRootFSUsage() {
  try {
    const response = await fetch("/root-fs-usage");
    const data = await response.json();
    if (!data || data.length === 0) throw new Error("No Root FS data available.");

    let rawValue = parseFloat(data[0].value[1]);
    document.getElementById("root-fs-usage").textContent = `${rawValue.toFixed(1)}%`;

    const now = new Date();
    document.getElementById("root-fs-refresh-time").textContent = `Last updated at ${now.toLocaleTimeString()}`;
  } catch (error) {
    console.error("Error fetching Root FS usage data:", error);
    document.getElementById("root-fs-usage").textContent = "Error fetching data.";
    document.getElementById("root-fs-refresh-time").textContent = "";
  }
}

// Function to fetch Server Uptime
async function fetchServerUptime() {
  try {
    const response = await fetch("/server-uptime");
    const data = await response.json();
    if (!data || data.length === 0) throw new Error("No Server Uptime data available.");

    const uptimeInSeconds = parseFloat(data[0].value[1]);
    const uptimeInHours = uptimeInSeconds / 3600;
    document.getElementById("server-uptime").textContent = `${uptimeInHours.toFixed(1)} hours`;

    const now = new Date();
    document.getElementById("uptime-refresh-time").textContent = `Last updated at ${now.toLocaleTimeString()}`;
  } catch (error) {
    console.error("Error fetching Server Uptime data:", error);
    document.getElementById("server-uptime").textContent = "Error fetching data.";
    document.getElementById("uptime-refresh-time").textContent = "";
  }
}

// Function to fetch and update the chart
async function fetchAndUpdateChart() {
  try {
    const response = await fetch("/requests-errors");
    const { data } = await response.json();

    if (!data || data.length === 0) {
      throw new Error("No data available for Total Requests & Errors Over Time.");
    }

    const timestamps = data[0]?.timestamps || [];
    const values = data[0]?.values || [];

    if (!timestamps.length || !values.length) {
      throw new Error("Invalid data structure: Missing timestamps or values.");
    }

    if (requestsErrorsChart) {
      requestsErrorsChart.data.labels = timestamps;
      requestsErrorsChart.data.datasets[0].data = values;
      requestsErrorsChart.update();
    } else {
      const ctx = document.getElementById("requestsErrorsChart").getContext("2d");
      requestsErrorsChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: timestamps,
          datasets: [
            {
              label: "Total Requests & Errors",
              data: values,
              borderColor: "rgb(135, 27, 230)",
              backgroundColor: "rgba(160, 37, 217, 0)",
              fill: true,
              tension: 0.2,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Total Requests & Errors Over Time" },
          },
          scales: {
            x: { type: "category", ticks: { autoSkip: true, maxTicksLimit: 10 } },
            y: { beginAtZero: true },
          },
        },
      });
    }
  } catch (error) {
    console.error("Error updating the chart:", error);
  }
}
// Global variable to store the chart instance
let statusChart = null;

// Function to fetch status codes and update the chart
async function fetchStatusCodes() {
  try {
    const response = await fetch("/status-codes");
    const data = await response.json();

    if (!data || data.length === 0) throw new Error("No status data available.");

    // Prepare data for the chart
    const labels = data.map((item) => `Status ${item.status}`);
    const values = data.map((item) => item.value);

    // Update the chart
    updateChart(labels, values);

    const now = new Date();
    document.getElementById("status-refresh-time").textContent = `Last updated at ${now.toLocaleTimeString()}`;
  } catch (error) {
    console.error("Error fetching status codes:", error);
    document.getElementById("status-refresh-time").textContent = "Error fetching data.";
  }
}

// Function to update the pie chart
function updateChart(labels, values) {
  const ctx = document.getElementById("statusChart").getContext("2d");

  // Destroy the previous chart instance if it exists
  if (statusChart) {
    statusChart.destroy();
  }

  // Create a new chart instance
  statusChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          data: values,
          backgroundColor: ["#4caf50", "#ffeb3b", "#2196f3", "#f44336", "#9c27b0"], // Example colors
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
}

/// Global variable to store the bar chart instance
let ipBarChart = null;

// Function to fetch remote IP data and update the bar chart
async function fetchRemoteIPData() {
  try {
    const response = await fetch("/remote-ip-data");
    const data = await response.json();

    if (!data || data.length === 0) throw new Error("No remote IP data available.");

    // Prepare data for the bar chart
    const labels = data.map((item) => item.ip); // IP addresses
    const values = data.map((item) => item.value); // Request counts
    const timestamps = data.map((item) => item.timestamp); // Timestamps

    // Update the bar chart
    updateBarChart(labels, values, timestamps);

    const now = new Date();
    document.getElementById("ip-refresh-time").textContent = `Last updated at ${now.toLocaleTimeString()}`;
  } catch (error) {
    console.error("Error fetching remote IP data:", error);
    document.getElementById("ip-refresh-time").textContent = "Error fetching data.";
  }
}

function updateBarChart(labels, values, timestamps) {
  const ctx = document.getElementById("ipChart").getContext("2d");

  // Destroy the previous bar chart instance if it exists
  if (ipBarChart) {
    ipBarChart.destroy();
  }

  // Create a new bar chart instance
  ipBarChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels, // Labels for the bars (IP addresses, though hidden in the chart)
      datasets: [
        {
          label: "Requests",
          data: values,
          backgroundColor: [
            "#4caf50",
            "#ffeb3b",
            "#2196f3",
            "#f44336",
            "#9c27b0",
          ], // Example colors
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = context.raw;
              const timestamp = timestamps[context.dataIndex];
              return [`Requests: ${value}`, `Timestamp: ${timestamp}`];
            },
          },
        },
      },
      scales: {
        x: {
          display: false, // Hide the x-axis
        },
        y: {
          title: {
            display: true,
            text: "Request Count",
            color: "#ffffff",
            font: {
              size: 14,
            },
          },
          ticks: {
            beginAtZero: true,
          },
        },
      },
    },
  });
}


// Function to fetch and display ModSecurity logs as a table
async function fetchModSecurityLogs() {
  try {
    // Fetch modsecurity data from the backend
    const response = await fetch("/modsecurity-data");
    const data = await response.json();

    const logsContainer = document.getElementById("modsecurity-logs");
    const refreshTime = document.getElementById("mod-refresh-time");

    // Check if data is available
    if (!data || data.length === 0) {
      logsContainer.innerHTML = "<p>No ModSecurity logs available.</p>";
      refreshTime.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
      return;
    }

    // Create table structure
    let tableHtml = `
      <table class="modsecurity-table">
        <thead>
          <tr>
            <th>#</th>
            <th>📍 Client IP</th>
            <th>⏳ Timestamp</th>
            <th>📝 Request</th>
            <th>🛑 Rule ID</th>
            <th>📢 Message</th>
          </tr>
        </thead>
        <tbody>
    `;

    // Populate table rows
    data.forEach((log, index) => {
      log.messages.forEach((msg, msgIndex) => {
        tableHtml += `
          <tr>
            <td>${index + 1}.${msgIndex + 1}</td>
            <td>${log.client_ip}</td>
            <td>${log.time_stamp}</td>
            <td>
              <details>
                <summary>View Request</summary>
                <p><strong>Method:</strong> ${log.request.method}</p>
                <p><strong>URI:</strong> ${log.request.uri}</p>
              </details>
            </td>
            <td>${msg.ruleId}</td>
            <td>${msg.message}</td>
          </tr>
        `;
      });
    });

    // Close table structure
    tableHtml += `</tbody></table>`;
    const now = new Date();

    // Insert table into the HTML
    logsContainer.innerHTML = tableHtml;
    refreshTime.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
  } catch (error) {
    console.error("Error fetching ModSecurity logs:", error);
    document.getElementById("modsecurity-logs").innerHTML = "<p>Error loading logs.</p>";
  }
}


// Function to fetch and display Nginx logs with structured data
async function fetchNginxLogs() {
  try {
    // Fetch logs from backend
    const response = await fetch("/nginx-logs");
    const data = await response.json();

    const logsContainer = document.getElementById("nginx-logs");
    const ngrefreshTime = document.getElementById("nginx-refresh-time");

    // Check if data is available
    if (!data || data.length === 0) {
      logsContainer.innerHTML = "<p>No Nginx logs available.</p>";
      refreshTime.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
      return;
    }

    // Store existing rows for animation comparison
    const existingRows = Array.from(document.querySelectorAll(".nginx-table tbody tr"));

    // Create table structure
    let tableHtml = `
      <table class="nginx-table">
        <thead>
          <tr>
            <th>#</th>
            <th>⏳ Time</th>
            <th>📍 Remote Address</th>
            <th>📡 Status</th>
            <th>📝 Method</th>
            <th>🔍 Request</th>
          </tr>
        </thead>
        <tbody>
    `;

    let newRows = [];

    // Populate table rows
    data.forEach((log, index) => {
      const rowHTML = `
        <tr class="new-row">
          <td>${index + 1}</td>
          <td>${log.time}</td>
          <td>${log.remote_addr}</td>
          <td>${log.status}</td>
          <td>${log.method}</td>
          <td>
            <details>
              <summary>View Request</summary>
              <p>${log.request}</p>
            </details>
          </td>
        </tr>
      `;
      newRows.push(rowHTML);
    });

    tableHtml += newRows.join("") + `</tbody></table>`;

    // Insert table into the HTML
    logsContainer.innerHTML = tableHtml;

    // Remove old rows smoothly
    existingRows.forEach((row) => {
      row.classList.add("removing");
      setTimeout(() => row.remove(), 500);
    });

    const now = new Date();
    ngrefreshTime.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
  } catch (error) {
    console.error("Error fetching Nginx logs:", error);
    document.getElementById("nginx-logs").innerHTML = "<p>Error loading logs.</p>";
  }
}


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

















// Function to fetch Summary using OpenAI
async function fetchSummary() {
  try {
    // Display loading text
    document.getElementById("summary").innerHTML = "<p>Generating summary...</p>";

    // Prepare the data to be summarized
    const data = {
      cpuUsage: document.getElementById("cpu-usage").textContent || "N/A",
      ramUsage: document.getElementById("ram-usage").textContent || "N/A",
      rootFSUsage: document.getElementById("root-fs-usage").textContent || "N/A",
      serverUptime: document.getElementById("server-uptime").textContent || "N/A",
      nginxStatus: document.getElementById("nginx-status").textContent || "N/A",
    };

    // ✅ Fetch Status Code Data
    const statusResponse = await fetch("/status-codes");
    const statusData = await statusResponse.json();
    if (statusData.length > 0) {
      data.statusCodes = statusData.map((item) => `Status ${item.status}: ${item.value} times`).join(", ");
    } else {
      data.statusCodes = "No status code data available.";
    }

    // ✅ Fetch Remote IP Data
    const ipResponse = await fetch("/remote-ip-data");
    const ipData = await ipResponse.json();
    if (ipData.length > 0) {
      data.remoteIPs = ipData.map((item) => `${item.ip} made ${item.value} requests at ${item.timestamp}`).join("; ");
    } else {
      data.remoteIPs = "No remote IP data available.";
    }

    // ✅ Fetch Request Error Data
    const requestErrorResponse = await fetch("/requests-errors");
    const requestErrorData = await requestErrorResponse.json();
    if (requestErrorData.data && requestErrorData.data.length > 0) {
      data.requestsErrors = requestErrorData.data[0]; // Extract first dataset
    } else {
      data.requestsErrors = { timestamps: [], values: [] }; // Default empty dataset
    }

            // ✅ Fetch ModSecurity Logs
    const modsecResponse = await fetch("/modsecurity-data");
    const modsecData = await modsecResponse.json();

    if (modsecData.length > 0) {
      data.modsecLogs = modsecData.map((log) => ({
        ruleId: log.messages?.[0]?.ruleId || "Unknown",
        message: log.messages?.[0]?.message || "No message available",
      }));
    } else {
      data.modsecLogs = [];
    }




    // ✅ Fetch Nginx Logs
    const nginxResponse = await fetch("/nginx-logs");
    const nginxData = await nginxResponse.json();
    if (nginxData.length > 0) {
      data.nginxLogs = nginxData.map((log) => ({
        time: log.time,
        remoteAddr: log.remote_addr,
        status: log.status,
        method: log.method,
        request: log.request,
      }));
    } else {
      data.nginxLogs = [];
    }

    // 🔹 Debugging: Log the data before sending
    console.log("Summary Data Sent to Backend:", JSON.stringify(data, null, 2));

    // ✅ Send data to the backend for summarization
    const summaryResponse = await fetch("/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data }), // Send full data
    });

    const result = await summaryResponse.json();
    if (!result.summary) throw new Error("No summary returned.");

    // 🔹 Debugging: Log the GPT-generated summary
    console.log("GPT Summary Received:", result.summary);

    // ✅ Format the summary into an ordered list
    const formattedSummary = result.summary
      .split(/\d\.\s+/) // Split on "1. ", "2. ", etc.
      .filter((item) => item.trim() !== "") // Remove empty items
      .map((item) => `<li>${item.trim()}</li>`) // Wrap each sentence in <li>
      .join(""); // Join all list items into a single string

    document.getElementById("summary").innerHTML = `<ol>${formattedSummary}</ol>`;
  } catch (error) {
    console.error("Error fetching insights:", error);
    document.getElementById("summary").innerHTML =
      "<p style='color: red;'>Error generating insights. Please try again.</p>";
  }
}

// ✅ Add event listener to the button
document.getElementById("generate-summary-button").addEventListener("click", fetchSummary);




// Initial setup: Live Mode should be active on page load
enableLiveMode();

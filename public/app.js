// Global flag to track dropdown interaction
let isDropdownActive = false;
let requestsErrorsChart;

// Function to fetch CPU usage
async function fetchCPUUsage() {
  try {
    if (isDropdownActive) return; // Skip updates if dropdown is active

    const response = await fetch("/cpu-usage");
    const data = await response.json();
    if (!data || data.length === 0) throw new Error("No CPU data available.");

    // Extract the raw value and display it with three decimal points without rounding
    let rawValue = parseFloat(data[0].value[1]);
    document.getElementById("cpu-usage").textContent = `${rawValue.toFixed(3)}`;

    const now = new Date();
    document.getElementById(
      "cpu-refresh-time"
    ).textContent = `Last updated at ${now.toLocaleTimeString()}`;
  } catch (error) {
    console.error("Error fetching CPU usage data:", error);
    document.getElementById("cpu-usage").textContent = "Error fetching data.";
    document.getElementById("cpu-refresh-time").textContent = "";
  }
}

// Function to fetch RAM usage
async function fetchRAMUsage() {
  try {
    if (isDropdownActive) return; // Skip updates if dropdown is active

    const response = await fetch("/ram-usage");
    const data = await response.json();
    if (!data || data.length === 0) throw new Error("No RAM data available.");

    let rawValue = parseFloat(data[0].value[1]);
    document.getElementById("ram-usage").textContent = `${rawValue.toFixed(1)}%`;

    const now = new Date();
    document.getElementById(
      "ram-refresh-time"
    ).textContent = `Last updated at ${now.toLocaleTimeString()}`;
  } catch (error) {
    console.error("Error fetching RAM usage data:", error);
    document.getElementById("ram-usage").textContent = "Error fetching data.";
    document.getElementById("ram-refresh-time").textContent = "";
  }
}

// Function to fetch Root FS usage
async function fetchRootFSUsage() {
  try {
    if (isDropdownActive) return; // Skip updates if dropdown is active

    const response = await fetch("/root-fs-usage");
    const data = await response.json();
    if (!data || data.length === 0) throw new Error("No Root FS data available.");

    let rawValue = parseFloat(data[0].value[1]);
    document.getElementById("root-fs-usage").textContent = `${rawValue.toFixed(1)}%`;

    const now = new Date();
    document.getElementById(
      "root-fs-refresh-time"
    ).textContent = `Last updated at ${now.toLocaleTimeString()}`;
  } catch (error) {
    console.error("Error fetching Root FS usage data:", error);
    document.getElementById("root-fs-usage").textContent = "Error fetching data.";
    document.getElementById("root-fs-refresh-time").textContent = "";
  }
}

// Function to fetch Server Uptime
async function fetchServerUptime() {
  try {
    if (isDropdownActive) return; // Skip updates if dropdown is active

    const response = await fetch("/server-uptime");
    const data = await response.json();
    if (!data || data.length === 0) throw new Error("No Server Uptime data available.");

    const uptimeInSeconds = parseFloat(data[0].value[1]);
    const uptimeInHours = uptimeInSeconds / 3600;
    document.getElementById("server-uptime").textContent = `${uptimeInHours.toFixed(1)} hours`;

    const now = new Date();
    document.getElementById(
      "uptime-refresh-time"
    ).textContent = `Last updated at ${now.toLocaleTimeString()}`;
  } catch (error) {
    console.error("Error fetching Server Uptime data:", error);
    document.getElementById("server-uptime").textContent = "Error fetching data.";
    document.getElementById("uptime-refresh-time").textContent = "";
  }
}

// Function to fetch and update the chart
async function fetchAndUpdateChart() {
  try {
    if (isDropdownActive) return; // Skip updates if dropdown is active

    const response = await fetch("/requests-errors");
    const { data } = await response.json();

    if (!data || data.length === 0) {
      throw new Error("No data available for Total Requests & Errors Over Time.");
    }

    const timestamps = data[0]?.timestamps || []; // Time labels
    const values = data[0]?.values || []; // Data points

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

// Function to fetch Summary using OpenAI
async function fetchSummary() {
  try {
    document.getElementById("summary").innerHTML = "<p>Generating summary...</p>";

    const data = {
      cpuUsage: document.getElementById("cpu-usage").textContent,
      ramUsage: document.getElementById("ram-usage").textContent,
      rootFSUsage: document.getElementById("root-fs-usage").textContent,
      serverUptime: document.getElementById("server-uptime").textContent,
    };

    const response = await fetch("/requests-errors");
    const requestErrorData = await response.json();

    if (requestErrorData.data && requestErrorData.data.length > 0) {
      data.requestsErrors = requestErrorData.data[0];
    } else {
      data.requestsErrors = { timestamps: [], values: [] };
    }

    const summaryResponse = await fetch("/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });

    const result = await summaryResponse.json();
    if (!result.summary) throw new Error("No summary returned.");

    const formattedSummary = result.summary
      .split(/\d\.\s+/)
      .filter((item) => item.trim() !== "")
      .map((item) => `<li>${item.trim()}</li>`)
      .join("");

    document.getElementById("summary").innerHTML = `<ol>${formattedSummary}</ol>`;
  } catch (error) {
    console.error("Error fetching insights:", error);
    document.getElementById("summary").innerHTML =
      "<p style='color: red;'>Error generating insights. Please try again.</p>";
  }
}

// Fetch data for the selected range
async function fetchCPUUsageForRange(start) {
  try {
    isDropdownActive = true; // Disable automatic updates when dropdown is active

    const response = await fetch(`/cpu-usage-range?start=${start}`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch average CPU usage.");
    }

    const average = result.average;
    document.getElementById("cpu-usage").textContent = `${average}%`;

    const now = new Date();
    document.getElementById(
      "cpu-refresh-time"
    ).textContent = `Data fetched for range starting at: ${new Date(
      start * 1000
    ).toLocaleString()}`;
  } catch (error) {
    console.error("Error fetching average CPU usage:", error);
    document.getElementById("cpu-usage").textContent = "Error fetching data for selected range.";
    document.getElementById("cpu-refresh-time").textContent = "";
  }
}

// Add event listener for dropdown change
document.getElementById("timeframe").addEventListener("change", function () {
  isDropdownActive = true; // Disable automatic updates
  const timeframe = Number(this.value);
  const now = Math.floor(Date.now() / 1000);
  const start = now - timeframe;

  fetchCPUUsageForRange(start);
});

// Re-enable automatic updates after 10 minutes
setTimeout(() => {
  isDropdownActive = false;
}, 10 * 60 * 1000);

// Update all data every 10 seconds
setInterval(() => {
  fetchCPUUsage();
  fetchRAMUsage();
  fetchRootFSUsage();
  fetchServerUptime();
  fetchAndUpdateChart();
}, 10000);

// Initial calls to display data immediately when the page loads
fetchCPUUsage();
fetchRAMUsage();
fetchRootFSUsage();
fetchServerUptime();
fetchAndUpdateChart();

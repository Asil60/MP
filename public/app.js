// Function to fetch CPU usage
async function fetchCPUUsage() {
  try {
    const response = await fetch("/cpu-usage");
    const data = await response.json();
    if (!data || data.length === 0) throw new Error("No CPU data available.");

    let rawValue = parseFloat(data[0].value[1]);
    document.getElementById("cpu-usage").textContent = `${rawValue.toFixed(1)}%`;

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
let requestsErrorsChart;

async function fetchAndUpdateChart() {
  try {
    // Fetch new data from the API
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

    // Update the chart
    if (requestsErrorsChart) {
      // Update the existing chart with new data
      requestsErrorsChart.data.labels = timestamps; // Update timestamps
      requestsErrorsChart.data.datasets[0].data = values; // Update values
      requestsErrorsChart.update(); // Refresh the chart
    } else {
      // Create the chart if it doesn't exist
      const ctx = document.getElementById("requestsErrorsChart").getContext("2d");
      requestsErrorsChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: timestamps, // Time labels
          datasets: [
            {
              label: "Total Requests & Errors",
              data: values, // Data points
              borderColor: "rgb(135, 27, 230)",
              backgroundColor: "rgba(160, 37, 217, 0)",
              fill: true, // Fill area under the curve
              tension: 0.2, // Smooth curves
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
            title: {
              display: true,
              text: "Total Requests & Errors Over Time",
            },
          },
          scales: {
            x: {
              type: "category",
              title: {
                display: true,
                text: "Time",
              },
              ticks: {
                autoSkip: true, // Automatically skip labels to avoid clutter
                maxTicksLimit: 10, // Limit the number of labels displayed
                maxRotation: 0, // Prevent rotation for better readability
                minRotation: 0,
              },
            },
            y: {
              title: {
                display: true,
                text: "Requests/Errors",
              },
              beginAtZero: true,
            },
          },
        },
      });
    }
  } catch (error) {
    console.error("Error updating the chart:", error);
  }
}

// Fetch data and update the chart every minute
document.addEventListener("DOMContentLoaded", () => {
  fetchAndUpdateChart(); // Initial fetch
  setInterval(fetchAndUpdateChart, 60000); // Update every 1 minute
});



// Function to fetch Summary using OpenAI
async function fetchSummary() {
  try {
    // Display loading text
    document.getElementById("summary").innerHTML = "<p>Generating summary...</p>";

    // Prepare the data to be summarized
    const data = {
      cpuUsage: document.getElementById("cpu-usage").textContent,
      ramUsage: document.getElementById("ram-usage").textContent,
      rootFSUsage: document.getElementById("root-fs-usage").textContent,
      serverUptime: document.getElementById("server-uptime").textContent,
    };

    // Fetch request-error data
    const response = await fetch("/requests-errors");
    const requestErrorData = await response.json();

    if (requestErrorData.data && requestErrorData.data.length > 0) {
      data.requestsErrors = requestErrorData.data[0]; // Extract first dataset
    } else {
      data.requestsErrors = { timestamps: [], values: [] }; // Default empty dataset
    }

    // Send data to the backend for summarization
    const summaryResponse = await fetch("/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data }),
    });

    const result = await summaryResponse.json();
    if (!result.summary) throw new Error("No summary returned.");

    // Format the summary into an ordered list
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

// Add event listener to the button
document.getElementById("generate-summary-button").addEventListener("click", fetchSummary);



// Update all data every 10 seconds
setInterval(() => {
  fetchCPUUsage();
  fetchRAMUsage();
  fetchRootFSUsage();
  fetchServerUptime();
}, 10000);

// Initial calls to display data immediately when the page loads
fetchCPUUsage();
fetchRAMUsage();
fetchRootFSUsage();
fetchServerUptime();

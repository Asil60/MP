// Global flag to track Live mode activation
let isLiveModeActive = true; // Live mode is enabled by default
let liveUpdateInterval;
let requestsErrorsChart;
 
 
// Function to fetch CPU usage
async function fetchCPUUsage() {
    try {
      const response = await fetch("/cpu-usageserverc");
      const data = await response.json();
      if (!data || data.length === 0) throw new Error("No CPU data available.");
 
      let rawValue = parseFloat(data[0].value[1]);
      document.getElementById("cpu-usageC").textContent = `${rawValue.toFixed(3)}`;
 
      const now = new Date();
      document.getElementById("cpu-refresh-timeC").textContent = `Last updated at ${now.toLocaleTimeString()}`;
    } catch (error) {
      console.error("Error fetching CPU usage data:", error);
      document.getElementById("cpu-usageC").textContent = "Error fetching data.";
      document.getElementById("cpu-refresh-timeC").textContent = "";
    }
  }
 
 
// Function to fetch RAM usage
async function fetchRAMUsage() {
    try {
      const response = await fetch("/ram-usageserverc");
      const data = await response.json();
      if (!data || data.length === 0) throw new Error("No RAM data available.");
 
      let rawValue = parseFloat(data[0].value[1]);
      document.getElementById("ram-usageC").textContent = `${rawValue.toFixed(1)}%`;
 
      const now = new Date();
      document.getElementById("ram-refresh-timeC").textContent = `Last updated at ${now.toLocaleTimeString()}`;
    } catch (error) {
      console.error("Error fetching RAM usage data:", error);
      document.getElementById("ram-usageC").textContent = "Error fetching data.";
      document.getElementById("ram-refresh-timeC").textContent = "";
    }
  }
 
 
// Function to fetch Root FS usage
async function fetchRootFSUsage() {
    try {
      const response = await fetch("/root-fs-usageserverc");
      const data = await response.json();
      if (!data || data.length === 0) throw new Error("No Root FS data available.");
 
      let rawValue = parseFloat(data[0].value[1]);
      document.getElementById("root-fs-usageC").textContent = `${rawValue.toFixed(1)}%`;
 
      const now = new Date();
      document.getElementById("root-fs-refresh-timeC").textContent = `Last updated at ${now.toLocaleTimeString()}`;
    } catch (error) {
      console.error("Error fetching Root FS usage data:", error);
      document.getElementById("root-fs-usageC").textContent = "Error fetching data.";
      document.getElementById("root-fs-refresh-timeC").textContent = "";
    }
  }
 
 
  // Function to fetch Server Uptime
async function fetchServerUptime() {
    try {
      const response = await fetch("/server-uptimeserverc");
      const data = await response.json();
      if (!data || data.length === 0) throw new Error("No Server Uptime data available.");
 
      const uptimeInSeconds = parseFloat(data[0].value[1]);
      const uptimeInHours = uptimeInSeconds / 3600;
      document.getElementById("server-uptimeC").textContent = `${uptimeInHours.toFixed(1)} hours`;
 
      const now = new Date();
      document.getElementById("uptime-refresh-timeC").textContent = `Last updated at ${now.toLocaleTimeString()}`;
    } catch (error) {
      console.error("Error fetching Server Uptime data:", error);
      document.getElementById("server-uptimeC").textContent = "Error fetching data.";
      document.getElementById("uptime-refresh-timeC").textContent = "";
    }
  }
 
 
 
  async function fetchAndUpdateChart() {
    try {
        const response = await fetch("/requests-errorsserverc");
 
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
 
        const responseData = await response.json();
        console.log("Full API Response:", responseData); // Debugging step
 
        const { data } = responseData;
 
        if (!data || data.length === 0) {
            console.warn("No data available.");
            return;
        }
 
        console.log("First Entry in Data:", data[0]); // Debugging
 
        const timestamps = data[0]?.timestamps || [];
        const values = data[0]?.values || [];
 
        console.log("Extracted Timestamps:", timestamps);
        console.log("Extracted Values:", values);
 
        if (!timestamps.length || !values.length) {
            console.warn("Invalid data structure: Missing timestamps or values.");
            return;
        }
 
        const ctx = document.getElementById("requestsErrorsChartC")?.getContext("2d");
        if (!ctx) {
            console.error("Canvas element 'requestsErrorsChartC' not found.");
            return;
        }
 
        if (requestsErrorsChart) {
            requestsErrorsChart.data.labels = timestamps;
            requestsErrorsChart.data.datasets[0].data = values;
            requestsErrorsChart.update();
        } else {
            requestsErrorsChart = new Chart(ctx, {
                type: "line",
                data: {
                    labels: timestamps,
                    datasets: [
                        {
                            label: "Network Receive Errors",
                            data: values,
                            borderColor: "rgb(255, 99, 132)",
                            backgroundColor: "rgba(255, 99, 132, 0.2)",
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
                        x: { ticks: { autoSkip: true, maxTicksLimit: 10 } },
                        y: { beginAtZero: true },
                    },
                },
            });
        }
    } catch (error) {
        console.error("Error updating the chart:", error);
    }
}
 
let networkTrafficChart; // Ensure this is defined globally
 
async function fetchAndUpdateNetworkTrafficChart() {
    try {
        const response = await fetch("/requests-networktrafficC");
 
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
 
        const responseData = await response.json();
        console.log("Full API Response (Network Traffic):", responseData);
 
        const { data } = responseData;
 
        if (!data || data.length === 0) {
            console.warn("No data available for Network Traffic.");
            return;
        }
 
        console.log("First Entry in Data:", data[0]); // Debugging
 
        // Extract timestamps and datasets
        const timestamps = data[0]?.timestamps || [];
        console.log("Extracted Timestamps:", timestamps);
 
        if (!timestamps.length) {
            console.warn("Invalid data structure: Missing timestamps.");
            return;
        }
 
        const datasets = data.map((dataset) => ({
            label: dataset.name, // Use the name from the API
            data: dataset.values,
            borderColor: getRandomColor(),
            backgroundColor: "rgba(0, 0, 0, 0)", // Transparent background
            fill: false,
            tension: 0.2,
        }));
 
        console.log("Prepared Datasets:", datasets);
 
        const now = new Date();
        document.getElementById("ip-refresh-timeC").textContent = `Last updated at ${now.toLocaleTimeString()}`;
 
        const ctx = document.getElementById("networkTrafficChartC")?.getContext("2d");
        if (!ctx) {
            console.error("Canvas element 'networkTrafficChartC' not found.");
            return;
        }
 
        if (networkTrafficChart) {
            // Update existing chart
            console.log("Updating existing chart...");
            networkTrafficChart.data.labels = timestamps;
            networkTrafficChart.data.datasets = datasets;
            networkTrafficChart.update();
        } else {
            // Create new chart
            console.log("Creating new chart...");
            networkTrafficChart = new Chart(ctx, {
                type: "line",
                data: {
                    labels: timestamps,
                    datasets: datasets,
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: "top" },
                        title: { display: true, text: "Network Traffic by Packets Over Time" },
                    },
                    scales: {
                        x: { ticks: { autoSkip: true, maxTicksLimit: 10 } },
                        y: { beginAtZero: true },
                    },
                },
            });
        }
    } catch (error) {
        console.error("Error updating the Network Traffic chart:", error);
    }
}
 
// Helper function to generate random colors for datasets
function getRandomColor() {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgb(${r}, ${g}, ${b})`;
}
 
 
// Function to fetch Summary using OpenAI
async function fetchSummary() {
    try {
        // Display loading text
        document.getElementById("summary").innerHTML = "<p>Generating summary...</p>";
 
        // Prepare the data to be summarized
        const data = {
            nginxStatus: document.getElementById("nginx-statusC").textContent || "N/A",
            cpuUsage: document.getElementById("cpu-usageC").textContent || "N/A",
            ramUsage: document.getElementById("ram-usageC").textContent || "N/A",
            rootFSUsage: document.getElementById("root-fs-usageC").textContent || "N/A",
            serverUptime: document.getElementById("server-uptimeC").textContent || "N/A",
            networkTrafficChart: document.getElementById("networkTrafficChartC").textContent || "N/A",
        };
 
        // Fetch Request Error Data
        const requestErrorResponse = await fetch("/requests-errorsserverc");
        const requestErrorData = await requestErrorResponse.json();
        if (requestErrorData.data && requestErrorData.data.length > 0) {
            data.requestsErrors = requestErrorData.data[0]; // Extract first dataset
        } else {
            data.requestsErrors = { timestamps: [], values: [] }; // Default empty dataset
        }
 
        // 🔹 Debugging: Log the data before sending
        console.log("Summary Data Sent to Backend:", JSON.stringify(data, null, 2));
 
        // Send data to the backend for summarization
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
 
 
// Function to fetch Nodejs status
async function fetchNodeJsStatus() {
    try {
      const response = await fetch("/nodejs-statusC");
      const data = await response.json();
 
      if (data.status === undefined) throw new Error("No Nodejs status data available.");
 
      const nodejsStatus = data.status === 1 ? "ON" : "OFF";
      document.getElementById("nodejs-statusC").textContent = nodejsStatus;
 
      const now = new Date();
      document.getElementById("nodejs-refresh-timeC").textContent = `Last updated at ${now.toLocaleTimeString()}`;
    } catch (error) {
      console.error("Error fetching Nodejs status:", error);
      document.getElementById("nodejs-statusC").textContent = "Error fetching data.";
      document.getElementById("nodejs-refresh-timeC").textContent = "";
    }
  }
 
 
 
  // Function to fetch Docker status
  async function fetchDockerStatus() {
    try {
      const response = await fetch("/docker-statusC");
      const data = await response.json();
 
      if (data.status === undefined) throw new Error("No Docker status data available.");
 
      const dockerStatus = data.status === 1 ? "ON" : "OFF";
      document.getElementById("docker-statusC").textContent = dockerStatus;
 
      const now = new Date();
      document.getElementById("docker-refresh-timeC").textContent = `Last updated at ${now.toLocaleTimeString()}`;
    } catch (error) {
      console.error("Error fetching Docker status:", error);
      document.getElementById("docker-statusC").textContent = "Error fetching data.";
      document.getElementById("docker-refresh-timeC").textContent = "";
    }
  }
 
 
setInterval(fetchCPUUsage, 10000);
setInterval(fetchRAMUsage, 10000);
setInterval(fetchRootFSUsage, 10000);
setInterval(fetchServerUptime, 10000);
setInterval(fetchAndUpdateChart, 10000);
setInterval(fetchAndUpdateNetworkTrafficChart, 10000);
setInterval(fetchNodeJsStatus, 10000)
setInterval(fetchDockerStatus, 10000);
 
 
 
  fetchCPUUsage();
  fetchRAMUsage();
  fetchRootFSUsage();
  fetchServerUptime();
  fetchAndUpdateChart();
  fetchAndUpdateNetworkTrafficChart();
  fetchNodeJsStatus();
  fetchDockerStatus();
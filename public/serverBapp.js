// Global flag to track Live mode activation
let isLiveModeActive = true; // Live mode is enabled by default
let liveUpdateInterval;
let requestsErrorsChart;
 
 
// Function to fetch CPU usage
async function fetchCPUUsage() {
    try {
      const response = await fetch("/cpu-usageserverb");
      const data = await response.json();
      if (!data || data.length === 0) throw new Error("No CPU data available.");
 
      let rawValue = parseFloat(data[0].value[1]);
      document.getElementById("cpu-usageB").textContent = `${rawValue.toFixed(3)}`;
 
      const now = new Date();
      document.getElementById("cpu-refresh-timeB").textContent = `Last updated at ${now.toLocaleTimeString()}`;
    } catch (error) {
      console.error("Error fetching CPU usage data:", error);
      document.getElementById("cpu-usageB").textContent = "Error fetching data.";
      document.getElementById("cpu-refresh-timeB").textContent = "";
    }
  }

  
 
 
// Function to fetch RAM usage
async function fetchRAMUsage() {
    try {
      const response = await fetch("/ram-usageserverb");
      const data = await response.json();
      if (!data || data.length === 0) throw new Error("No RAM data available.");
 
      let rawValue = parseFloat(data[0].value[1]);
      document.getElementById("ram-usageB").textContent = `${rawValue.toFixed(1)}%`;
 
      const now = new Date();
      document.getElementById("ram-refresh-timeB").textContent = `Last updated at ${now.toLocaleTimeString()}`;
    } catch (error) {
      console.error("Error fetching RAM usage data:", error);
      document.getElementById("ram-usageB").textContent = "Error fetching data.";
      document.getElementById("ram-refresh-timeB").textContent = "";
    }
  }
 
 
// Function to fetch Root FS usage
async function fetchRootFSUsage() {
    try {
      const response = await fetch("/root-fs-usageserverb");
      const data = await response.json();
      if (!data || data.length === 0) throw new Error("No Root FS data available.");
 
      let rawValue = parseFloat(data[0].value[1]);
      document.getElementById("root-fs-usageB").textContent = `${rawValue.toFixed(1)}%`;
 
      const now = new Date();
      document.getElementById("root-fs-refresh-timeB").textContent = `Last updated at ${now.toLocaleTimeString()}`;
    } catch (error) {
      console.error("Error fetching Root FS usage data:", error);
      document.getElementById("root-fs-usageB").textContent = "Error fetching data.";
      document.getElementById("root-fs-refresh-timeB").textContent = "";
    }
  }
 
 
  // Function to fetch Server Uptime
async function fetchServerUptime() {
    try {
      const response = await fetch("/server-uptimeserverb");
      const data = await response.json();
      if (!data || data.length === 0) throw new Error("No Server Uptime data available.");
 
      const uptimeInSeconds = parseFloat(data[0].value[1]);
      const uptimeInHours = uptimeInSeconds / 3600;
      document.getElementById("server-uptimeB").textContent = `${uptimeInHours.toFixed(1)} hours`;
 
      const now = new Date();
      document.getElementById("uptime-refresh-timeB").textContent = `Last updated at ${now.toLocaleTimeString()}`;
    } catch (error) {
      console.error("Error fetching Server Uptime data:", error);
      document.getElementById("server-uptimeB").textContent = "Error fetching data.";
      document.getElementById("uptime-refresh-timeB").textContent = "";
    }
  }
 
 
 
  async function fetchAndUpdateChart() {
    try {
        const response = await fetch("/requests-errorsserverb");
 
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
 
        const ctx = document.getElementById("requestsErrorsChartB")?.getContext("2d");
        if (!ctx) {
            console.error("Canvas element 'requestsErrorsChartB' not found.");
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
        const response = await fetch("/requests-networktrafficB");
 
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
        document.getElementById("ip-refresh-timeB").textContent = `Last updated at ${now.toLocaleTimeString()}`;
 
        const ctx = document.getElementById("networkTrafficChartB")?.getContext("2d");
        if (!ctx) {
            console.error("Canvas element 'networkTrafficChartB' not found.");
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
 
 
 

// Function to fetch Summary for Server B using OpenAI
async function fetchServerBSummary() {
    try {
      // Display loading text
      document.getElementById("summaryb").innerHTML = "<p>Generating summary...</p>";
  
      // Prepare the data for Server B to be summarized
      const data = {
        dockerStatus: document.getElementById("docker-statusB").textContent || "N/A",
        cpuUsage: document.getElementById("cpu-usageB").textContent || "N/A",
        ramUsage: document.getElementById("ram-usageB").textContent || "N/A",
        rootFSUsage: document.getElementById("root-fs-usageB").textContent || "N/A",
        serverUptime: document.getElementById("server-uptimeB").textContent || "N/A",
      };
  
      // Fetch Request Error Data for Server B
      const requestErrorResponse = await fetch("/requests-errorsserverb");
      const requestErrorData = await requestErrorResponse.json();
      if (requestErrorData.data && requestErrorData.data.length > 0) {
        data.requestsErrors = requestErrorData.data[0]; // Extract first dataset
      } else {
        data.requestsErrors = { timestamps: [], values: [] }; // Default empty dataset
      }
  
      // Fetch Remote IP Data for Server B
      const remoteIPResponse = await fetch("/remote-ip-data");
      const remoteIPData = await remoteIPResponse.json();
      data.remoteIPs = remoteIPData.length
        ? remoteIPData.map((ip) => `${ip.ip} - ${ip.value} requests at ${ip.timestamp}`).join(", ")
        : "No remote IP activity detected.";
  
      // 🔹 Debugging: Log the data before sending
      console.log("Server B Summary Data Sent to Backend:", JSON.stringify(data, null, 2));
  
      // Send data to the backend for summarization
      const summaryResponse = await fetch("/summarize-serverb", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }), // Send full data
      });
  
      const result = await summaryResponse.json();
      if (!result.summary) throw new Error("No summary returned.");
  
      // 🔹 Debugging: Log the GPT-generated summary
      console.log("GPT Summary Received for Server B:", result.summary);
  
      // Format the summary into an ordered list
      const formattedSummary = result.summary
        .split(/\d\.\s+/) // Split on "1. ", "2. ", etc.
        .filter((item) => item.trim() !== "") // Remove empty items
        .map((item) => `<li>${item.trim()}</li>`) // Wrap each sentence in <li>
        .join(""); // Join all list items into a single string
  
      document.getElementById("summaryb").innerHTML = `<ol>${formattedSummary}</ol>`;
    } catch (error) {
      console.error("Error fetching insights for Server B:", error);
      document.getElementById("summaryb").innerHTML =
        "<p style='color: red;'>Error generating insights. Please try again.</p>";
    }
  }
  
  // Add event listener to the Server B summary button
  document
    .getElementById("generate-summary-buttonb")
    .addEventListener("click", fetchServerBSummary);
  
  





 
 
 
  // Function to fetch Docker status
async function fetchDockerStatus() {
    try {
      const response = await fetch("/docker-statusB");
      const data = await response.json();
 
      if (data.status === undefined) throw new Error("No Docker status data available.");
 
      const dockerStatus = data.status === 1 ? "ON" : "OFF";
      document.getElementById("docker-statusB").textContent = dockerStatus;
 
      const now = new Date();
      document.getElementById("docker-refresh-timeB").textContent = `Last updated at ${now.toLocaleTimeString()}`;
    } catch (error) {
      console.error("Error fetching Docker status:", error);
      document.getElementById("docker-statusB").textContent = "Error fetching data.";
      document.getElementById("docker-refresh-timeB").textContent = "";
    }
  }
 
 
 
 
 
 
// Start 10-second refresh intervals for each function
setInterval(fetchCPUUsage, 10000);
setInterval(fetchRAMUsage, 10000);
setInterval(fetchRootFSUsage, 10000);
setInterval(fetchServerUptime, 10000);
setInterval(fetchAndUpdateChart, 10000);
setInterval(fetchAndUpdateNetworkTrafficChart, 10000);
setInterval(fetchDockerStatus, 10000);
 
 
 
 
  fetchCPUUsage();
  fetchRAMUsage();
  fetchRootFSUsage();
  fetchServerUptime();
  fetchAndUpdateChart();
  fetchAndUpdateNetworkTrafficChart();
  fetchDockerStatus();
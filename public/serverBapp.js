// Global flag to track Live mode activation
let requestsErrorsChart;
let networkTrafficChart = null;
let isLiveModeActive = true; // Live mode is enabled by default
let liveUpdateInterval;

// Function to fetch CPU usage
async function fetchCPUUsage() {
    try {
        if (!isLiveModeActive) return; // Skip if live mode is inactive

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



// ✅ Function to fetch and update CPU usage based on selected timeframe for Server B
async function fetchCPUUsageRange(start) {
    try {
        if (!isLiveModeActive && !start) return; // Ensure live mode is off and start time exists

        const endpoint = `/cpu-usageserverb-range?start=${start}`;
        const response = await fetch(endpoint);
        const data = await response.json();

        if (!data.success) throw new Error(data.error || "No CPU data available.");

        // ✅ Compute the average CPU usage over the selected range
        const total = data.data.reduce((sum, entry) => sum + entry.value, 0);
        const averageValue = total / data.data.length; // Average calculation

        // ✅ Get the latest value in the range
        let rawValue = data.data[data.data.length - 1]?.value || 0;

        // ✅ Update the frontend with both latest and average values
        document.getElementById("cpu-usageB").textContent = `${rawValue.toFixed(3)}%`;

        // ✅ Determine the appropriate refresh time message
        const now = new Date();
        if (isLiveModeActive) {
            document.getElementById("cpu-refresh-timeB").textContent = `Last updated at: ${now.toLocaleString()}`;
        } else {
            document.getElementById("cpu-refresh-timeB").textContent = `Data fetched for range starting at: ${new Date(start * 1000).toLocaleString()}`;
        }
    } catch (error) {
        console.error("Error fetching CPU usage range data:", error);
        document.getElementById("cpu-usageB").textContent = "Error fetching data.";
        document.getElementById("cpu-refresh-timeB").textContent = "";
    }
}






// Function to fetch RAM usage
async function fetchRAMUsage() {
    try {
        if (!isLiveModeActive) return; // Skip if live mode is inactive

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



// ✅ Function to fetch and update RAM usage based on selected timeframe for Server B
async function fetchRAMUsageRange(start) {
    try {
        if (!isLiveModeActive && !start) return; // Ensure live mode is off and start time exists

        const endpoint = `/ram-usageserverb-range?start=${start}`;
        const response = await fetch(endpoint);
        const data = await response.json();

        if (!data.success) throw new Error(data.error || "No RAM data available.");

        // ✅ Use the computed average RAM usage from the API response
        const averageValue = data.average;

        // ✅ Get the latest RAM usage value in the range
        let rawValue = data.data[data.data.length - 1]?.value || 0;

        // ✅ Update the frontend with the latest RAM usage value
        document.getElementById("ram-usageB").textContent = `${rawValue.toFixed(1)}%`;

        // ✅ Determine the appropriate refresh time message
        const now = new Date();
        if (isLiveModeActive) {
            document.getElementById("ram-refresh-timeB").textContent = `Last updated at: ${now.toLocaleString()}`;
        } else {
            document.getElementById("ram-refresh-timeB").textContent = `Data fetched for range starting at: ${new Date(start * 1000).toLocaleString()}`;
        }
    } catch (error) {
        console.error("Error fetching RAM usage range data:", error);
        document.getElementById("ram-usageB").textContent = "Error fetching data.";
        document.getElementById("ram-refresh-timeB").textContent = "";
    }
}



// Function to fetch Root FS usage
async function fetchRootFSUsage() {
    try {
        if (!isLiveModeActive) return; // Skip if live mode is inactive

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



// ✅ Function to fetch and update Root FS usage based on selected timeframe for Server B
async function fetchRootFSUsageRange(start) {
    try {
        if (!isLiveModeActive && !start) return; // Ensure live mode is off and start time exists

        const endpoint = `/root-fs-usageserverb-range?start=${start}`;
        const response = await fetch(endpoint);
        const data = await response.json();

        if (!data.success) throw new Error(data.error || "No Root FS data available.");

        // ✅ Compute the average Root FS usage from API response
        const values = data.data.map(entry => entry.value);
        const averageValue = values.reduce((sum, val) => sum + val, 0) / values.length;

        // ✅ Get the latest Root FS usage value in the range
        let rawValue = data.data[data.data.length - 1]?.value || 0;

        // ✅ Update the frontend with the latest Root FS usage value
        document.getElementById("root-fs-usageB").textContent = `${rawValue.toFixed(1)}%`;

        // ✅ Determine the appropriate refresh time message
        const now = new Date();
        if (isLiveModeActive) {
            document.getElementById("root-fs-refresh-timeB").textContent = `Last updated at: ${now.toLocaleString()}`;
        } else {
            document.getElementById("root-fs-refresh-timeB").textContent = `Data fetched for range starting at: ${new Date(start * 1000).toLocaleString()}`;
        }
    } catch (error) {
        console.error("Error fetching Root FS usage range data:", error);
        document.getElementById("root-fs-usageB").textContent = "Error fetching data.";
        document.getElementById("root-fs-refresh-timeB").textContent = "";
    }
}





// Function to fetch Server Uptime
async function fetchServerUptime() {
    try {
        if (!isLiveModeActive) return; // Skip if live mode is inactive

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

// Function to fetch and update Requests & Errors chart
async function fetchAndUpdateChart() {
    try {
        if (!isLiveModeActive) return; // Skip if live mode is inactive

        const response = await fetch("/requests-errorsserverb");
        const responseData = await response.json();
        const { data } = responseData;

        if (!data || data.length === 0) return;

        const timestamps = data[0]?.timestamps || [];
        const values = data[0]?.values || [];

        const ctx = document.getElementById("requestsErrorsChartB")?.getContext("2d");
        if (!ctx) return;

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
        const now = new Date();
        document.getElementById("r-refresh-timeB").textContent = `Last updated at ${now.toLocaleTimeString()}`;
    } catch (error) {
        console.error("Error updating the chart:", error);
    }
}



// ✅ Function to fetch and update Requests & Errors chart based on selected timeframe for Server B
async function fetchAndUpdateChartRange(start) {
    try {
        if (!isLiveModeActive && !start) return;

        const endpoint = `/requests-errorsserverb-range?start=${start}`;
        const response = await fetch(endpoint);
        const responseData = await response.json();

        if (!responseData.success) throw new Error(responseData.error || "No data available.");

        const data = responseData.data;
        const timestamps = data[0]?.timestamps || [];
        const values = data[0]?.values || [];

        const ctx = document.getElementById("requestsErrorsChartB")?.getContext("2d");
        if (!ctx) return;

        if (requestsErrorsChart) {
            // ✅ Update the existing chart
            requestsErrorsChart.data.labels = timestamps;
            requestsErrorsChart.data.datasets[0].data = values;
            requestsErrorsChart.update();
        } else {
            // ✅ Create a new chart if one doesn't exist
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

        // ✅ Determine the appropriate refresh time message
        const now = new Date();
        if (isLiveModeActive) {
            document.getElementById("r-refresh-timeB").textContent = `Last updated at: ${now.toLocaleString()}`;
        } else {
            document.getElementById("r-refresh-timeB").textContent = `Data fetched for range starting at: ${new Date(start * 1000).toLocaleString()}`;
        }
    } catch (error) {
        console.error("Error updating the Requests & Errors chart:", error);
    }
}










function getRandomColor() {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgb(${r}, ${g}, ${b})`;
  }
  

// Function to fetch and update Network Traffic chart
async function fetchAndUpdateNetworkTrafficChart() {
    try {
        if (!isLiveModeActive) return; // Skip if live mode is inactive

        const response = await fetch("/requests-networktrafficB");
        const responseData = await response.json();
        const { data } = responseData;

        if (!data || data.length === 0) return;

        const timestamps = data[0]?.timestamps || [];
        const datasets = data.map((dataset) => ({
            label: dataset.name,
            data: dataset.values,
            borderColor: getRandomColor(),
            backgroundColor: "rgba(0, 0, 0, 0)",
            fill: false,
            tension: 0.2,
        }));

        const ctx = document.getElementById("networkTrafficChartB")?.getContext("2d");
        if (!ctx) return;

        if (networkTrafficChart) {
            networkTrafficChart.data.labels = timestamps;
            networkTrafficChart.data.datasets = datasets;
            networkTrafficChart.update();
        } else {
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
        const now = new Date();
        document.getElementById("ip-refresh-timeB").textContent = `Last updated at ${now.toLocaleTimeString()}`;
    } catch (error) {
        console.error("Error updating the Network Traffic chart:", error);
    }
}



// ✅ Function to fetch and update Network Traffic chart based on selected timeframe for Server B
async function fetchAndUpdateNetworkTrafficChartRange(start) {
    try {
        if (!isLiveModeActive && !start) return;

        const endpoint = `/requests-networktrafficb-range?start=${start}`;
        const response = await fetch(endpoint);
        const responseData = await response.json();

        if (!responseData.success) throw new Error(responseData.error || "No data available.");

        const data = responseData.data;
        const timestamps = data[0]?.timestamps || [];
        const datasets = data.map((dataset) => ({
            label: dataset.name,
            data: dataset.values,
            borderColor: getRandomColor(),
            backgroundColor: "rgba(0, 0, 0, 0)",
            fill: false,
            tension: 0.2,
        }));

        const ctx = document.getElementById("networkTrafficChartB")?.getContext("2d");
        if (!ctx) return;

        if (networkTrafficChart) {
            // ✅ Update the existing chart
            networkTrafficChart.data.labels = timestamps;
            networkTrafficChart.data.datasets = datasets;
            networkTrafficChart.update();
        } else {
            // ✅ Create a new chart if one doesn't exist
            networkTrafficChart = new Chart(ctx, {
                type: "line",
                data: { labels: timestamps, datasets: datasets },
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

        // ✅ Determine the appropriate refresh time message
        const now = new Date();
        if (isLiveModeActive) {
            document.getElementById("ip-refresh-timeB").textContent = `Last updated at: ${now.toLocaleString()}`;
        } else {
            document.getElementById("ip-refresh-timeB").textContent = `Data fetched for range starting at: ${new Date(start * 1000).toLocaleString()}`;
        }
    } catch (error) {
        console.error("Error updating the Network Traffic chart:", error);
    }
}







// Function to fetch Docker status
async function fetchDockerStatus() {
    try {
        if (!isLiveModeActive) return; // Skip if live mode is inactive

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
        data.requestsErrors = requestErrorData.data?.[0] || { timestamps: [], values: [] };
  
        // ✅ Get Network Traffic Data from Chart.js (Replacing Remote IPs)
        const chartInstance = Chart.getChart("networkTrafficChartB");
        if (chartInstance) {
            data.networkTraffic = chartInstance.data.datasets.map(dataset => ({
                label: dataset.label,
                timestamps: chartInstance.data.labels, // Get all timestamps
                values: dataset.data // Get all recorded traffic values
            }));
        } else {
            data.networkTraffic = "No network traffic data found in the chart.";
        }
  
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

// Function to enable Live Mode
function enableLiveMode() {
    isLiveModeActive = true; // Enable live mode
    clearInterval(liveUpdateInterval); // Clear any existing intervals

    // Fetch data immediately
    fetchCPUUsage();
    fetchRAMUsage();
    fetchRootFSUsage();
    fetchServerUptime();
    fetchAndUpdateChart();
    fetchAndUpdateNetworkTrafficChart();
    fetchDockerStatus();

    // Set interval for live updates (every 10 seconds)
    liveUpdateInterval = setInterval(() => {
        fetchCPUUsage();
        fetchRAMUsage();
        fetchRootFSUsage();
        fetchServerUptime();
        fetchAndUpdateChart();
        fetchAndUpdateNetworkTrafficChart();
        fetchDockerStatus();
    }, 10000);
}

// Function to disable Live Mode
function disableLiveMode() {
    isLiveModeActive = false; // Disable live mode
    clearInterval(liveUpdateInterval); // Stop live updates
}

// Event listener for timeframe dropdown
document.getElementById("timeframeB").addEventListener("change", function () {
    if (this.value === "live") {
        enableLiveMode(); // Enable live updates
    } else {
        isLiveModeActive = false;
        clearInterval(liveUpdateInterval); // Stop live updates

        const start = Math.floor(Date.now() / 1000) - parseInt(this.value, 10);

        // Fetch data for the selected timeframe
        fetchCPUUsageRange(start);
        fetchRAMUsageRange(start);
        fetchRootFSUsageRange(start);
        fetchAndUpdateChartRange(start);
        fetchAndUpdateNetworkTrafficChartRange(start);
    }
});

// Initialize Live Mode on page load
enableLiveMode();
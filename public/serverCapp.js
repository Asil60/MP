// Global flag to track Live mode activation
let isLiveModeActive = true; // Live mode is enabled by default
let liveUpdateInterval;
let requestsErrorsChart;
let networkTrafficChart;

// Function to fetch CPU usage
async function fetchCPUUsage() {
    try {
        if (!isLiveModeActive) return; // Skip if live mode is inactive

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



// ✅ Function to fetch and update CPU usage based on selected timeframe for Server C
async function fetchCPUUsageCRange(start) {
    try {
        if (!isLiveModeActive && !start) return; // Ensure live mode is off and start time exists

        const endpoint = `/cpu-usageserverc-range?start=${start}`;
        const response = await fetch(endpoint);
        const responseData = await response.json();

        if (!responseData.success) throw new Error(responseData.error || "No CPU data available.");

        // ✅ Compute the average CPU usage over the selected range
        const cpuValues = responseData.data.map(entry => entry.value);
        const averageCPU = cpuValues.reduce((sum, val) => sum + val, 0) / cpuValues.length;

        // ✅ Get the latest CPU usage value in the range
        let rawValue = responseData.data[responseData.data.length - 1]?.value || 0;

        // ✅ Update the frontend with the latest CPU usage value
        document.getElementById("cpu-usageC").textContent = `${rawValue.toFixed(2)}%`;

        // ✅ Determine the appropriate refresh time message
        const now = new Date();
        if (isLiveModeActive) {
            document.getElementById("cpu-refresh-timeC").textContent = `Last updated at: ${now.toLocaleString()}`;
        } else {
            document.getElementById("cpu-refresh-timeC").textContent = `Data fetched for range starting at: ${new Date(start * 1000).toLocaleString()}`;
        }
    } catch (error) {
        console.error("Error fetching CPU usage data:", error);
        document.getElementById("cpu-usageC").textContent = "Error fetching data.";
        document.getElementById("cpu-refresh-timeC").textContent = "";
    }
}





// Function to fetch RAM usage
async function fetchRAMUsage() {
    try {
        if (!isLiveModeActive) return; // Skip if live mode is inactive

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



// ✅ Function to fetch and update RAM usage based on selected timeframe for Server C
async function fetchRAMUsageCRange(start) {
    try {
        if (!isLiveModeActive && !start) return; // Ensure live mode is off and start time exists

        const endpoint = `/ram-usageserverc-range?start=${start}`;
        const response = await fetch(endpoint);
        const responseData = await response.json();

        if (!responseData.success) throw new Error(responseData.error || "No RAM data available.");

        // ✅ Compute the average RAM usage over the selected range
        const ramValues = responseData.data.map(entry => entry.value);
        const averageRAM = ramValues.reduce((sum, val) => sum + val, 0) / ramValues.length;

        // ✅ Get the latest RAM usage value in the range
        let rawValue = responseData.data[responseData.data.length - 1]?.value || 0;

        // ✅ Update the frontend with the latest RAM usage value
        document.getElementById("ram-usageC").textContent = `${rawValue.toFixed(2)}%`;

        // ✅ Determine the appropriate refresh time message
        const now = new Date();
        if (isLiveModeActive) {
            document.getElementById("ram-refresh-timeC").textContent = `Last updated at: ${now.toLocaleString()}`;
        } else {
            document.getElementById("ram-refresh-timeC").textContent = `Data fetched for range starting at: ${new Date(start * 1000).toLocaleString()}`;
        }
    } catch (error) {
        console.error("Error fetching RAM usage data:", error);
        document.getElementById("ram-usageC").textContent = "Error fetching data.";
        document.getElementById("ram-refresh-timeC").textContent = "";
    }
}




// Function to fetch Root FS usage
async function fetchRootFSUsage() {
    try {
        if (!isLiveModeActive) return; // Skip if live mode is inactive

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


// ✅ Function to fetch and update Root FS usage based on selected timeframe for Server C
async function fetchRootFSUsageCRange(start) {
    try {
        if (!isLiveModeActive && !start) return; // Ensure live mode is off and start time exists

        const endpoint = `/root-fs-usageserverc-range?start=${start}`;
        const response = await fetch(endpoint);
        const responseData = await response.json();

        if (!responseData.success) throw new Error(responseData.error || "No Root FS data available.");

        // ✅ Compute the average Root FS usage over the selected range
        const rootFSValues = responseData.data.map(entry => entry.value);
        const averageRootFS = rootFSValues.reduce((sum, val) => sum + val, 0) / rootFSValues.length;

        // ✅ Get the latest Root FS usage value in the range
        let rawValue = responseData.data[responseData.data.length - 1]?.value || 0;

        // ✅ Update the frontend with the latest Root FS usage value
        document.getElementById("root-fs-usageC").textContent = `${rawValue.toFixed(2)}%`;

        // ✅ Determine the appropriate refresh time message
        const now = new Date();
        if (isLiveModeActive) {
            document.getElementById("root-fs-refresh-timeC").textContent = `Last updated at: ${now.toLocaleString()}`;
        } else {
            document.getElementById("root-fs-refresh-timeC").textContent = `Data fetched for range starting at: ${new Date(start * 1000).toLocaleString()}`;
        }
    } catch (error) {
        console.error("Error fetching Root FS usage data:", error);
        document.getElementById("root-fs-usageC").textContent = "Error fetching data.";
        document.getElementById("root-fs-refresh-timeC").textContent = "";
    }
}




// Function to fetch Server Uptime
async function fetchServerUptime() {
    try {
        if (!isLiveModeActive) return; // Skip if live mode is inactive

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

// Function to fetch and update Requests & Errors chart
async function fetchAndUpdateChart() {
    try {
        if (!isLiveModeActive) return; // Skip if live mode is inactive

        const response = await fetch("/requests-errorsserverc");
        const responseData = await response.json();
        const { data } = responseData;

        if (!data || data.length === 0) return;

        const timestamps = data[0]?.timestamps || [];
        const values = data[0]?.values || [];

        const ctx = document.getElementById("requestsErrorsChartC")?.getContext("2d");
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
    } catch (error) {
        console.error("Error updating the chart:", error);
    }
}



// ✅ Function to fetch and update Requests & Errors chart based on selected timeframe for Server C
async function fetchAndUpdateRequestsErrorsChartCRange(start) {
    try {
        if (!isLiveModeActive && !start) return;

        const endpoint = `/requests-errorsserverc-range?start=${start}`;
        const response = await fetch(endpoint);
        const responseData = await response.json();

        if (!responseData.success) throw new Error(responseData.error || "No data available.");

        const data = responseData.data;
        const timestamps = data[0]?.timestamps || [];
        const values = data[0]?.values || [];

        const ctx = document.getElementById("requestsErrorsChartC")?.getContext("2d");
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
            document.getElementById("r-refresh-timeC").textContent = `Last updated at: ${now.toLocaleString()}`;
        } else {
            document.getElementById("r-refresh-timeC").textContent = `Data fetched for range starting at: ${new Date(start * 1000).toLocaleString()}`;
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

        const response = await fetch("/requests-networktrafficC");
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

        const ctx = document.getElementById("networkTrafficChartC")?.getContext("2d");
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
        document.getElementById("ip-refresh-timeC").textContent = `Last updated at ${now.toLocaleTimeString()}`;
    } catch (error) {
        console.error("Error updating the Network Traffic chart:", error);
    }
}



// ✅ Function to fetch and update Network Traffic chart based on selected timeframe for Server C
async function fetchAndUpdateNetworkTrafficChartCRange(start) {
    try {
        if (!isLiveModeActive && !start) return;

        const endpoint = `/requests-networktrafficc-range?start=${start}`;
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

        const ctx = document.getElementById("networkTrafficChartC")?.getContext("2d");
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

        // ✅ Determine the appropriate refresh time message
        const now = new Date();
        if (isLiveModeActive) {
            document.getElementById("ip-refresh-timeC").textContent = `Last updated at: ${now.toLocaleString()}`;
        } else {
            document.getElementById("ip-refresh-timeC").textContent = `Data fetched for range starting at: ${new Date(start * 1000).toLocaleString()}`;
        }
    } catch (error) {
        console.error("Error updating the Network Traffic chart:", error);
    }
}

// ✅ Function to generate random colors for datasets
function getRandomColor() {
    return `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
}






// Function to fetch Docker status
async function fetchDockerStatus() {
    try {
        if (!isLiveModeActive) return; // Skip if live mode is inactive

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




// Function to fetch Summary for Server C using OpenAI
async function fetchServerCSummary() {
    try {
        // Display loading text
        document.getElementById("summaryc").innerHTML = "<p>Generating summary...</p>";
  
        // Prepare the data for Server C to be summarized
        const data = {
            dockerStatus: document.getElementById("docker-statusC").textContent || "N/A",
            cpuUsage: document.getElementById("cpu-usageC").textContent || "N/A",
            ramUsage: document.getElementById("ram-usageC").textContent || "N/A",
            rootFSUsage: document.getElementById("root-fs-usageC").textContent || "N/A",
            serverUptime: document.getElementById("server-uptimeC").textContent || "N/A",
        };
  
        // Fetch Request Error Data for Server C
        const requestErrorResponse = await fetch("/requests-errorsserverc");
        const requestErrorData = await requestErrorResponse.json();
        data.requestsErrors = requestErrorData.data?.[0] || { timestamps: [], values: [] };
  
        // ✅ Get Network Traffic Data from Chart.js (Replacing Remote IPs)
        const chartInstance = Chart.getChart("networkTrafficChartC");
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
        console.log("Server C Summary Data Sent to Backend:", JSON.stringify(data, null, 2));
  
        // Send data to the backend for summarization
        const summaryResponse = await fetch("/summarize-serverc", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ data }), // Send full data
        });
  
        const result = await summaryResponse.json();
        if (!result.summary) throw new Error("No summary returned.");
  
        // 🔹 Debugging: Log the GPT-generated summary
        console.log("GPT Summary Received for Server C:", result.summary);
  
        // Format the summary into an ordered list
        const formattedSummary = result.summary
            .split(/\d\.\s+/) // Split on "1. ", "2. ", etc.
            .filter((item) => item.trim() !== "") // Remove empty items
            .map((item) => `<li>${item.trim()}</li>`) // Wrap each sentence in <li>
            .join(""); // Join all list items into a single string
  
        document.getElementById("summaryc").innerHTML = `<ol>${formattedSummary}</ol>`;
    } catch (error) {
        console.error("Error fetching insights for Server C:", error);
        document.getElementById("summaryc").innerHTML =
            "<p style='color: red;'>Error generating insights. Please try again.</p>";
    }
  }
  
  // Add event listener to the Server C summary button
  document
    .getElementById("generate-summary-buttonc")
    .addEventListener("click", fetchServerCSummary);
  
   



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
document.getElementById("timeframeC").addEventListener("change", function () {
    if (this.value === "live") {
        enableLiveMode(); // Enable live updates
    } else {
        isLiveModeActive = false;
        clearInterval(liveUpdateInterval); // Stop live updates

        const start = Math.floor(Date.now() / 1000) - parseInt(this.value, 10);

        // Fetch data for the selected timeframe
        fetchCPUUsageCRange(start);
        fetchRAMUsageCRange(start);
        fetchRootFSUsageCRange(start);
        fetchAndUpdateRequestsErrorsChartCRange(start);
        fetchAndUpdateNetworkTrafficChartCRange(start);
    
    }
});

// Initialize Live Mode on page load
enableLiveMode();
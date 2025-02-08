
let requestsErrorsChart;
let networkTrafficChart = null; // Declare globally
let isLiveModeActiveA = true; // Default: Live Mode is active
let updateIntervalA;

// Function to fetch CPU usage
async function fetchCPUUsageA() {
    try {
        if (!isLiveModeActiveA) return; // Stop updates if timeframe is selected

        const response = await fetch("/cpu-usageservera");
        const data = await response.json();
        if (!data || data.length === 0) throw new Error("No CPU data available.");

        let rawValue = parseFloat(data[0].value[1]);
        document.getElementById("cpu-usageA").textContent = `${rawValue.toFixed(3)}`;

        const now = new Date();
        document.getElementById("cpu-refresh-timeA").textContent = `Last updated at ${now.toLocaleTimeString()}`;
    } catch (error) {
        console.error("Error fetching CPU usage data:", error);
        document.getElementById("cpu-usageA").textContent = "Error fetching data.";
        document.getElementById("cpu-refresh-timeA").textContent = "";
    }
}

// Function to fetch CPU usage (Range Selection)
async function fetchCPUUsageARange(start) {
  try {
    if (!isLiveModeActiveA && !start) return; // Ensure live mode is off and start time exists
    
    const response = await fetch(`/cpu-usageservera-range?start=${start}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.error || "No CPU data available.");

    // Get the latest value in the range
    let rawValue = data.data[data.data.length - 1]?.value || 0;
    document.getElementById("cpu-usageA").textContent = `${rawValue.toFixed(3)}%`;

    document.getElementById("cpu-refresh-timeA").textContent = `Data fetched for range starting at: ${new Date(start * 1000).toLocaleString()}`;
  } catch (error) {
    console.error("Error fetching CPU usage range data:", error);
    document.getElementById("cpu-usageA").textContent = "Error fetching data.";
    document.getElementById("cpu-refresh-timeA").textContent = "";
  }
}
// Function to fetch RAM usage
async function fetchRAMUsageA() {
    try {
        if (!isLiveModeActiveA) return;

        const response = await fetch("/ram-usageservera");
        const data = await response.json();
        if (!data || data.length === 0) throw new Error("No RAM data available.");

        let rawValue = parseFloat(data[0].value[1]);
        document.getElementById("ram-usageA").textContent = `${rawValue.toFixed(1)}%`;

        const now = new Date();
        document.getElementById("ram-refresh-timeA").textContent = `Last updated at ${now.toLocaleTimeString()}`;
    } catch (error) {
        console.error("Error fetching RAM usage data:", error);
        document.getElementById("ram-usageA").textContent = "Error fetching data.";
        document.getElementById("ram-refresh-timeA").textContent = "";
    }
}

// Function to fetch and update RAM usage based on selected timeframe
async function fetchRAMUsageARange(start) {
  try {
      if (!isLiveModeActiveA && !start) return; // Ensure live mode is off and start time exists

      const endpoint = `/ram-usageservera-range?start=${start}`;
      const response = await fetch(endpoint);
      const data = await response.json();

      if (!data.success) throw new Error(data.error || "No RAM data available.");

      // Extract the latest RAM usage value
      let latestValue = data.data.length > 0 ? data.data[data.data.length - 1].value : null;
      let averageValue = data.average !== undefined ? data.average : null;

      if (latestValue !== null) {
          document.getElementById("ram-usageA").textContent = `${latestValue.toFixed(1)}%`;
      } else {
          document.getElementById("ram-usageA").textContent = "N/A";
      }

      if (averageValue !== null) {
          document.getElementById("ram-usageA").textContent = `${averageValue.toFixed(1)}%`;
      } else {
          document.getElementById("ram-usageA").textContent = "N/A";
      }

      const now = new Date();
      document.getElementById("ram-refresh-timeA").textContent = `Last updated at ${now.toLocaleTimeString()}`;
  } catch (error) {
      console.error("Error fetching RAM usage data:", error);
      document.getElementById("ram-usageA").textContent = "Error fetching data.";
      document.getElementById("ram-usageA").textContent = "Avg: Error fetching data.";
  }
}



// Function to fetch Root FS usage
async function fetchRootFSUsageA() {
    try {
        if (!isLiveModeActiveA) return;

        const response = await fetch("/root-fs-usageservera");
        const data = await response.json();
        if (!data || data.length === 0) throw new Error("No Root FS data available.");

        let rawValue = parseFloat(data[0].value[1]);
        document.getElementById("root-fs-usageA").textContent = `${rawValue.toFixed(1)}%`;

        const now = new Date();
        document.getElementById("root-fs-refresh-timeA").textContent = `Last updated at ${now.toLocaleTimeString()}`;
    } catch (error) {
        console.error("Error fetching Root FS usage data:", error);
        document.getElementById("root-fs-usageA").textContent = "Error fetching data.";
        document.getElementById("root-fs-refresh-timeA").textContent = "";
    }
}

// Function to fetch and update average Root FS usage
async function fetchRootFSUsageARange(start) {
  try {
      if (!isLiveModeActiveA && !start) return;

      const endpoint = `/root-fs-usageservera-range?start=${start}`;
      const response = await fetch(endpoint);
      const data = await response.json();

      if (!data.success) throw new Error(data.error || "No Root FS data available.");

      // ✅ Compute the average Root FS usage
      let sum = 0;
      let count = 0;

      data.data.forEach(entry => {
          sum += entry.value;
          count++;
      });

      let averageValue = count > 0 ? sum / count : null;

      // ✅ Display the average Root FS usage
      if (averageValue !== null) {
          document.getElementById("root-fs-usageA").textContent = `${averageValue.toFixed(1)}%`;
          
      } else {
          document.getElementById("root-fs-usageA").textContent = "Avg: N/A";
      }

      // ✅ Update the last refresh timestamp
      const now = new Date();
      document.getElementById("root-fs-refresh-timeA").textContent = `Last updated at ${now.toLocaleTimeString()}`;

  } catch (error) {
      console.error("Error fetching Root FS usage data:", error);
      document.getElementById("root-fs-usageA").textContent = "Avg: Error fetching data.";
      document.getElementById("root-fs-refresh-timeA").textContent = "";
  }
}


// Function to fetch Server Uptime
async function fetchServerUptimeA() {
    try {
        if (!isLiveModeActiveA) return;

        const response = await fetch("/server-uptimeservera");
        const data = await response.json();
        if (!data || data.length === 0) throw new Error("No Server Uptime data available.");

        const uptimeInSeconds = parseFloat(data[0].value[1]);
        const uptimeInHours = uptimeInSeconds / 3600;
        document.getElementById("server-uptimeA").textContent = `${uptimeInHours.toFixed(1)} hours`;

        const now = new Date();
        document.getElementById("uptime-refresh-timeA").textContent = `Last updated at ${now.toLocaleTimeString()}`;
    } catch (error) {
        console.error("Error fetching Server Uptime data:", error);
        document.getElementById("server-uptimeA").textContent = "Error fetching data.";
        document.getElementById("uptime-refresh-timeA").textContent = "";
    }
}

// Function to fetch and update the Requests & Errors chart
async function fetchAndUpdateChartA() {
    try {
        if (!isLiveModeActiveA) return;

        const response = await fetch("/requests-errorsservera");
        const responseData = await response.json();
        const { data } = responseData;

        if (!data || data.length === 0) return;

        const timestamps = data[0]?.timestamps || [];
        const values = data[0]?.values || [];

        const ctx = document.getElementById("requestsErrorsChartA")?.getContext("2d");
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
        // ✅ Update the refresh time
        const now = new Date();
        document.getElementById("r-refresh-timeA").textContent = `Last updated at ${now.toLocaleTimeString()}`;

    } catch (error) {
        console.error("Error updating the chart:", error);
    }
}


// ✅ Function to fetch and update Requests & Errors Chart for selected timeframe
async function fetchAndUpdateChartARange(start) {
  try {
      if (!isLiveModeActiveA && !start) return;

      const endpoint = `/requests-errorsservera-range?start=${start}`;
      const response = await fetch(endpoint);
      const responseData = await response.json();

      if (!responseData.success) throw new Error(responseData.error || "No data available.");

      const data = responseData.data;

      // ✅ Extract timestamps and values
      const timestamps = data[0]?.timestamps || [];
      const values = data[0]?.values || [];

      const ctx = document.getElementById("requestsErrorsChartA")?.getContext("2d");
      if (!ctx) return;

      if (requestsErrorsChart) {
          // ✅ Update existing chart
          requestsErrorsChart.data.labels = timestamps;
          requestsErrorsChart.data.datasets[0].data = values;
          requestsErrorsChart.update();
      } else {
          // ✅ Create new chart if not exists
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

      // ✅ Update the refresh time
      document.getElementById("r-refresh-timeA").textContent = `Last updated at ${new Date().toLocaleTimeString()}`;
  } catch (error) {
      console.error("Error updating the Requests & Errors chart:", error);
  }
}







// Function to fetch and update Network Traffic Chart
async function fetchAndUpdateNetworkTrafficChartA() {
    try {
        if (!isLiveModeActiveA) return;

        const response = await fetch("/requests-networktrafficA");
        const responseData = await response.json();
        const { data } = responseData;

        if (!data || data.length === 0) return;

        const timestamps = data[0]?.timestamps || [];
        const datasets = data.map((dataset) => ({
            label: dataset.name,
            data: dataset.values,
            borderColor: getRandomColor(),  // Use random color for each dataset
            backgroundColor: "rgba(0, 0, 0, 0)",
            fill: false,
            tension: 0.2,
        }));

        const ctx = document.getElementById("networkTrafficChartA")?.getContext("2d");
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
        // ✅ Update the refresh time
        const now = new Date();
        document.getElementById("ip-refresh-timeA").textContent = `Last updated at ${now.toLocaleTimeString()}`;

    } catch (error) {
        console.error("Error updating the Network Traffic chart:", error);
    }
}

function getRandomColor() {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return `rgb(${r}, ${g}, ${b})`;
}



// ✅ Function to fetch and update Network Traffic chart for selected timeframe
async function fetchAndUpdateNetworkTrafficChartARange(start) {
  try {
      if (!isLiveModeActiveA && !start) return;

      const endpoint = `/requests-networktrafficA-range?start=${start}`;
      const response = await fetch(endpoint);
      const responseData = await response.json();

      if (!responseData.success) throw new Error(responseData.error || "No data available.");

      const data = responseData.data;

      // ✅ Extract timestamps and datasets
      const timestamps = data[0]?.timestamps || [];
      const datasets = data.map((dataset) => ({
          label: dataset.name,
          data: dataset.values,
          borderColor: getRandomColor(),
          backgroundColor: "rgba(0, 0, 0, 0)",
          fill: false,
          tension: 0.2,
      }));

      const ctx = document.getElementById("networkTrafficChartA")?.getContext("2d");
      if (!ctx) return;

      if (networkTrafficChart) {
          // ✅ Update existing chart
          networkTrafficChart.data.labels = timestamps;
          networkTrafficChart.data.datasets = datasets;
          networkTrafficChart.update();
      } else {
          // ✅ Create new chart if not exists
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

      // ✅ Update the refresh time
      document.getElementById("ip-refresh-timeA").textContent = `Last updated at ${new Date().toLocaleTimeString()}`;
  } catch (error) {
      console.error("Error updating the Network Traffic chart:", error);
  }
}

// ✅ Function to generate random colors for datasets
function getRandomColor() {
  return `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
}





// Function to fetch Summary for Server A using OpenAI
async function fetchServerASummary() {
    try {
      // Display loading text
      document.getElementById("summarya").innerHTML = "<p>Generating summary...</p>";
  
      // Prepare the data for Server A to be summarized
      const data = {
        dockerStatus: document.getElementById("docker-statusA").textContent || "N/A",
        cpuUsage: document.getElementById("cpu-usageA").textContent || "N/A",
        ramUsage: document.getElementById("ram-usageA").textContent || "N/A",
        rootFSUsage: document.getElementById("root-fs-usageA").textContent || "N/A",
        serverUptime: document.getElementById("server-uptimeA").textContent || "N/A",
      };
  
      // Fetch Request Error Data for Server A
      const requestErrorResponse = await fetch("/requests-errorsservera");
      const requestErrorData = await requestErrorResponse.json();
      if (requestErrorData.data && requestErrorData.data.length > 0) {
        data.requestsErrors = requestErrorData.data[0]; // Extract first dataset
      } else {
        data.requestsErrors = { timestamps: [], values: [] }; // Default empty dataset
      }
  
      // Fetch Remote IP Data for Server A
      const remoteIPResponse = await fetch("/remote-ip-data");
      const remoteIPData = await remoteIPResponse.json();
      data.remoteIPs = remoteIPData.length
        ? remoteIPData.map((ip) => `${ip.ip} - ${ip.value} requests at ${ip.timestamp}`).join(", ")
        : "No remote IP activity detected.";
  
      // 🔹 Debugging: Log the data before sending
      console.log("Server A Summary Data Sent to Backend:", JSON.stringify(data, null, 2));
  
      // Send data to the backend for summarization
      const summaryResponse = await fetch("/summarize-servera", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }), // Send full data
      });
  
      const result = await summaryResponse.json();
      if (!result.summary) throw new Error("No summary returned.");
  
      // 🔹 Debugging: Log the GPT-generated summary
      console.log("GPT Summary Received for Server A:", result.summary);
  
      // Format the summary into an ordered list
      const formattedSummary = result.summary
        .split(/\d\.\s+/) // Split on "1. ", "2. ", etc.
        .filter((item) => item.trim() !== "") // Remove empty items
        .map((item) => `<li>${item.trim()}</li>`) // Wrap each sentence in <li>
        .join(""); // Join all list items into a single string
  
      document.getElementById("summarya").innerHTML = `<ol>${formattedSummary}</ol>`;
    } catch (error) {
      console.error("Error fetching insights for Server A:", error);
      document.getElementById("summarya").innerHTML =
        "<p style='color: red;'>Error generating insights. Please try again.</p>";
    }
  }
  
  // Add event listener to the Server A summary button
  document
    .getElementById("generate-summary-button-servera")
    .addEventListener("click", fetchServerASummary);
  
  
 
// Function to fetch Docker status
async function fetchDockerStatus() {
    try {
      const response = await fetch("/docker-statusA");
      const data = await response.json();
 
      if (data.status === undefined) throw new Error("No Docker status data available.");
 
      const dockerStatus = data.status === 1 ? "ON" : "OFF";
      document.getElementById("docker-statusA").textContent = dockerStatus;
 
      const now = new Date();
      document.getElementById("docker-refresh-timeA").textContent = `Last updated at ${now.toLocaleTimeString()}`;
    } catch (error) {
      console.error("Error fetching Docker status:", error);
      document.getElementById("docker-statusA").textContent = "Error fetching data.";
      document.getElementById("docker-refresh-timeA").textContent = "";
    }
  }




  
 
 
 


// Function to enable Live Mode
function enableLiveModeA() {
    isLiveModeActiveA = true;
    fetchCPUUsageA();
    fetchRAMUsageA();
    fetchRootFSUsageA();
    fetchServerUptimeA();
    fetchAndUpdateChartA();
    fetchAndUpdateNetworkTrafficChartA();
    fetchDockerStatus();

    clearInterval(updateIntervalA);
    updateIntervalA = setInterval(() => {
        fetchCPUUsageA();
        fetchRAMUsageA();
        fetchRootFSUsageA();
        fetchServerUptimeA();
        fetchAndUpdateChartA();
        fetchAndUpdateNetworkTrafficChartA();
        fetchDockerStatus();
    }, 10000);
}

// Event listener for timeframe dropdown
document.getElementById("timeframeA").addEventListener("change", function () {
  if (this.value === "live") {
    enableLiveModeA(); // Re-enable live updates
  } else {
    isLiveModeActiveA = false;
    clearInterval(updateIntervalA); // Stop live updates

    const start = Math.floor(Date.now() / 1000) - parseInt(this.value, 10);
    
    // Fetch data for the selected timeframe
    fetchCPUUsageARange(start);
    fetchRAMUsageARange(start);
    fetchRootFSUsageARange(start);
    fetchAndUpdateChartARange(start);
    fetchAndUpdateNetworkTrafficChartARange(start)
  }
});

// Start Live Mode on page load
enableLiveModeA();





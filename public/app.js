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

    // Send data to the backend for summarization
    const response = await fetch("/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data }),
    });

    const result = await response.json();
    if (!result.summary) throw new Error("No summary returned.");

    // Split the summary into sentences based on periods and format it into a single ordered list
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
document
  .getElementById("generate-summary-button")
  .addEventListener("click", fetchSummary);


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

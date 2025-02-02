const express = require("express");
const axios = require("axios");
const { OpenAI } = require("openai");

const app = express();
const PORT = 3000;

// Grafana API configuration
const GRAFANA_API_URL = "http://13.251.167.13:3000/api/datasources/proxy/11/api/v1/query";
const GRAFANA_API_URL_RANGE = "http://13.251.167.13:3000/api/datasources/proxy/11/api/v1/query_range";
const LOKI_API_URL = "http://13.251.167.13:3000/api/datasources/proxy/9/loki/api/v1/query_range";
const API_KEY = "glsa_YVEZzcvnH5yrMZhyNMUi8iomZgEv8sps_33763bf6"; // Replace with your Grafana API key

// OpenAI API configuration
const openai = new OpenAI({
  apiKey: "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", // Replace with your OpenAI API key
});

// Middleware to serve static files and parse JSON
app.use(express.static("public"));
app.use(express.json());

function getStepSize(start, end) {
  const range = end - start;
  if (range > 7 * 24 * 3600) return 6 * 3600; // 6 hours for > 7 days
  if (range > 2 * 24 * 3600) return 3600; // 1 hour for > 2 days
  return 10; // 10 seconds for shorter ranges
}

// 🔹 Function to dynamically determine step size based on time range
function getStepSized(start, end) {
  const range = end - start;
  if (range > 7 * 24 * 3600) return 86400; // 1 day for >7 days
  if (range > 2 * 24 * 3600) return 3600; // 1 hour for >2 days
  if (range > 3600) return 300; // 5 minutes for >1 hour
  return 1
}

// 🔹 Function to fetch and compute average from time-series data
async function fetchAndComputeAverage(query, start) {
  try {
    const end = Math.floor(Date.now() / 1000);
    const step = getStepSize(start, end);

    const response = await axios.get(GRAFANA_API_URL_RANGE, {
      params: { query, start, end, step },
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    const result = response.data.data.result;
    if (!result || result.length === 0 || !result[0].values) {
      return { success: false, error: "No data available for the range." };
    }

    const values = result[0].values;
    const average = values.reduce((sum, [, value]) => sum + parseFloat(value), 0) / values.length;

    return { success: true, average: average.toFixed(2) };
  } catch (error) {
    console.error(`Error fetching data for query: ${query}`, error.message);
    return { success: false, error: "Failed to fetch data for range." };
  }
}

// Endpoint for Nginx Status
app.get("/nginx-status", async (req, res) => {
  try {
    const query = `{__name__="nginx_up", instance="localhost:9113", job="nginx"}`;

    const response = await axios.get(GRAFANA_API_URL, {
      params: { query },
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    const result = response.data.data.result;

    // Check if there's a valid result
    if (result.length > 0) {
      const nginxStatus = parseFloat(result[0].value[1]); // Get the status value (1 or 0)
      res.json({ status: nginxStatus });
    } else {
      res.json({ status: 0 }); // Return 0 if no result found
    }
  } catch (error) {
    console.error("Error fetching Nginx status:", error.message);
    res.status(500).send("Failed to fetch Nginx status.");
  }
});

// Endpoint for CPU usage
app.get("/cpu-usage", async (req, res) => {
  try {
    const query =
      '100 * (1 - avg(rate(node_cpu_seconds_total{mode="idle", instance="localhost:9100"}[1m])))';

    const response = await axios.get(GRAFANA_API_URL, {
      params: {
        query,
        start: Math.floor(Date.now() / 1000) - 3600,
        end: Math.floor(Date.now() / 1000),
        step: 10,
      },
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    res.json(response.data.data.result);
  } catch (error) {
    console.error("Error fetching CPU usage data:", error.message);
    res.status(500).send("Failed to fetch CPU usage data.");
  }
});


// Endpoint for RAM usage
app.get("/ram-usage", async (req, res) => {
  try {
    const query =
      '100 * (1 - (node_memory_MemAvailable_bytes{instance="localhost:9100"} / node_memory_MemTotal_bytes{instance="localhost:9100"}))';

    const response = await axios.get(GRAFANA_API_URL, {
      params: {
        query,
        start: Math.floor(Date.now() / 1000) - 3600,
        end: Math.floor(Date.now() / 1000),
        step: 10,
      },
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    res.json(response.data.data.result);
  } catch (error) {
    console.error("Error fetching RAM usage data:", error.message);
    res.status(500).send("Failed to fetch RAM usage data.");
  }
});

// Endpoint for Root FS usage
app.get("/root-fs-usage", async (req, res) => {
  try {
    const query =
      '100 * (node_filesystem_size_bytes{mountpoint="/"} - node_filesystem_avail_bytes{mountpoint="/"}) / node_filesystem_size_bytes{mountpoint="/"}';

    const response = await axios.get(GRAFANA_API_URL, {
      params: {
        query,
        start: Math.floor(Date.now() / 1000) - 3600,
        end: Math.floor(Date.now() / 1000),
        step: 10,
      },
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    res.json(response.data.data.result);
  } catch (error) {
    console.error("Error fetching Root FS usage data:", error.message);
    res.status(500).send("Failed to fetch Root FS usage data.");
  }
});

// Endpoint for Server Uptime
app.get("/server-uptime", async (req, res) => {
  try {
    const query =
      'time() - node_boot_time_seconds{instance="localhost:9100"}';

    const response = await axios.get(GRAFANA_API_URL, {
      params: {
        query,
        start: Math.floor(Date.now() / 1000) - 3600,
        end: Math.floor(Date.now() / 1000),
        step: 10,
      },
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    res.json(response.data.data.result);
  } catch (error) {
    console.error("Error fetching Server Uptime data:", error.message);
    res.status(500).send("Failed to fetch Server Uptime data.");
  }
});

app.get("/requests-errors", async (req, res) => {
  try {
    const query = 'rate(nginx_http_requests_total[5m])'; // Query for rate
    const endTime = Math.floor(Date.now() / 1000); // Current time in seconds
    const startTime = endTime - 3600; // Start time (1 hour ago)
    const step = 60; // 1-minute intervals

    // Make API call with time range parameters
    const response = await axios.get(GRAFANA_API_URL_RANGE, {
      params: {
        query,
        start: startTime,
        end: endTime,
        step,
      },
      headers: {
        Authorization: `Bearer ${API_KEY}`, // Replace with your API key
      },
    });

    const resultData = response.data?.data?.result;

    if (!resultData || resultData.length === 0) {
      console.warn("No data returned from API.");
      return res.json({ data: [] });
    }

    // Process time-series data
    const formattedData = resultData.map((item) => {
      if (item.values && Array.isArray(item.values)) {
        return {
          timestamps: item.values.map((value) =>
            new Date(value[0] * 1000).toLocaleTimeString() // Only include the time
          ),
          values: item.values.map((value) => parseFloat(value[1])), // Extract metric values
        };
      }

      console.warn("Unexpected data format for item:", item);
      return null;
    }).filter(Boolean); // Remove null entries

    res.json({ data: formattedData });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).send(`Failed to fetch data: ${error.message}`);
  }
});

// Endpoint to fetch status codes
app.get("/status-codes", async (req, res) => {
  try {
    const query = `sum by (status) (count_over_time({job="nginx"} | json | __error__="" | line_format "{{.status}}" [5m]))`;
    const start = Math.floor(Date.now() / 1000) - 3600; // Last 1 hour
    const end = Math.floor(Date.now() / 1000); // Current time

    const response = await axios.get(LOKI_API_URL, {
      params: { query, start, end, step: 10 },
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    const results = response.data.data.result;
    const statusData = results.map((item) => ({
      status: item.metric.status,
      value: parseFloat(item.values[item.values.length - 1][1]),
    }));

    res.json(statusData);
  } catch (error) {
    console.error("Error fetching status codes:", error.message);
    res.status(500).send("Failed to fetch status codes.");
  }
});






// OpenAI summary endpoint
app.post("/summarize", async (req, res) => {
  try {
    const { data } = req.body; // Receive the data to analyze

    // Extract and process request-errors data
    let requestErrorsSummary = "No request error data available.";
    let errorSpikeDetected = false;
    let avgValue = 0;

    if (data.requestsErrors.timestamps.length > 0) {
      const latestTime = data.requestsErrors.timestamps[data.requestsErrors.timestamps.length - 1];
      const latestValue = data.requestsErrors.values[data.requestsErrors.values.length - 1];

      avgValue =
        data.requestsErrors.values.reduce((sum, val) => sum + val, 0) /
        data.requestsErrors.values.length;

      const maxValue = Math.max(...data.requestsErrors.values);
      const minValue = Math.min(...data.requestsErrors.values);

      // Detect error spikes (if the max is much higher than the average)
      if (maxValue > avgValue * 2) {
        errorSpikeDetected = true;
      }

      requestErrorsSummary = `
      - Latest request-error count at ${latestTime}: ${latestValue}
      - Average request-error count over the past hour: ${avgValue.toFixed(2)}
      - Highest recorded request-error count: ${maxValue}
      - Lowest recorded request-error count: ${minValue}
      ${errorSpikeDetected ? "- **Spike in errors detected** (potential downtime or high traffic issue)." : ""}
      `;
    }

    // Determine uptime stability
    let uptimeInHours = parseFloat(data.serverUptime);
    let uptimeMessage = uptimeInHours > 24
      ? "The system has been running stably for over a day."
      : `The system has been up for ${uptimeInHours.toFixed(1)} hours.`;

    if (errorSpikeDetected) {
      uptimeMessage += " However, request-error spikes suggest possible short downtimes or performance issues.";
    }

    const prompt = `
You are an expert system monitoring assistant. Analyze the following system data:
- CPU Usage: ${data.cpuUsage}
- RAM Usage: ${data.ramUsage}
- Root FS Usage: ${data.rootFSUsage}
- Server Uptime: ${data.serverUptime}
- Request Errors Trend:
  ${requestErrorsSummary}

1. Summarize the current state of the system.
2. Predict what might happen if these trends continue for the next 24 hours.
3. Explain what this data means for maintaining optimal system performance in a custom-built website.
4. Identify potential bottlenecks or issues from the request-error trends and suggest solutions.
5. Based on the request-error trends and uptime data, indicate whether the system is experiencing stable uptime or potential downtime.

**Uptime Analysis:**
${uptimeMessage}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 350,
      temperature: 0.7,
    });

    const summary = response.choices[0].message.content.trim();
    res.json({ summary });
  } catch (error) {
    console.error("Error generating summary and predictions:", error.message);
    res.status(500).send("Failed to generate summary and predictions.");
  }
});

app.post("/ask-gpt", async (req, res) => {
  try {
    const { question, data } = req.body;
    // Log received data for debugging
    console.log("Received Data for GPT:", data);

    // Format request-error data
    let requestErrorsSummary = "No request-error data available.";
    if (data.requestsErrors?.timestamps?.length > 0) {
      const latestTime = data.requestsErrors.timestamps[data.requestsErrors.timestamps.length - 1];
      const latestValue = data.requestsErrors.values[data.requestsErrors.values.length - 1];
      const avgValue =
        data.requestsErrors.values.reduce((sum, val) => sum + val, 0) /
        data.requestsErrors.values.length;
      const maxValue = Math.max(...data.requestsErrors.values);

      requestErrorsSummary = `
      - Latest request-error rate at ${latestTime}: ${latestValue.toFixed(2)}
      - Average error rate over the last hour: ${avgValue.toFixed(2)}
      - Maximum error rate in the last hour: ${maxValue.toFixed(2)}
      `;
    }

    // Log formatted summary for debugging
    console.log("Request-Errors Summary for GPT:", requestErrorsSummary);

    // Construct GPT prompt
    const prompt = `
    Based on the following system data:
    - CPU Usage: ${data.cpuUsage}
    - RAM Usage: ${data.ramUsage}
    - Root FS Usage: ${data.rootFSUsage}
    - Server Uptime: ${data.serverUptime}
    - Request Errors Summary:
      ${requestErrorsSummary}

    User's Question: "${question}"

    Provide a detailed and helpful response about the system, focusing on the request-error trends if applicable.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.7,
    });

    const answer = response.choices[0].message.content.trim();
    res.json({ answer });
  } catch (error) {
    console.error("Error processing GPT query:", error.message);
    res.status(500).json({ error: "Failed to process query." });
  }
});

app.get("/cpu-usage-range", async (req, res) => {
  const { start } = req.query;

  if (!start) {
    return res.status(400).json({ success: false, error: "Start timestamp is required." });
  }

  try {
    const end = Math.floor(Date.now() / 1000); // Current time in Unix seconds

    // Dynamically set the step size based on the time range
    const range = end - start;
    let step = 10; // Default step size (in seconds)

    if (range > 2 * 24 * 3600) step = 3600; // Step size = 1 hour for ranges > 2 days
    if (range > 7 * 24 * 3600) step = 6 * 3600; // Step size = 6 hours for ranges > 7 days

    const query =
      '100 * (1 - avg(rate(node_cpu_seconds_total{mode="idle", instance="localhost:9100"}[1m])))';

    const response = await axios.get(GRAFANA_API_URL_RANGE, {
      params: { query, start, end, step },
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    const result = response.data.data.result;

    if (!result || result.length === 0 || !result[0].values) {
      return res.status(404).json({ success: false, error: "No data available for the range." });
    }

    const values = result[0].values;

    const average =
      values.reduce((sum, [, value]) => sum + parseFloat(value), 0) / values.length;

    res.json({ success: true, average: average.toFixed(2) });
  } catch (error) {
    console.error("Error fetching CPU usage data for range:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch CPU usage data for range." });
  }
});

// 🔹 RAM Usage Endpoint (Average Over Time)
app.get("/ram-usage-range", async (req, res) => {
  const { start } = req.query;
  if (!start) return res.status(400).json({ success: false, error: "Start timestamp is required." });

  const query = '100 * (1 - (node_memory_MemAvailable_bytes{instance="localhost:9100"} / node_memory_MemTotal_bytes{instance="localhost:9100"}))';
  const result = await fetchAndComputeAverage(query, start);
  res.json(result);
});

// 🔹 Root FS Usage Endpoint (Average Over Time)
app.get("/root-fs-usage-range", async (req, res) => {
  const { start } = req.query;
  if (!start) return res.status(400).json({ success: false, error: "Start timestamp is required." });

  const query = '100 * (node_filesystem_size_bytes{mountpoint="/"} - node_filesystem_avail_bytes{mountpoint="/"}) / node_filesystem_size_bytes{mountpoint="/"}';
  const result = await fetchAndComputeAverage(query, start);
  res.json(result);
});

// 🔹 Fetch Requests & Errors Over Time (All Data)
app.get("/requests-errors-range", async (req, res) => {
  const { start } = req.query;
  if (!start) {
    return res.status(400).json({ success: false, error: "Start timestamp is required." });
  }

  try {
    const end = Math.floor(Date.now() / 1000); // Current time in UNIX seconds
    const step = Math.max(300, Math.floor((end - start) / 1000)); // At least 5-minute steps

    const query = 'rate(nginx_http_requests_total[5m])';

    console.log(`Fetching data from Grafana API with start=${start}, end=${end}, step=${step}`);

    // Fetch data from Grafana API
    const response = await axios.get(GRAFANA_API_URL_RANGE, {
      params: { query, start, end, step },
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    const resultData = response.data?.data?.result;
    if (!resultData || resultData.length === 0) {
      console.log("❌ No data received from Grafana API.");
      return res.json({ success: false, error: "No data available for the range." });
    }

    // Process time-series data: Combine all series into a single dataset
    let allTimestamps = [];
    let allValues = [];
    resultData.forEach((series) => {
      const timestamps = series.values.map((value) => value[0] * 1000); // Convert to milliseconds
      const values = series.values.map((value) => parseFloat(value[1]));
      allTimestamps = allTimestamps.concat(timestamps);
      allValues = allValues.concat(values);
    });

    // Sort timestamps and values
    const combinedData = allTimestamps
      .map((timestamp, index) => ({ timestamp, value: allValues[index] }))
      .sort((a, b) => a.timestamp - b.timestamp);

    // Extract sorted timestamps and values
    const sortedTimestamps = combinedData.map((item) => new Date(item.timestamp).toLocaleString());
    const sortedValues = combinedData.map((item) => item.value);

    // Format data for response
    const formattedData = {
      timestamps: sortedTimestamps,
      values: sortedValues,
    };

    // Send response with all data
    res.json({ success: true, data: formattedData });
  } catch (error) {
    console.error("❌ Error fetching requests/errors data for range:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch requests/errors data for range." });
  }
});


// Default route
app.get("/", (req, res) => {
  res.send("<h1>Welcome to the Node.js Grafana Integration</h1>");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

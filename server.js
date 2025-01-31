const express = require("express");
const axios = require("axios");
const { OpenAI } = require("openai");

const app = express();
const PORT = 3000;

// Grafana API configuration
const GRAFANA_API_URL = "http://18.136.43.13:3000/api/datasources/proxy/1/api/v1/query";
const GRAFANA_API_URL_RANGE = "http://18.136.43.13:3000/api/datasources/proxy/1/api/v1/query_range";
const API_KEY = "glsa_6AvxaOVDiUgTCde5nqYnf3TBlVwE1lJt_0b9647e9"; // Replace with your Grafana API key

// OpenAI API configuration
const openai = new OpenAI({
  apiKey: "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", // Replace with your OpenAI API key
});

// Middleware to serve static files and parse JSON
app.use(express.static("public"));
app.use(express.json());

// Endpoint for CPU usage
app.get("/cpu-usage", async (req, res) => {
  try {
    const query =
      '100 * (1 - avg(rate(node_cpu_seconds_total{mode="idle", instance="10.0.1.147:9100"}[1m])))';

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
      '100 * (1 - (node_memory_MemAvailable_bytes{instance="10.0.1.147:9100"} / node_memory_MemTotal_bytes{instance="10.0.1.147:9100"}))';

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
      'time() - node_boot_time_seconds{instance="10.0.1.147:9100"}';

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

    // Format request-error data for GPT
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

    // GPT prompt with the summarized data
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



// Default route
app.get("/", (req, res) => {
  res.send("<h1>Welcome to the Node.js Grafana Integration</h1>");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

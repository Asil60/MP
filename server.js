const express = require("express");
const axios = require("axios");
const { OpenAI } = require("openai");

const app = express();
const PORT = 3000;

// Grafana API configuration
const GRAFANA_API_URL = "http://18.136.43.13:3000/api/datasources/proxy/1/api/v1/query";
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

// OpenAI summary endpoint
app.post("/summarize", async (req, res) => {
  try {
    const { data } = req.body; // Receive the data to analyze
    const prompt = `
You are an expert system monitoring assistant. Analyze the following system data:
- CPU Usage: ${data.cpuUsage}
- RAM Usage: ${data.ramUsage}
- Root FS Usage: ${data.rootFSUsage}
- Server Uptime: ${data.serverUptime}

1. Summarize the current state of the system.
2. Predict what might happen if these trends continue for the next 24 hours.
3. Explain what this data means for maintaining optimal system performance in a custom-built website.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.7,
    });

    const summary = response.choices[0].message.content.trim();
    res.json({ summary });
  } catch (error) {
    console.error("Error generating summary and predictions:", error.message);
    res.status(500).send("Failed to generate summary and predictions.");
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

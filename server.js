const express = require("express");
const axios = require("axios");
const { OpenAI } = require("openai");

const app = express();
const PORT = 3000;

// Grafana API configuration
const GRAFANA_API_URL = "http://13.251.167.13:3000/api/datasources/proxy/11/api/v1/query";
const GRAFANA_API_URLA = "http://13.251.167.13:3000/api/datasources/proxy/14/api/v1/query";
const GRAFANA_API_URLB = "http://13.251.167.13:3000/api/datasources/proxy/15/api/v1/query";
const GRAFANA_API_URLC = "http://13.251.167.13:3000/api/datasources/proxy/16/api/v1/query";
const GRAFANA_API_URL_RANGE = "http://13.251.167.13:3000/api/datasources/proxy/11/api/v1/query_range";
const GRAFANA_API_URL_RANGEA = "http://13.251.167.13:3000/api/datasources/proxy/14/api/v1/query_range";
const GRAFANA_API_URL_RANGEB = "http://13.251.167.13:3000/api/datasources/proxy/15/api/v1/query_range";
const GRAFANA_API_URL_RANGEC = "http://13.251.167.13:3000/api/datasources/proxy/16/api/v1/query_range";
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

    // Extract the most recent value for each status
    const statusData = results.map((item) => {
      const status = item.metric.status; // e.g., "200", "404"
      const latestValue = parseFloat(item.values[item.values.length - 1][1]); // Get the last value
      return { status, value: latestValue };
    });

    res.json(statusData);
  } catch (error) {
    console.error("Error fetching status codes:", error.message);
    res.status(500).send("Failed to fetch status codes.");
  }
});


// 🔹 Status Codes Range Endpoint
app.get("/status-codes-range", async (req, res) => {
  const { start } = req.query;
  if (!start) {
    return res.status(400).json({ success: false, error: "Start timestamp is required." });
  }

  try {
    const end = Math.floor(Date.now() / 1000); // Current time in Unix seconds
    const step = getStepSize(start, end); // Dynamically set step size

    const query = `sum by (status) (count_over_time({job="nginx"} | json | __error__="" | line_format "{{.status}}" [5m]))`;

    const response = await axios.get(LOKI_API_URL, {
      params: { query, start, end, step },
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    const results = response.data.data.result;

    if (!results || results.length === 0) {
      return res.json({ success: false, error: "No status code data available for the range." });
    }

    // Extract and format status codes
    const statusData = results.map((item) => ({
      status: item.metric.status, // e.g., "200", "404", "500"
      value: item.values.reduce((sum, [, v]) => sum + parseFloat(v), 0), // Sum values over the range
    }));

    res.json({ success: true, data: statusData });
  } catch (error) {
    console.error("Error fetching status codes range:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch status codes range." });
  }
});



// Endpoint to fetch remote IP data
app.get("/remote-ip-data", async (req, res) => {
  try {
    const query = `topk(5, sum by (remote_addr) (rate({job="nginx"} | json | __error__="" [1m])))`;
    const start = Math.floor(Date.now() / 1000) - 3600; // Last 1 hour
    const end = Math.floor(Date.now() / 1000); // Current time

    const response = await axios.get(LOKI_API_URL, {
      params: { query, start, end, step: 10 },
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    const results = response.data.data.result;

    // Extract and format the data with timestamps
    const ipData = results.map((item) => {
      const ip = item.metric.remote_addr; // IP address
      const latestValue = item.values[item.values.length - 1]; // Most recent value and timestamp
      const value = parseFloat(latestValue[1]); // Extract value
      const timestamp = new Date(parseFloat(latestValue[0]) * 1000).toLocaleString(); // Format timestamp
      return { ip, value, timestamp };
    });

    res.json(ipData);
  } catch (error) {
    console.error("Error fetching remote IP data:", error.message);
    res.status(500).send("Failed to fetch remote IP data.");
  }
});



// 🔹 Remote IP Data with Timeframe Support
app.get("/remote-ip-data-range", async (req, res) => {
  const { start } = req.query;
  if (!start) return res.status(400).json({ success: false, error: "Start timestamp is required." });

  try {
    const end = Math.floor(Date.now() / 1000); // Current time in Unix seconds
    const step = getStepSize(start, end); // Dynamically determine step size

    const query = `topk(5, sum by (remote_addr) (rate({job="nginx"} | json | __error__="" [1m])))`;

    const response = await axios.get(LOKI_API_URL, {
      params: { query, start, end, step },
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    const results = response.data?.data?.result;
    if (!results || results.length === 0) {
      return res.json({ success: false, error: "No remote IP data available for the range." });
    }

    // Extract and format IP data
    const ipData = results.map((item) => ({
      ip: item.metric.remote_addr, // Extract IP
      values: item.values.map((entry) => ({
        timestamp: new Date(parseFloat(entry[0]) * 1000).toLocaleString(),
        value: parseFloat(entry[1]),
      })),
    }));

    res.json({ success: true, data: ipData });
  } catch (error) {
    console.error("Error fetching remote IP data for range:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch remote IP data for range." });
  }
});


// OpenAI Summary Endpoint (Now Includes Nginx Logs)
app.post("/summarize", async (req, res) => {
  try {
    const { data } = req.body;

    // ✅ Extract & Summarize Nginx Logs
    let nginxLogSummary = "No Nginx log data available.";
    if (data.nginxLogs && data.nginxLogs.length > 0) {
      nginxLogSummary = data.nginxLogs.map((log, index) => {
        return `🔹 ${log.time} - **${log.remote_addr}** [${log.method}] \`${log.request}\` - **${log.status}**`;
      }).join("\n");
    }

    // ✅ Extract & Summarize ModSecurity Logs
    let modsecSummary = "No ModSecurity logs detected.";
    if (data.modsecLogs && data.modsecLogs.length > 0) {
      modsecSummary = data.modsecLogs.map((log) => {
        return `🔹 Rule ID: ${log.ruleId} - **${log.message}**`;
      }).join("\n");
    }

    // ✅ Extract & Summarize Request Errors
    let requestErrorsSummary = "No request error data available.";
    if (data.requestsErrors && data.requestsErrors.timestamps.length > 0) {
      const latestTime = data.requestsErrors.timestamps[data.requestsErrors.timestamps.length - 1];
      const latestValue = data.requestsErrors.values[data.requestsErrors.values.length - 1];
      const avgValue = data.requestsErrors.values.reduce((sum, val) => sum + val, 0) / data.requestsErrors.values.length;
      requestErrorsSummary = `
      - Latest request-error count at ${latestTime}: ${latestValue}
      - Average request-error count over the past hour: ${avgValue.toFixed(2)}
      `;
    }

    // ✅ Construct GPT Prompt
    const prompt = `
You are an expert system monitoring assistant. Analyze the following system data:
- **CPU Usage:** ${data.cpuUsage}
- **RAM Usage:** ${data.ramUsage}
- **Root FS Usage:** ${data.rootFSUsage}
- **Server Uptime:** ${data.serverUptime}
- **Nginx Status:** ${data.nginxStatus}

📌 **Status Code Summary:**
${data.statusCodes || "No status code data available."}

🌍 **Remote IP Requests:**
${data.remoteIPs || "No remote IP activity detected."}

🚨 **Request Errors Trend:**
${requestErrorsSummary}

🛡 **Security Threats Detected (ModSecurity Logs):**
${modsecSummary}

📜 **Nginx Logs (Past 1 Hour)**
${nginxLogSummary}

1️⃣ **Summarize the current state of the system.**
2️⃣ Predict what might happen if these trends continue for the next 24 hours.
3️⃣ Explain what this data means for maintaining optimal system performance in a custom-built website.
4️⃣ Identify potential bottlenecks or issues from the request-error trends and ModSecurity threats, then suggest solutions.
5️⃣ Based on the request-error trends and uptime data, indicate whether the system is experiencing stable uptime or potential downtime.
`;

    console.log("Prompt Sent to GPT:", prompt); // Debugging log

    // ✅ Send Data to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: "You are a system monitoring assistant." },
                 { role: "user", content: prompt }],
      max_tokens: 350,
      temperature: 0.7,
    });

    const summary = response.choices[0].message.content.trim();
    console.log("GPT Summary Response:", summary); // Debugging log

    res.json({ summary });
  } catch (error) {
    console.error("Error generating summary and predictions:", error.message);
    res.status(500).send("Failed to generate summary and predictions.");
  }
});

app.post("/ask-gpt", async (req, res) => {
  try {
    const { question, data } = req.body;
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

    console.log("Request-Errors Summary for GPT:", requestErrorsSummary);


   


    // Format ModSecurity logs
    let modsecLogsSummary = "No ModSecurity logs available.";
    if (data.modsecLogs && data.modsecLogs.length > 0) {
      modsecLogsSummary = data.modsecLogs
        .map((log, index) => `  ${index + 1}. Rule ID: ${log.ruleId} - ${log.message}`)
        .join("\n");
    }

    console.log("ModSecurity Logs Summary for GPT:", modsecLogsSummary);



    // Format Nginx logs
    let nginxLogsSummary = "No Nginx logs available.";
    if (data.nginxLogs && data.nginxLogs.length > 0) {
      nginxLogsSummary = data.nginxLogs
        .map((log, index) => `  ${index + 1}. ${log.logEntry}`)
        .join("\n");
    }

    console.log("Nginx Logs Summary for GPT:", nginxLogsSummary);


    // Format Status Codes
    let statusCodesSummary = "No status code data available.";
    if (data.statusCodes && data.statusCodes.length > 0) {
      statusCodesSummary = data.statusCodes
        .map((code) => `  Status ${code.status}: ${code.value} requests`)
        .join("\n");
    }

     // Format Remote IP Data
     let remoteIpSummary = "No remote IP data available.";
     if (data.remoteIpData && data.remoteIpData.length > 0) {
       remoteIpSummary = data.remoteIpData
         .map((entry, index) => `  ${index + 1}. IP: ${entry.ip} - Requests: ${entry.value} at ${entry.timestamp}`)
         .join("\n");
     }
 
     console.log("Remote IP Summary for GPT:", remoteIpSummary);


    // Construct GPT prompt
    const prompt = `
    Based on the following system data:
    - CPU Usage: ${data.cpuUsage}
    - RAM Usage: ${data.ramUsage}
    - Root FS Usage: ${data.rootFSUsage}
    - Server Uptime: ${data.serverUptime}
    - Request Errors Summary:
      ${requestErrorsSummary}

    - ModSecurity Logs:
      ${modsecLogsSummary}

    - Nginx Access Logs:
      ${nginxLogsSummary}

      - Status Codes:
      ${statusCodesSummary}

      - Remote IP Data:
      ${remoteIpSummary}

    User's Question: "${question}"

    Provide a detailed and helpful response based on the logs and system performance. If the question relates to security, analyze ModSecurity logs to provide insights into security threats.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 400,
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














app.get("/modsecurity-data", async (req, res) => {
  try {
    const start = Math.floor(Date.now() / 1000) - 3600; // Start time (last 1 hour)
    const end = Math.floor(Date.now() / 1000); // End time (current time)
 
    const query = `{job="modsecurity"}`; // Your query
 
    const response = await axios.get(`http://13.251.167.13:3000/api/datasources/proxy/9/loki/api/v1/query_range`, {
      params: {
        query,
        start,
        end,
        step: 10,
      },
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });
 

    // Process and filter the data
    const result = response.data.data.result;
 
    const extractedData = result.flatMap((entry) => {
      if (entry.values?.length > 0) {
        return entry.values.map((value) => {
          try {
            const rawJson = value[1]; // Get the stringified JSON
 
            const parsedData = JSON.parse(rawJson); // Parsing the JSON string
 
            // Destructure and extract only the relevant fields
            const {
              transaction: {
                client_ip = "Unknown IP",
                time_stamp = "Unknown Timestamp",
                request = {},
                response = {},
                messages = [],
              } = {},
              producer: {
                modsecurity = "Unknown version",
                connector = "Unknown connector",
              } = {},
            } = parsedData;
 
            // Handle missing request or response details and set defaults
            const { method = "Unknown Method", uri = "Unknown URI" } = request;
            const { http_code = "Unknown HTTP Code", body = "Unknown Body" } = response;
 
            // Log to verify extracted 
 
            // Extract all ruleIds and messages from the messages array
            const messageData = messages.map((message, index) => {
              // Extract message and ruleId from the structure
              const ruleId = message?.details?.ruleId || "Unknown Rule ID"; // ruleId is inside details
              const messageText = message?.message || "No message"; // message is directly inside the message object
 
 
              return {
                ruleId,
                message: messageText,
              };
            });
 
            // Return the structured data
            return {
              client_ip,
              time_stamp,
              request: {
                method,
                uri,
              },
              response: {
                http_code,
                body,
              },
              modsecurity: {
                version: modsecurity,
                connector: connector,
              },
              messages: messageData,
            };
          } catch (err) {
            console.error("Error parsing JSON:", err.message);
            return null; // Skip this entry if JSON parsing fails
          }
        });
      }
      return [];
    }).filter((item) => item !== null); // Remove any null values
 
    // Return the extracted data to the frontend
    res.json(extractedData);
  } catch (error) {
    console.error("Error fetching modsecurity data:", error.message);
    res.status(500).send("Failed to fetch modsecurity data.");
  }
});





// 🔹 ModSecurity Data with Timeframe Support
app.get("/modsecurity-data-range", async (req, res) => {
  const { start } = req.query;
  if (!start) return res.status(400).json({ success: false, error: "Start timestamp is required." });

  try {
    const end = Math.floor(Date.now() / 1000); // Current time
    const step = getStepSize(start, end); // Dynamically determine step size

    const query = `{job="modsecurity"}`; // Query to fetch logs

    const response = await axios.get(`http://13.251.167.13:3000/api/datasources/proxy/9/loki/api/v1/query_range`, {
      params: { query, start, end, step },
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    // Process and filter the data
    const result = response.data.data.result;

    const extractedData = result.flatMap((entry) => {
      if (entry.values?.length > 0) {
        return entry.values.map((value) => {
          try {
            const rawJson = value[1]; // Get the stringified JSON
            const parsedData = JSON.parse(rawJson); // Parse JSON string

            // Extract necessary fields
            const {
              transaction: {
                client_ip = "Unknown IP",
                time_stamp = "Unknown Timestamp",
                request = {},
                response = {},
                messages = [],
              } = {},
              producer: {
                modsecurity = "Unknown version",
                connector = "Unknown connector",
              } = {},
            } = parsedData;

            const { method = "Unknown Method", uri = "Unknown URI" } = request;
            const { http_code = "Unknown HTTP Code", body = "Unknown Body" } = response;

            // Extract all ruleIds and messages from the messages array
            const messageData = messages.map((message) => ({
              ruleId: message?.details?.ruleId || "Unknown Rule ID",
              message: message?.message || "No message",
            }));

            return {
              client_ip,
              time_stamp,
              request: { method, uri },
              response: { http_code, body },
              modsecurity: { version: modsecurity, connector: connector },
              messages: messageData,
            };
          } catch (err) {
            console.error("Error parsing JSON:", err.message);
            return null;
          }
        });
      }
      return [];
    }).filter((item) => item !== null); // Remove any null values

    res.json({ success: true, data: extractedData });
  } catch (error) {
    console.error("Error fetching modsecurity data:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch modsecurity data." });
  }
});






 
// Endpoint to fetch ModSecurity attack logs for the past 1 hour
app.get("/modsecurity-attacks", async (req, res) => {
  try {
    const start = Math.floor(Date.now() / 1000) - 3600; // Start time (1 hour ago)
    const end = Math.floor(Date.now() / 1000); // Current time
 
    const query = `{job="modsecurity"} |~ "union select|select.*from|drop table|--"`; // Loki query for SQLi attack patterns
 
    const response = await axios.get(LOKI_API_URL, {
      params: {
        query,
        start,
        end,
        step: 10, // Adjust for better resolution
      },
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });
 
    const result = response.data.data.result;
 
    // Extract attack logs only (removing timestamp)
    const extractedAttacks = result.flatMap((entry) =>
      entry.values.map((log) => {
        try {
          const attackData = JSON.parse(log[1]); // Convert log message to JSON
          return attackData;
        } catch (error) {
          console.error("Error parsing attack log data:", error.message);
          return null;
        }
      })
    ).filter(log => log !== null);
 
    // Send structured attack logs to the frontend
    res.json(extractedAttacks);
  } catch (error) {
    console.error("Error fetching ModSecurity attack logs:", error.message);
    res.status(500).send("Failed to fetch ModSecurity attack logs.");
  }
});


// Endpoint to fetch Nginx logs for the past 1 hour
app.get("/nginx-logs", async (req, res) => {
  try {
    const start = Math.floor(Date.now() / 1000) - 3600; // Start time (1 hour ago)
    const end = Math.floor(Date.now() / 1000); // Current time

    const query = `{job="nginx"}`; // Loki query

    const response = await axios.get(LOKI_API_URL, {
      params: {
        query,
        start,
        end,
        step: 10, // Adjust for better resolution
      },
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });


    const result = response.data.data.result;

    // Extract log messages only (removing timestamp)
    const extractedLogs = result.flatMap((entry) =>
      entry.values.map((log) => {
        try {
          const logData = JSON.parse(log[1]); // Convert log message to JSON
          return logData;
        } catch (error) {
          console.error("Error parsing log data:", error.message);
          return null;
        }
      })
    ).filter(log => log !== null);

    // Send structured logs to the frontend
    res.json(extractedLogs);
  } catch (error) {
    console.error("Error fetching Nginx logs:", error.message);
    res.status(500).send("Failed to fetch Nginx logs.");
  }
});



app.get("/nginx-logs-range", async (req, res) => {
  const { start } = req.query;
  if (!start) return res.status(400).json({ success: false, error: "Start timestamp is required." });

  try {
    const end = Math.floor(Date.now() / 1000); // Current time
    const step = getStepSize(start, end); // Dynamically adjust step size
    const limit = 5000; // Increase limit to fetch more logs

    const query = `{job="nginx"}`; // Loki query

    const response = await axios.get(LOKI_API_URL, {
      params: { query, start, end, step, limit },
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    const result = response.data.data.result;

    if (!result || result.length === 0) {
      return res.json({ success: false, error: "No data available for the range." });
    }

    // Extract and format logs
    const extractedLogs = result.flatMap((entry) =>
      entry.values.map((log) => {
        try {
          const timestamp = new Date(parseInt(log[0]) * 1000).toLocaleString();
          const logData = JSON.parse(log[1]); // Convert log message to JSON
          return { timestamp, ...logData };
        } catch (error) {
          console.error("Error parsing log data:", error.message);
          return null;
        }
      })
    ).filter(log => log !== null);

    res.json({ success: true, data: extractedLogs });
  } catch (error) {
    console.error("Error fetching Nginx logs range:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch Nginx logs for range." });
  }
});





// SERVER A

// Endpoint for CPU usage
app.get("/cpu-usageservera", async (req, res) => {
  try {
    const query =
      '100 * (1 - avg(rate(node_cpu_seconds_total{mode="idle", instance="10.0.2.208:9100"}[1m])))';

    const response = await axios.get(GRAFANA_API_URLA, {
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
app.get("/ram-usageservera", async (req, res) => {
  try {
    const query =
      '100 * (1 - (node_memory_MemAvailable_bytes{instance="10.0.2.208:9100"} / node_memory_MemTotal_bytes{instance="10.0.2.208:9100"}))';

    const response = await axios.get(GRAFANA_API_URLA, {
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
app.get("/root-fs-usageservera", async (req, res) => {
  try {
    const query =
      '100 - ((node_filesystem_avail_bytes{instance="10.0.2.208:9100", mountpoint="/", fstype!="rootfs"} * 100) / node_filesystem_size_bytes{instance="10.0.2.208:9100", mountpoint="/", fstype!="rootfs"})';

    const response = await axios.get(GRAFANA_API_URLA, {
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
app.get("/server-uptimeservera", async (req, res) => {
  try {
    const query =
      'node_time_seconds{instance="10.0.2.208:9100"} - node_boot_time_seconds{instance="10.0.2.208:9100"}';

    const response = await axios.get(GRAFANA_API_URLA, {
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

app.get("/requests-errorsservera", async (req, res) => {
  try {
    const query = 'irate(node_network_receive_errs_total{instance="10.0.2.208:9100"}[5m])'; // Use a fixed rate interval (e.g., 5m)
   
    const endTime = Math.floor(Date.now() / 1000); // Current UNIX time in seconds
    const startTime = endTime - 3600; // Start time (1 hour ago)
    const step = 60; // Step interval (1 minute)
 
    console.log(`Fetching data from ${startTime} to ${endTime} with step ${step}`);
 
    // Make API call with time range parameters
    const response = await axios.get(GRAFANA_API_URL_RANGEA, {
      params: {
        query,
        start: startTime,
        end: endTime,
        step,
      },
      headers: {
        Authorization: `Bearer ${API_KEY}`, // Ensure API_KEY is correctly set
      },
    });
 
    // Ensure the API response is valid
    if (response.data.status !== "success") {
      console.warn("Invalid response from Grafana API:", response.data);
      return res.status(500).json({ error: "Invalid response from API" });
    }
 
    const resultData = response.data?.data?.result || [];
 
    if (resultData.length === 0) {
      console.warn("No data returned from API.");
      return res.json({ data: [] });
    }
 
    // Process time-series data
    const formattedData = resultData.map((item) => {
      if (item.values && Array.isArray(item.values)) {
        return {
          timestamps: item.values.map((value) =>
            new Date(value[0] * 1000).toLocaleTimeString() // Convert timestamp to readable time
          ),
          values: item.values.map((value) => parseFloat(value[1])), // Convert metric values to numbers
        };
      }
 
      console.warn("Unexpected data format for item:", item);
      return null;
    }).filter(Boolean); // Remove any null values
 
    res.json({ data: formattedData });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ error: `Failed to fetch data: ${error.message}` });
  }
});
 
 
app.get("/requests-networktrafficA", async (req, res) => {
  try {
    const query = 'irate(node_network_receive_packets_total{instance="10.0.2.208:9100"}[5m])';
   
    const endTime = Math.floor(Date.now() / 1000); // Current UNIX time in seconds
    const startTime = endTime - 3600; // Start time (1 hour ago)
    const step = 60; // Step interval (1 minute)
 
    console.log(`Fetching data from ${startTime} to ${endTime} with step ${step}`);
 
    if (!API_KEY) {
      console.warn("Warning: API_KEY is not set!");
    }
 
    // ✅ API Call with error handling
    const response = await axios.get(GRAFANA_API_URL_RANGEA, {
      params: { query, start: startTime, end: endTime, step },
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
 
    // ✅ Ensure API response is valid
    if (!response.data || !response.data.data || !response.data.data.result) {
      console.warn("Invalid response format from API:", response.data);
      return res.status(500).json({ error: "Invalid response from API" });
    }
 
    const resultData = response.data.data.result;
 
    if (resultData.length === 0) {
      console.warn("No data returned from API.");
      return res.json({ data: [] });
    }
 
    // ✅ Process time-series data properly
    const formattedData = resultData.map((item) => {
      // Extract dataset name from `metric` object
      const name = Object.values(item.metric).join(" - "); // Join metric labels for a readable name
      console.log("Dataset Name:", name);
 
      if (item.values && Array.isArray(item.values)) {
        return {
          name, // Dataset name
          timestamps: item.values.map((value) =>
            new Date(value[0] * 1000).toLocaleTimeString() // Convert UNIX timestamp to readable time
          ),
          values: item.values.map((value) => parseFloat(value[1])), // Convert metric values to numbers
        };
      }
 
      console.warn("Unexpected data format for item:", item);
      return null;
    }).filter(Boolean); // Remove null values
 
    console.log("Formatted Data with Names:", JSON.stringify(formattedData, null, 2)); // ✅ Debugging: Ensure data is correct
 
    res.json({ data: formattedData });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ error: `Failed to fetch data: ${error.message}` });
  }
});
 
// Endpoint for Nodejs Status
app.get("/nodejs-statusA", async (req, res) => {
  try {
    const query = `up{job="node_app", instance="10.0.2.208:3000"}`;
 
    const response = await axios.get(GRAFANA_API_URLA, {
      params: { query },
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });
 
    const result = response.data.data.result;
 
    // Check if there's a valid result
    if (result.length > 0) {
      const nodejsStatus = parseFloat(result[0].value[1]); // Get the status value (1 or 0)
      res.json({ status: nodejsStatus });
    } else {
      res.json({ status: 0 }); // Return 0 if no result found
    }
  } catch (error) {
    console.error("Error fetching Nodejs status:", error.message);
    res.status(500).send("Failed to fetch Nodejs status.");
  }
});
 
// Endpoint for Docker Status
app.get("/docker-statusA", async (req, res) => {
  try {
    const query = `up{job="docker", instance="10.0.2.208:9323"}`;
 
    const response = await axios.get(GRAFANA_API_URLA, {
      params: { query },
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });
 
    const result = response.data.data.result;
 
    // Check if there's a valid result
    if (result.length > 0) {
      const dockerStatus = parseFloat(result[0].value[1]); // Get the status value (1 or 0)
      res.json({ status: dockerStatus });
    } else {
      res.json({ status: 0 }); // Return 0 if no result found
    }
  } catch (error) {
    console.error("Error fetching Docker status:", error.message);
    res.status(500).send("Failed to fetch Docker status.");
  }
});



  



  
  
  
  
  
  
  //SERVER B


  //SERVER B
 
// Endpoint for CPU usage
app.get("/cpu-usageserverb", async (req, res) => {
  try {
    const query =
      '100 * (1 - avg(rate(node_cpu_seconds_total{mode="idle", instance="10.0.3.229:9100"}[1m])))';
 
    const response = await axios.get(GRAFANA_API_URLB, {
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
app.get("/ram-usageserverb", async (req, res) => {
  try {
    const query =
      '100 * (1 - (node_memory_MemAvailable_bytes{instance="10.0.3.229:9100"} / node_memory_MemTotal_bytes{instance="10.0.3.229:9100"}))';
 
    const response = await axios.get(GRAFANA_API_URLB, {
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
app.get("/root-fs-usageserverb", async (req, res) => {
  try {
    const query =
      '100 - ((node_filesystem_avail_bytes{instance="10.0.3.229:9100", mountpoint="/", fstype!="rootfs"} * 100) / node_filesystem_size_bytes{instance="10.0.3.229:9100", mountpoint="/", fstype!="rootfs"})';
     
 
    const response = await axios.get(GRAFANA_API_URLB, {
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
app.get("/server-uptimeserverb", async (req, res) => {
  try {
    const query =
      'node_time_seconds{instance="10.0.3.229:9100"} - node_boot_time_seconds{instance="10.0.3.229:9100"}';
 
    const response = await axios.get(GRAFANA_API_URLB, {
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
 
 
 
app.get("/requests-errorsserverb", async (req, res) => {
  try {
    const query = 'irate(node_network_receive_errs_total{instance="10.0.3.229:9100"}[5m])'; // Use a fixed rate interval (e.g., 5m)
   
    const endTime = Math.floor(Date.now() / 1000); // Current UNIX time in seconds
    const startTime = endTime - 3600; // Start time (1 hour ago)
    const step = 60; // Step interval (1 minute)
 
    console.log(`Fetching data from ${startTime} to ${endTime} with step ${step}`);
 
    // Make API call with time range parameters
    const response = await axios.get(GRAFANA_API_URL_RANGEB, {
      params: {
        query,
        start: startTime,
        end: endTime,
        step,
      },
      headers: {
        Authorization: `Bearer ${API_KEY}`, // Ensure API_KEY is correctly set
      },
    });
 
    // Ensure the API response is valid
    if (response.data.status !== "success") {
      console.warn("Invalid response from Grafana API:", response.data);
      return res.status(500).json({ error: "Invalid response from API" });
    }
 
    const resultData = response.data?.data?.result || [];
 
    if (resultData.length === 0) {
      console.warn("No data returned from API.");
      return res.json({ data: [] });
    }
 
    // Process time-series data
    const formattedData = resultData.map((item) => {
      if (item.values && Array.isArray(item.values)) {
        return {
          timestamps: item.values.map((value) =>
            new Date(value[0] * 1000).toLocaleTimeString() // Convert timestamp to readable time
          ),
          values: item.values.map((value) => parseFloat(value[1])), // Convert metric values to numbers
        };
      }
 
      console.warn("Unexpected data format for item:", item);
      return null;
    }).filter(Boolean); // Remove any null values
 
    res.json({ data: formattedData });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ error: `Failed to fetch data: ${error.message}` });
  }
});
 
 
app.get("/requests-networktrafficB", async (req, res) => {
  try {
    const query = 'irate(node_network_receive_packets_total{instance="10.0.3.229:9100"}[5m])';
   
    const endTime = Math.floor(Date.now() / 1000); // Current UNIX time in seconds
    const startTime = endTime - 3600; // Start time (1 hour ago)
    const step = 60; // Step interval (1 minute)
 
    console.log(`Fetching data from ${startTime} to ${endTime} with step ${step}`);
 
    if (!API_KEY) {
      console.warn("Warning: API_KEY is not set!");
    }
 
    // ✅ API Call with error handling
    const response = await axios.get(GRAFANA_API_URL_RANGEB, {
      params: { query, start: startTime, end: endTime, step },
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
 
    // ✅ Ensure API response is valid
    if (!response.data || !response.data.data || !response.data.data.result) {
      console.warn("Invalid response format from API:", response.data);
      return res.status(500).json({ error: "Invalid response from API" });
    }
 
    const resultData = response.data.data.result;
 
    if (resultData.length === 0) {
      console.warn("No data returned from API.");
      return res.json({ data: [] });
    }
 
    // ✅ Process time-series data properly
    const formattedData = resultData.map((item) => {
      // Extract dataset name from `metric` object
      const name = Object.values(item.metric).join(" - "); // Join metric labels for a readable name
      console.log("Dataset Name:", name);
 
      if (item.values && Array.isArray(item.values)) {
        return {
          name, // Dataset name
          timestamps: item.values.map((value) =>
            new Date(value[0] * 1000).toLocaleTimeString() // Convert UNIX timestamp to readable time
          ),
          values: item.values.map((value) => parseFloat(value[1])), // Convert metric values to numbers
        };
      }
 
      console.warn("Unexpected data format for item:", item);
      return null;
    }).filter(Boolean); // Remove null values
 
    console.log("Formatted Data with Names:", JSON.stringify(formattedData, null, 2)); // ✅ Debugging: Ensure data is correct
 
    res.json({ data: formattedData });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ error: `Failed to fetch data: ${error.message}` });
  }
});
 
// Endpoint for Nodejs Status
app.get("/nodejs-statusB", async (req, res) => {
  try {
    const query = `up{job="node_app", instance="10.0.3.229:3000"}`;
 
    const response = await axios.get(GRAFANA_API_URLB, {
      params: { query },
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });
 
    const result = response.data.data.result;
 
    // Check if there's a valid result
    if (result.length > 0) {
      const nodejsStatus = parseFloat(result[0].value[1]); // Get the status value (1 or 0)
      res.json({ status: nodejsStatus });
    } else {
      res.json({ status: 0 }); // Return 0 if no result found
    }
  } catch (error) {
    console.error("Error fetching Nodejs status:", error.message);
    res.status(500).send("Failed to fetch Nodejs status.");
  }
});
 
 
// Endpoint for Docker Status
app.get("/docker-statusB", async (req, res) => {
  try {
    const query = `up{job="docker", instance="10.0.3.229:9323"}`;
 
    const response = await axios.get(GRAFANA_API_URLB, {
      params: { query },
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });
 
    const result = response.data.data.result;
 
    // Check if there's a valid result
    if (result.length > 0) {
      const dockerStatus = parseFloat(result[0].value[1]); // Get the status value (1 or 0)
      res.json({ status: dockerStatus });
    } else {
      res.json({ status: 0 }); // Return 0 if no result found
    }
  } catch (error) {
    console.error("Error fetching Docker status:", error.message);
    res.status(500).send("Failed to fetch Docker status.");
  }
});





  //SERVER C
  //SERVER C
 
// Endpoint for CPU usage
app.get("/cpu-usageserverc", async (req, res) => {
  try {
    const query =
      '100 * (1 - avg(rate(node_cpu_seconds_total{mode="idle", instance="10.0.4.85:9100"}[1m])))';
 
    const response = await axios.get(GRAFANA_API_URLC, {
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
app.get("/ram-usageserverc", async (req, res) => {
  try {
    const query =
      '100 * (1 - (node_memory_MemAvailable_bytes{instance="10.0.4.85:9100"} / node_memory_MemTotal_bytes{instance="10.0.4.85:9100"}))';
 
    const response = await axios.get(GRAFANA_API_URLC, {
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
app.get("/root-fs-usageserverc", async (req, res) => {
  try {
    const query =
      '100 - ((node_filesystem_avail_bytes{instance="10.0.4.85:9100", mountpoint="/", fstype!="rootfs"} * 100) / node_filesystem_size_bytes{instance="10.0.4.85:9100", mountpoint="/", fstype!="rootfs"})';
     
 
    const response = await axios.get(GRAFANA_API_URLC, {
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
app.get("/server-uptimeserverc", async (req, res) => {
  try {
    const query =
      'node_time_seconds{instance="10.0.4.85:9100"} - node_boot_time_seconds{instance="10.0.4.85:9100"}';
 
    const response = await axios.get(GRAFANA_API_URLC, {
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
 
 
 
app.get("/requests-errorsserverc", async (req, res) => {
  try {
    const query = 'irate(node_network_receive_errs_total{instance="10.0.4.85:9100"}[5m])'; // Use a fixed rate interval (e.g., 5m)
   
    const endTime = Math.floor(Date.now() / 1000); // Current UNIX time in seconds
    const startTime = endTime - 3600; // Start time (1 hour ago)
    const step = 60; // Step interval (1 minute)
 
    console.log(`Fetching data from ${startTime} to ${endTime} with step ${step}`);
 
    // Make API call with time range parameters
    const response = await axios.get(GRAFANA_API_URL_RANGEC, {
      params: {
        query,
        start: startTime,
        end: endTime,
        step,
      },
      headers: {
        Authorization: `Bearer ${API_KEY}`, // Ensure API_KEY is correctly set
      },
    });
 
    // Ensure the API response is valid
    if (response.data.status !== "success") {
      console.warn("Invalid response from Grafana API:", response.data);
      return res.status(500).json({ error: "Invalid response from API" });
    }
 
    const resultData = response.data?.data?.result || [];
 
    if (resultData.length === 0) {
      console.warn("No data returned from API.");
      return res.json({ data: [] });
    }
 
    // Process time-series data
    const formattedData = resultData.map((item) => {
      if (item.values && Array.isArray(item.values)) {
        return {
          timestamps: item.values.map((value) =>
            new Date(value[0] * 1000).toLocaleTimeString() // Convert timestamp to readable time
          ),
          values: item.values.map((value) => parseFloat(value[1])), // Convert metric values to numbers
        };
      }
 
      console.warn("Unexpected data format for item:", item);
      return null;
    }).filter(Boolean); // Remove any null values
 
    res.json({ data: formattedData });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ error: `Failed to fetch data: ${error.message}` });
  }
});
 
 
app.get("/requests-networktrafficC", async (req, res) => {
  try {
    const query = 'irate(node_network_receive_packets_total{instance="10.0.4.85:9100"}[5m])';
   
    const endTime = Math.floor(Date.now() / 1000); // Current UNIX time in seconds
    const startTime = endTime - 3600; // Start time (1 hour ago)
    const step = 60; // Step interval (1 minute)
 
    console.log(`Fetching data from ${startTime} to ${endTime} with step ${step}`);
 
    if (!API_KEY) {
      console.warn("Warning: API_KEY is not set!");
    }
 
    // ✅ API Call with error handling
    const response = await axios.get(GRAFANA_API_URL_RANGEC, {
      params: { query, start: startTime, end: endTime, step },
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
 
    // ✅ Ensure API response is valid
    if (!response.data || !response.data.data || !response.data.data.result) {
      console.warn("Invalid response format from API:", response.data);
      return res.status(500).json({ error: "Invalid response from API" });
    }
 
    const resultData = response.data.data.result;
 
    if (resultData.length === 0) {
      console.warn("No data returned from API.");
      return res.json({ data: [] });
    }
 
    // ✅ Process time-series data properly
    const formattedData = resultData.map((item) => {
      // Extract dataset name from `metric` object
      const name = Object.values(item.metric).join(" - "); // Join metric labels for a readable name
      console.log("Dataset Name:", name);
 
      if (item.values && Array.isArray(item.values)) {
        return {
          name, // Dataset name
          timestamps: item.values.map((value) =>
            new Date(value[0] * 1000).toLocaleTimeString() // Convert UNIX timestamp to readable time
          ),
          values: item.values.map((value) => parseFloat(value[1])), // Convert metric values to numbers
        };
      }
 
      console.warn("Unexpected data format for item:", item);
      return null;
    }).filter(Boolean); // Remove null values
 
    console.log("Formatted Data with Names:", JSON.stringify(formattedData, null, 2)); // ✅ Debugging: Ensure data is correct
 
    res.json({ data: formattedData });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ error: `Failed to fetch data: ${error.message}` });
  }
});
 
 
// Endpoint for Nginx Status
app.get("/nodejs-statusC", async (req, res) => {
  try {
    const query = `up{job="node_app", instance="10.0.4.85:3000"}`;
 
    const response = await axios.get(GRAFANA_API_URLC, {
      params: { query },
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });
 
    const result = response.data.data.result;
 
    // Check if there's a valid result
    if (result.length > 0) {
      const nodejsStatus = parseFloat(result[0].value[1]); // Get the status value (1 or 0)
      res.json({ status: nodejsStatus });
    } else {
      res.json({ status: 0 }); // Return 0 if no result found
    }
  } catch (error) {
    console.error("Error fetching Nodejs status:", error.message);
    res.status(500).send("Failed to fetch Nodejs status.");
  }
});
 
 
// Endpoint for Docker Status
app.get("/docker-statusC", async (req, res) => {
  try {
    const query = `up{job="docker", instance="10.0.4.85:9323"}`;
 
    const response = await axios.get(GRAFANA_API_URLC, {
      params: { query },
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });
 
    const result = response.data.data.result;
 
    // Check if there's a valid result
    if (result.length > 0) {
      const dockerStatus = parseFloat(result[0].value[1]); // Get the status value (1 or 0)
      res.json({ status: dockerStatus });
    } else {
      res.json({ status: 0 }); // Return 0 if no result found
    }
  } catch (error) {
    console.error("Error fetching Docker status:", error.message);
    res.status(500).send("Failed to fetch Docker status.");
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

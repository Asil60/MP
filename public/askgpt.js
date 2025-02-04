document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("gpt-input").addEventListener("keypress", async function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      const query = event.target.value.trim();
      if (!query) return;

      const summaryDiv = document.getElementById("summary");
      summaryDiv.innerHTML = `<p>Processing your query...</p>`;

      try {
        // Fetch system metrics
        const cpuUsage = document.getElementById("cpu-usage")?.textContent || "Unavailable";
        const ramUsage = document.getElementById("ram-usage")?.textContent || "Unavailable";
        const rootFSUsage = document.getElementById("root-fs-usage")?.textContent || "Unavailable";
        const serverUptime = document.getElementById("server-uptime")?.textContent || "Unavailable";

        // Fetch request-error data
        const response = await fetch("/requests-errors");
        const requestErrorData = await response.json();
        let requestErrors = requestErrorData.data?.[0] || { timestamps: [], values: [] };

        // Fetch ModSecurity logs
        const modsecResponse = await fetch("/modsecurity-data");
        const modsecData = await modsecResponse.json();

        // Ensure modsecData has logs and extract relevant information
        let modsecLogs = [];
        if (modsecData && modsecData.length > 0) {
          modsecLogs = modsecData.map((log) => {
            return log.messages.map((message, index) => ({
              ruleId: message.ruleId,
              message: message.message,
              logEntry: message.logEntry || `Log entry ${index + 1}`,  // Optional: Replace this if necessary
            }));
          }).flat(); // Flatten the array if multiple messages per log
        }

        // Fetch Nginx logs
        const nginxResponse = await fetch("/nginx-logs");
        const nginxData = await nginxResponse.json();
        let nginxLogs = nginxData.map((log) => ({ logEntry: log.logEntry }));

        // Fetch Status Codes data
        const statusCodesResponse = await fetch("/status-codes");
        const statusCodesData = await statusCodesResponse.json();
        let statusCodes = statusCodesData.map((status) => ({
          status: status.status,
          value: status.value,
        }));

        console.log("Formatted Request-Errors for GPT:", requestErrors);
        console.log("Formatted ModSecurity Logs for GPT:", modsecLogs);
        console.log("Formatted Nginx Logs for GPT:", nginxLogs);
        console.log("Formatted Status Codes for GPT:", statusCodes);

        // Send query and all system data to the GPT endpoint
        const gptResponse = await fetch("/ask-gpt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: query,
            data: {
              cpuUsage,
              ramUsage,
              rootFSUsage,
              serverUptime,
              requestsErrors: requestErrors,
              modsecLogs: modsecLogs,
              nginxLogs: nginxLogs,
              statusCodes: statusCodes, // Add status codes to the data
            },
          }),
        });

        const result = await gptResponse.json();
        if (!result.answer) throw new Error("No response from GPT.");

        summaryDiv.innerHTML = `<p><strong>You asked:</strong> "${query}"</p><p>${result.answer}</p>`;
      } catch (error) {
        console.error("Error fetching GPT response:", error);
        summaryDiv.innerHTML = `<p style='color: red;'>Error processing query. Please try again.</p>`;
      }

      event.target.value = "";
      event.target.style.height = "auto";
    }
  });
});

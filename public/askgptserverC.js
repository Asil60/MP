document.addEventListener("DOMContentLoaded", function () {
  // Handle Enter key submission for Server C questions
  document.getElementById("gpt-inputC").addEventListener("keypress", async function (event) {
      if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();

          const query = event.target.value.trim();
          if (!query) return; // Ignore empty input

          // Display loading message
          const summaryDiv = document.getElementById("summaryc");
          summaryDiv.innerHTML = `<p>Processing your query...</p>`;

          try {
              // Fetch Server C system metrics
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

              // 🔹 Debugging: Log the question and data before sending
              console.log("Server C Query Sent to Backend:", JSON.stringify({ question: query, data }, null, 2));

              // Send question and system data to the backend
              const gptResponse = await fetch("/askgpt-serverc", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ question: query, data }),
              });

              const result = await gptResponse.json();
              if (!result.answer) throw new Error("No response from GPT.");

              // 🔹 Debugging: Log the GPT-generated answer
              console.log("GPT Response for Server C Query:", result.answer);

              // Display GPT's response
              summaryDiv.innerHTML = `<p><strong>You asked:</strong> "${query}"</p><p>${result.answer}</p>`;
          } catch (error) {
              console.error("Error fetching GPT response for Server C:", error);
              summaryDiv.innerHTML = `<p style='color: red;'>Error processing query. Please try again.</p>`;
          }

          // Clear the input
          event.target.value = "";
      }
  });

  // Adjust textarea height dynamically as user types
  document.getElementById("gpt-inputC").addEventListener("input", function () {
      this.style.height = "auto"; // Reset height
      this.style.height = this.scrollHeight + "px"; // Adjust height dynamically
  });
});

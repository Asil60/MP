document.addEventListener("DOMContentLoaded", function () {
  // Handle Enter key submission for Server B questions
  document.getElementById("gpt-inputB").addEventListener("keypress", async function (event) {
      if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();

          const query = event.target.value.trim();
          if (!query) return; // Ignore empty input

          // Display loading message
          const summaryDiv = document.getElementById("summaryb");
          summaryDiv.innerHTML = `<p>Processing your query...</p>`;

          try {
              // Fetch Server B system metrics
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

              // 🔹 Debugging: Log the question and data before sending
              console.log("Server B Query Sent to Backend:", JSON.stringify({ question: query, data }, null, 2));

              // Send question and system data to the backend
              const gptResponse = await fetch("/askgpt-serverb", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ question: query, data }),
              });

              const result = await gptResponse.json();
              if (!result.answer) throw new Error("No response from GPT.");

              // 🔹 Debugging: Log the GPT-generated answer
              console.log("GPT Response for Server B Query:", result.answer);

              // Display GPT's response
              summaryDiv.innerHTML = `<p><strong>You asked:</strong> "${query}"</p><p>${result.answer}</p>`;
          } catch (error) {
              console.error("Error fetching GPT response for Server B:", error);
              summaryDiv.innerHTML = `<p style='color: red;'>Error processing query. Please try again.</p>`;
          }

          // Clear the input
          event.target.value = "";
      }
  });

  // Adjust textarea height dynamically as user types
  document.getElementById("gpt-inputB").addEventListener("input", function () {
      this.style.height = "auto"; // Reset height
      this.style.height = this.scrollHeight + "px"; // Adjust height dynamically
  });
});

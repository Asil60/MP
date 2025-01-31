document.addEventListener("DOMContentLoaded", function () {
  // Handle Enter key submission for user queries
  document.getElementById("gpt-input").addEventListener("keypress", async function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevent new line

      const query = event.target.value.trim();
      if (!query) return; // Ignore empty input

      // Display loading message
      const summaryDiv = document.getElementById("summary");
      summaryDiv.innerHTML = `<p>Processing your query...</p>`;

      try {
        // Fetch system metrics
        const cpuUsage = document.getElementById("cpu-usage")?.textContent || "Unavailable";
        const ramUsage = document.getElementById("ram-usage")?.textContent || "Unavailable";
        const rootFSUsage = document.getElementById("root-fs-usage")?.textContent || "Unavailable";
        const serverUptime = document.getElementById("server-uptime")?.textContent || "Unavailable";

        // Fetch request-error data from the server
        const response = await fetch("/requests-errors");
        const requestErrorData = await response.json();

        // Validate and extract request-error data
        let requestErrors = { timestamps: [], values: [] };
        if (requestErrorData.data && requestErrorData.data.length > 0) {
          requestErrors = requestErrorData.data[0]; // Use the first dataset
        } else {
          console.warn("No request-error data available.");
        }

        // Log the fetched and formatted request-error data for debugging
        console.log("Fetched Request-Error Data:", requestErrorData);
        console.log("Formatted Request-Errors for GPT:", requestErrors);

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
            },
          }),
        });

        // Process GPT's response
        const result = await gptResponse.json();
        if (!result.answer) throw new Error("No response from GPT.");

        // Display GPT's response
        summaryDiv.innerHTML = `<p><strong>You asked:</strong> "${query}"</p><p>${result.answer}</p>`;
      } catch (error) {
        console.error("Error fetching GPT response:", error);
        summaryDiv.innerHTML = `<p style='color: red;'>Error processing query. Please try again.</p>`;
      }

      // Clear the input and reset its height
      event.target.value = "";
      event.target.style.height = "auto";
    }
  });

  // Adjust textarea height dynamically as user types
  document.getElementById("gpt-input").addEventListener("input", function () {
    this.style.height = "auto"; // Reset height
    this.style.height = this.scrollHeight + "px"; // Adjust height dynamically
  });
});

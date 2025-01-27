  // Handle Enter key submission
  document.getElementById("gpt-input").addEventListener("keypress", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevent new line
      const query = event.target.value.trim();

      if (query) {
        // Example: Display query in summary
        const summaryDiv = document.getElementById("summary");
        summaryDiv.textContent = `You asked: "${query}". GPT response will appear here.`;

        // Optionally clear input
        event.target.value = "";
        event.target.style.height = "auto"; // Reset height
      }
    }
  });

  // Adjust textarea height dynamically
  document.getElementById("gpt-input").addEventListener("input", function () {
    this.style.height = "auto"; // Reset height
    this.style.height = this.scrollHeight + "px"; // Adjust height to content
  });

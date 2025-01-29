document.addEventListener("DOMContentLoaded", function () {
    // Select buttons and status element
    const startButton = document.getElementById("ec2-start-btn");
    const stopButton = document.getElementById("ec2-stop-btn");
    const statusElement = document.getElementById("ec2-status");

    // Attach event listeners to the buttons
    if (startButton) {
        startButton.addEventListener("click", () => controlInstance("start"));
    }

    if (stopButton) {
        stopButton.addEventListener("click", () => controlInstance("stop"));
    }

    // Function to handle instance control
    async function controlInstance(action) {
        try {
            // Replace the placeholder with your actual API Gateway endpoint
            const instanceId = "i-08cae59e20d698303"; // Replace with your actual EC2 instance ID
            const apiUrl = `https://4i98unenwe.execute-api.ap-southeast-1.amazonaws.com/Dev1/?action=${action}&instance_ids=${instanceId}`;
            const apiKey = "4SFCCo7m8ia9TU6KtG6JXa63FQcOZmibAAzyYvPb"; // Replace this with your actual API key if required

            // API request
            const response = await fetch(apiUrl, {
                method: "GET",
                headers: {
                    "x-api-key": apiKey, // Remove this if your API Gateway doesn't require an API key
                },
            });

            const data = await response.json();

            // Update the status element
            if (statusElement) {
                statusElement.innerText = data.body || `Instance ${action}ed successfully.`;
            }
        } catch (error) {
            if (statusElement) {
                statusElement.innerText = `Error: ${error.message}`;
            }
        }
    }
});

report:

document.addEventListener("DOMContentLoaded", function () {
    const { jsPDF } = window.jspdf;
    const API_KEY = "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"; // Replace with your GPT API key
    const GPT_URL = "https://api.openai.com/v1/chat/completions";

    document.getElementById("downloadPDF").addEventListener("click", async () => {
        try {
            const pdf = new jsPDF("p", "mm", "a4");

            // 🔹 First Page: Add Lumiere Proxy Title
            const pageHeight = pdf.internal.pageSize.height; // Page height
            const verticalCenter = pageHeight / 2 - 30; // Center content vertically

            // Add the logo
            const logo = new Image();
            logo.src = "./images/logo_black.png"; // Replace with your actual logo file path
            pdf.addImage(logo, "PNG", 80, verticalCenter - 50, 50, 30); // Resized logo (Width: 50mm, Height: 30mm)

            // Add title text
            pdf.setFontSize(40);
            pdf.setFont("helvetica", "bold");
            pdf.text("Lumiere Proxy", 105, verticalCenter, { align: "center" }); // Website Name

            pdf.setFontSize(16);
            pdf.setFont("helvetica", "italic");
            pdf.text("Detect - Protect - Secure", 105, verticalCenter + 15, { align: "center" }); // Tagline

            pdf.setFontSize(14);
            pdf.setFont("helvetica", "normal");
            pdf.text("Internal Report", 105, verticalCenter + 35, { align: "center" }); // Subtitle

            // Add horizontal line
            pdf.setDrawColor(150); // Gray line
            pdf.line(20, verticalCenter + 40, 190, verticalCenter + 40);

            pdf.addPage(); // Add a new page for the main content

            // 🔹 Report Title and Generated Time
            pdf.setFontSize(18);
            pdf.setFont("helvetica", "bold");
            pdf.text("Lumiere Proxy Dashboard - System Report", 10, 20);
            pdf.setFontSize(12);
            pdf.setFont("helvetica", "normal");
            pdf.text("Generated on: " + new Date().toLocaleString(), 10, 30);

            let yOffset = 40; // Adjust position for subsequent sections

            // 🔹 System Metrics Table
            pdf.setFontSize(14);
            pdf.text("System Metrics", 10, yOffset);
            yOffset += 8;

            const systemMetrics = [
                ["Metric", "Value"],
                ["EC2 Instance Status", document.getElementById("ec2-status")?.innerText || "N/A"],
                ["CPU Usage", document.getElementById("cpu-usage")?.innerText || "N/A"],
                ["RAM Usage", document.getElementById("ram-usage")?.innerText || "N/A"],
                ["Root FS Used", document.getElementById("root-fs-usage")?.innerText || "N/A"],
                ["Server Uptime", document.getElementById("server-uptime")?.innerText || "N/A"],
            ];

            pdf.autoTable({
                startY: yOffset,
                head: [systemMetrics[0]],
                body: systemMetrics.slice(1),
                theme: "grid",
                styles: { fontSize: 10, cellPadding: 4 },
            });

            yOffset = pdf.lastAutoTable.finalY + 10;

            // 🔹 Data Refresh Times Section
            pdf.setFontSize(14);
            pdf.text("Data Refresh Time", 10, yOffset);
            yOffset += 8;

            const refreshTimes = [
                ["Metric", "Last Updated"],
                ["CPU", document.getElementById("cpu-refresh-time")?.innerText || "N/A"],
                ["RAM", document.getElementById("ram-refresh-time")?.innerText || "N/A"],
                ["Root FS", document.getElementById("root-fs-refresh-time")?.innerText || "N/A"],
                ["Server Uptime", document.getElementById("uptime-refresh-time")?.innerText || "N/A"],
            ];

            pdf.autoTable({
                startY: yOffset,
                head: [refreshTimes[0]],
                body: refreshTimes.slice(1),
                theme: "grid",
                styles: { fontSize: 10, cellPadding: 4 },
            });

            yOffset = pdf.lastAutoTable.finalY + 10;

            // 🔹 Chart Section
            const canvas = document.getElementById("requestsErrorsChart");
            if (canvas) {
                const chartImage = canvas.toDataURL("image/png");
                pdf.addPage();
                pdf.setFontSize(14);
                pdf.text("Total Requests & Errors Over Time", 10, 20);
                pdf.addImage(chartImage, "PNG", 10, 30, 190, 100); // Add chart to PDF
                yOffset = 140; // Reset yOffset for the next section
            }

            // 🔹 AI-Powered Insights Section
            pdf.addPage();
            pdf.setFontSize(16);
            pdf.setFont("helvetica", "bold");
            pdf.text("AI-Powered System Insights", 10, 20);
            pdf.setDrawColor(0, 0, 0);
            pdf.line(10, 22, 200, 22); // Add a horizontal line
            yOffset = 30;

            let gptSummary = await generateGPTSummary(systemMetrics);
            if (!gptSummary) {
                gptSummary = "⚠️ GPT API failed. Please check your API key or network connection.";
            }

            const sections = gptSummary.split("\n\n");
            sections.forEach((section) => {
                const lines = pdf.splitTextToSize(section, 180);
                pdf.setFontSize(12);
                pdf.setFont("helvetica", "normal");
                pdf.text(lines, 10, yOffset);
                yOffset += lines.length * 6 + 4;

                if (yOffset > 270) {
                    pdf.addPage();
                    yOffset = 20;
                }
            });

            // 🔹 Save the PDF
            pdf.save("Lumiere_Proxy_Dashboard_Report.pdf");
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("An error occurred while generating the report. Please try again.");
        }
    });

    async function generateGPTSummary(metricsTable) {
        const metrics = Object.fromEntries(metricsTable.slice(1));

        const prompt = `
        Provide a detailed analysis for the following system metrics:
        Metrics:
        ${JSON.stringify(metrics, null, 2)}

        Include:
        - Metrics analysis
        - Refresh times analysis
        - Insights and recommendations for performance improvements
        `;

        try {
            const response = await fetch(GPT_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`,
                },
                body: JSON.stringify({
                    model: "gpt-4",
                    messages: [{ role: "system", content: prompt }],
                    max_tokens: 1024,
                    temperature: 0.7,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("GPT API Error:", errorData);
                return null;
            }

            const data = await response.json();
            return data.choices[0].message.content.trim();
        } catch (error) {
            console.error("Error calling GPT API:", error);
            return null;
        }
    }
});
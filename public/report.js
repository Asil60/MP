document.addEventListener("DOMContentLoaded", function () {
    const { jsPDF } = window.jspdf;
    const API_KEY = "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"; // Replace with your GPT API key
    const GPT_URL = "https://api.openai.com/v1/chat/completions";
 
    document.getElementById("downloadPDF").addEventListener("click", async () => {
        try {
            const pdf = new jsPDF("p", "mm", "a4");
 
            // 🔹 Title Page
            const pageHeight = pdf.internal.pageSize.height;
            const verticalCenter = pageHeight / 2 - 30;
 
            // Add Logo
            const logo = new Image();
            logo.src = "./images/logo_black.png";
            pdf.addImage(logo, "PNG", 75, verticalCenter - 60, 60, 40); // Centered logo
 
            // Add Title
            pdf.setFontSize(36);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(0, 102, 204); // Blue color
            pdf.text("Lumiere Proxy", 105, verticalCenter, { align: "center" });
 
            // Add Subtitle
            pdf.setFontSize(18);
            pdf.setFont("helvetica", "italic");
            pdf.setTextColor(50);
            pdf.text("Detect - Protect - Secure", 105, verticalCenter + 15, { align: "center" });
 
            // Horizontal Line
            pdf.setDrawColor(150);
            pdf.setLineWidth(0.5);
            pdf.line(20, verticalCenter + 30, 190, verticalCenter + 30);
 
            // Add Generated Date
            pdf.setFontSize(12);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(100);
            pdf.text("Generated on: " + new Date().toLocaleString(), 105, verticalCenter + 45, { align: "center" });
 
            pdf.addPage(); // Add a new page for the main content
 
            // 🔹 System Metrics Section
            pdf.setFontSize(22);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(0, 102, 204);
            pdf.text("System Metrics", 10, 20);
 
            const systemMetrics = [
                ["Metric", "Value"],
                ["EC2 Instance Status", document.getElementById("ec2-status")?.innerText || "N/A"],
                ["Nginx Status", document.getElementById("nginx-status")?.innerText || "N/A"],
                ["CPU Usage", document.getElementById("cpu-usage")?.innerText || "N/A"],
                ["RAM Usage", document.getElementById("ram-usage")?.innerText || "N/A"],
                ["Root FS Used", document.getElementById("root-fs-usage")?.innerText || "N/A"],
                ["Server Uptime", document.getElementById("server-uptime")?.innerText || "N/A"],
            ];
 
            pdf.autoTable({
                startY: 30,
                head: [systemMetrics[0]],
                body: systemMetrics.slice(1),
                theme: "grid", // Full grid for better segmentation
                headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255], fontSize: 12 },
                bodyStyles: { fontSize: 10 },
            });
 
            // 🔹 Data Refresh Times Section
            pdf.addPage();
            pdf.setFontSize(22);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(0, 102, 204);
            pdf.text("Data Refresh Times", 10, 20);
 
            const refreshTimes = [
                ["Metric", "Last Updated"],
                ["Nginx Refresh Time", document.getElementById("nginx-refresh-time")?.innerText || "N/A"],
                ["CPU", document.getElementById("cpu-refresh-time")?.innerText || "N/A"],
                ["RAM", document.getElementById("ram-refresh-time")?.innerText || "N/A"],
                ["Root FS", document.getElementById("root-fs-refresh-time")?.innerText || "N/A"],
                ["Server Uptime", document.getElementById("uptime-refresh-time")?.innerText || "N/A"],
            ];
 
            pdf.autoTable({
                startY: 30,
                head: [refreshTimes[0]],
                body: refreshTimes.slice(1),
                theme: "grid", // Full grid
                headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255], fontSize: 12 },
                bodyStyles: { fontSize: 10 },
            });
 
            // 🔹 Chart Section (with Real Data and Image)
            const charts = [
                { id: "requestsErrorsChart", title: "Requests & Errors Over Time" },
                { id: "statusChart", title: "Nginx Status Over Time" },
                { id: "ipChart", title: "IP Traffic Over Time" },
            ];
 
            for (const chart of charts) {
                const chartElement = document.getElementById(chart.id);
                if (chartElement) {
                    pdf.addPage();
                    pdf.setFontSize(22);
                    pdf.setFont("helvetica", "bold");
                    pdf.setTextColor(0, 102, 204);
                    pdf.text(chart.title, 10, 20);
 
                    const chartData = extractChartData(chartElement);
                    pdf.autoTable({
                        startY: 30,
                        head: [["Label", "Value"]],
                        body: chartData,
                        theme: "grid",
                        headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255], fontSize: 12 },
                        bodyStyles: { fontSize: 10 },
                    });
 
                    const currentY = pdf.lastAutoTable.finalY + 10;
                    const chartHeight = 100; // Chart height
                    const chartImage = chartElement.toDataURL("image/png");
 
                    // Check if there's enough space for the image on the current page
                    if (currentY + chartHeight > pageHeight) {
                        pdf.addPage();
                        pdf.addImage(chartImage, "PNG", 10, 20, 190, chartHeight);
                    } else {
                        pdf.addImage(chartImage, "PNG", 10, currentY, 190, chartHeight);
                    }
                }
            }
 
            // 🔹 Logs Section
            pdf.addPage();
            pdf.setFontSize(22);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(0, 102, 204);
            pdf.text("ModSecurity Logs", 10, 20);
 
            const modSecurityRows = await getTableRows("modsecurity-logs");
            if (modSecurityRows.length > 0) {
                pdf.autoTable({
                    startY: 30,
                    head: [["#", "Client IP", "Timestamp", "Request", "Rule ID", "Details"]],
                    body: modSecurityRows,
                    theme: "grid", // Full grid for log segmentation
                    headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255], fontSize: 12 },
                    bodyStyles: { fontSize: 10 },
                });
            } else {
                pdf.setFontSize(14);
                pdf.text("No ModSecurity logs available.", 10, 30);
            }
 
            // 🔹 NGINX Logs Section
            pdf.addPage();
            pdf.setFontSize(22);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(0, 102, 204);
            pdf.text("NGINX Logs", 10, 20);
 
            const nginxRows = await getTableRows("nginx-logs");
            if (nginxRows.length > 0) {
                pdf.autoTable({
                    startY: 30,
                    head: [["#", "Time", "Remote Address", "Status", "Method", "Details"]],
                    body: nginxRows,
                    theme: "grid", // Full grid
                    headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255], fontSize: 12 },
                    bodyStyles: { fontSize: 10 },
                });
            } else {
                pdf.setFontSize(14);
                pdf.text("No NGINX logs available.", 10, 30);
            }
 
            // 🔹 GPT Insights Section
            pdf.addPage();
            pdf.setFontSize(22);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(0, 102, 204);
            pdf.text("AI-Powered Insights", 10, 20);
 
            const gptInsights = await generateGPTInsights(systemMetrics); // Pass metrics to GPT
            const paragraphs = gptInsights.split("\n\n"); // Split insights into paragraphs
            let y = 30;
 
            const pageWidth = pdf.internal.pageSize.width - 20; // Account for margins
 
            // Add Section Titles and Horizontal Lines
            paragraphs.forEach((paragraph, index) => {
                if (index === 1) {
                    pdf.setDrawColor(200);
                    pdf.setLineWidth(0.5);
                    pdf.line(10, y - 5, 200, y - 5); // Horizontal line to separate sections
                }
 
                const lines = pdf.splitTextToSize(paragraph, pageWidth);
                lines.forEach((line) => {
                    if (y > pageHeight - 20) {
                        pdf.addPage();
                        y = 20; // Reset Y-coordinate for the new page
                    }
                    pdf.setFontSize(12); // Regular font size
                    pdf.setFont("helvetica", "normal");
                    pdf.setTextColor(0, 0, 0); // Black text for body
                    pdf.text(line, 10, y);
                    y += 8; // Add line spacing
                });
                y += 10; // Add extra spacing between paragraphs
            });
 
            // Save the PDF
            pdf.save("Lumiere_Proxy_RP_Report.pdf");
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("An error occurred while generating the report. Please try again.");
        }
    });
 
    async function generateGPTInsights(metrics) {
        const formattedMetrics = metrics.slice(1).map(([metric, value]) => `${metric}: ${value}`).join("\n");
 
        const prompt = `
        You are a monitoring company specializing in web security and server performance. Based on the following server metrics, provide a structured in-depth analysis in this format:
 
        Key Observations:
        - Identify performance or security issues indicated by the metrics.
        - Highlight inconsistencies or unusual patterns.
 
        Implications:
        - Explain the potential impact of the observed issues on the system's availability, performance, and security.
 
        Recommendations:
        - Immediate actions to resolve critical issues.
        - Short-term steps to stabilize the system.
        - Long-term strategies to improve performance, scalability, and security.
 
        Potential Risks:
        - Detail the risks of not addressing the identified issues promptly.
        - Suggest mitigation strategies to reduce or eliminate these risks.
 
        Audit Summary:
        - Summarize the current status of the system and highlight key risks.
        - Provide an action plan to address current issues and optimize the system.
 
        Metrics:
        ${formattedMetrics}
 
        Ensure your explanation is detailed, professional, and tailored for stakeholders evaluating server performance and security.
        `;
 
        try {
            const response = await fetch(GPT_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_KEY}`,
                },
                body: JSON.stringify({
                    model: "gpt-4",
                    messages: [{ role: "user", content: prompt }],
                    max_tokens: 1000,
                    temperature: 0.7,
                }),
            });
 
            if (!response.ok) {
                const errorData = await response.json();
                console.error("GPT API Error:", errorData);
                return "Unable to generate insights. Please check your API key and network connection.";
            }
 
            const data = await response.json();
            return data.choices[0].message.content.trim();
        } catch (error) {
            console.error("Error calling GPT API:", error);
            return "Unable to generate insights. Please check your API key and network connection.";
        }
    }
 
    function extractChartData(chartElement) {
        const chartInstance = Chart.getChart(chartElement); // Assumes Chart.js instance
        if (!chartInstance) return [];
 
        const labels = chartInstance.data.labels;
        const datasets = chartInstance.data.datasets;
 
        const data = [];
        datasets.forEach((dataset) => {
            dataset.data.forEach((value, index) => {
                data.push([labels[index], value]);
            });
        });
 
        return data;
    }
 
    async function getTableRows(tableId) {
        const table = document.getElementById(tableId);
        if (!table) return [];
 
        const rows = [];
        const tableRows = table.querySelectorAll("tr");
 
        for (let row of tableRows) {
            const cells = row.querySelectorAll("td, th");
            const rowData = [];
 
            for (let cell of cells) {
                let text = cell.textContent.trim();
                text = text.replace(/[^\x20-\x7E]/g, ""); // Removes non-ASCII characters
                rowData.push(text);
            }
            rows.push(rowData);
        }
 
        return rows;
    }
});
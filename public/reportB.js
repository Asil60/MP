document.addEventListener("DOMContentLoaded", function () {
    const { jsPDF } = window.jspdf;
    const API_KEY = "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"; // Replace with your GPT API key
    const GPT_URL = "https://api.openai.com/v1/chat/completions";

    document.getElementById("downloadPDFB").addEventListener("click", async () => {
        try {
            // Show Swal with progress bar
            const swalInstance = Swal.fire({
                title: "Generating PDF...",
                html: '<div style="width: 100%;"><progress id="progressBar" value="0" max="100" style="width: 100%;"></progress></div>',
                showConfirmButton: false,
                allowOutsideClick: false,
                onBeforeOpen: () => {
                    Swal.showLoading();
                }
            });

            const pdf = new jsPDF("p", "mm", "a4");

            // 🔹 Title Page
            const pageHeight = pdf.internal.pageSize.height;
            const verticalCenter = pageHeight / 2 - 30;

            // Add Logo
            const logo = new Image();
            logo.src = "./images/logo_black.png";
            await new Promise((resolve) => {
                logo.onload = () => {
                    pdf.addImage(logo, "PNG", 75, verticalCenter - 60, 60, 40); // Centered logo
                    resolve();
                };
            });

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

            // 🔹 System Metrics Section (Server B)
            pdf.setFontSize(22);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(0, 102, 204);
            pdf.text("Server B Metrics", 10, 20);

            const serverBMetrics = [
                ["Metric", "Value"],
                ["EC2 Instance Status", document.getElementById("ec2-statusB")?.innerText || "N/A"],
                ["Docker Status", document.getElementById("docker-statusB")?.innerText || "N/A"],
                ["Docker Refresh Time", document.getElementById("docker-refresh-timeB")?.innerText || "N/A"],
                ["CPU Usage", document.getElementById("cpu-usageB")?.innerText || "N/A"],
                ["CPU Refresh Time", document.getElementById("cpu-refresh-timeB")?.innerText || "N/A"],
                ["RAM Usage", document.getElementById("ram-usageB")?.innerText || "N/A"],
                ["RAM Refresh Time", document.getElementById("ram-refresh-timeB")?.innerText || "N/A"],
                ["Root FS Usage", document.getElementById("root-fs-usageB")?.innerText || "N/A"],
                ["Root FS Refresh Time", document.getElementById("root-fs-refresh-timeB")?.innerText || "N/A"],
                ["Server Uptime", document.getElementById("server-uptimeB")?.innerText || "N/A"],
                ["Uptime Refresh Time", document.getElementById("uptime-refresh-timeB")?.innerText || "N/A"],
            ];

            pdf.autoTable({
                startY: 30,
                head: [serverBMetrics[0]],
                body: serverBMetrics.slice(1),
                theme: "grid",
                headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255], fontSize: 12 },
                bodyStyles: { fontSize: 10 },
            });

            // Update progress bar
            updateProgressBar(30);

            // 🔹 Chart Section (Server B)
            const charts = [
                { id: "requestsErrorsChartB", title: "Requests & Errors Over Time (Server B)" },
                { id: "networkTrafficChartB", title: "Network Traffic Over Time (Server B)" },
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

                    if (chart.id === "networkTrafficChartB") {
                        const chartImage = chartElement.toDataURL("image/png");
                        const chartHeight = 100;
                        const currentY = 30;

                        pdf.addImage(chartImage, "PNG", 10, currentY, 190, chartHeight);

                        chartData.datasets.forEach((dataset, index) => {
                            pdf.addPage();
                            pdf.setFontSize(14);
                            pdf.setFont("helvetica", "bold");
                            pdf.text(`Network Traffic Data - ${dataset.label}`, 10, 20);

                            pdf.autoTable({
                                startY: 30,
                                head: [["Label", "Value"]],
                                body: dataset.data.map((value, idx) => [
                                    chartData.labels[idx],
                                    value,
                                ]),
                                theme: "grid",
                                headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255], fontSize: 12 },
                                bodyStyles: { fontSize: 10 },
                            });
                        });
                    } else {
                        pdf.autoTable({
                            startY: 30,
                            head: [["Label", "Value"]],
                            body: chartData.datasets[0].data.map((value, index) => [
                                chartData.labels[index],
                                value,
                            ]),
                            theme: "grid",
                            headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255], fontSize: 12 },
                            bodyStyles: { fontSize: 10 },
                        });

                        const currentY = pdf.lastAutoTable.finalY + 10;
                        const chartHeight = 100;
                        const chartImage = chartElement.toDataURL("image/png");

                        if (currentY + chartHeight > pageHeight) {
                            pdf.addPage();
                            pdf.addImage(chartImage, "PNG", 10, 20, 190, chartHeight);
                        } else {
                            pdf.addImage(chartImage, "PNG", 10, currentY, 190, chartHeight);
                        }
                    }
                }
            }

            // Update progress bar
            updateProgressBar(60);

            // 🔹 GPT Insights Section
            pdf.addPage();
            pdf.setFontSize(22);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(0, 102, 204);
            pdf.text("AI-Powered Insights", 10, 20);

            const gptInsights = await generateGPTInsights(serverBMetrics);
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

            // Update progress bar
            updateProgressBar(90);

            // Save the PDF
            pdf.save("Lumiere_Proxy_ServerB_Report.pdf");

            // Final update to progress bar
            updateProgressBar(100);
            Swal.fire({
                title: "Download Complete!",
                icon: "success",
                confirmButtonText: "OK"
            });
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("An error occurred while generating the report. Please try again.");
        }
    });

    function updateProgressBar(value) {
        const progressBar = document.getElementById("progressBar");
        if (progressBar) {
            progressBar.value = value;
        }
    }

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
        if (!chartInstance) return { labels: [], datasets: [] };

        const labels = chartInstance.data.labels;
        const datasets = chartInstance.data.datasets.map((dataset) => ({
            label: dataset.label,
            data: dataset.data,
        }));

        return { labels, datasets };
    }
});
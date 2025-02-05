document.addEventListener("DOMContentLoaded", function () {
    const incidentBody = document.getElementById("incident-body");
    const modal = document.getElementById("ticket-modal");
    const closeModal = document.querySelector(".close-btn");
    const resolveBtn = document.getElementById("resolve-btn");
    const closingStatementSection = document.getElementById("closing-statement-section");
    const filterType = document.getElementById("filter-type");
    const filterInput = document.getElementById("filter-input");
    const applyFilter = document.getElementById("apply-filter");
    const clearFilter = document.getElementById("clear-filter");
    const prevPage = document.getElementById("prev-page");
    const nextPage = document.getElementById("next-page");
    const pageInfo = document.getElementById("page-info");
 
    const rowsPerPage = 10;
    let currentPage = 1;
    let tickets = JSON.parse(localStorage.getItem("incidentTickets")) || [];
    let filteredTickets = [...tickets];
 
    function loadIncidentTickets(page = 1) {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const currentTickets = filteredTickets.slice(start, end);
 
        incidentBody.innerHTML = "";
        currentTickets.forEach(ticket => {
            const row = document.createElement("tr");
 
            row.innerHTML = `
                <td class="ticket-id" data-id="${ticket.id}">${ticket.id}</td>
                <td class="time">${ticket.time}</td>
                <td class="status">${ticket.status}</td>
            `;
 
            row.querySelector(".ticket-id").addEventListener("click", function () {
                openTicketModal(ticket);
            });
 
            incidentBody.appendChild(row);
        });
 
        updatePaginationControls();
    }
 
    function updatePaginationControls() {
        const totalPages = Math.ceil(filteredTickets.length / rowsPerPage);
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        prevPage.disabled = currentPage === 1;
        nextPage.disabled = currentPage === totalPages;
    }
 
    function openTicketModal(ticket) {
        document.getElementById("modal-ticket-id").innerText = ticket.id;
        document.getElementById("modal-type").innerText = ticket.type || "N/A";
        document.getElementById("modal-time").innerText = ticket.time;
        document.getElementById("modal-ip").innerText = ticket.ip || "N/A";
        document.getElementById("modal-uri").innerText = ticket.uri || "N/A";
        document.getElementById("modal-message").innerText = ticket.message || "N/A";
        document.getElementById("modal-status").innerText = ticket.status;
 
        if (ticket.status === "Resolved") {
            closingStatementSection.innerHTML = `<p><strong>Closing Statement:</strong> ${ticket.closingStatement || "No statement provided."}</p>`;
            resolveBtn.style.display = "none";
        } else {
            closingStatementSection.innerHTML = `
                <label for="closing-statement"><strong>Closing Statement:</strong></label>
                <input type="text" id="closing-statement" placeholder="Enter a closing statement..." required>
            `;
            resolveBtn.style.display = "block";
            resolveBtn.disabled = true;
 
            document.getElementById("closing-statement").addEventListener("input", function () {
                resolveBtn.disabled = !this.value.trim();
            });
 
            resolveBtn.setAttribute("data-id", ticket.id);
        }
 
        modal.style.display = "block";
    }
 
    function resolveTicket(ticketID) {
        tickets = tickets.map(ticket => {
            if (ticket.id === ticketID) {
                const closingStatement = document.getElementById("closing-statement").value.trim();
                return { ...ticket, status: "Resolved", closingStatement };
            }
            return ticket;
        });
 
        localStorage.setItem("incidentTickets", JSON.stringify(tickets));
        filteredTickets = [...tickets];
        modal.style.display = "none";
        loadIncidentTickets(currentPage);
    }
 
    function filterTickets() {
        const filterValue = filterInput.value.trim().toLowerCase();
        const filterKey = filterType.value;
 
        filteredTickets = tickets.filter(ticket => {
            if (filterKey === "id") {
                return ticket.id.toLowerCase().includes(filterValue);
            } else if (filterKey === "time") {
                return ticket.time.toLowerCase().includes(filterValue);
            } else if (filterKey === "status") {
                return ticket.status.toLowerCase().includes(filterValue);
            }
            return true;
        });
 
        currentPage = 1; // Reset to first page after filtering
        loadIncidentTickets();
    }
 
    resolveBtn.addEventListener("click", function () {
        const ticketID = this.getAttribute("data-id");
        resolveTicket(ticketID);
    });
 
    applyFilter.addEventListener("click", filterTickets);
 
    clearFilter.addEventListener("click", () => {
        filterInput.value = "";
        filteredTickets = [...tickets];
        currentPage = 1;
        loadIncidentTickets();
    });
 
    prevPage.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            loadIncidentTickets(currentPage);
        }
    });
 
    nextPage.addEventListener("click", () => {
        const totalPages = Math.ceil(filteredTickets.length / rowsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            loadIncidentTickets(currentPage);
        }
    });
 
    closeModal.addEventListener("click", function () {
        modal.style.display = "none";
    });
 
    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
 
    loadIncidentTickets();
});

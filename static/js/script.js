console.log("script.js loaded");

document.addEventListener("DOMContentLoaded", function () {

    /* ---------------- SIDEBAR NAVIGATION ---------------- */

    const sidebarLinks = document.querySelectorAll(".sidebar-link[data-section]");
    const sidebar = document.querySelector(".sidebar");
    const mainContent = document.querySelector(".main-content");
    const backToDashboardBtn = document.getElementById("backToDashboardBtn");

    sidebarLinks.forEach(link => {
        link.addEventListener("click", function(e) {
            e.preventDefault();

            const targetSection = this.dataset.section;

            // Remove active class from all links
            sidebarLinks.forEach(l => l.classList.remove("active"));

            // Add active class to clicked link
            this.classList.add("active");

            // Hide all content sections
            document.querySelectorAll(".content-section").forEach(section => {
                section.classList.remove("active");
            });

            // Show target section
            const targetSectionElement = document.getElementById(`section-${targetSection}`);
            if (targetSectionElement) {
                targetSectionElement.classList.add("active");
            }

            // Handle sidebar hide/show for Bookings section
            if (targetSection === "bookings") {
                sidebar.classList.add("hidden");
                mainContent.classList.add("full-width");
                if (backToDashboardBtn) {
                    backToDashboardBtn.style.display = "inline-block";
                }
            } else {
                sidebar.classList.remove("hidden");
                mainContent.classList.remove("full-width");
                if (backToDashboardBtn) {
                    backToDashboardBtn.style.display = "none";
                }
            }
        });
    });

    /* ---------------- BACK TO DASHBOARD BUTTON ---------------- */

    if (backToDashboardBtn) {
        backToDashboardBtn.addEventListener("click", function() {
            // Restore sidebar
            sidebar.classList.remove("hidden");
            mainContent.classList.remove("full-width");
            backToDashboardBtn.style.display = "none";

            // Switch to dashboard section
            document.querySelectorAll(".content-section").forEach(section => {
                section.classList.remove("active");
            });

            const dashboardSection = document.getElementById("section-dashboard");
            if (dashboardSection) {
                dashboardSection.classList.add("active");
            }

            // Update active link
            sidebarLinks.forEach(l => l.classList.remove("active"));
            const dashboardLink = document.querySelector(".sidebar-link[data-section='dashboard']");
            if (dashboardLink) {
                dashboardLink.classList.add("active");
            }
        });
    }

    /* ---------------- CANDIDATE NAVIGATION ---------------- */
    
    const candidateNavLinks = document.querySelectorAll(".candidate-nav-link[data-section]");
    
    candidateNavLinks.forEach(link => {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            
            const targetSection = this.dataset.section;
            
            // Remove active class from all candidate nav links
            candidateNavLinks.forEach(l => l.classList.remove("active"));
            
            // Add active class to clicked link
            this.classList.add("active");
            
            // Hide all content sections
            document.querySelectorAll(".content-section").forEach(section => {
                section.classList.remove("active");
            });
            
            // Show target section
            const targetSectionElement = document.getElementById(`section-${targetSection}`);
            if (targetSectionElement) {
                targetSectionElement.classList.add("active");
            }
        });
    });

    const bookingModal = document.getElementById("bookingModal");
    const bookingForm = document.getElementById("bookingForm");
    const slotDetails = document.getElementById("slotDetails");

    const rescheduleModal = document.getElementById("rescheduleModal");
    const rescheduleModalContent = document.getElementById("rescheduleModalContent");

    const dateSelector = document.getElementById("interviewDateSelector");


    /* ---------------- BOOK SLOT MODAL ---------------- */

    if (bookingModal) {

        bookingModal.addEventListener("show.bs.modal", function (event) {

            const button = event.relatedTarget;

            slotDetails.innerHTML =
                `${button.dataset.slotDate}<br>
                 ${button.dataset.slotStart} - ${button.dataset.slotEnd}<br>
                 ${button.dataset.slotLicense}`;

            bookingForm.action = `/book-slot/${button.dataset.slotId}`;

        });

        bookingModal.addEventListener("hidden.bs.modal", function () {
            bookingForm.reset();
        });

    }


    /* ---------------- RESCHEDULE MODAL ---------------- */

    if (rescheduleModal) {

        rescheduleModal.addEventListener("show.bs.modal", function (event) {

            const bookingId = event.relatedTarget.dataset.bookingId;

            rescheduleModalContent.innerHTML =
                '<div class="text-center p-4"><div class="spinner-border text-primary"></div></div>';

            fetch(`/reschedule/${bookingId}`, {
                headers: {
                    "X-Requested-With": "XMLHttpRequest"
                }
            })

            .then(response => response.text())

            .then(html => {

                rescheduleModalContent.innerHTML = html;

                initializeRescheduleForm(bookingId);

            })

            .catch(err => {

                rescheduleModalContent.innerHTML =
                    `<div class="alert alert-danger">${err}</div>`;

            });

        });

    }


    function initializeRescheduleForm(bookingId) {

        const form = document.querySelector("#rescheduleModalContent form");

        const dateInput = document.getElementById("rescheduleDate");

        const slotSelect = document.getElementById("new_slot_id");


        /* ---------- Calendar Change ---------- */

        if (dateInput) {

            dateInput.addEventListener("change", function () {

                fetch("/get-slots-by-date", {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        interview_date: this.value
                    })

                })

                .then(res => res.json())

                .then(data => {

                    if (!data.success) return;

                    slotSelect.innerHTML = "";

                    const slots = [
                        ...data.earth_slots,
                        ...data.moon_slots
                    ];

                    slots.forEach(slot => {

                        const option = document.createElement("option");

                        option.value = slot.id;

                        option.text =
                            `${slot.start_time} - ${slot.end_time} (${slot.license_name})`;

                        slotSelect.appendChild(option);

                    });

                });

            });

        }


        /* ---------- Submit ---------- */

        if (form) {

            form.addEventListener("submit", function (e) {

                e.preventDefault();

                fetch(`/reschedule/${bookingId}`, {

                    method: "POST",

                    headers: {
                        "X-Requested-With": "XMLHttpRequest"
                    },

                    body: new FormData(form)

                })

                .then(res => res.json())

                .then(data => {

                    if (data.success) {

                        alert("Interview rescheduled successfully!");

                        const modalInstance = bootstrap.Modal.getInstance(rescheduleModal);
                        if (modalInstance) {
                            modalInstance.hide();
                        }

                        location.reload();

                    } else {

                        alert(data.error);

                    }

                });

            });

        }

    }


    /* ---------------- Candidate Calendar ---------------- */

    if (dateSelector) {

        dateSelector.addEventListener("change", function () {

            fetch("/get-slots-by-date", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    interview_date: this.value
                })

            })

            .then(res => res.json())

            .then(data => {

                if (!data.success) return;

                updateSlotsTable(data.earth_slots, data.moon_slots);

            });

        });

    }


    function updateSlotsTable(earthSlots, moonSlots) {

        const tbody =
            document.querySelector("#availableSlotsTable tbody");

        if (!tbody) return;

        const slots = [...earthSlots, ...moonSlots];

        if (slots.length === 0) {

            tbody.innerHTML =
                "<tr><td colspan='5' class='text-center'>No Slots Available</td></tr>";

            return;

        }

        let html = "";

        slots.forEach(slot => {

            html += `
            <tr>

                <td>${slot.license_name}</td>

                <td>${slot.interview_date}</td>

                <td>${slot.start_time}</td>

                <td>${slot.end_time}</td>

                <td>

                    <button
                        class="btn btn-primary btn-sm"
                        data-bs-toggle="modal"
                        data-bs-target="#bookingModal"
                        data-slot-id="${slot.id}"
                        data-slot-date="${slot.interview_date}"
                        data-slot-start="${slot.start_time}"
                        data-slot-end="${slot.end_time}"
                        data-slot-license="${slot.license_name}">

                        Book Slot

                    </button>

                </td>

            </tr>
            `;

        });

        tbody.innerHTML = html;

    }

});
//-------------------LOGIN---------------------------------------//
function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = document.getElementById("role").value;

  const emailRegex = /^[a-zA-Z0-9._]+@vit[a-zA-Z]*\.ac\.in$/;
  const passwordRegex = /^(?=.*\d).{6,}$/;

  if (!emailRegex.test(email)) {
    alert("Enter valid VIT email (example: name@vitstudent.ac.in)");
    return;
  }

  if (!passwordRegex.test(password)) {
    alert("Password must be at least 6 characters and contain at least 1 number");
    return;
  }

  // STORE DATA
  localStorage.setItem("userEmail", email);
  localStorage.setItem("userRole", role);

  // REDIRECT
  window.location.href = "dashboard.html";
}



//----------------------------------------DASHBOARD---------------------------------//
// ROLE-BASED PARKING AREAS
const parkingAreas = {
  Student: [
    "SJT Student Parking",
    "SJT Ground Parking",
    "TT Student Parking",
    "GDN Student Parking",
    "PRP Student Parking",
    "SMV Student Parking",
    "MB Student Parking",
    "MGB Student Parking"
  ],

  Faculty: [
    "PRP Basement Parking",
    "PRP Annexure Parking",
    "SJT Parking Lot",
    "TT Parking",
    "Woodys Parking",
    "MB Parking Lot 1"
  ],

  "Admin Staff": [
    "MB Parking Lot 1",
    "MB Parking Lot 2"
  ]
};

function setNavbar() {
  const role = localStorage.getItem("userRole");
  document.getElementById("userRole").innerText = role;
}

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

function loadDashboard() {
  setNavbar();   // ADD THIS LINE

  const role = localStorage.getItem("userRole");
  const areas = parkingAreas[role];

  const container = document.getElementById("parkingAreas");
  container.innerHTML = "";

  areas.forEach(area => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
  <img src="images/${area}.jpg" class="card-img">

  <h3 class="card-title">${area}</h3>

  <button class="card-btn">Select</button>
`;

    div.querySelector(".card-btn").onclick = () => {
      localStorage.setItem("selectedArea", area);
      window.location.href = "parking.html";
    };

    container.appendChild(div);
  });
}

// SEARCH FUNCTION (LETTER MATCHING)
function searchParking() {
  const query = document.getElementById("search").value.toLowerCase();

  document.querySelectorAll(".card").forEach(card => {
    const name = card.innerText.toLowerCase();
    card.style.display = name.includes(query) ? "block" : "none";
  });
}



//-----------------------------------------------PARKING-------------------------------
let currentArea;
let selectedSlot = null;

let parkingData = JSON.parse(localStorage.getItem("parkingData")) || {};
let bookingHistory = JSON.parse(localStorage.getItem("history")) || [];

function initParking() {
  currentArea = localStorage.getItem("selectedArea");

  document.getElementById("areaTitle").innerText = currentArea;
  document.getElementById("userRole").innerText =
    localStorage.getItem("userRole");

  if (!parkingData[currentArea]) {
    parkingData[currentArea] = new Array(50).fill(0);
  }

  renderSlots();
  renderHistory();
}

/* RENDER GRID */
function renderSlots() {
  const container = document.getElementById("parkingGrid");
  container.innerHTML = "";

  const slots = parkingData[currentArea];

  let freeCount = 0;

  slots.forEach((slot, index) => {
    const div = document.createElement("div");

    div.className = "slot " + (slot === 0 ? "free" : "occupied");
    div.innerText = "P" + (index + 1);

    if (slot === 0) {
      freeCount++;

      div.onclick = () => selectSlot(index, div);
    }

    container.appendChild(div);
  });

  document.getElementById("availableCount").innerText =
    "Available Slots: " + freeCount;
}

/* SELECT ONLY ONE SLOT */
function selectSlot(index, element) {
  // Remove previous selection
  document.querySelectorAll(".slot").forEach(s => {
    s.classList.remove("selected");
  });

  element.classList.add("selected");

  selectedSlot = index;

  document.getElementById("selectedSlot").innerText =
    "Selected Slot: P" + (index + 1);
}

function saveBookingHistory(slot, start, end) {
  const entry = {
    slot: "P" + (slot + 1),
    area: currentArea,
    time: start + " - " + end
  };

  bookingHistory.push(entry);

  localStorage.setItem("history", JSON.stringify(bookingHistory));

  renderHistory(); // ✅ THIS IS IMPORTANT
}

function renderHistory() {
  const table = document.querySelector("#historyTable tbody");
  table.innerHTML = "";

  bookingHistory.forEach(item => {
    const row = `
      <tr>
        <td>${item.slot}</td>
        <td>${item.area}</td>
        <td>${item.time}</td>
      </tr>
    `;
    table.innerHTML += row;
  });
}

/* CONFIRM BOOKING */
function confirmBooking() {
  try {
    if (selectedSlot === null) {
      alert("Select a slot first!");
      return;
    }

    const startEl = document.getElementById("startTime");
    const endEl = document.getElementById("endTime");

    if (!startEl || !endEl) {
      alert("Time inputs not found!");
      return;
    }

    const start = startEl.value;
    const end = endEl.value;

    if (!start || !end) {
      alert("Select time range!");
      return;
    }

    if (start >= end) {
      alert("End time must be after start time!");
      return;
    }

    if (start < "07:00" || end > "19:00") {
      alert("Allowed time is 7AM to 7PM only");
      return;
    }

    // Ensure area exists
    if (!parkingData[currentArea]) {
      parkingData[currentArea] = new Array(50).fill(0);
    }

    // Book slot
    parkingData[currentArea][selectedSlot] = 1;

    localStorage.setItem("parkingData", JSON.stringify(parkingData));

    if (typeof saveBookingHistory === "function") {
      saveBookingHistory(selectedSlot, start, end);
    }

    alert(`Slot P${selectedSlot + 1} booked from ${start} to ${end}`);

    selectedSlot = null;
    document.getElementById("selectedSlot").innerText = "No Slot Selected";

    renderSlots();

  } catch (err) {
    console.error(err);
    alert("Something went wrong. Check console (F12).");
  }
}
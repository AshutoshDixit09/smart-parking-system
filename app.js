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
  setNavbar();   

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


//-----------------------------------------------PARKING-------------------------------
let currentArea = localStorage.getItem("selectedArea");
let selectedSlot = null;

let parkingData = JSON.parse(localStorage.getItem("parkingData")) || {};
let history = JSON.parse(localStorage.getItem("history")) || [];

/* INIT */
function initParking() {
  document.getElementById("areaTitle").innerText = currentArea;

  if (!parkingData[currentArea]) {
    parkingData[currentArea] = new Array(50).fill(0);
  }

  renderSlots();
  renderHistory();
}

/* SHOW SLOTS */
function renderSlots() {
  let grid = document.getElementById("parkingGrid");
  grid.innerHTML = "";

  let free = 0;

  for (let i = 0; i < 50; i++) {
    let div = document.createElement("div");
    div.innerText = "P" + (i + 1);

    if (parkingData[currentArea][i] === 0) {
      div.className = "slot free";
      free++;

      div.onclick = function () {
        selectedSlot = i;
        alert("Selected Slot: P" + (i + 1));
      };

    } else {
      div.className = "slot occupied";
    }

    grid.appendChild(div);
  }

  document.getElementById("availableCount").innerText =
    "Available Slots: " + free;
}

/* BOOK SLOT */
function confirmBooking() {
  if (selectedSlot === null) {
    alert("Select a slot first!");
    return;
  }

  let start = document.getElementById("startTime").value;
  let end = document.getElementById("endTime").value;

  if (!start || !end) {
    alert("Enter time!");
    return;
  }

  if (start >= end) {
    alert("Invalid time!");
    return;
  }

  if (start < "07:00" || end > "19:00") {
    alert("Only 7AM to 7PM allowed!");
    return;
  }

  // BOOK
  parkingData[currentArea][selectedSlot] = 1;

  localStorage.setItem("parkingData", JSON.stringify(parkingData));

  // SAVE HISTORY
  history.push({
    slot: "P" + (selectedSlot + 1),
    area: currentArea,
    time: start + " - " + end
  });

  localStorage.setItem("history", JSON.stringify(history));

  alert("Slot booked!");

  selectedSlot = null;

  renderSlots();
  renderHistory();
}

/* HISTORY */
function renderHistory() {
  let table = document.querySelector("#historyTable tbody");
  table.innerHTML = "";

  for (let i = 0; i < history.length; i++) {
    let h = history[i];

    table.innerHTML += `
      <tr>
        <td>${h.slot}</td>
        <td>${h.area}</td>
        <td>${h.time}</td>
      </tr>
    `;
  }
}
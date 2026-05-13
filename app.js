const flights = [
  {
    flightNumber: "TG101",
    airline: "Thai Airways",
    originCode: "BKK", originCity: "Bangkok Suvarnabhumi",
    destCode: "SIN", destCity: "Singapore Changi",
    departure: "08:30", arrival: "12:05",
    duration: "2h 35m", terminal: "2", gate: "D4",
    aircraft: "Boeing 777", status: "on-time", delay: 0
  },
  {
    flightNumber: "TG206",
    airline: "Thai Airways",
    originCode: "BKK", originCity: "Bangkok Suvarnabhumi",
    destCode: "NRT", destCity: "Tokyo Narita",
    departure: "23:45", arrival: "07:55+1",
    duration: "6h 10m", terminal: "2", gate: "B12",
    aircraft: "Boeing 787", status: "boarding", delay: 0
  },
  {
    flightNumber: "TG409",
    airline: "Thai Airways",
    originCode: "BKK", originCity: "Bangkok Suvarnabhumi",
    destCode: "LHR", destCity: "London Heathrow",
    departure: "22:15", arrival: "05:40+1",
    duration: "11h 25m", terminal: "2", gate: "A7",
    aircraft: "Airbus A380", status: "delayed", delay: 45
  },
  {
    flightNumber: "PG201",
    airline: "Bangkok Airways",
    originCode: "BKK", originCity: "Bangkok Suvarnabhumi",
    destCode: "USM", destCity: "Koh Samui",
    departure: "07:00", arrival: "08:10",
    duration: "1h 10m", terminal: "1", gate: "H3",
    aircraft: "ATR 72", status: "on-time", delay: 0
  },
  {
    flightNumber: "PG315",
    airline: "Bangkok Airways",
    originCode: "BKK", originCity: "Bangkok Suvarnabhumi",
    destCode: "HKT", destCity: "Phuket International",
    departure: "10:30", arrival: "11:50",
    duration: "1h 20m", terminal: "1", gate: "G5",
    aircraft: "ATR 72", status: "landed", delay: 0
  },
  {
    flightNumber: "FD3012",
    airline: "Thai AirAsia",
    originCode: "DMK", originCity: "Bangkok Don Mueang",
    destCode: "CNX", destCity: "Chiang Mai International",
    departure: "06:25", arrival: "07:35",
    duration: "1h 10m", terminal: "1", gate: "F2",
    aircraft: "Airbus A320", status: "on-time", delay: 0
  },
  {
    flightNumber: "FD2501",
    airline: "Thai AirAsia",
    originCode: "DMK", originCity: "Bangkok Don Mueang",
    destCode: "KUL", destCity: "Kuala Lumpur KLIA2",
    departure: "14:40", arrival: "17:55",
    duration: "2h 15m", terminal: "1", gate: "E8",
    aircraft: "Airbus A320", status: "delayed", delay: 30
  },
  {
    flightNumber: "SQ972",
    airline: "Singapore Airlines",
    originCode: "SIN", originCity: "Singapore Changi",
    destCode: "BKK", destCity: "Bangkok Suvarnabhumi",
    departure: "09:15", arrival: "10:50",
    duration: "2h 35m", terminal: "2", gate: "C22",
    aircraft: "Boeing 737", status: "on-time", delay: 0
  },
  {
    flightNumber: "SQ175",
    airline: "Singapore Airlines",
    originCode: "SIN", originCity: "Singapore Changi",
    destCode: "LAX", destCity: "Los Angeles International",
    departure: "23:30", arrival: "20:10",
    duration: "17h 40m", terminal: "3", gate: "F30",
    aircraft: "Airbus A350", status: "on-time", delay: 0
  },
  {
    flightNumber: "EK373",
    airline: "Emirates",
    originCode: "DXB", originCity: "Dubai International",
    destCode: "BKK", destCity: "Bangkok Suvarnabhumi",
    departure: "03:10", arrival: "13:05",
    duration: "6h 55m", terminal: "2", gate: "K1",
    aircraft: "Airbus A380", status: "landed", delay: 0
  },
  {
    flightNumber: "EK384",
    airline: "Emirates",
    originCode: "BKK", originCity: "Bangkok Suvarnabhumi",
    destCode: "DXB", destCity: "Dubai International",
    departure: "14:25", arrival: "19:10",
    duration: "6h 45m", terminal: "2", gate: "K3",
    aircraft: "Boeing 777", status: "boarding", delay: 0
  },
  {
    flightNumber: "SL100",
    airline: "Thai Lion Air",
    originCode: "DMK", originCity: "Bangkok Don Mueang",
    destCode: "HKT", destCity: "Phuket International",
    departure: "08:00", arrival: "09:25",
    duration: "1h 25m", terminal: "1", gate: "D1",
    aircraft: "Boeing 737", status: "on-time", delay: 0
  },
  {
    flightNumber: "SL201",
    airline: "Thai Lion Air",
    originCode: "DMK", originCity: "Bangkok Don Mueang",
    destCode: "CNX", destCity: "Chiang Mai International",
    departure: "11:10", arrival: "12:25",
    duration: "1h 15m", terminal: "1", gate: "D6",
    aircraft: "Airbus A320", status: "cancelled", delay: 0
  },
  {
    flightNumber: "QR835",
    airline: "Qatar Airways",
    originCode: "DOH", originCity: "Doha Hamad International",
    destCode: "BKK", destCity: "Bangkok Suvarnabhumi",
    departure: "02:30", arrival: "12:55",
    duration: "7h 25m", terminal: "2", gate: "M5",
    aircraft: "Boeing 787", status: "on-time", delay: 0
  },
  {
    flightNumber: "CX700",
    airline: "Cathay Pacific",
    originCode: "HKG", originCity: "Hong Kong International",
    destCode: "BKK", destCity: "Bangkok Suvarnabhumi",
    departure: "07:50", arrival: "10:15",
    duration: "2h 25m", terminal: "2", gate: "N9",
    aircraft: "Airbus A330", status: "on-time", delay: 0
  },
  {
    flightNumber: "AK851",
    airline: "AirAsia",
    originCode: "KUL", originCity: "Kuala Lumpur KLIA2",
    destCode: "BKK", destCity: "Bangkok Suvarnabhumi",
    departure: "16:20", arrival: "17:30",
    duration: "2h 10m", terminal: "1", gate: "J2",
    aircraft: "Airbus A320", status: "delayed", delay: 20
  }
];

const statusConfig = {
  "on-time":  { label: "On Time",   dot: "🟢", cls: "on-time"  },
  "delayed":  { label: "Delayed",   dot: "🟠", cls: "delayed"  },
  "cancelled":{ label: "Cancelled", dot: "🔴", cls: "cancelled"},
  "landed":   { label: "Landed",    dot: "🔵", cls: "landed"   },
  "boarding": { label: "Boarding",  dot: "🟣", cls: "boarding" }
};

function getProgressPercent(status, depTime) {
  if (status === "landed" || status === "cancelled") return 100;
  if (status === "boarding") return 5;
  const [h, m] = depTime.split(":").map(Number);
  const now = new Date();
  const depMinutes = h * 60 + m;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const diff = nowMinutes - depMinutes;
  if (diff < 0) return 0;
  return Math.min(Math.round((diff / 90) * 100), 95);
}

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function renderFlightCard(flight, dateStr) {
  const sc = statusConfig[flight.status] || statusConfig["on-time"];
  const progress = getProgressPercent(flight.status, flight.departure);
  const progressLabel = flight.status === "cancelled"
    ? "Flight Cancelled"
    : flight.status === "landed"
    ? "Flight Completed"
    : `${progress}% En Route`;

  const delayHtml = flight.delay > 0
    ? `<div class="delay-notice">⚠ Delayed by ${flight.delay} minutes</div>`
    : "";

  return `
    <div class="card-header">
      <div class="card-flight-info">
        <h2>✈ ${flight.flightNumber}</h2>
        <div class="card-airline">${flight.airline} · ${flight.aircraft}</div>
      </div>
      <span class="status-badge ${sc.cls}">${sc.dot} ${sc.label}</span>
    </div>

    <div class="card-route">
      <div class="route-row">
        <div class="route-point">
          <div class="route-code">${flight.originCode}</div>
          <div class="route-city">${flight.originCity}</div>
          <div class="route-time">${flight.departure}</div>
        </div>
        <div class="route-arrow">
          <div class="arrow-line"></div>
          <div class="route-icon">✈</div>
          <div class="route-duration">${flight.duration}</div>
        </div>
        <div class="route-point destination">
          <div class="route-code">${flight.destCode}</div>
          <div class="route-city">${flight.destCity}</div>
          <div class="route-time">${flight.arrival}</div>
        </div>
      </div>
    </div>

    <div class="progress-section">
      <div class="progress-label">
        <span>Departure</span>
        <span>${progressLabel}</span>
        <span>Arrival</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>
    </div>

    ${delayHtml}

    <div class="card-details">
      <div class="detail-item">
        <div class="detail-label">Terminal</div>
        <div class="detail-value">${flight.terminal}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Gate</div>
        <div class="detail-value">${flight.gate}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Aircraft</div>
        <div class="detail-value">${flight.aircraft.split(" ").slice(-1)[0]}</div>
      </div>
    </div>

    <div class="card-footer">
      <span>📅 ${formatDate(dateStr)}</span>
      <span>Updated just now</span>
    </div>
  `;
}

function showSection(...ids) {
  ["loadingSection", "resultSection", "errorSection"]
    .forEach(id => {
      document.getElementById(id).style.display = ids.includes(id) ? "" : "none";
    });
}

function searchMock(number) {
  const normalized = number.trim().toUpperCase();
  return flights.find(f => f.flightNumber === normalized) || null;
}

async function searchFlightAPI(number) {
  const res = await fetch(`/api/flight?iata=${encodeURIComponent(number)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function setSourceBadge(source) {
  const footer = document.querySelector("#resultCard .card-footer");
  if (!footer) return;
  const badge = source === "live"
    ? `<span class="source-badge live">🟢 Live data</span>`
    : `<span class="source-badge mock">⚪ Demo data</span>`;
  footer.insertAdjacentHTML("afterbegin", badge);
}

function initChips() {
  const exTags = document.getElementById("exampleTags");
  if (!exTags) return;
  ["TG101", "SQ972", "EK373", "QR835", "TG409"].forEach(code => {
    const tag = document.createElement("button");
    tag.className = "chip";
    tag.textContent = code;
    tag.onclick = () => {
      document.getElementById("flightNumber").value = code;
      if (!document.getElementById("travelDate").value) {
        document.getElementById("travelDate").value = new Date().toISOString().split("T")[0];
      }
      document.getElementById("searchForm").dispatchEvent(new Event("submit"));
    };
    exTags.appendChild(tag);
  });
}

document.getElementById("searchForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const number = document.getElementById("flightNumber").value.trim();
  const dateStr = document.getElementById("travelDate").value;

  if (!number) { document.getElementById("flightNumber").focus(); return; }

  const btn = document.getElementById("searchBtn");
  btn.classList.add("loading");
  btn.querySelector(".btn-text").textContent = "Searching...";
  showSection("loadingSection");

  let flight = null;
  let source = "mock";

  try {
    const result = await searchFlightAPI(number);
    if (result.found && result.flight) {
      flight = result.flight;
      source = "live";
    }
  } catch (_) {
    // API unavailable — fall through to mock
  }

  if (!flight) {
    flight = searchMock(number);
  }

  btn.classList.remove("loading");
  btn.querySelector(".btn-text").textContent = "Track Flight";

  if (flight) {
    document.getElementById("resultCard").innerHTML = renderFlightCard(flight, dateStr);
    setSourceBadge(source);
    showSection("resultSection");
  } else {
    document.getElementById("errorMessage").textContent =
      `No flight found for "${number.toUpperCase()}". Please check the flight number and try again.`;
    showSection("errorSection");
  }
});

document.getElementById("travelDate").value = new Date().toISOString().split("T")[0];

initChips();

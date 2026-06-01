(function () {
'use strict';
// Extended mock data with prices for comparison
const compareFlights = [
  // BKK → SIN
  { flightNumber:"TG101",  airline:"Thai Airways",    originCode:"BKK", destCode:"SIN", departure:"08:30", arrival:"12:05", duration:"2h 35m", durationMins:155, aircraft:"Boeing 777",  price:4200,  status:"on-time",  stops:0 },
  { flightNumber:"SQ971",  airline:"Singapore Airlines", originCode:"BKK", destCode:"SIN", departure:"10:45", arrival:"14:20", duration:"2h 35m", durationMins:155, aircraft:"Boeing 737",  price:5800,  status:"on-time",  stops:0 },
  { flightNumber:"FD501",  airline:"Thai AirAsia",    originCode:"BKK", destCode:"SIN", departure:"06:10", arrival:"09:55", duration:"2h 45m", durationMins:165, aircraft:"Airbus A320", price:1990,  status:"on-time",  stops:0 },
  { flightNumber:"TR2301", airline:"Scoot",           originCode:"BKK", destCode:"SIN", departure:"14:20", arrival:"18:10", duration:"2h 50m", durationMins:170, aircraft:"Boeing 787",  price:1750,  status:"delayed",  stops:0 },
  { flightNumber:"MI741",  airline:"SilkAir",         originCode:"BKK", destCode:"SIN", departure:"19:50", arrival:"23:45", duration:"2h 55m", durationMins:175, aircraft:"Boeing 737",  price:3400,  status:"on-time",  stops:0 },

  // BKK → NRT
  { flightNumber:"TG206",  airline:"Thai Airways",    originCode:"BKK", destCode:"NRT", departure:"23:45", arrival:"07:55+1",duration:"6h 10m", durationMins:370, aircraft:"Boeing 787",  price:18500, status:"on-time",  stops:0 },
  { flightNumber:"JL033",  airline:"Japan Airlines",  originCode:"BKK", destCode:"NRT", departure:"10:10", arrival:"18:30", duration:"6h 20m", durationMins:380, aircraft:"Boeing 787",  price:22000, status:"on-time",  stops:0 },
  { flightNumber:"NH848",  airline:"ANA",             originCode:"BKK", destCode:"NRT", departure:"00:30", arrival:"08:50+1",duration:"6h 20m", durationMins:380, aircraft:"Boeing 787",  price:19800, status:"boarding", stops:0 },
  { flightNumber:"TZ201",  airline:"Scoot",           originCode:"BKK", destCode:"NRT", departure:"08:00", arrival:"18:10", duration:"7h 10m", durationMins:430, aircraft:"Boeing 787",  price:8900,  status:"on-time",  stops:1,
    transfers:[{
      airportCode:"SIN", airportName:"Singapore Changi Airport",
      arrivalTime:"09:55", departureTime:"11:30", layoverMins:95,
      arrivalTerminal:"1", departureTerminal:"1",
      connectingFlight:"TZ202", connectingAirline:"Scoot", connectingStatus:"on-time",
      connectingAircraft:"Boeing 787",
      baggageReclaim: false,
      note:"Through check-in available. Stay in transit area — no immigration required."
    }]
  },

  // BKK → HKT (domestic)
  { flightNumber:"PG315",  airline:"Bangkok Airways", originCode:"BKK", destCode:"HKT", departure:"10:30", arrival:"11:50", duration:"1h 20m", durationMins:80,  aircraft:"ATR 72",      price:2100,  status:"landed",   stops:0 },
  { flightNumber:"FD3214", airline:"Thai AirAsia",    originCode:"BKK", destCode:"HKT", departure:"07:05", arrival:"08:20", duration:"1h 15m", durationMins:75,  aircraft:"Airbus A320", price:899,   status:"on-time",  stops:0 },
  { flightNumber:"SL100",  airline:"Thai Lion Air",   originCode:"BKK", destCode:"HKT", departure:"08:00", arrival:"09:25", duration:"1h 25m", durationMins:85,  aircraft:"Boeing 737",  price:790,   status:"on-time",  stops:0 },
  { flightNumber:"TG207",  airline:"Thai Airways",    originCode:"BKK", destCode:"HKT", departure:"12:15", arrival:"13:30", duration:"1h 15m", durationMins:75,  aircraft:"Airbus A320", price:2800,  status:"on-time",  stops:0 },

  // BKK → CNX
  { flightNumber:"FD3012", airline:"Thai AirAsia",    originCode:"BKK", destCode:"CNX", departure:"06:25", arrival:"07:35", duration:"1h 10m", durationMins:70,  aircraft:"Airbus A320", price:799,   status:"on-time",  stops:0 },
  { flightNumber:"SL201",  airline:"Thai Lion Air",   originCode:"BKK", destCode:"CNX", departure:"11:10", arrival:"12:25", duration:"1h 15m", durationMins:75,  aircraft:"Airbus A320", price:720,   status:"cancelled",stops:0 },
  { flightNumber:"PG211",  airline:"Bangkok Airways", originCode:"BKK", destCode:"CNX", departure:"15:30", arrival:"16:45", duration:"1h 15m", durationMins:75,  aircraft:"ATR 72",      price:2400,  status:"on-time",  stops:0 },
  { flightNumber:"TG110",  airline:"Thai Airways",    originCode:"BKK", destCode:"CNX", departure:"09:00", arrival:"10:10", duration:"1h 10m", durationMins:70,  aircraft:"Airbus A320", price:2600,  status:"on-time",  stops:0 },

  // BKK → DXB
  { flightNumber:"EK384",  airline:"Emirates",        originCode:"BKK", destCode:"DXB", departure:"14:25", arrival:"19:10", duration:"6h 45m", durationMins:405, aircraft:"Boeing 777",  price:12500, status:"boarding", stops:0 },
  { flightNumber:"TG900",  airline:"Thai Airways",    originCode:"BKK", destCode:"DXB", departure:"01:30", arrival:"06:00", duration:"6h 30m", durationMins:390, aircraft:"Airbus A380", price:14200, status:"on-time",  stops:0 },
  { flightNumber:"FZ551",  airline:"flydubai",        originCode:"BKK", destCode:"DXB", departure:"23:45", arrival:"05:35+1",duration:"7h 50m", durationMins:470, aircraft:"Boeing 737",  price:7800,  status:"on-time",  stops:1,
    transfers:[{
      airportCode:"CMB", airportName:"Bandaranaike International Airport",
      arrivalTime:"01:20", departureTime:"02:45", layoverMins:85,
      arrivalTerminal:"1", departureTerminal:"1",
      connectingFlight:"FZ552", connectingAirline:"flydubai", connectingStatus:"on-time",
      connectingAircraft:"Boeing 737 MAX",
      baggageReclaim: false,
      note:"Transit passengers remain in the terminal. No immigration required for most nationalities."
    }]
  },

  // BKK → KUL
  { flightNumber:"FD2501", airline:"Thai AirAsia",    originCode:"BKK", destCode:"KUL", departure:"14:40", arrival:"17:55", duration:"2h 15m", durationMins:135, aircraft:"Airbus A320", price:1490,  status:"delayed",  stops:0 },
  { flightNumber:"MH782",  airline:"Malaysia Airlines",originCode:"BKK", destCode:"KUL", departure:"09:15", arrival:"12:30", duration:"2h 15m", durationMins:135, aircraft:"Boeing 737",  price:3800,  status:"on-time",  stops:0 },
  { flightNumber:"AK853",  airline:"AirAsia",         originCode:"BKK", destCode:"KUL", departure:"16:20", arrival:"19:30", duration:"2h 10m", durationMins:130, aircraft:"Airbus A320", price:1350,  status:"on-time",  stops:0 },

  // DMK → SIN
  { flightNumber:"TR600",  airline:"Scoot",           originCode:"DMK", destCode:"SIN", departure:"08:30", arrival:"12:15", duration:"2h 45m", durationMins:165, aircraft:"Boeing 787",  price:1650,  status:"on-time",  stops:0 },
  { flightNumber:"FD5201", airline:"Thai AirAsia",    originCode:"DMK", destCode:"SIN", departure:"17:00", arrival:"20:50", duration:"2h 50m", durationMins:170, aircraft:"Airbus A320", price:1890,  status:"on-time",  stops:0 },

  // BKK → LHR
  { flightNumber:"TG409",  airline:"Thai Airways",    originCode:"BKK", destCode:"LHR", departure:"22:15", arrival:"05:40+1",duration:"11h 25m",durationMins:685, aircraft:"Airbus A380", price:32000, status:"delayed",  stops:0 },
  { flightNumber:"EK405",  airline:"Emirates",        originCode:"BKK", destCode:"LHR", departure:"04:05", arrival:"14:05", duration:"12h 00m",durationMins:720, aircraft:"Airbus A380", price:28500, status:"on-time",  stops:1,
    transfers:[{
      airportCode:"DXB", airportName:"Dubai International Airport",
      arrivalTime:"08:10", departureTime:"10:25", layoverMins:135,
      arrivalTerminal:"3", departureTerminal:"3",
      connectingFlight:"EK003", connectingAirline:"Emirates", connectingStatus:"on-time",
      connectingAircraft:"Boeing 777-300ER",
      baggageReclaim: false,
      note:"Baggage through-checked to London. Use the inter-terminal shuttle if needed. Emirates Lounge available for Business/First class."
    }]
  },
  { flightNumber:"QR835",  airline:"Qatar Airways",   originCode:"BKK", destCode:"LHR", departure:"02:30", arrival:"11:50", duration:"13h 20m",durationMins:800, aircraft:"Boeing 787",  price:26000, status:"on-time",  stops:1,
    transfers:[{
      airportCode:"DOH", airportName:"Hamad International Airport",
      arrivalTime:"06:00", departureTime:"07:50", layoverMins:110,
      arrivalTerminal:"1", departureTerminal:"1",
      connectingFlight:"QR001", connectingAirline:"Qatar Airways", connectingStatus:"delayed",
      connectingAircraft:"Airbus A380",
      baggageReclaim: false,
      note:"Transfer via the award-winning Hamad International Airport. Follow 'Connections' signs on arrival. Duty-free shopping available."
    }]
  },
];

const airports = [
  { code:"BKK", name:"Bangkok Suvarnabhumi", city:"Bangkok" },
  { code:"DMK", name:"Bangkok Don Mueang",   city:"Bangkok" },
  { code:"SIN", name:"Singapore Changi",     city:"Singapore" },
  { code:"NRT", name:"Tokyo Narita",         city:"Tokyo" },
  { code:"HKT", name:"Phuket International", city:"Phuket" },
  { code:"CNX", name:"Chiang Mai International", city:"Chiang Mai" },
  { code:"DXB", name:"Dubai International",  city:"Dubai" },
  { code:"KUL", name:"Kuala Lumpur KLIA2",   city:"Kuala Lumpur" },
  { code:"LHR", name:"London Heathrow",      city:"London" },
  { code:"USM", name:"Koh Samui",            city:"Koh Samui" },
];

const popularRoutes = [
  { from:"BKK", to:"SIN" },
  { from:"BKK", to:"NRT" },
  { from:"BKK", to:"HKT" },
  { from:"BKK", to:"CNX" },
  { from:"BKK", to:"DXB" },
  { from:"BKK", to:"LHR" },
  { from:"BKK", to:"KUL" },
];

const statusConfig = {
  "on-time":  { label:"On Time",   dot:"🟢", cls:"on-time"  },
  "delayed":  { label:"Delayed",   dot:"🟠", cls:"delayed"  },
  "cancelled":{ label:"Cancelled", dot:"🔴", cls:"cancelled"},
  "landed":   { label:"Landed",    dot:"🔵", cls:"landed"   },
  "boarding": { label:"Boarding",  dot:"🟣", cls:"boarding" },
};

let currentResults = [];
let currentSort = "departure";

function formatTHB(n) {
  return n.toLocaleString("th-TH");
}

function getAirlineInitials(name) {
  return name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
}

function populateSelects() {
  const originSel = document.getElementById("origin");
  const destSel   = document.getElementById("destination");
  airports.forEach(a => {
    originSel.innerHTML += `<option value="${a.code}">${a.code} — ${a.city}</option>`;
    destSel.innerHTML   += `<option value="${a.code}">${a.code} — ${a.city}</option>`;
  });
}

function populateRouteChips() {
  const container = document.getElementById("routeChips");
  popularRoutes.forEach(r => {
    const fromAp = airports.find(a => a.code === r.from);
    const toAp   = airports.find(a => a.code === r.to);
    const btn = document.createElement("button");
    btn.className = "route-chip";
    btn.innerHTML = `<span>${r.from}</span><span class="route-chip-arrow">→</span><span>${r.to}</span>`;
    btn.title = `${fromAp?.city} → ${toAp?.city}`;
    btn.onclick = () => {
      document.getElementById("origin").value      = r.from;
      document.getElementById("destination").value = r.to;
      document.getElementById("compareForm").dispatchEvent(new Event("submit"));
    };
    container.appendChild(btn);
  });
}

function sortResults(list, by) {
  return [...list].sort((a, b) => {
    if (by === "price")    return a.price - b.price;
    if (by === "duration") return a.durationMins - b.durationMins;
    if (by === "airline")  return a.airline.localeCompare(b.airline);
    // default: departure
    return a.departure.localeCompare(b.departure);
  });
}

function layoverLabel(mins) {
  if (mins < 60)  return { text: `${mins}m`, cls: "layover-tight",   icon: "⚠", warn: "Very tight — risk of missing connection" };
  if (mins < 90)  return { text: `${Math.floor(mins/60)}h ${mins%60}m`, cls: "layover-short",   icon: "⚡", warn: "Short layover — proceed directly to gate" };
  if (mins < 180) return { text: `${Math.floor(mins/60)}h ${mins%60}m`, cls: "layover-ok",      icon: "✓",  warn: null };
  return           { text: `${Math.floor(mins/60)}h ${mins%60}m`, cls: "layover-long",    icon: "☕", warn: null };
}

function renderTransferPanel(transfers, flightNum) {
  if (!transfers || transfers.length === 0) return "";

  const rows = transfers.map((t, i) => {
    const sc  = statusConfig[t.connectingStatus] || statusConfig["on-time"];
    const lv  = layoverLabel(t.layoverMins);
    const sameTerminal = t.arrivalTerminal === t.departureTerminal;
    const bagHtml = t.baggageReclaim
      ? `<div class="tx-bag-warn"><span class="tx-bag-icon">🧳</span><div><strong>Baggage reclaim required</strong><p>Collect your bags at baggage claim, then re-check them at the check-in counter before proceeding through security.</p></div></div>`
      : `<div class="tx-bag-ok"><span class="tx-bag-icon">✓</span><div><strong>Through check-in</strong><p>Your baggage is checked through to the final destination. No need to collect or re-check.</p></div></div>`;

    const terminalHtml = sameTerminal
      ? `<div class="tx-terminal same"><span>📍</span> Arrive & depart from <strong>Terminal ${t.arrivalTerminal}</strong></div>`
      : `<div class="tx-terminal diff"><span>📍</span> Arrive <strong>Terminal ${t.arrivalTerminal}</strong> → Transfer to <strong>Terminal ${t.departureTerminal}</strong><span class="tx-terminal-warn"> ⚠ Terminal change required</span></div>`;

    const warnHtml = lv.warn
      ? `<div class="tx-layover-warn">${lv.icon} ${lv.warn}</div>` : "";

    return `
    <div class="transfer-panel-inner">
      <!-- Header: airport + layover time -->
      <div class="tx-header">
        <div class="tx-airport">
          <span class="tx-airport-code">${t.airportCode}</span>
          <span class="tx-airport-name">${t.airportName}</span>
        </div>
        <div class="tx-layover ${lv.cls}">
          <div class="tx-layover-icon">${lv.icon}</div>
          <div class="tx-layover-time">${lv.text}</div>
          <div class="tx-layover-label">Layover</div>
        </div>
      </div>

      <!-- Timeline -->
      <div class="tx-timeline">
        <div class="tx-tl-row">
          <div class="tx-tl-dot arrive"></div>
          <div class="tx-tl-body">
            <span class="tx-tl-time">${t.arrivalTime}</span>
            <span class="tx-tl-label">Arrive · <strong>${t.airportCode}</strong></span>
            <span class="tx-flight-pill">${flightNum}</span>
          </div>
        </div>
        <div class="tx-tl-line"></div>
        <div class="tx-tl-row">
          <div class="tx-tl-dot depart"></div>
          <div class="tx-tl-body">
            <span class="tx-tl-time">${t.departureTime}</span>
            <span class="tx-tl-label">Depart · <strong>${t.airportCode}</strong></span>
            <span class="tx-flight-pill">${t.connectingFlight}
              <span class="status-badge ${sc.cls}" style="font-size:0.65rem;padding:2px 7px;">${sc.dot} ${sc.label}</span>
            </span>
          </div>
        </div>
      </div>

      ${warnHtml}
      ${terminalHtml}

      <!-- Connecting flight info -->
      <div class="tx-connecting">
        <div class="tx-conn-row">
          <span class="tx-conn-label">Connecting flight</span>
          <span class="tx-conn-value">${t.connectingFlight} · ${t.connectingAirline}</span>
        </div>
        <div class="tx-conn-row">
          <span class="tx-conn-label">Aircraft</span>
          <span class="tx-conn-value">${t.connectingAircraft}</span>
        </div>
        <div class="tx-conn-row">
          <span class="tx-conn-label">Status</span>
          <span class="status-badge ${sc.cls}" style="font-size:0.72rem;padding:3px 10px;">${sc.dot} ${sc.label}</span>
        </div>
      </div>

      <!-- Baggage -->
      ${bagHtml}

      <!-- Note -->
      ${t.note ? `<div class="tx-note">ℹ ${t.note}</div>` : ""}
    </div>`;
  }).join("");

  return `
  <div class="transfer-panel" id="tp-${flightNum}" style="display:none;">
    ${rows}
  </div>`;
}

function renderCard(f, index, bestPriceId, fastestId) {
  const sc = statusConfig[f.status] || statusConfig["on-time"];
  const isBest    = f.flightNumber === bestPriceId;
  const isFastest = f.flightNumber === fastestId;

  let ribbon = `<div class="ribbon-space"></div>`;
  if (isBest)    ribbon = `<div class="card-ribbon ribbon-best">💸 Best Price</div>`;
  else if (isFastest) ribbon = `<div class="card-ribbon ribbon-fast">⚡ Fastest</div>`;

  const borderClass = isBest ? "best-price" : isFastest ? "fastest" : "";
  const delay = index * 40;
  const hasTransfer = f.stops > 0 && f.transfers?.length > 0;
  const transferBtn = hasTransfer
    ? `<button class="tx-toggle-btn" onclick="toggleTransfer('${f.flightNumber}', this)">
         <span class="tx-btn-icon">🔗</span> View Transfer Details
         <span class="tx-chevron">▾</span>
       </button>`
    : "";

  return `
  <div class="compare-card ${borderClass}" style="animation-delay:${delay}ms">
    ${ribbon}
    <div class="cc-main">
      <div class="cc-airline">
        <div class="airline-logo">${getAirlineInitials(f.airline)}</div>
        <span class="airline-name">${f.airline}</span>
        <span class="flight-num-badge">${f.flightNumber}</span>
      </div>

      <div class="cc-time-block">
        <div class="cc-time">${f.departure}</div>
        <div class="cc-iata">${f.originCode}</div>
      </div>

      <div class="cc-connector">
        <div class="cc-duration">${f.duration}</div>
        <div class="cc-line"></div>
        <div class="cc-stops">${f.stops === 0 ? "Nonstop" : `${f.stops} stop`}</div>
      </div>

      <div class="cc-time-block right">
        <div class="cc-time">${f.arrival}</div>
        <div class="cc-iata">${f.destCode}</div>
      </div>

      <div class="cc-price-block">
        <div class="cc-currency">THB</div>
        <div class="cc-price">${formatTHB(f.price)}</div>
      </div>
    </div>

    <div class="cc-footer">
      <span class="cc-detail-pill">✈ ${f.aircraft}</span>
      <span class="cc-detail-pill">🪑 ${f.stops === 0 ? "Direct" : "1 Stop"}</span>
      <span class="cc-detail-pill cc-status-pill status-badge ${sc.cls}">${sc.dot} ${sc.label}</span>
      ${transferBtn}
    </div>
    ${renderTransferPanel(f.transfers, f.flightNumber)}
  </div>`;
}

function toggleTransfer(flightNum, btn) {
  const panel = document.getElementById("tp-" + flightNum);
  if (!panel) return;
  const open = panel.style.display !== "none";
  panel.style.display = open ? "none" : "";
  btn.classList.toggle("open", !open);
  btn.querySelector(".tx-chevron").textContent = open ? "▾" : "▴";
}

function renderResults(list, origin, dest) {
  const active = list.filter(f => f.status !== "cancelled");
  if (active.length === 0) return null;

  const bestPrice = active.reduce((m, f) => f.price < m.price ? f : m);
  const fastest   = active.reduce((m, f) => f.durationMins < m.durationMins ? f : m);

  return {
    html: list.map((f, i) => renderCard(f, i, bestPrice.flightNumber, fastest.flightNumber)).join(""),
    bestPrice,
    fastest,
    count: list.length,
  };
}

function showSections(...ids) {
  ["loadingSection","resultsSection","noResultSection","summaryBar","controlBar","suggestSection"]
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = ids.includes(id) ? "" : "none";
    });
}

function sourceBadge(source) {
  if (source === "cached")   return `<span class="source-badge cached">⚡ Cached</span>`;
  if (source === "schedule") return `<span class="source-badge schedule">📅 Schedule data</span>`;
  return `<span class="source-badge live">🟢 Live data</span>`;
}

function decorateFastest(origin, dest, source) {
  const active = currentResults.filter(f => f.status !== "cancelled" && f.durationMins > 0);
  const fastest = active.length
    ? active.reduce((m, f) => f.durationMins < m.durationMins ? f : m)
    : null;

  if (fastest) {
    const cards = document.querySelectorAll('#flightsGrid .compare-card');
    currentResults.forEach((f, i) => {
      if (f.flightNumber === fastest.flightNumber && cards[i]) {
        cards[i].classList.add('fastest');
        const ribbonEl = cards[i].querySelector('.ribbon-space, .card-ribbon');
        if (ribbonEl) ribbonEl.outerHTML = `<div class="card-ribbon ribbon-fast">⚡ Fastest</div>`;
      }
    });
  }

  const fastestInfo = fastest
    ? `<span class="summary-sep">|</span><span>Fastest: <strong>${fastest.duration}</strong> (${fastest.airline})</span>`
    : '';

  document.getElementById("summaryBar").innerHTML = `
    <span>✈ <strong>${origin} → ${dest}</strong></span>
    <span class="summary-sep">|</span>
    <span><strong>${currentResults.length}</strong> flights found</span>
    ${fastestInfo}
    ${sourceBadge(source)}
  `;
}

function displayResults(results, origin, dest, source) {
  if (results.length === 0) { showSections("noResultSection"); return; }

  currentResults = results;
  currentSort = "departure";
  document.querySelectorAll(".sort-tab").forEach(t =>
    t.classList.toggle("active", t.dataset.sort === "departure")
  );

  const sorted   = sortResults(results, "departure");
  const rendered = renderResults(sorted, origin, dest);
  if (!rendered) { showSections("noResultSection"); return; }

  const srcBadge = source === "cached"
    ? `<span class="source-badge cached">⚡ Cached</span>`
    : source === "schedule"
    ? `<span class="source-badge schedule">📅 Schedule data</span>`
    : `<span class="source-badge live">🟢 Live data</span>`;

  const priceInfo = rendered.bestPrice?.price != null
    ? `<span class="summary-sep">|</span><span>Best price: <strong>฿${formatTHB(rendered.bestPrice.price)}</strong> (${rendered.bestPrice.airline})</span>`
    : "";

  document.getElementById("summaryBar").innerHTML = `
    <span>✈ <strong>${origin} → ${dest}</strong></span>
    <span class="summary-sep">|</span>
    <span><strong>${rendered.count}</strong> flights found</span>
    ${priceInfo}
    <span class="summary-sep">|</span>
    <span>Fastest: <strong>${rendered.fastest.duration}</strong> (${rendered.fastest.airline})</span>
    ${srcBadge}
  `;

  document.getElementById("flightsGrid").innerHTML = rendered.html;
  showSections("summaryBar", "controlBar", "resultsSection");
}

let currentEventSource = null;

function doSearch() {
  const origin = document.getElementById("origin").value;
  const dest   = document.getElementById("destination").value;
  if (!origin || !dest) return;

  if (currentEventSource) currentEventSource.close();

  const btn = document.getElementById("compareBtn");
  btn.classList.add("loading");
  btn.querySelector(".btn-text").textContent = "Searching...";
  showSections("loadingSection");

  currentResults = [];
  const date = document.getElementById("dateFrom").value;
  const params = new URLSearchParams({ dep: origin, arr: dest });
  if (date) params.set('date', date);
  const url = `/api/compare-stream?${params}`;

  const grid = document.getElementById("flightsGrid");
  grid.innerHTML = '';

  let source = "live";
  let total  = 0;
  let finished = false;

  const stop = () => {
    if (!finished) {
      finished = true;
      if (currentEventSource) { currentEventSource.close(); currentEventSource = null; }
      btn.classList.remove("loading");
      btn.querySelector(".btn-text").textContent = "Compare Flights";
    }
  };

  const es = new EventSource(url);
  currentEventSource = es;

  const todayStr = new Date().toISOString().split('T')[0];
  const isFuture = date && date > todayStr;

  es.addEventListener('meta', e => {
    const data = JSON.parse(e.data);
    total  = data.total;
    source = data.cached ? "cached" : (isFuture ? "schedule" : "live");
    if (total === 0) return; // wait for done → noResult
    showSections("summaryBar", "controlBar", "resultsSection");
    document.getElementById("summaryBar").innerHTML = `
      <span>✈ <strong>${origin} → ${dest}</strong></span>
      <span class="summary-sep">|</span>
      <span>Loading <strong>${total}</strong> flights…</span>
      ${sourceBadge(source)}
    `;
  });

  es.addEventListener('flight', e => {
    const flight = JSON.parse(e.data);
    const idx = currentResults.length;
    currentResults.push(flight);
    grid.insertAdjacentHTML('beforeend', renderCard(flight, idx, null, null));
    document.getElementById("summaryBar").querySelector('span:nth-child(3)').innerHTML =
      `Loading <strong>${currentResults.length}/${total}</strong>…`;
  });

  es.addEventListener('done', () => {
    if (currentResults.length === 0) {
      stop();
      showSections("noResultSection");
      return;
    }
    decorateFastest(origin, dest, source);
    currentSort = "departure";
    document.querySelectorAll(".sort-tab").forEach(t =>
      t.classList.toggle("active", t.dataset.sort === "departure")
    );
    stop();
  });

  es.addEventListener('error', e => {
    // EventSource error event has no useful data; check our custom error
    let isConfigError = false;
    try {
      if (e.data) {
        const data = JSON.parse(e.data);
        if (data.code === 'aerodatabox_not_configured') isConfigError = true;
      }
    } catch (_) {}

    stop();
    if (isConfigError) {
      document.getElementById("noResultSection").querySelector("p").textContent =
        "Future schedule lookup requires AeroDataBox API key. Please configure AERODATABOX_KEY.";
    }
    if (currentResults.length === 0) showSections("noResultSection");
  });
}

// Sort tabs
document.querySelectorAll(".sort-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    if (!currentResults.length) return;
    currentSort = tab.dataset.sort;
    document.querySelectorAll(".sort-tab").forEach(t =>
      t.classList.toggle("active", t === tab)
    );
    const sorted   = sortResults(currentResults, currentSort);
    const rendered = renderResults(sorted);
    if (rendered) document.getElementById("flightsGrid").innerHTML = rendered.html;
  });
});

// Swap origin/destination
document.getElementById("swapBtn").addEventListener("click", () => {
  const o = document.getElementById("origin");
  const d = document.getElementById("destination");
  [o.value, d.value] = [d.value, o.value];
});

// Form submit
document.getElementById("compareForm").addEventListener("submit", e => {
  e.preventDefault();
  doSearch();
});

// Set default dates
const today = new Date().toISOString().split("T")[0];
const next7  = new Date(Date.now() + 7*86400000).toISOString().split("T")[0];
document.getElementById("dateFrom").value = today;
document.getElementById("dateTo").value   = next7;

populateSelects();
populateRouteChips();
showSections("suggestSection");

window.toggleTransfer = toggleTransfer;
})();

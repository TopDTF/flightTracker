require('dotenv').config();
const express = require('express');
const http    = require('http');

const app     = express();
const PORT    = process.env.PORT || 3000;
const API_KEY = process.env.AVIATIONSTACK_KEY || '';

// ── In-memory cache ──────────────────────────────────────────────────────────
const cache = new Map(); // key → { data, expiresAt }

const ROUTE_TTL  = 6 * 60 * 60 * 1000; // 6 hours
const FLIGHT_TTL = 30 * 60 * 1000;     // 30 minutes

function cacheGet(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { cache.delete(key); return null; }
  return entry.data;
}

function cacheSet(key, data, ttl) {
  cache.set(key, { data, expiresAt: Date.now() + ttl });
}

// ── AviationStack fetch (5s timeout) ─────────────────────────────────────────
function aviationFetch(params) {
  return new Promise((resolve, reject) => {
    const qs  = new URLSearchParams({ access_key: API_KEY, ...params }).toString();
    const url = `http://api.aviationstack.com/v1/flights?${qs}`;
    const req = http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

// ── Normalize AviationStack → app format ─────────────────────────────────────
function normalize(f) {
  const dep  = f.departure || {};
  const arr  = f.arrival   || {};
  const al   = f.airline   || {};
  const ac   = f.aircraft  || {};
  const fl   = f.flight    || {};

  const status = (() => {
    switch ((f.flight_status || '').toLowerCase()) {
      case 'active':    return 'on-time';
      case 'landed':    return 'landed';
      case 'cancelled': return 'cancelled';
      case 'diverted':  return 'cancelled';
      default:          return 'on-time';
    }
  })();

  const depSched  = dep.scheduled ? new Date(dep.scheduled) : null;
  const depActual = dep.actual    ? new Date(dep.actual)    : null;
  const arrSched  = arr.scheduled ? new Date(arr.scheduled) : null;

  const fmt = d => d ? d.toISOString().slice(11, 16) : '--:--';

  let durationMins = 0;
  if (depSched && arrSched) durationMins = Math.round((arrSched - depSched) / 60000);
  const duration = durationMins > 0
    ? `${Math.floor(durationMins / 60)}h ${durationMins % 60}m` : '--';

  return {
    flightNumber: fl.iata  || fl.icao  || 'N/A',
    airline:      al.name  || 'Unknown',
    originCode:   dep.iata || '--',
    originCity:   dep.airport || dep.iata || '--',
    destCode:     arr.iata || '--',
    destCity:     arr.airport || arr.iata || '--',
    departure:    fmt(depActual || depSched),
    arrival:      fmt(arrSched),
    duration,
    durationMins,
    terminal:     dep.terminal || '-',
    gate:         dep.gate     || '-',
    arrTerminal:  arr.terminal || '-',
    arrGate:      arr.gate     || '-',
    aircraft:     ac.iata || ac.icao || 'N/A',
    status,
    delay:        dep.delay || 0,
    stops:        0,
    price:        null,
  };
}

// ── Preload popular routes on startup ────────────────────────────────────────
const POPULAR_ROUTES = [
  ['BKK','SIN'], ['BKK','NRT'], ['BKK','HKT'],
  ['BKK','CNX'], ['BKK','DXB'], ['BKK','LHR'],
  ['BKK','KUL'], ['DMK','SIN'],
];

async function preloadRoute(dep, arr) {
  const key = `route:${dep}:${arr}`;
  try {
    const data = await aviationFetch({ dep_iata: dep, arr_iata: arr, limit: 10 });
    if (!data.error && Array.isArray(data.data)) {
      const flights = data.data.map(normalize).filter(f => f.flightNumber !== 'N/A');
      cacheSet(key, flights, ROUTE_TTL);
      console.log(`[cache] preloaded ${dep}→${arr}: ${flights.length} flights`);
    }
  } catch (e) {
    console.log(`[cache] preload ${dep}→${arr} failed: ${e.message}`);
  }
}

async function preloadAll() {
  if (!API_KEY) { console.log('[cache] no API key, skipping preload'); return; }
  console.log('[cache] preloading popular routes...');
  // stagger requests 300ms apart to avoid rate limiting
  for (const [dep, arr] of POPULAR_ROUTES) {
    await preloadRoute(dep, arr);
    await new Promise(r => setTimeout(r, 300));
  }
  console.log('[cache] preload complete');
}

// Refresh cache every 6 hours
setInterval(preloadAll, ROUTE_TTL);

// ── Static files ─────────────────────────────────────────────────────────────
app.use(express.static('.', { extensions: ['html'] }));

// ── GET /api/flight?iata=TG101&date=2026-05-13 ───────────────────────────────
app.get('/api/flight', async (req, res) => {
  const iata = (req.query.iata  || '').toUpperCase().trim();
  const date = (req.query.date  || '').trim();
  if (!iata) return res.status(400).json({ error: 'Missing iata' });
  if (!API_KEY) return res.status(503).json({ error: 'API key not configured' });

  // Free plan: only today's real-time data available
  const today    = new Date().toISOString().split('T')[0];
  const isFuture = date && date > today;
  if (isFuture) {
    return res.json({
      found: false,
      reason: 'future',
      message: `Schedule data for ${date} requires a paid plan. Real-time tracking is available for today's flights only.`,
    });
  }

  const params = { flight_iata: iata, limit: 1 };
  if (date) params.flight_date = date;

  const key    = `flight:${iata}:${date || today}`;
  const cached = cacheGet(key);
  if (cached) return res.json({ found: true, flight: cached, cached: true });

  try {
    const data = await aviationFetch(params);
    if (data.error) return res.status(502).json({ error: data.error.info || 'API error' });

    const flights = (data.data || []).map(normalize);
    if (!flights.length) {
      return res.json({
        found: false,
        reason: 'not_found',
        message: `Flight ${iata} was not found. It may not be operating today or is not in our data source.`,
      });
    }

    cacheSet(key, flights[0], FLIGHT_TTL);
    res.json({ found: true, flight: flights[0], cached: false });
  } catch (e) {
    res.status(504).json({ error: e.message });
  }
});

// ── GET /api/compare?dep=BKK&arr=SIN ─────────────────────────────────────────
app.get('/api/compare', async (req, res) => {
  const dep = (req.query.dep || '').toUpperCase().trim();
  const arr = (req.query.arr || '').toUpperCase().trim();
  if (!dep || !arr) return res.status(400).json({ error: 'Missing dep/arr' });
  if (!API_KEY) return res.status(503).json({ error: 'API key not configured' });

  const key    = `route:${dep}:${arr}`;
  const cached = cacheGet(key);
  if (cached) return res.json({ found: cached.length > 0, flights: cached, cached: true });

  try {
    const data = await aviationFetch({ dep_iata: dep, arr_iata: arr, limit: 10 });
    if (data.error) return res.status(502).json({ error: data.error.info || 'API error' });

    const flights = (data.data || []).map(normalize).filter(f => f.flightNumber !== 'N/A');
    cacheSet(key, flights, ROUTE_TTL);
    res.json({ found: flights.length > 0, flights, cached: false });
  } catch (e) {
    res.status(504).json({ error: e.message });
  }
});

// ── GET /api/cache-status (debug) ─────────────────────────────────────────────
app.get('/api/cache-status', (req, res) => {
  const entries = [...cache.entries()].map(([k, v]) => ({
    key: k,
    items: Array.isArray(v.data) ? v.data.length : 1,
    expiresIn: Math.round((v.expiresAt - Date.now()) / 60000) + ' min',
  }));
  res.json({ size: cache.size, entries });
});

app.listen(PORT, () => {
  console.log(`Flight Tracker running on port ${PORT}`);
  preloadAll();
});

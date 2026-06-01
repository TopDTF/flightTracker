require('dotenv').config();
const express = require('express');
const http    = require('http');
const https   = require('https');

const app  = express();
const PORT = process.env.PORT || 3000;

const AVIATION_KEY    = process.env.AVIATIONSTACK_KEY || '';
const AERODATABOX_KEY = process.env.AERODATABOX_KEY   || '';

// ── In-memory cache ──────────────────────────────────────────────────────────
const cache = new Map();
const ROUTE_TTL  = 24 * 60 * 60 * 1000; // 24 hours
const FLIGHT_TTL = 60 * 60 * 1000;      // 1 hour

function cacheGet(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { cache.delete(key); return null; }
  return entry.data;
}

function cacheSet(key, data, ttl) {
  cache.set(key, { data, expiresAt: Date.now() + ttl });
}

// ── HTTPS GET JSON helper ────────────────────────────────────────────────────
function httpsGetJson(options, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { reject(new Error(`bad JSON from ${options.hostname}`)); }
      });
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}

// ── AeroDataBox ──────────────────────────────────────────────────────────────
function adbFetch(path) {
  return httpsGetJson({
    hostname: 'aerodatabox.p.rapidapi.com',
    path,
    method:  'GET',
    headers: {
      'x-rapidapi-host': 'aerodatabox.p.rapidapi.com',
      'x-rapidapi-key':  AERODATABOX_KEY,
    },
  });
}

function parseAdbTime(t) {
  // "2026-06-01 08:30+07:00" or "2026-06-01 01:30Z"
  if (!t) return null;
  const iso = t.replace(' ', 'T').replace('Z', '+00:00');
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

function adbStatus(s) {
  const t = (s || '').toLowerCase();
  if (t.includes('cancel'))                       return 'cancelled';
  if (t.includes('divert'))                       return 'cancelled';
  if (t.includes('arrived') || t.includes('landed')) return 'landed';
  if (t.includes('board'))                        return 'boarding';
  if (t.includes('delay'))                        return 'delayed';
  return 'on-time';
}

function normalizeAdbFlight(f) {
  const dep = f.departure || {};
  const arr = f.arrival   || {};
  const al  = f.airline   || {};
  const ac  = f.aircraft  || {};

  const depStr = dep.scheduledTime?.local || dep.scheduledTime?.utc || '';
  const arrStr = arr.scheduledTime?.local || arr.scheduledTime?.utc || '';
  const depDt  = parseAdbTime(depStr);
  const arrDt  = parseAdbTime(arrStr);

  let durationMins = 0;
  if (depDt && arrDt) durationMins = Math.round((arrDt - depDt) / 60000);
  const duration = durationMins > 0
    ? `${Math.floor(durationMins/60)}h ${durationMins%60}m` : '--';

  const hm = s => s ? s.slice(11, 16) : '--:--';

  return {
    flightNumber: (f.number || 'N/A').replace(/\s+/g, ''),
    airline:      al.name || 'Unknown',
    originCode:   dep.airport?.iata || '--',
    originCity:   dep.airport?.name || dep.airport?.iata || '--',
    destCode:     arr.airport?.iata || '--',
    destCity:     arr.airport?.name || arr.airport?.iata || '--',
    departure:    hm(depStr),
    arrival:      hm(arrStr),
    duration,
    durationMins,
    terminal:     dep.terminal || '-',
    gate:         dep.gate     || '-',
    arrTerminal:  arr.terminal || '-',
    arrGate:      arr.gate     || '-',
    aircraft:     ac.model     || 'N/A',
    status:       adbStatus(f.status),
    delay:        0,
    stops:        0,
    price:        null,
  };
}

function normalizeAdbFids(f, depIata) {
  const mov = f.movement || {};
  const al  = f.airline  || {};
  const ac  = f.aircraft || {};
  const depStr = mov.scheduledTime?.local || '';
  return {
    flightNumber: (f.number || 'N/A').replace(/\s+/g, ''),
    airline:      al.name || 'Unknown',
    originCode:   depIata,
    originCity:   depIata,
    destCode:     mov.airport?.iata || '--',
    destCity:     mov.airport?.name || mov.airport?.iata || '--',
    departure:    depStr ? depStr.slice(11, 16) : '--:--',
    arrival:      '--:--',
    duration:     '--',
    durationMins: 0,
    terminal:     mov.terminal || '-',
    gate:         '-',
    arrTerminal:  '-',
    aircraft:     ac.model || 'N/A',
    status:       adbStatus(f.status),
    delay:        0,
    stops:        0,
    price:        null,
  };
}

async function adbFlightByNumber(iata, date) {
  const { body } = await adbFetch(`/flights/number/${encodeURIComponent(iata)}/${encodeURIComponent(date)}`);
  if (body && body.message) throw new Error(body.message);
  return Array.isArray(body) ? body : [];
}

async function adbDepartures(dep, fromLocal, toLocal) {
  const qs = new URLSearchParams({
    direction:      'Departure',
    withCancelled:  'true',
    withCodeshared: 'false',
    withCargo:      'false',
    withPrivate:    'false',
    withLocation:   'false',
  }).toString();
  const path = `/flights/airports/iata/${dep}/${encodeURIComponent(fromLocal)}/${encodeURIComponent(toLocal)}?${qs}`;
  const { body } = await adbFetch(path);
  if (body && body.message) throw new Error(body.message);
  return body && Array.isArray(body.departures) ? body.departures : [];
}

// Find ≤4 flights dep→arr in window, enrich each with arrival time via Flight-by-number.
// AeroDataBox free tier = 1 req/sec, so we serialize the enrichment calls with a delay.
async function fetchCompareViaAdb(dep, arr, date, fromLocal, toLocal) {
  const deps     = await adbDepartures(dep, fromLocal, toLocal);
  const filtered = deps.filter(d => d.movement?.airport?.iata === arr).slice(0, 4);
  if (!filtered.length) return [];

  const enriched = [];
  for (let i = 0; i < filtered.length; i++) {
    // Sleep 1.1s before every enrichment call (including the first — the FIDS
    // call above already used the current 1-req/sec slot).
    await new Promise(r => setTimeout(r, 1100));
    const d   = filtered[i];
    const num = (d.number || '').replace(/\s+/g, '');
    let row = null;
    if (num) {
      try {
        const details = await adbFlightByNumber(num, date);
        if (details.length > 0) row = normalizeAdbFlight(details[0]);
      } catch (e) {
        console.log(`[adb enrich] ${num} ${date} failed: ${e.message}`);
      }
    }
    enriched.push(row || normalizeAdbFids(d, dep));
  }

  // Don't cache for a full 24h if enrichment failed for any row — retry sooner.
  return enriched.filter(f => f.flightNumber !== 'N/A');
}

function compareCacheTtl(flights) {
  const anyMissing = flights.some(f => f.arrival === '--:--');
  return anyMissing ? 10 * 60 * 1000 : ROUTE_TTL; // 10min vs 24h
}

// ── AviationStack (fallback) ─────────────────────────────────────────────────
function aviationFetch(params) {
  return new Promise((resolve, reject) => {
    const qs  = new URLSearchParams({ access_key: AVIATION_KEY, ...params }).toString();
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

function normalizeAviation(f) {
  const dep = f.departure || {};
  const arr = f.arrival   || {};
  const al  = f.airline   || {};
  const ac  = f.aircraft  || {};
  const fl  = f.flight    || {};

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
  const fmt       = d => d ? d.toISOString().slice(11, 16) : '--:--';

  let durationMins = 0;
  if (depSched && arrSched) durationMins = Math.round((arrSched - depSched) / 60000);
  const duration = durationMins > 0
    ? `${Math.floor(durationMins/60)}h ${durationMins%60}m` : '--';

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

// ── Local time helpers ───────────────────────────────────────────────────────
function pad(n) { return String(n).padStart(2, '0'); }
function todayIso() { return new Date().toISOString().split('T')[0]; }
function isoLocal(d) {
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ── Static files ─────────────────────────────────────────────────────────────
app.use(express.static('.', { extensions: ['html'] }));

// ── GET /api/flight?iata=TG101&date=YYYY-MM-DD ───────────────────────────────
app.get('/api/flight', async (req, res) => {
  const iata = (req.query.iata || '').toUpperCase().trim();
  const date = (req.query.date || '').trim();
  if (!iata) return res.status(400).json({ error: 'Missing iata' });

  const today   = todayIso();
  const useDate = date || today;
  const key     = `flight:${iata}:${useDate}`;
  const cached  = cacheGet(key);
  if (cached) return res.json({ found: true, flight: cached, cached: true });

  // Try AeroDataBox (supports past + future up to 365 days)
  if (AERODATABOX_KEY) {
    try {
      const results = await adbFlightByNumber(iata, useDate);
      if (results.length > 0) {
        const flight = normalizeAdbFlight(results[0]);
        cacheSet(key, flight, FLIGHT_TTL);
        return res.json({ found: true, flight, cached: false, source: 'aerodatabox' });
      }
    } catch (e) {
      console.log(`[adb flight] ${iata} ${useDate} failed: ${e.message}`);
    }
  }

  // Fallback: AviationStack (today only)
  if (AVIATION_KEY && useDate <= today) {
    try {
      const params = { flight_iata: iata, limit: 1 };
      if (date) params.flight_date = date;
      const data = await aviationFetch(params);
      if (!data.error) {
        const flights = (data.data || []).map(normalizeAviation);
        if (flights.length) {
          cacheSet(key, flights[0], FLIGHT_TTL);
          return res.json({ found: true, flight: flights[0], cached: false, source: 'aviationstack' });
        }
      }
    } catch (e) {
      console.log(`[aviation flight] ${iata} failed: ${e.message}`);
    }
  }

  res.json({
    found: false,
    reason: 'not_found',
    message: `Flight ${iata} was not found for ${useDate}.`,
  });
});

// ── GET /api/compare?dep=BKK&arr=SIN ── today's flights ──────────────────────
app.get('/api/compare', async (req, res) => {
  const dep = (req.query.dep || '').toUpperCase().trim();
  const arr = (req.query.arr || '').toUpperCase().trim();
  if (!dep || !arr) return res.status(400).json({ error: 'Missing dep/arr' });

  const today  = todayIso();
  const key    = `route:${dep}:${arr}:${today}`;
  const cached = cacheGet(key);
  if (cached) return res.json({ found: cached.length > 0, flights: cached, cached: true });

  // AeroDataBox: next 12 hours from now
  if (AERODATABOX_KEY) {
    try {
      const now    = new Date();
      const later  = new Date(now.getTime() + 12 * 3600000);
      const flights = await fetchCompareViaAdb(dep, arr, today, isoLocal(now), isoLocal(later));
      if (flights.length) {
        cacheSet(key, flights, compareCacheTtl(flights));
        return res.json({ found: true, flights, cached: false, source: 'aerodatabox' });
      }
    } catch (e) {
      console.log(`[adb compare] ${dep}→${arr} failed: ${e.message}`);
    }
  }

  // Fallback: AviationStack
  if (AVIATION_KEY) {
    try {
      const data = await aviationFetch({ dep_iata: dep, arr_iata: arr, limit: 4 });
      if (!data.error) {
        const flights = (data.data || []).map(normalizeAviation).filter(f => f.flightNumber !== 'N/A').slice(0, 4);
        cacheSet(key, flights, ROUTE_TTL);
        return res.json({ found: flights.length > 0, flights, cached: false, source: 'aviationstack' });
      }
    } catch (e) {
      console.log(`[aviation compare] failed: ${e.message}`);
    }
  }

  res.json({ found: false, flights: [], cached: false });
});

// ── GET /api/schedule?dep=BKK&arr=SIN&date=YYYY-MM-DD ── future schedules ────
app.get('/api/schedule', async (req, res) => {
  const dep  = (req.query.dep  || '').toUpperCase().trim();
  const arr  = (req.query.arr  || '').toUpperCase().trim();
  const date = (req.query.date || '').trim();
  if (!dep || !arr || !date) return res.status(400).json({ error: 'Missing dep/arr/date' });

  if (!AERODATABOX_KEY) {
    return res.status(503).json({
      error:   'aerodatabox_not_configured',
      message: 'AeroDataBox API key not set. Add AERODATABOX_KEY env var.',
    });
  }

  const key    = `route:${dep}:${arr}:${date}`;
  const cached = cacheGet(key);
  if (cached) return res.json({ found: cached.length > 0, flights: cached, cached: true, source: 'aerodatabox' });

  try {
    // Morning window (00:00–12:00 local) — 12h is the FIDS limit
    const flights = await fetchCompareViaAdb(dep, arr, date, `${date}T00:00`, `${date}T12:00`);
    cacheSet(key, flights, compareCacheTtl(flights));
    res.json({ found: flights.length > 0, flights, cached: false, source: 'aerodatabox' });
  } catch (e) {
    res.status(504).json({ error: e.message });
  }
});

// ── GET /api/cache-status (debug) ────────────────────────────────────────────
app.get('/api/cache-status', (req, res) => {
  const entries = [...cache.entries()].map(([k, v]) => ({
    key: k,
    items: Array.isArray(v.data) ? v.data.length : 1,
    expiresIn: Math.round((v.expiresAt - Date.now()) / 60000) + ' min',
  }));
  res.json({ size: cache.size, entries });
});

// ── POST /api/cache-clear ────────────────────────────────────────────────────
app.post('/api/cache-clear', (req, res) => {
  const n = cache.size;
  cache.clear();
  res.json({ cleared: n });
});

app.listen(PORT, () => {
  console.log(`Flight Tracker running on port ${PORT}`);
});

require('dotenv').config();
const express = require('express');
const https   = require('https');
const http    = require('http');

const app  = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.AVIATIONSTACK_KEY || '';

app.use(express.static('.', { extensions: ['html'] }));

// Helper: call AviationStack (HTTP — free plan limitation)
function aviationFetch(params) {
  return new Promise((resolve, reject) => {
    const qs = new URLSearchParams({ access_key: API_KEY, ...params }).toString();
    const url = `http://api.aviationstack.com/v1/flights?${qs}`;
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

// Normalize AviationStack flight object → app format
function normalizeFlightData(f) {
  const dep  = f.departure  || {};
  const arr  = f.arrival    || {};
  const al   = f.airline    || {};
  const ac   = f.aircraft   || {};
  const fl   = f.flight     || {};
  const live = f.live        || {};

  const status = (() => {
    switch ((f.flight_status || '').toLowerCase()) {
      case 'active':    return 'on-time';
      case 'landed':    return 'landed';
      case 'cancelled': return 'cancelled';
      case 'diverted':  return 'cancelled';
      case 'scheduled': return 'on-time';
      default:          return 'on-time';
    }
  })();

  const depSched  = dep.scheduled ? new Date(dep.scheduled) : null;
  const depActual = dep.actual    ? new Date(dep.actual)    : null;
  const arrSched  = arr.scheduled ? new Date(arr.scheduled) : null;
  const delayMins = dep.delay || 0;

  const fmt = d => d ? d.toISOString().slice(11,16) : '--:--';

  let durationMins = 0;
  if (depSched && arrSched) {
    durationMins = Math.round((arrSched - depSched) / 60000);
  }
  const durationStr = durationMins > 0
    ? `${Math.floor(durationMins/60)}h ${durationMins%60}m`
    : '--';

  return {
    flightNumber:  fl.iata  || fl.icao  || 'N/A',
    airline:       al.name  || 'Unknown',
    originCode:    dep.iata || '--',
    originCity:    dep.airport || dep.iata || '--',
    destCode:      arr.iata || '--',
    destCity:      arr.airport || arr.iata || '--',
    departure:     fmt(depActual || depSched),
    arrival:       fmt(arrSched),
    duration:      durationStr,
    durationMins,
    terminal:      dep.terminal || '-',
    gate:          dep.gate     || '-',
    arrTerminal:   arr.terminal || '-',
    arrGate:       arr.gate     || '-',
    aircraft:      ac.iata || ac.icao || 'N/A',
    status,
    delay:         delayMins,
    live: live.latitude ? {
      lat:      live.latitude,
      lng:      live.longitude,
      altitude: live.altitude,
      speed:    live.speed_horizontal,
    } : null,
    _raw: f,
  };
}

// ── GET /api/flight?iata=TG101 ──────────────────────────────────────────────
app.get('/api/flight', async (req, res) => {
  const iata = (req.query.iata || '').toUpperCase().trim();
  if (!iata) return res.status(400).json({ error: 'Missing flight iata' });
  if (!API_KEY) return res.status(503).json({ error: 'API key not configured' });

  try {
    const data = await aviationFetch({ flight_iata: iata, limit: 1 });
    if (data.error) return res.status(502).json({ error: data.error.info || 'API error' });

    const flights = (data.data || []).map(normalizeFlightData);
    if (flights.length === 0) return res.json({ found: false });

    res.json({ found: true, flight: flights[0] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── GET /api/compare?dep=BKK&arr=SIN ───────────────────────────────────────
app.get('/api/compare', async (req, res) => {
  const dep = (req.query.dep || '').toUpperCase().trim();
  const arr = (req.query.arr || '').toUpperCase().trim();
  if (!dep || !arr) return res.status(400).json({ error: 'Missing dep/arr' });
  if (!API_KEY) return res.status(503).json({ error: 'API key not configured' });

  try {
    const data = await aviationFetch({ dep_iata: dep, arr_iata: arr, limit: 10 });
    if (data.error) return res.status(502).json({ error: data.error.info || 'API error' });

    const flights = (data.data || []).map(f => ({
      ...normalizeFlightData(f),
      stops: 0,
      price: null,
    }));

    res.json({ found: flights.length > 0, flights });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => console.log(`Flight Tracker running on port ${PORT}`));

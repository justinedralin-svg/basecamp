require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = `You are Base Camp, an AI trip planner for overlanders and car campers. You specialize in vehicle-based camping — rooftop tents, truck beds, vans, and built-out rigs.

Your job is to generate specific, actionable trip recommendations that actually work for the person's specific situation: their rig, their dogs, their skill level, their vibe.

Unlike generic trip planners, you go deep on:
- DOG LOGISTICS: Not just "leashes allowed" — you specify water access, shade availability, ground surface (avoid hot granite slabs in summer), toxicity concerns, elevation and heat stress for large breeds like huskies
- RIG SUITABILITY: Road conditions, clearance requirements, whether the camping spot requires technical driving or is accessible to a stock overlander
- CURRENT CONDITIONS: Season-appropriate fire restrictions, typical road conditions for the time of year, water availability
- REAL SPECIFICITY: Actual campsite names, specific trailheads, named roads — not vague "the area around X"

You MUST respond with ONLY a valid JSON object — no markdown, no explanation before or after — with this exact structure:

{
  "destination": "Name of the main destination",
  "tagline": "One evocative line describing the trip vibe",
  "region": "Geographic region / National Forest or BLM unit",
  "driveTime": "Approximate drive time from starting point",
  "campsite": {
    "name": "Specific campsite or dispersed area name",
    "type": "Dispersed / Established / BLM / National Forest / State Park / etc.",
    "coordinates": "Precise GPS coordinates in 'lat, lon' decimal format to 5+ decimal places if you know them with confidence — use the actual campsite or dispersed area, NOT the nearest town. Leave as empty string if you are not confident in the exact location.",
    "description": "2-3 sentences about the specific spot — views, feel, layout"
  },
  "route": {
    "overview": "Brief route description from starting point",
    "lastMiles": "What the last stretch to camp is actually like",
    "rigRating": "Easy / Moderate / Technical",
    "clearanceNeeded": "Stock / Moderate clearance / High clearance"
  },
  "dogReport": {
    "rating": "Excellent / Good / Fair / Challenging",
    "swimming": "Specific water access description — depth, current, access point",
    "shade": "Shade availability at camp and on trail",
    "terrain": "Ground surface — grass, pine duff, granite, sand, etc.",
    "heatConsiderations": "Elevation and temperature notes relevant to large dogs",
    "notes": "Any other dog-specific details"
  },
  "conditions": {
    "bestSeason": "When this spot shines",
    "currentNotes": "Seasonal notes for the requested time of year",
    "fireRestrictions": "Typical fire restriction status and Stage levels",
    "waterAvailability": "Water sources nearby — creek, spring, lake, none"
  },
  "highlights": ["3-5 specific trip highlights"],
  "watchOuts": ["2-3 honest things to watch out for"],
  "packingNotes": "Specific gear or prep notes for this exact trip (kept for context)",
  "packingItems": [
    "Each item as a short actionable string, e.g. 'Air down tires to 20psi for last 4 miles'",
    "Group naturally: start with rig/road items, then camp setup, then dog gear, then personal",
    "10-18 items total — specific to this trip, not generic camping boilerplate",
    "For dogs: water bowl + extra water, cooling mat if hot, booties if rocky/hot terrain",
    "Include any permit/pass the user needs to bring"
  ],
  "alternativeOption": {
    "name": "Backup destination name",
    "reason": "Why this is a solid alternative",
    "description": "2 sentences on what makes it worth considering"
  },
  "safetyBriefing": {
    "campfirePermit": "Required / Not required / Check current restrictions — be specific about California dispersed camping rules",
    "campfirePermitUrl": "https://www.preventwildfireca.org/campfire-permit/",
    "bearCanister": "Required / Recommended / Not required",
    "bearCanisterNotes": "Specific info — bear box availability, wilderness area rules, or Sierra quota areas",
    "additionalPermits": ["Any wilderness permits, day-use quotas, OHV permits, or special entry requirements — empty array if none"],
    "emergencyInfo": "Nearest hospital or urgent care, cell coverage notes, and whether a satellite communicator is strongly advised"
  }
}`;

app.post('/api/plan', async (req, res) => {
  const { constraints, changeRequest, originalTrip } = req.body;

  if (!constraints) {
    return res.status(400).json({ error: 'Missing trip constraints' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured. Add it to your .env file.' });
  }

  try {
    const userPrompt = (changeRequest && originalTrip)
      ? buildReplanPrompt(constraints, originalTrip, changeRequest)
      : buildUserPrompt(constraints);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Anthropic API error ${response.status}: ${errBody}`);
    }

    const json = await response.json();
    const rawText = json.content[0].text.trim();

    let trip;
    try {
      trip = JSON.parse(rawText);
    } catch (parseErr) {
      // Try to extract JSON if there's extra text
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        trip = JSON.parse(match[0]);
      } else {
        throw new Error('Could not parse trip JSON from response');
      }
    }

    res.json({ trip });
  } catch (err) {
    console.error('Error generating trip:', err.message);
    res.status(500).json({ error: err.message || 'Failed to generate trip' });
  }
});

// Weather endpoint — uses Open-Meteo (free, no API key)
app.get('/api/weather', async (req, res) => {
  const { lat, lon, dates } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });

  const { startDate, endDate } = parseTripDates(dates);

  // Always fetch 7 days starting from the trip start date
  const sevenDayEnd = new Date(startDate);
  sevenDayEnd.setDate(sevenDayEnd.getDate() + 6);
  const pad = n => String(n).padStart(2, '0');
  const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const windowEnd = fmt(sevenDayEnd);

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max,weathercode` +
    `&temperature_unit=fahrenheit&windspeed_unit=mph&timezone=auto` +
    `&start_date=${startDate}&end_date=${windowEnd}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Open-Meteo error');
    const data = await response.json();
    // Return trip date range so frontend can highlight the right days
    res.json({ weather: data.daily, timezone: data.timezone, tripStart: startDate, tripEnd: endDate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function parseTripDates(dateStr) {
  const today = new Date();
  const pad = n => String(n).padStart(2, '0');
  const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  if (!dateStr) {
    // Default: next 3 days
    const end = new Date(today);
    end.setDate(today.getDate() + 2);
    return { startDate: fmt(today), endDate: fmt(end) };
  }

  const s = dateStr.toLowerCase().trim();

  // "this weekend"
  if (s.includes('this weekend') || s === 'weekend') {
    const day = today.getDay(); // 0=Sun, 6=Sat
    const daysToSat = day === 6 ? 0 : (6 - day);
    const sat = new Date(today); sat.setDate(today.getDate() + daysToSat);
    const sun = new Date(sat); sun.setDate(sat.getDate() + 1);
    return { startDate: fmt(sat), endDate: fmt(sun) };
  }

  // "next weekend"
  if (s.includes('next weekend')) {
    const day = today.getDay();
    const daysToSat = (6 - day + 7) % 7 + 7;
    const sat = new Date(today); sat.setDate(today.getDate() + daysToSat);
    const sun = new Date(sat); sun.setDate(sat.getDate() + 1);
    return { startDate: fmt(sat), endDate: fmt(sun) };
  }

  // Try to find dates like "Aug 15-17", "August 15-17", "Aug 15", "8/15-8/17"
  const monthNames = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
  const monthMatch = s.match(/([a-z]+)\s+(\d{1,2})(?:\s*[-–]\s*(\d{1,2}))?/);
  if (monthMatch) {
    const monthIdx = monthNames.findIndex(m => monthMatch[1].startsWith(m));
    if (monthIdx >= 0) {
      const year = today.getFullYear();
      const startDay = parseInt(monthMatch[2]);
      const endDay = monthMatch[3] ? parseInt(monthMatch[3]) : startDay + 2;
      const start = new Date(year, monthIdx, startDay);
      const end = new Date(year, monthIdx, endDay);
      if (start < today) { start.setFullYear(year + 1); end.setFullYear(year + 1); }
      return { startDate: fmt(start), endDate: fmt(end) };
    }
  }

  // Fallback: next 3 days
  const end = new Date(today); end.setDate(today.getDate() + 2);
  return { startDate: fmt(today), endDate: fmt(end) };
}

// Haversine distance between two lat/lon points — returns miles
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const toRad = deg => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// NWS weather alerts — free, no API key, US only
app.get('/api/weather-alerts', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ alerts: [] });

  try {
    const url = `https://api.weather.gov/alerts/active?point=${lat},${lon}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'BaseCamp/1.0 (overlanding trip planner)',
        'Accept': 'application/geo+json',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return res.json({ alerts: [] });

    const data = await response.json();
    const alerts = (data.features || [])
      .map(f => ({
        event: f.properties.event,
        headline: f.properties.headline,
        severity: f.properties.severity,   // Extreme | Severe | Moderate | Minor
        urgency: f.properties.urgency,
        expires: f.properties.expires,
        area: f.properties.areaDesc,
      }))
      .filter(a => a.event)
      .slice(0, 6);

    res.json({ alerts });
  } catch (err) {
    console.log(`[Weather alerts] Error: ${err.message}`);
    res.json({ alerts: [] });
  }
});

// Active fire check — uses NIFC (National Interagency Fire Center) ArcGIS layer
app.get('/api/fire-check', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });

  try {
    const params = new URLSearchParams({
      where: '1=1',
      outFields: 'IncidentName,GISAcres,PercentContained,POOState',
      returnGeometry: 'false',
      returnCentroid: 'true',
      outSR: '4326',
      f: 'json',
    });
    const url = `https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/Active_Fires/FeatureServer/0/query?${params}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'BaseCamp/1.0' },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return res.json({ fires: [] });

    const data = await response.json();
    const userLat = parseFloat(lat);
    const userLon = parseFloat(lon);

    const fires = (data.features || [])
      .filter(f => f.centroid && f.attributes?.IncidentName)
      .map(f => ({
        name: f.attributes.IncidentName,
        acres: Math.round(f.attributes.GISAcres || 0),
        contained: f.attributes.PercentContained ?? null,
        state: f.attributes.POOState || '',
        miles: haversineDistance(userLat, userLon, f.centroid.y, f.centroid.x),
      }))
      .filter(f => f.miles <= 100)
      .sort((a, b) => a.miles - b.miles)
      .slice(0, 5);

    res.json({ fires });
  } catch {
    res.json({ fires: [] }); // non-critical — fail silently
  }
});

// Geocoding via Nominatim (OpenStreetMap) — free, no API key
app.get('/api/geocode', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'q required' });

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=3&countrycodes=us`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'BaseCamp/1.0 (trip planner)' },
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) return res.json({ results: [] });

    const data = await response.json();
    res.json({
      results: data.map(r => ({
        name: r.display_name,
        lat: parseFloat(r.lat),
        lon: parseFloat(r.lon),
        type: r.type,
      })),
    });
  } catch {
    res.json({ results: [] });
  }
});

// Tile proxy for USFS Motor Vehicle Use Map (MVUM) — shows which roads allow which vehicles
// Uses EDW_MVUM_02 (includes road labels). Only renders at zoom 10+.
app.get('/api/tiles/mvum/:z/:y/:x', async (req, res) => {
  const { z, y, x } = req.params;
  const url = `https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_MVUM_02/MapServer/tile/${z}/${y}/${x}`;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Referer': 'https://apps.fs.usda.gov/',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      res.set('Content-Type', response.headers.get('content-type') || 'image/png');
      res.set('Cache-Control', 'public, max-age=86400');
      return res.send(Buffer.from(buffer));
    }
    console.log(`[MVUM tiles] ${response.status} for z=${z} y=${y} x=${x}`);
    res.status(response.status).end();
  } catch (err) {
    console.log(`[MVUM tiles] Error: ${err.message}`);
    res.status(503).end();
  }
});

// Tile proxy for BLM/federal lands overlay — tries BLM first, falls back to ArcGIS Living Atlas
app.get('/api/tiles/federal-lands/:z/:y/:x', async (req, res) => {
  const { z, y, x } = req.params;

  const primaryUrl = `https://gis.blm.gov/arcgis/rest/services/lands/BLM_National_Surface_Management_Agency/MapServer/tile/${z}/${y}/${x}`;

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://gis.blm.gov/',
  };

  try {
    const response = await fetch(primaryUrl, {
      headers,
      signal: AbortSignal.timeout(8000),
    });
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      res.set('Content-Type', response.headers.get('content-type') || 'image/png');
      res.set('Cache-Control', 'public, max-age=86400');
      return res.send(Buffer.from(buffer));
    }
    console.log(`[BLM tiles] Primary returned ${response.status} for z=${z} y=${y} x=${x} — tile may be ocean/out-of-bounds`);
    res.status(response.status).end();
  } catch (err) {
    console.log(`[BLM tiles] Error: ${err.message}`);
    res.status(503).end();
  }
});

// OSM camping spots via Overpass API
app.get('/api/camping-spots', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ spots: [] });

  // Query for camp_sites and caravan_sites within 25km
  const query = `[out:json][timeout:25];
(
  node["tourism"="camp_site"](around:25000,${lat},${lon});
  way["tourism"="camp_site"](around:25000,${lat},${lon});
  node["tourism"="caravan_site"](around:25000,${lat},${lon});
);
out center;`;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'BaseCamp/1.0' },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) return res.json({ spots: [] });

    const data = await response.json();
    const spots = (data.elements || [])
      .filter(el => el.lat != null || el.center?.lat != null)
      .map(el => ({
        id: el.id,
        lat: el.lat ?? el.center.lat,
        lon: el.lon ?? el.center.lon,
        name: el.tags?.name || null,
        access: el.tags?.access || null,
        fee: el.tags?.fee || null,
        operator: el.tags?.operator || null,
        capacity: el.tags?.capacity || null,
        type: el.tags?.tourism || 'camp_site',
      }))
      .slice(0, 60);

    res.json({ spots });
  } catch (err) {
    console.log(`[Camping spots] Error: ${err.message}`);
    res.json({ spots: [] });
  }
});

function buildUserPrompt(c) {
  const lines = [];

  lines.push(`Plan a trip for me. Here's my situation:`);
  lines.push('');
  lines.push(`STARTING POINT: ${c.startingLocation || 'Berkeley, CA'}`);

  if (c.tripDates) lines.push(`WHEN: ${c.tripDates}`);
  if (c.tripLength) lines.push(`LENGTH: ${c.tripLength}`);

  lines.push('');
  lines.push(`MY RIG: ${c.rigType || 'Not specified'}`);
  if (c.campingStyle) lines.push(`CAMPING STYLE: ${c.campingStyle}`);
  if (c.roadExperience) lines.push(`ROAD EXPERIENCE: ${c.roadExperience}`);

  if (c.hasDogs && c.dogs && c.dogs.length > 0) {
    lines.push('');
    lines.push('MY DOGS:');
    c.dogs.forEach(dog => {
      const parts = [];
      if (dog.name) parts.push(dog.name);
      if (dog.breed) parts.push(dog.breed);
      if (dog.size) parts.push(`(${dog.size})`);
      lines.push(`- ${parts.join(', ') || 'Dog'}`);
    });
  }

  if (c.activities && c.activities.length > 0) {
    lines.push('');
    lines.push(`ACTIVITIES I WANT: ${c.activities.join(', ')}`);
  }

  if (c.driveDistance) {
    lines.push(`MAX DRIVE FROM HOME: ${c.driveDistance}`);
  }

  if (c.weatherPrefs) {
    const wp = c.weatherPrefs;
    const parts = [];
    if (wp.maxRainChance !== null && wp.maxRainChance !== undefined) {
      parts.push(`avoid destinations where trip days likely see >${wp.maxRainChance}% rain chance`);
    }
    if (wp.minTempF) parts.push(`lows should stay above ${wp.minTempF}°F`);
    if (wp.maxTempF) parts.push(`highs should stay below ${wp.maxTempF}°F`);
    if (wp.avoidWind) parts.push(`avoid areas with typical high winds (25+ mph)`);
    if (parts.length > 0) {
      lines.push('');
      lines.push(`WEATHER PREFERENCES: ${parts.join('; ')}`);
    }
  }

  if (c.vibe) {
    lines.push('');
    lines.push(`VIBE / NOTES: ${c.vibe}`);
  }

  lines.push('');
  lines.push('Give me a trip that actually works for all of this. Be specific. I know this area and will notice if you\'re being vague.');

  return lines.join('\n');
}

function buildReplanPrompt(constraints, originalTrip, changeRequest) {
  const lines = [];

  lines.push(`I previously planned this camping trip and now want to tweak it. Here's the original:`);
  lines.push('');
  lines.push(`PREVIOUS DESTINATION: ${originalTrip.destination}`);
  if (originalTrip.campsite?.name) lines.push(`PREVIOUS CAMPSITE: ${originalTrip.campsite.name}`);
  if (originalTrip.region) lines.push(`REGION: ${originalTrip.region}`);
  if (originalTrip.tagline) lines.push(`VIBE: ${originalTrip.tagline}`);
  lines.push('');
  lines.push(`MY SETUP (unchanged):`);
  lines.push(`STARTING POINT: ${constraints.startingLocation || 'Berkeley, CA'}`);
  if (constraints.tripDates) lines.push(`WHEN: ${constraints.tripDates}`);
  if (constraints.tripLength) lines.push(`LENGTH: ${constraints.tripLength}`);
  lines.push(`MY RIG: ${constraints.rigType || 'Not specified'}`);
  if (constraints.campingStyle) lines.push(`CAMPING STYLE: ${constraints.campingStyle}`);
  if (constraints.roadExperience) lines.push(`ROAD EXPERIENCE: ${constraints.roadExperience}`);

  if (constraints.hasDogs && constraints.dogs?.length > 0) {
    lines.push('MY DOGS:');
    constraints.dogs.forEach(dog => {
      const parts = [];
      if (dog.name) parts.push(dog.name);
      if (dog.breed) parts.push(dog.breed);
      if (dog.size) parts.push(`(${dog.size})`);
      lines.push(`- ${parts.join(', ') || 'Dog'}`);
    });
  }

  if (constraints.activities?.length > 0) lines.push(`ACTIVITIES: ${constraints.activities.join(', ')}`);
  if (constraints.driveDistance) lines.push(`MAX DRIVE: ${constraints.driveDistance}`);
  if (constraints.vibe) lines.push(`ORIGINAL VIBE: ${constraints.vibe}`);

  lines.push('');
  lines.push(`WHAT I WANT TO CHANGE: ${changeRequest}`);
  lines.push('');
  lines.push(`Keep everything that isn't changing — same dates, same rig, same dogs. Address my change request specifically. Don't just return the same destination unless it genuinely still makes sense. Be specific as always.`);

  return lines.join('\n');
}

// Serve built client in production
app.use(express.static(path.join(__dirname, 'client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🏕️  Base Camp server running on http://localhost:${PORT}`);
  console.log(`   API key: ${process.env.ANTHROPIC_API_KEY ? '✓ configured' : '✗ MISSING — add to .env'}\n`);
});

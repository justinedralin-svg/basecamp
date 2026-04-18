import { useEffect, useRef, useState } from 'react';

function xmlEscape(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function downloadGPX({ lat, lon, name }) {
  const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Camp With My Dog" xmlns="http://www.topografix.com/GPX/1/1">
  <wpt lat="${lat}" lon="${lon}">
    <name>${xmlEscape(name)}</name>
    <sym>Campground</sym>
  </wpt>
</gpx>`;
  const blob = new Blob([gpx], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.gpx`;
  a.click();
  URL.revokeObjectURL(url);
}

function parseCoords(coordStr) {
  if (!coordStr) return null;
  const parts = coordStr.split(/[,\s]+/).map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
  if (parts.length >= 2) {
    const [lat, lon] = parts;
    if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) return { lat, lon };
  }
  return null;
}

const BASE_TILES = {
  topo: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© <a href="https://opentopomap.org">OpenTopoMap</a>',
    maxZoom: 17,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© <a href="https://www.esri.com/">Esri</a> World Imagery',
    maxZoom: 19,
  },
};



export default function MapPin({ coordinates, destination, campsiteName }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const baseLayerRef = useRef(null);

  const [basemap, setBasemap] = useState('topo');
  const [showRoads, setShowRoads] = useState(true);
  const mvumLayerRef = useRef(null);

  const [resolvedCoords, setResolvedCoords] = useState(null);
  const [coordSource, setCoordSource] = useState(null);
  const [geocoding, setGeocoding] = useState(false);

  const [copied, setCopied] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const [landInfo, setLandInfo] = useState(null);   // { found, manager, unitName, dispersed }
  const [landLoading, setLandLoading] = useState(false);

  // Resolve coordinates from AI or geocode fallback
  useEffect(() => {
    const parsed = parseCoords(coordinates);
    if (parsed) {
      setResolvedCoords(parsed);
      setCoordSource('ai');
    } else {
      const query = campsiteName || destination;
      if (query) {
        setGeocoding(true);
        fetch(`/api/geocode?q=${encodeURIComponent(query)}`)
          .then(r => r.json())
          .then(data => {
            if (data.results?.[0]) {
              setResolvedCoords({ lat: data.results[0].lat, lon: data.results[0].lon });
              setCoordSource('geocoded');
            }
          })
          .catch(() => {})
          .finally(() => setGeocoding(false));
      }
    }
  }, [coordinates, campsiteName, destination]);

  // Look up what land the pin is on once coords resolve
  useEffect(() => {
    if (!resolvedCoords) return;
    setLandLoading(true);
    fetch(`/api/land-check?lat=${resolvedCoords.lat}&lon=${resolvedCoords.lon}`)
      .then(r => r.json())
      .then(data => setLandInfo(data))
      .catch(() => setLandInfo({ found: false }))
      .finally(() => setLandLoading(false));
  }, [resolvedCoords]);

  // Build/rebuild map when coordinates resolve
  useEffect(() => {
    if (!resolvedCoords || !window.L || !containerRef.current) return;
    const { lat, lon } = resolvedCoords;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      baseLayerRef.current = null;
    }

    const map = window.L.map(containerRef.current, {
      center: [lat, lon], zoom: 11,
      zoomControl: true, scrollWheelZoom: false, attributionControl: true,
    });

    const bt = BASE_TILES[basemap];
    baseLayerRef.current = window.L.tileLayer(bt.url, { maxZoom: bt.maxZoom, attribution: bt.attribution }).addTo(map);

    // USFS Motor Vehicle Use Map — forest road numbers (FR 9N18, etc.)
    const mvum = window.L.tileLayer('/api/tiles/mvum/{z}/{y}/{x}', {
      maxZoom: 16, opacity: 0.85, minZoom: 9,
    });
    if (showRoads && basemap === 'topo') mvum.addTo(map);
    mvumLayerRef.current = mvum;

    const icon = window.L.divIcon({
      className: '',
      html: `<div style="
        width:28px;height:28px;background:#5c7a3e;
        border:3px solid #2c2416;border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.5);
      "></div>`,
      iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -30],
    });

    window.L.marker([lat, lon], { icon })
      .addTo(map)
      .bindPopup(`<strong>${destination || campsiteName || 'Camp'}</strong>`, { offset: [0, -10] })
      .openPopup();

    mapRef.current = map;
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        baseLayerRef.current = null;
        mvumLayerRef.current = null;
      }
    };
  }, [resolvedCoords]);

  // Swap base layer when topo/satellite changes (without rebuilding map)
  useEffect(() => {
    if (!mapRef.current || !baseLayerRef.current || !window.L) return;
    const bt = BASE_TILES[basemap];
    baseLayerRef.current.remove();
    const newBase = window.L.tileLayer(bt.url, { maxZoom: bt.maxZoom, attribution: bt.attribution }).addTo(mapRef.current);
    newBase.bringToBack();
    baseLayerRef.current = newBase;
  }, [basemap]);

  // Toggle MVUM road overlay — only meaningful on topo
  useEffect(() => {
    if (!mapRef.current || !mvumLayerRef.current) return;
    if (showRoads && basemap === 'topo') {
      mvumLayerRef.current.addTo(mapRef.current);
    } else {
      mvumLayerRef.current.remove();
    }
  }, [showRoads, basemap]);


  async function copyCoords() {
    if (!resolvedCoords) return;
    const text = `${resolvedCoords.lat.toFixed(6)}, ${resolvedCoords.lon.toFixed(6)}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { window.prompt('Copy coordinates:', text); }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchError(null);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      if (data.results?.[0]) {
        setResolvedCoords({ lat: data.results[0].lat, lon: data.results[0].lon });
        setCoordSource('searched');
        setShowSearch(false);
        setSearchQuery('');
      } else {
        setSearchError('No results — try adding the state, e.g. "Twin Lakes, CA"');
      }
    } catch { setSearchError('Search failed — try again'); }
    setSearchLoading(false);
  }

  // No coordinates found — show a friendly empty state with inline search
  if (!geocoding && !resolvedCoords) {
    return (
      <div style={{ borderRadius: 8, border: '1px solid #d8cfa8', marginBottom: 14, overflow: 'hidden' }}>
        <div style={{
          height: 160,
          background: 'linear-gradient(160deg, #e8e0ca 0%, #d4c9aa 100%)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 10, padding: '0 24px', textAlign: 'center',
        }}>
          <span style={{ fontSize: 36 }}>🗺️</span>
          <p style={{ color: '#6b5c42', fontSize: 14, margin: 0, lineHeight: 1.5 }}>
            Couldn't pin the exact location.<br />
            Search below to place it on the map.
          </p>
        </div>
        <div style={{ padding: '12px', background: '#f0ebe0', borderTop: '1px solid #d8cfa8' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder={`e.g. "${campsiteName || destination || 'campsite name, CA'}"`}
              style={{ flex: 1, padding: '9px 12px', fontSize: 14, borderRadius: 6, border: '1px solid #c8bc96', background: '#faf7f0', color: '#2c2416', outline: 'none' }}
            />
            <button
              onClick={handleSearch}
              disabled={searchLoading || !searchQuery.trim()}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: 14, opacity: searchLoading || !searchQuery.trim() ? 0.6 : 1 }}
            >
              {searchLoading ? '…' : 'Find'}
            </button>
          </div>
          {searchError && (
            <div style={{ color: '#b91c1c', fontSize: 12, marginTop: 6 }}>{searchError}</div>
          )}
        </div>
      </div>
    );
  }

  // Build verify link based on land manager
  function verifyUrl() {
    if (!landInfo?.found) return null;
    const q = encodeURIComponent(`${landInfo.unitName || landInfo.manager} dispersed camping rules`);
    return `https://www.google.com/search?q=${q}`;
  }

  return (
    <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #d8cfa8', marginBottom: 14 }}>

      {/* Land confidence banner — shown before map so it's the first thing seen */}
      {landLoading && (
        <div style={{ padding: '10px 14px', background: '#f8f4ec', borderBottom: '1px solid #d8cfa8', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
          <span style={{ color: '#9c8b6e', fontSize: 12 }}>Checking land ownership…</span>
        </div>
      )}
      {!landLoading && landInfo && (
        <div style={{
          padding: '10px 14px',
          background: landInfo.found && landInfo.dispersed === 'ok'
            ? 'rgba(45,106,45,0.09)'
            : landInfo.found && landInfo.dispersed === 'no'
            ? 'rgba(180,90,40,0.09)'
            : 'rgba(155,130,60,0.08)',
          borderBottom: '1px solid',
          borderColor: landInfo.found && landInfo.dispersed === 'ok'
            ? 'rgba(45,106,45,0.2)'
            : landInfo.found && landInfo.dispersed === 'no'
            ? 'rgba(180,90,40,0.2)'
            : '#d8cfa8',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>
              {!landInfo.found ? '❓'
                : landInfo.dispersed === 'ok' ? '✅'
                : landInfo.dispersed === 'no' ? '⛔'
                : '⚠️'}
            </span>
            <div>
              <div style={{
                fontSize: 13, fontWeight: 700, lineHeight: 1.3,
                color: landInfo.found && landInfo.dispersed === 'ok' ? '#1a5c1a'
                  : landInfo.found && landInfo.dispersed === 'no' ? '#9a3a10'
                  : '#6b5c42',
              }}>
                {!landInfo.found && 'Land type unknown'}
                {landInfo.found && landInfo.dispersed === 'ok' && `Free dispersed camping — ${landInfo.unitName || landInfo.manager}`}
                {landInfo.found && landInfo.dispersed === 'no' && `No dispersed camping — ${landInfo.unitName || landInfo.manager}`}
                {landInfo.found && landInfo.dispersed === 'unknown' && `${landInfo.unitName || landInfo.manager} — verify camping rules`}
              </div>
              <div style={{ fontSize: 11, color: '#9c8b6e', marginTop: 1 }}>
                {!landInfo.found && 'Couldn\'t confirm land ownership — verify before dispersed camping'}
                {landInfo.found && landInfo.dispersed === 'ok' && 'USFS/BLM public land · No permit needed for dispersed sites'}
                {landInfo.found && landInfo.dispersed === 'no' && 'Must use designated campsites only · Fees may apply'}
                {landInfo.found && landInfo.dispersed === 'unknown' && 'Land manager confirmed but dispersed rules unclear'}
              </div>
            </div>
          </div>
          {verifyUrl() && (
            <a href={verifyUrl()} target="_blank" rel="noopener noreferrer" style={{
              fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
              color: '#9c8b6e', textDecoration: 'none',
              border: '1px solid #d8cfa8', borderRadius: 5, padding: '3px 8px',
              background: 'rgba(255,255,255,0.5)',
            }}>Verify →</a>
          )}
        </div>
      )}

      {/* Map */}
      {geocoding ? (
        <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e8e0ca' }}>
          <span style={{ color: '#9c8b6e', fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
            Locating {campsiteName || destination}...
          </span>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <div ref={containerRef} style={{ height: 260, width: '100%' }} />
        </div>
      )}


      {/* Controls bar — single row */}
      <div style={{
        borderTop: '1px solid #d8cfa8', background: '#f0ebe0',
        padding: '7px 12px',
        display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
      }}>
        {/* Topo / Satellite toggle */}
        <div style={{ display: 'flex', border: '1px solid #c8bc96', borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
          {['topo', 'satellite'].map(mode => (
            <button key={mode} onClick={() => setBasemap(mode)} style={{
              background: basemap === mode ? '#5c7a3e' : 'transparent',
              border: 'none',
              color: basemap === mode ? '#faf7f0' : '#9c8b6e',
              fontSize: 11, fontWeight: 600,
              padding: '4px 9px', cursor: 'pointer',
              transition: 'all 0.15s',
            }}>
              {mode === 'topo' ? '🗺 Topo' : '🛰 Satellite'}
            </button>
          ))}
        </div>

        {/* Forest Roads overlay toggle — only useful on topo */}
        {basemap === 'topo' && (
          <button
            onClick={() => setShowRoads(v => !v)}
            style={{
              background: showRoads ? 'rgba(92,122,62,0.12)' : 'transparent',
              border: `1px solid ${showRoads ? 'rgba(92,122,62,0.4)' : '#c8bc96'}`,
              borderRadius: 6, color: showRoads ? '#3d5c28' : '#9c8b6e',
              fontSize: 11, fontWeight: 600,
              padding: '4px 9px', cursor: 'pointer', flexShrink: 0,
              transition: 'all 0.15s',
            }}
          >
            🛣 Roads
          </button>
        )}

        {resolvedCoords && (
          <>
            <div style={{ width: 1, height: 14, background: '#d8cfa8', flexShrink: 0 }} />
            <span style={{ color: '#9c8b6e', fontFamily: 'monospace', fontSize: 11, flexShrink: 0 }}>
              {resolvedCoords.lat.toFixed(5)}, {resolvedCoords.lon.toFixed(5)}
            </span>
            <button onClick={copyCoords} style={{
              background: copied ? 'rgba(74,222,128,0.12)' : 'none',
              border: `1px solid ${copied ? 'rgba(45,106,45,0.3)' : '#c8bc96'}`,
              borderRadius: 5, color: copied ? '#2d6a2d' : '#9c8b6e',
              fontSize: 11, padding: '3px 8px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              {copied ? '✓' : 'Copy'}
            </button>
            <a
              href={
                /iPhone|iPad|iPod/i.test(navigator.userAgent)
                  ? `https://maps.apple.com/?daddr=${resolvedCoords.lat},${resolvedCoords.lon}&dirflg=d`
                  : `https://www.google.com/maps/dir/?api=1&destination=${resolvedCoords.lat},${resolvedCoords.lon}`
              }
              target="_blank" rel="noopener noreferrer"
              style={{
                background: 'rgba(92,122,62,0.1)', border: '1px solid rgba(92,122,62,0.35)',
                borderRadius: 5, color: '#5c7a3e', fontWeight: 600,
                fontSize: 11, padding: '3px 8px', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              📍 Directions
            </a>
            <button
              onClick={() => {
                const name = encodeURIComponent(campsiteName || destination || 'Camp');
                const { lat, lon } = resolvedCoords;
                const appUrl = window.location.origin;
                // Hosted GPX URL — Gaia GPS app can import directly from this
                const gpxUrl = encodeURIComponent(`${appUrl}/api/gpx?lat=${lat}&lon=${lon}&name=${name}`);
                // Deep link: opens Gaia GPS app and imports the pin. Falls back to web map.
                const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
                const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
                if (isMobile) {
                  // Try Gaia GPS app deep link first — imports GPX and shows pin
                  window.location.href = `gaiagps://open?fileUrl=${gpxUrl}`;
                  // Fallback to web after short delay if app not installed
                  setTimeout(() => {
                    window.open(`https://www.gaiagps.com/map/?lat=${lat}&lon=${lon}&zoom=13`, '_blank');
                  }, 1500);
                } else {
                  // Desktop: open web map + download GPX for manual import
                  window.open(`https://www.gaiagps.com/map/?lat=${lat}&lon=${lon}&zoom=13`, '_blank');
                  downloadGPX({ lat, lon, name: decodeURIComponent(name) });
                }
              }}
              style={{
                background: 'none', border: '1px solid #c8bc96',
                borderRadius: 5, color: '#9c8b6e',
                fontSize: 11, padding: '3px 8px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              Gaia GPS
            </button>
            <button onClick={() => { setShowSearch(v => !v); setSearchError(null); }} style={{
              background: 'none', border: '1px solid #c8bc96',
              borderRadius: 5, color: '#9c8b6e',
              fontSize: 11, padding: '3px 8px', cursor: 'pointer', flexShrink: 0,
            }}>
              {showSearch ? '✕' : '🔍'}
            </button>
          </>
        )}
      </div>


      {/* Refine search */}
      {showSearch && (
        <div style={{ borderTop: '1px solid #1e3020', padding: '10px 12px', background: '#f0ebe0' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: searchError ? 8 : 0 }}>
            <input
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder={`e.g. "${campsiteName || 'Twin Lakes Campground, CA'}"`}
              style={{ flex: 1, padding: '8px 10px', fontSize: 13 }}
            />
            <button
              onClick={handleSearch}
              disabled={searchLoading || !searchQuery.trim()}
              className="btn-primary"
              style={{ padding: '7px 14px', fontSize: 13, opacity: searchLoading ? 0.7 : 1, whiteSpace: 'nowrap' }}
            >
              {searchLoading ? '...' : 'Search'}
            </button>
          </div>
          {searchError && <div style={{ color: '#b91c1c', fontSize: 12 }}>{searchError}</div>}
        </div>
      )}
    </div>
  );
}

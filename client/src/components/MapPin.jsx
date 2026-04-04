import { useEffect, useRef, useState } from 'react';

function xmlEscape(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function downloadGPX({ lat, lon, name }) {
  const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Base Camp" xmlns="http://www.topografix.com/GPX/1/1">
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

const BLM_LEGEND = [
  { color: '#F5C842', icon: '✓', label: 'BLM', sub: 'Free dispersed camping' },
  { color: '#7BBF72', icon: '✓', label: 'National Forest', sub: 'Free dispersed camping' },
  { color: '#B09FD4', icon: '✕', label: 'National Park', sub: 'No dispersed camping' },
  { color: '#7AC8C8', icon: '–', label: 'Fish & Wildlife', sub: 'Restricted, check rules' },
  { color: '#E8A06A', icon: '–', label: 'Tribal land', sub: 'Check access' },
];

const MVUM_LEGEND = [
  { color: '#1a6cb5', lineStyle: 'solid', icon: '✓', label: 'All vehicles', sub: 'Passenger cars & trucks' },
  { color: '#7B4F2E', lineStyle: 'solid', icon: '◐', label: 'High clearance', sub: 'Check for your rig' },
  { color: '#E07B00', lineStyle: 'dashed', icon: '✕', label: 'OHV / ATV only', sub: 'Requires OHV permit' },
  { color: '#999999', lineStyle: 'dotted', icon: '✕', label: 'Closed', sub: 'No motor vehicles' },
];

function OverlayToggle({ label, active, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? `${color}18` : 'transparent',
        border: `1px solid ${active ? color : '#c8bc96'}`,
        borderRadius: 6,
        color: active ? color : '#9c8b6e',
        fontSize: 11, fontWeight: 600, padding: '4px 10px',
        cursor: 'pointer', whiteSpace: 'nowrap',
        display: 'flex', alignItems: 'center', gap: 5,
        transition: 'all 0.15s',
      }}
    >
      <span style={{
        width: 8, height: 8, borderRadius: 2,
        background: active ? color : '#c8bc96',
        flexShrink: 0, display: 'inline-block',
      }} />
      {label}
    </button>
  );
}

export default function MapPin({ coordinates, destination, campsiteName }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const baseLayerRef = useRef(null);
  const blmRef = useRef(null);
  const mvumRef = useRef(null);

  const [basemap, setBasemap] = useState('satellite');
  const [blmOn, setBlmOn] = useState(true);
  const [mvumOn, setMvumOn] = useState(false);

  const [resolvedCoords, setResolvedCoords] = useState(null);
  const [coordSource, setCoordSource] = useState(null);
  const [geocoding, setGeocoding] = useState(false);

  const [copied, setCopied] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

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

  // Build/rebuild map when coordinates resolve
  useEffect(() => {
    if (!resolvedCoords || !window.L || !containerRef.current) return;
    const { lat, lon } = resolvedCoords;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      baseLayerRef.current = null;
      blmRef.current = null;
      mvumRef.current = null;
    }

    const map = window.L.map(containerRef.current, {
      center: [lat, lon], zoom: 11,
      zoomControl: true, scrollWheelZoom: false, attributionControl: true,
    });

    const bt = BASE_TILES[basemap];
    baseLayerRef.current = window.L.tileLayer(bt.url, { maxZoom: bt.maxZoom, attribution: bt.attribution }).addTo(map);

    const blm = window.L.tileLayer('/api/tiles/federal-lands/{z}/{y}/{x}', {
      opacity: blmOn ? 0.45 : 0, maxZoom: 15,
      errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    }).addTo(map);
    blmRef.current = blm;

    const mvum = window.L.tileLayer('/api/tiles/mvum/{z}/{y}/{x}', {
      opacity: mvumOn ? 0.85 : 0, maxZoom: 17,
    }).addTo(map);
    mvumRef.current = mvum;

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
        blmRef.current = null;
        mvumRef.current = null;
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

  // Toggle opacity on BLM/MVUM layers
  useEffect(() => { if (blmRef.current) blmRef.current.setOpacity(blmOn ? 0.45 : 0); }, [blmOn]);
  useEffect(() => { if (mvumRef.current) mvumRef.current.setOpacity(mvumOn ? 0.85 : 0); }, [mvumOn]);

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

  if (!geocoding && !resolvedCoords) return null;

  return (
    <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #d8cfa8', marginBottom: 14 }}>

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

          {/* Map app links */}
          {resolvedCoords && (
            <div style={{ position: 'absolute', bottom: 8, left: 8, zIndex: 1000, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {/* Google Maps */}
              <a
                href={`https://www.google.com/maps?q=${resolvedCoords.lat},${resolvedCoords.lon}&ll=${resolvedCoords.lat},${resolvedCoords.lon}&z=13`}
                target="_blank" rel="noopener noreferrer"
                title="Open in Google Maps — save area offline before your trip"
                style={{
                  background: 'rgba(244,237,224,0.95)', border: '1px solid #c8bc96',
                  borderRadius: 6, color: '#6b5c42', fontSize: 11, fontWeight: 600,
                  padding: '4px 8px', textDecoration: 'none', backdropFilter: 'blur(4px)',
                  display: 'flex', alignItems: 'center', gap: 3,
                }}
              >
                <span style={{ fontSize: 12 }}>🗺</span> Google Maps
              </a>

              {/* Apple Maps */}
              <a
                href={`https://maps.apple.com/?q=${encodeURIComponent(campsiteName || destination || 'Camp')}&ll=${resolvedCoords.lat},${resolvedCoords.lon}&z=13`}
                target="_blank" rel="noopener noreferrer"
                title="Open in Apple Maps — save map for offline use"
                style={{
                  background: 'rgba(244,237,224,0.95)', border: '1px solid #c8bc96',
                  borderRadius: 6, color: '#6b5c42', fontSize: 11, fontWeight: 600,
                  padding: '4px 8px', textDecoration: 'none', backdropFilter: 'blur(4px)',
                  display: 'flex', alignItems: 'center', gap: 3,
                }}
              >
                <span style={{ fontSize: 12 }}>🍎</span> Apple Maps
              </a>

              {/* Gaia GPS — downloads GPX then opens Gaia */}
              <button
                onClick={() => {
                  const name = campsiteName || destination || 'Camp';
                  downloadGPX({ lat: resolvedCoords.lat, lon: resolvedCoords.lon, name });
                  window.open(
                    `https://www.gaiagps.com/map/?lat=${resolvedCoords.lat}&lon=${resolvedCoords.lon}&zoom=13`,
                    '_blank'
                  );
                }}
                title="Downloads waypoint GPX and opens Gaia GPS"
                style={{
                  background: 'rgba(244,237,224,0.95)', border: '1px solid #c8bc96',
                  borderRadius: 6, color: '#6b5c42', fontSize: 11, fontWeight: 600,
                  padding: '4px 8px', cursor: 'pointer', backdropFilter: 'blur(4px)',
                  display: 'flex', alignItems: 'center', gap: 3,
                }}
              >
                <span style={{ fontSize: 12 }}>📍</span> Gaia GPS
              </button>
            </div>
          )}
        </div>
      )}

      {/* Controls bar */}
      <div style={{
        borderTop: '1px solid #d8cfa8', background: '#f0ebe0',
        padding: '8px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 8, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Topo / Satellite pill */}
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
          <div style={{ width: 1, height: 16, background: '#d8cfa8', flexShrink: 0 }} />
          <OverlayToggle label="Public lands" active={blmOn} color="#f59e0b" onClick={() => setBlmOn(v => !v)} />
          <OverlayToggle label="MVUM roads" active={mvumOn} color="#60a5fa" onClick={() => setMvumOn(v => !v)} />
        </div>

        {/* Coords + actions */}
        {resolvedCoords && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
            <span style={{ color: '#9c8b6e', fontFamily: 'monospace', fontSize: 11 }}>
              {resolvedCoords.lat.toFixed(5)}, {resolvedCoords.lon.toFixed(5)}
              {coordSource !== 'ai' && <span style={{ marginLeft: 4 }}>· {coordSource}</span>}
            </span>
            <button onClick={copyCoords} style={{
              background: copied ? 'rgba(74,222,128,0.12)' : 'none',
              border: `1px solid ${copied ? 'rgba(45,106,45,0.3)' : '#284228'}`,
              borderRadius: 5, color: copied ? '#2d6a2d' : '#9c8b6e',
              fontSize: 11, padding: '3px 8px', cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
              {copied ? '✓' : 'Copy'}
            </button>
            <button onClick={() => { setShowSearch(v => !v); setSearchError(null); }} style={{
              background: 'none', border: '1px solid #c8bc96',
              borderRadius: 5, color: '#9c8b6e',
              fontSize: 11, padding: '3px 8px', cursor: 'pointer',
            }}>
              {showSearch ? '✕' : '🔍'}
            </button>
          </div>
        )}
      </div>

      {/* Legend — only when a layer is active */}
      {(blmOn || mvumOn) && (
        <div style={{
          borderTop: '1px solid #d8cfa8', background: '#f0ebe0',
          padding: '10px 14px',
          display: 'flex', gap: 20, flexWrap: 'wrap',
        }}>
          {blmOn && (
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ color: '#5c7a3e', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 7 }}>
                Can I camp here?
              </div>
              {BLM_LEGEND.map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                  <div style={{ width: 11, height: 11, borderRadius: 2, background: item.color, flexShrink: 0, opacity: 0.9 }} />
                  <span style={{ color: item.icon === '✓' ? '#2d6a2d' : item.icon === '✕' ? '#b91c1c' : '#9c8b6e', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ color: '#6b5c42', fontSize: 11 }}>{item.label}</span>
                  <span style={{ color: '#b8aa88', fontSize: 10, marginLeft: 2 }}>· {item.sub}</span>
                </div>
              ))}
            </div>
          )}

          {mvumOn && (
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ color: '#60a5fa', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 7 }}>
                Can my rig drive this?
              </div>
              {MVUM_LEGEND.map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                  <div style={{
                    width: 22, height: 3, borderRadius: 2, flexShrink: 0,
                    background: item.lineStyle === 'solid' ? item.color : 'transparent',
                    border: item.lineStyle !== 'solid' ? `2px ${item.lineStyle} ${item.color}` : 'none',
                  }} />
                  <span style={{ color: item.icon === '✓' ? '#2d6a2d' : item.icon === '✕' ? '#b91c1c' : '#f59e0b', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ color: '#6b5c42', fontSize: 11 }}>{item.label}</span>
                  <span style={{ color: '#b8aa88', fontSize: 10, marginLeft: 2 }}>· {item.sub}</span>
                </div>
              ))}
              <div style={{ color: '#4a5a4a', fontSize: 10, marginTop: 6 }}>Roads appear at zoom 10+ · labels at 12+</div>
            </div>
          )}
        </div>
      )}

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

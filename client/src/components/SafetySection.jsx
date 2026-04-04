import { useState, useEffect } from 'react';

function parseCoords(str) {
  if (!str) return [null, null];
  const parts = str.split(/[,\s]+/).map(Number).filter(n => !isNaN(n));
  if (parts.length >= 2) return [parts[0], parts[1]];
  return [null, null];
}

function SafetyRow({ icon, label, value, note, link, linkText, isLast }) {
  return (
    <div style={{
      display: 'flex', gap: 12,
      paddingBottom: isLast ? 0 : 12,
      marginBottom: isLast ? 0 : 12,
      borderBottom: isLast ? 'none' : '1px solid #e8e0ca',
    }}>
      <span style={{ fontSize: 16, flexShrink: 0, paddingTop: 2 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ color: '#9c8b6e', fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{label}</div>
        <div style={{ color: '#3d3020', fontSize: 13, lineHeight: 1.5 }}>{value}</div>
        {note && (
          <div style={{ color: '#6b5c42', fontSize: 12, marginTop: 3, lineHeight: 1.4 }}>{note}</div>
        )}
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#5c7a3e', fontSize: 12, textDecoration: 'none', display: 'inline-block', marginTop: 4 }}
            onClick={e => e.stopPropagation()}
          >
            {linkText || link} ↗
          </a>
        )}
      </div>
    </div>
  );
}

const ALERT_ICONS = {
  'Red Flag Warning': '🔥',
  'Fire Weather Watch': '🔥',
  'High Wind Warning': '💨',
  'High Wind Watch': '💨',
  'Wind Advisory': '💨',
  'Winter Storm Warning': '❄️',
  'Winter Storm Watch': '❄️',
  'Winter Weather Advisory': '❄️',
  'Blizzard Warning': '❄️',
  'Flash Flood Warning': '🌊',
  'Flash Flood Watch': '🌊',
  'Flood Warning': '🌊',
  'Flood Watch': '🌊',
  'Excessive Heat Warning': '☀️',
  'Excessive Heat Watch': '☀️',
  'Heat Advisory': '☀️',
  'Tornado Warning': '🌪️',
  'Tornado Watch': '🌪️',
  'Thunderstorm Warning': '⛈️',
  'Severe Thunderstorm Warning': '⛈️',
  'Severe Thunderstorm Watch': '⛈️',
};

function alertColor(severity) {
  if (severity === 'Extreme') return { bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.35)', text: '#f87171' };
  if (severity === 'Severe') return { bg: 'rgba(251,146,60,0.10)', border: 'rgba(251,146,60,0.35)', text: '#fb923c' };
  return { bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.30)', text: '#fbbf24' };
}

export default function SafetySection({ trip, coordinates }) {
  const [fires, setFires] = useState([]);
  const [fireLoading, setFireLoading] = useState(true);
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const safety = trip?.safetyBriefing;

  useEffect(() => {
    const [lat, lon] = parseCoords(coordinates);
    if (!lat || !lon) {
      setFireLoading(false);
      setAlertsLoading(false);
      return;
    }

    fetch(`/api/fire-check?lat=${lat}&lon=${lon}`)
      .then(r => r.json())
      .then(data => {
        setFires(data.fires || []);
        setFireLoading(false);
      })
      .catch(() => setFireLoading(false));

    fetch(`/api/weather-alerts?lat=${lat}&lon=${lon}`)
      .then(r => r.json())
      .then(data => {
        setWeatherAlerts(data.alerts || []);
        setAlertsLoading(false);
      })
      .catch(() => setAlertsLoading(false));
  }, [coordinates]);

  // Build the rows we'll show
  const rows = [];
  if (safety?.campfirePermit) {
    rows.push({ icon: '🪵', label: 'Campfire permit', value: safety.campfirePermit, link: safety.campfirePermitUrl, linkText: 'Get free CA permit' });
  }
  if (safety?.bearCanister) {
    rows.push({ icon: '🐻', label: 'Bear canister', value: safety.bearCanister, note: safety.bearCanisterNotes });
  }
  if (safety?.additionalPermits?.length > 0) {
    safety.additionalPermits.forEach(p => {
      if (p && !p.toLowerCase().includes('empty')) {
        rows.push({ icon: '📋', label: 'Permit', value: p });
      }
    });
  }
  if (safety?.emergencyInfo) {
    rows.push({ icon: '🚑', label: 'Emergency', value: safety.emergencyInfo });
  }

  const hasContent = fires.length > 0 || weatherAlerts.length > 0 || rows.length > 0;
  if (!hasContent && !fireLoading && !alertsLoading) return null;

  return (
    <div className="card" style={{ padding: 20, marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 18 }}>⛺</span>
        <h3 style={{ color: '#2c2416', fontSize: 15, fontWeight: 600, margin: 0 }}>Safety briefing</h3>
      </div>

      {/* Active fire incidents */}
      {fires.length > 0 && (
        <div style={{ marginBottom: (weatherAlerts.length > 0 || rows.length > 0) ? 14 : 0 }}>
          {fires.map((fire, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(248,113,113,0.07)',
                border: '1px solid rgba(248,113,113,0.25)',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: i < fires.length - 1 ? 8 : 0,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 4 }}>
                <span style={{ color: '#f87171', fontSize: 13, fontWeight: 600 }}>
                  🔥 {fire.name}
                </span>
                <span style={{ color: '#f87171', fontSize: 12 }}>
                  {Math.round(fire.miles)} mi away
                </span>
              </div>
              <div style={{ color: '#6b5c42', fontSize: 12, marginTop: 3 }}>
                {fire.acres > 0 && `${fire.acres.toLocaleString()} acres`}
                {fire.contained !== null && fire.acres > 0 && ' · '}
                {fire.contained !== null && `${fire.contained}% contained`}
                {fire.state && ` · ${fire.state}`}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NWS weather alerts */}
      {weatherAlerts.length > 0 && (
        <div style={{ marginBottom: rows.length > 0 ? 14 : 0 }}>
          {weatherAlerts.map((alert, i) => {
            const colors = alertColor(alert.severity);
            const icon = ALERT_ICONS[alert.event] || '⚠️';
            return (
              <div
                key={i}
                style={{
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 8,
                  padding: '10px 14px',
                  marginBottom: i < weatherAlerts.length - 1 ? 8 : 0,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 4 }}>
                  <span style={{ color: colors.text, fontSize: 13, fontWeight: 600 }}>
                    {icon} {alert.event}
                  </span>
                  {alert.expires && (
                    <span style={{ color: colors.text, fontSize: 11, opacity: 0.8 }}>
                      until {new Date(alert.expires).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                {alert.headline && (
                  <div style={{ color: '#6b5c42', fontSize: 12, marginTop: 3, lineHeight: 1.4 }}>
                    {alert.headline.replace(/^[^:]+:\s*/i, '')}
                  </div>
                )}
                {alert.area && (
                  <div style={{ color: '#9c8b6e', fontSize: 11, marginTop: 3 }}>
                    📍 {alert.area.split(';')[0].trim()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Permit + safety rows */}
      {rows.map((row, i) => (
        <SafetyRow
          key={i}
          {...row}
          isLast={i === rows.length - 1}
        />
      ))}

      {/* No fires / no alerts — quiet note */}
      {!fireLoading && !alertsLoading && fires.length === 0 && weatherAlerts.length === 0 && rows.length > 0 && (
        <div style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid #e8e0ca',
          color: '#9c8b6e',
          fontSize: 12,
        }}>
          ✓ No active fire incidents or weather alerts at time of planning
        </div>
      )}
    </div>
  );
}

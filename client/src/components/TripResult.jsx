import { useState } from 'react';
import MapPin from './MapPin.jsx';
import WeatherStrip from './WeatherStrip.jsx';
import SafetySection from './SafetySection.jsx';

function buildShareUrl(trip) {
  // unescape + encodeURIComponent makes btoa safe for Unicode characters
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(trip))));
  return `${window.location.origin}${window.location.pathname}#shared/${encoded}`;
}

function RatingPill({ rating }) {
  const colors = {
    'Excellent': 'pill-green',
    'Good': 'pill-green',
    'Fair': 'pill-amber',
    'Challenging': 'pill-red',
    'Easy': 'pill-green',
    'Moderate': 'pill-amber',
    'Technical': 'pill-red',
    'Stock': 'pill-green',
    'Stock / Moderate clearance': 'pill-green',
    'Moderate clearance': 'pill-amber',
    'High clearance': 'pill-red',
  };
  const cls = colors[rating] || 'pill-slate';
  return <span className={`pill ${cls}`}>{rating}</span>;
}

function Section({ icon, title, children }) {
  return (
    <div className="card" style={{ padding: 20, marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <h3 style={{ color: '#2c2416', fontSize: 15, fontWeight: 600, margin: 0 }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid #e8e0ca' }}>
      <span style={{ color: '#9c8b6e', fontSize: 13, fontWeight: 500, flexShrink: 0, marginRight: 16, paddingTop: 1 }}>{label}</span>
      <span style={{ color: '#3d3020', fontSize: 14, textAlign: 'right', lineHeight: 1.4 }}>{value}</span>
    </div>
  );
}

export default function TripResult({ entry, onSave, onPlanAnother, onViewLog, readOnly }) {
  const { trip, id, date, status } = entry;
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleSave() {
    onSave(entry);
    setSaved(true);
  }

  async function handleShare() {
    try {
      const url = buildShareUrl(trip);
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback if clipboard is blocked
      const url = buildShareUrl(trip);
      window.prompt('Copy this link to share:', url);
    }
  }

  if (!trip) return null;

  return (
    <div className="fade-in">
      {/* Hero */}
      <div style={{ marginBottom: 24 }}>
        <div className="hero-row">
          <div>
            <h1 style={{ color: '#2c2416', fontSize: 28, fontWeight: 700, letterSpacing: '-0.6px', margin: '0 0 4px' }}>
              {trip.destination}
            </h1>
            <p style={{ color: '#5c7a3e', fontSize: 15, margin: '0 0 6px', fontStyle: 'italic' }}>{trip.tagline}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {trip.region && <span className="pill pill-slate">{trip.region}</span>}
              {trip.driveTime && <span className="pill pill-slate">🚗 {trip.driveTime}</span>}
            </div>
          </div>
          <div className="hero-actions">
            <button onClick={handleShare} className="btn-ghost" style={{ padding: '10px 16px', fontSize: 14 }}>
              {copied ? '✓ Copied!' : '⬆ Share'}
            </button>
            {!readOnly && (
              !saved ? (
                <button onClick={handleSave} className="btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}>
                  Save to log
                </button>
              ) : (
                <span className="pill pill-green">✓ Saved</span>
              )
            )}
          </div>
        </div>
      </div>

      {/* Camp spot + map together */}
      <Section icon="🏕️" title="The spot">
        <MapPin
          coordinates={trip.campsite?.coordinates}
          destination={trip.destination}
          campsiteName={trip.campsite?.name}
        />
        <Row label="Name" value={trip.campsite?.name} />
        <Row label="Type" value={trip.campsite?.type} />
        {trip.campsite?.coordinates && <Row label="Coords" value={trip.campsite.coordinates} />}
        {trip.campsite?.description && (
          <p style={{ color: '#3d3020', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{trip.campsite.description}</p>
        )}
      </Section>

      {/* Weather — below the spot */}
      <WeatherStrip
        coordinates={trip.campsite?.coordinates}
        tripDates={entry.constraints?.tripDates}
        destination={trip.destination}
        weatherPrefs={entry.constraints?.weatherPrefs}
      />

      {/* Safety briefing — fire alerts + permits */}
      <SafetySection
        trip={trip}
        coordinates={trip.campsite?.coordinates}
      />

      {/* Dog report — prominent */}
      {trip.dogReport && (
        <Section icon="🐕" title="Dog report">
          <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#6b5c42', fontSize: 13 }}>Overall</span>
            <RatingPill rating={trip.dogReport.rating} />
          </div>
          <Row label="Swimming" value={trip.dogReport.swimming} />
          <Row label="Shade" value={trip.dogReport.shade} />
          <Row label="Terrain" value={trip.dogReport.terrain} />
          <Row label="Heat / elevation" value={trip.dogReport.heatConsiderations} />
          {trip.dogReport.notes && (
            <div style={{ background: 'rgba(92,122,62,0.07)', border: '1px solid rgba(92,122,62,0.18)', borderRadius: 6, padding: '10px 12px', marginTop: 4 }}>
              <p style={{ color: '#4a3c28', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{trip.dogReport.notes}</p>
            </div>
          )}
        </Section>
      )}

      {/* Route / rig */}
      {trip.route && (
        <Section icon="🚙" title="Rig report">
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {trip.route.rigRating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#9c8b6e', fontSize: 12 }}>Road difficulty</span>
                <RatingPill rating={trip.route.rigRating} />
              </div>
            )}
            {trip.route.clearanceNeeded && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#9c8b6e', fontSize: 12 }}>Clearance</span>
                <RatingPill rating={trip.route.clearanceNeeded} />
              </div>
            )}
          </div>
          <Row label="Route" value={trip.route.overview} />
          <Row label="Last miles" value={trip.route.lastMiles} />
        </Section>
      )}

      {/* Conditions */}
      {trip.conditions && (
        <Section icon="🌤️" title="Conditions">
          <Row label="Best season" value={trip.conditions.bestSeason} />
          <Row label="Current notes" value={trip.conditions.currentNotes} />
          <Row label="Fire restrictions" value={trip.conditions.fireRestrictions} />
          <Row label="Water" value={trip.conditions.waterAvailability} />
        </Section>
      )}

      {/* Highlights + Watch-outs */}
      {(trip.highlights?.length > 0 || trip.watchOuts?.length > 0) && (
        <div className="grid-2" style={{ marginBottom: 12 }}>
          {trip.highlights?.length > 0 && (
            <div className="card" style={{ padding: 16 }}>
              <div style={{ color: '#2d6a2d', fontSize: 13, fontWeight: 600, marginBottom: 10 }}>✓ Highlights</div>
              {trip.highlights.map((h, i) => (
                <div key={i} style={{ color: '#3d3020', fontSize: 13, lineHeight: 1.5, paddingBottom: 6, marginBottom: 6, borderBottom: i < trip.highlights.length - 1 ? '1px solid #e8e0ca' : 'none' }}>
                  {h}
                </div>
              ))}
            </div>
          )}
          {trip.watchOuts?.length > 0 && (
            <div className="card" style={{ padding: 16 }}>
              <div style={{ color: '#b91c1c', fontSize: 13, fontWeight: 600, marginBottom: 10 }}>⚠ Watch out</div>
              {trip.watchOuts.map((w, i) => (
                <div key={i} style={{ color: '#3d3020', fontSize: 13, lineHeight: 1.5, paddingBottom: 6, marginBottom: 6, borderBottom: i < trip.watchOuts.length - 1 ? '1px solid #e8e0ca' : 'none' }}>
                  {w}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Packing notes */}
      {trip.packingNotes && (
        <Section icon="🎒" title="Pack list notes">
          <p style={{ color: '#3d3020', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{trip.packingNotes}</p>
        </Section>
      )}

      {/* Alternative */}
      {trip.alternativeOption?.name && (
        <div className="card" style={{ padding: 16, marginBottom: 12 }}>
          <div style={{ color: '#9c8b6e', fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            If this doesn't work out
          </div>
          <div style={{ color: '#2c2416', fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{trip.alternativeOption.name}</div>
          <div style={{ color: '#6b5c42', fontSize: 13, marginBottom: 6 }}>{trip.alternativeOption.reason}</div>
          {trip.alternativeOption.description && (
            <div style={{ color: '#9c8b6e', fontSize: 13, lineHeight: 1.5 }}>{trip.alternativeOption.description}</div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
        <button onClick={onPlanAnother} className="btn-ghost" style={{ flex: 1, padding: '12px' }}>
          Plan another trip
        </button>
        {saved && (
          <button onClick={onViewLog} className="btn-primary" style={{ flex: 1, padding: '12px' }}>
            View trip log
          </button>
        )}
      </div>
    </div>
  );
}

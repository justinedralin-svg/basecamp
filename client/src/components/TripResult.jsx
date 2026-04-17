import { useState } from 'react';
import MapPin from './MapPin.jsx';
import WeatherStrip from './WeatherStrip.jsx';
import SafetySection from './SafetySection.jsx';
import { getDogNames } from '../utils/profile.js';
import ShareModal from './ShareModal.jsx';
import { trackEvent } from '../utils/analytics.js';
import { showToast } from '../utils/toast.js';

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

function mapsUrl(coordString) {
  if (!coordString) return null;
  const match = coordString.match(/(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/);
  if (!match) return null;
  const [, lat, lon] = match;
  // Use geo: URI — opens Google Maps on Android, Apple Maps on iOS, Google Maps on desktop
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`;
}

function CoordsRow({ coords }) {
  if (!coords) return null;
  const url = mapsUrl(coords);
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid #e8e0ca' }}>
      <span style={{ color: '#9c8b6e', fontSize: 13, fontWeight: 500, flexShrink: 0, marginRight: 16 }}>Coords</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: '#3d3020', fontSize: 13, fontFamily: 'monospace' }}>{coords}</span>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('directions_opened')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: '#5c7a3e', color: '#fff',
              padding: '4px 10px', borderRadius: 20,
              fontSize: 12, fontWeight: 600, textDecoration: 'none',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            🗺️ Directions
          </a>
        )}
      </div>
    </div>
  );
}

function EmailPlan({ trip, constraints }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSend(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/send-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), trip, constraints }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');
      setStatus('sent');
      trackEvent('plan_emailed');
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  }

  if (status === 'sent') return (
    <div className="fade-in" style={{ background: 'rgba(92,122,62,0.07)', border: '1px solid rgba(92,122,62,0.25)', borderRadius: 10, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 20 }}>✉️</span>
      <div>
        <div style={{ color: '#2d6a2d', fontWeight: 600, fontSize: 14 }}>Plan sent!</div>
        <div style={{ color: '#6b5c42', fontSize: 13 }}>Check your inbox — the full trip is on its way to {email}.</div>
      </div>
    </div>
  );

  return (
    <div style={{ background: '#faf7f0', border: '1px solid #d8cfa8', borderRadius: 10, padding: '16px 18px', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 18 }}>📧</span>
        <span style={{ color: '#2c2416', fontWeight: 600, fontSize: 14 }}>Email this plan to yourself</span>
      </div>
      <p style={{ color: '#9c8b6e', fontSize: 13, margin: '0 0 12px', lineHeight: 1.5 }}>
        Get the full trip plan — map coordinates, packing list, dog report — straight to your inbox.
      </p>
      <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          style={{ flex: 1, padding: '9px 12px', fontSize: 14, borderRadius: 7, border: '1px solid #c8bc96', background: '#fff', color: '#2c2416', outline: 'none' }}
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={status === 'sending'}
          style={{ padding: '9px 18px', fontSize: 14, whiteSpace: 'nowrap', opacity: status === 'sending' ? 0.7 : 1 }}
        >
          {status === 'sending' ? 'Sending…' : 'Send →'}
        </button>
      </form>
      {status === 'error' && (
        <div style={{ color: '#b91c1c', fontSize: 12, marginTop: 7 }}>{errorMsg}</div>
      )}
    </div>
  );
}

function ShareAppNudge({ destination }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const appUrl = window.location.origin;
  const msg = `Just planned a camping trip to ${destination} using this free app — it builds the whole plan around your dog 🐾 ${appUrl}`;

  async function handleShare() {
    if (navigator.share) {
      try { await navigator.share({ title: 'Camp With My Dog', text: msg, url: appUrl }); return; }
      catch {}
    }
    try {
      await navigator.clipboard.writeText(msg);
      showToast('Message copied — paste it anywhere!');
    } catch {
      window.prompt('Copy and share:', msg);
    }
  }

  return (
    <div className="fade-in" style={{
      marginTop: 16,
      background: 'linear-gradient(135deg, #faf7f0, #f0ebe0)',
      border: '1.5px solid #d8cfa8',
      borderRadius: 12,
      padding: '18px 20px',
      position: 'relative',
    }}>
      <button
        onClick={() => setDismissed(true)}
        style={{ position: 'absolute', top: 10, right: 12, background: 'none', border: 'none', color: '#b8aa88', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}
      >×</button>
      <div style={{ fontSize: 28, marginBottom: 8 }}>🐾</div>
      <div style={{ color: '#2c2416', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
        Know another dog owner?
      </div>
      <p style={{ color: '#6b5c42', fontSize: 13, lineHeight: 1.6, margin: '0 0 14px' }}>
        Camp With My Dog is free — share it with a friend who's been Googling "dog-friendly camping" for months.
      </p>
      <button
        onClick={handleShare}
        className="btn-primary"
        style={{ width: '100%', padding: '11px', fontSize: 14 }}
      >
        ⬆ Share Camp With My Dog
      </button>
    </div>
  );
}

export default function TripResult({ entry, onSave, onPlanAnother, onViewLog, readOnly }) {
  const { trip, id, date, status } = entry;
  const [saved, setSaved] = useState(false);
  const [showShare, setShowShare] = useState(false);

  function handleSave() {
    trackEvent('trip_saved');
    onSave(entry);
    setSaved(true);
    showToast('Trip saved to your log!');
  }


  if (!trip) return null;

  return (
    <div className="fade-in">
      {showShare && <ShareModal trip={trip} onClose={() => setShowShare(false)} />}
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
            <button onClick={() => { trackEvent('share_clicked'); setShowShare(true); }} className="btn-ghost" style={{ padding: '10px 16px', fontSize: 14 }}>
              ⬆ Share
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
        <CoordsRow coords={trip.campsite?.coordinates} />
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
        tripConditions={trip.conditions}
      />

      {/* Safety briefing — fire alerts + permits */}
      <SafetySection
        trip={trip}
        coordinates={trip.campsite?.coordinates}
      />

      {/* Dog report — prominent */}
      {trip.dogReport && (
        <Section icon="🐕" title={`${getDogNames('Dog')}'s report`}>
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

      {/* Email plan */}
      <EmailPlan trip={trip} constraints={entry.constraints} />

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button onClick={onPlanAnother} className="btn-ghost" style={{ flex: 1, padding: '12px' }}>
          Plan another trip
        </button>
        {saved && (
          <button onClick={onViewLog} className="btn-primary" style={{ flex: 1, padding: '12px' }}>
            View trip log
          </button>
        )}
      </div>

      {/* Post-save viral nudge — appears after saving */}
      {saved && !readOnly && <ShareAppNudge destination={trip.destination} />}

    </div>
  );
}

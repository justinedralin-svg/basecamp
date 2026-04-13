import { useState } from 'react';
import TripResult from './TripResult.jsx';

export default function SharedTrip({ trip, onPlanOwn, onSaveTrip }) {
  const [saved, setSaved] = useState(false);

  if (!trip) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🗺️</div>
        <div style={{ color: '#2c2416', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Trip not found</div>
        <div style={{ color: '#9c8b6e', fontSize: 14, marginBottom: 24 }}>This link may be invalid or expired.</div>
        <button onClick={onPlanOwn} className="btn-primary" style={{ padding: '12px 24px' }}>
          Plan your own trip
        </button>
      </div>
    );
  }

  function handleSave() {
    onSaveTrip && onSaveTrip(trip);
    setSaved(true);
  }

  const fakeEntry = { trip, id: 'shared', date: new Date().toISOString(), status: 'shared' };

  return (
    <div className="fade-in">

      {/* Top banner */}
      <div style={{
        background: 'rgba(92,122,62,0.08)',
        border: '1px solid rgba(92,122,62,0.20)',
        borderRadius: 10,
        padding: '14px 18px',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 16 }}>🐾</span>
              <span style={{ color: '#5c7a3e', fontSize: 13, fontWeight: 600 }}>Shared via Camp With My Dog</span>
            </div>
            <div style={{ color: '#6b5c42', fontSize: 13, lineHeight: 1.5 }}>
              Someone shared this dog-friendly trip plan with you.
              Plan your own trip free — no account needed.
            </div>
          </div>
        </div>
      </div>

      {/* Trip result */}
      <TripResult
        entry={fakeEntry}
        onSave={() => {}}
        onPlanAnother={onPlanOwn}
        onViewLog={onPlanOwn}
        readOnly
      />

      {/* Bottom CTA card */}
      <div className="card" style={{ padding: 24, marginTop: 16, textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🐾</div>
        <h3 style={{ color: '#2c2416', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
          Plan your own dog-friendly trip
        </h3>
        <p style={{ color: '#9c8b6e', fontSize: 14, lineHeight: 1.6, marginBottom: 20, maxWidth: 360, margin: '0 auto 20px' }}>
          AI-powered camping trips built around your dog. Safety info, fire alerts, weather, packing lists — free to use.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 320, margin: '0 auto' }}>
          <button
            onClick={onPlanOwn}
            className="btn-primary"
            style={{ padding: '14px', fontSize: 15 }}
          >
            Plan my trip with my dog →
          </button>
          {!saved ? (
            <button
              onClick={handleSave}
              className="btn-ghost"
              style={{ padding: '12px', fontSize: 14 }}
            >
              💾 Save this trip to my log
            </button>
          ) : (
            <div style={{ color: '#5c7a3e', fontSize: 14, fontWeight: 500, padding: '12px' }}>
              ✓ Saved to your trip log
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

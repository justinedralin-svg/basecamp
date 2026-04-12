import TripCard from './TripCard.jsx';
export default function Home({ trips, onStartPlan, onViewLog, onViewTrip, dogName, dogNames }) {
  const recent = trips.slice(0, 3);

  return (
    <div className="fade-in">
      {/* Hero */}
      <div style={{ padding: '48px 0 40px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🐾</div>
        <h1 style={{
          color: '#2c2416',
          fontSize: 36,
          fontWeight: 700,
          letterSpacing: '-0.8px',
          marginBottom: 12,
          lineHeight: 1.2,
        }}>
          {dogName ? `Is this trip right for ${dogName}?` : 'Is this trip going to'}{!dogName && <><br /><span style={{ color: '#5c7a3e' }}>actually work?</span></>}
          {dogName && <><br /><span style={{ color: '#5c7a3e' }}>Let's find out.</span></>}
        </h1>
        <p style={{ color: '#9c8b6e', fontSize: 16, maxWidth: 440, margin: '0 auto 32px', lineHeight: 1.6 }}>
          {dogNames
            ? `Plan a dog-friendly camping trip for you and ${dogNames}. Safety info, maps, packing list — all in one place.`
            : 'Tell us your rig, your dogs, and what you\'re after. Get a trip that actually fits — not just a list of campgrounds.'}
        </p>
        <button
          onClick={onStartPlan}
          className="btn-primary"
          style={{ padding: '14px 32px', fontSize: 16 }}
        >
          {dogName ? `Plan a trip with ${dogName} →` : 'Plan a Trip'}
        </button>
      </div>

      {/* What makes it different */}
      <div className="grid-3" style={{ marginBottom: 48 }}>
        {[
          { icon: '🐕', title: 'Dog-first', desc: 'Actual swimming access, shade, heat index — not just "leashes allowed"' },
          { icon: '🚙', title: 'Rig-aware', desc: 'Road conditions and clearance for your specific setup' },
          { icon: '📋', title: 'Your trip log', desc: 'Save and revisit every trip you\'ve planned or done' },
        ].map(f => (
          <div key={f.title} className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{f.icon}</div>
            <div style={{ color: '#2c2416', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{f.title}</div>
            <div style={{ color: '#9c8b6e', fontSize: 13, lineHeight: 1.5 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Recent trips */}
      {recent.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ color: '#2c2416', fontSize: 18, fontWeight: 600, margin: 0 }}>Recent trips</h2>
            <button
              onClick={onViewLog}
              style={{ background: 'none', border: 'none', color: '#5c7a3e', fontSize: 14, cursor: 'pointer', fontWeight: 500 }}
            >
              View all →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recent.map(t => (
              <TripCard key={t.id} entry={t} onClick={() => onViewTrip(t.id)} />
            ))}
          </div>
        </div>
      )}

      {trips.length === 0 && (
        <div className="card" style={{ padding: 32, textAlign: 'center', marginTop: 8 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🗺️</div>
          <div style={{ color: '#9c8b6e', fontSize: 15 }}>
            {dogName
              ? `No trips yet. Time to find somewhere ${dogName} will love.`
              : 'Your trip log is empty. Plan your first trip above.'}
          </div>
        </div>
      )}
    </div>
  );
}

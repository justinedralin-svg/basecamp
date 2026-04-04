import TripResult from './TripResult.jsx';

export default function SharedTrip({ trip, onPlanOwn }) {
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

  const fakeEntry = { trip, id: 'shared', date: new Date().toISOString(), status: 'shared' };

  return (
    <div className="fade-in">
      {/* Banner */}
      <div style={{
        background: 'rgba(92,122,62,0.08)',
        border: '1px solid rgba(92,122,62,0.18)',
        borderRadius: 8,
        padding: '12px 16px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>⛺</span>
          <span style={{ color: '#5c7a3e', fontSize: 13, fontWeight: 500 }}>
            Someone shared this Base Camp trip with you
          </span>
        </div>
        <button onClick={onPlanOwn} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
          Plan your own →
        </button>
      </div>

      <TripResult
        entry={fakeEntry}
        onSave={() => {}}
        onPlanAnother={onPlanOwn}
        onViewLog={onPlanOwn}
        readOnly
      />
    </div>
  );
}

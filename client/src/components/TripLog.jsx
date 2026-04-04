import TripCard from './TripCard.jsx';

export default function TripLog({ trips, onViewTrip, onMarkDone, onDelete, onStartPlan }) {
  const done = trips.filter(t => t.status === 'done');
  const planned = trips.filter(t => t.status !== 'done');

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: '#2c2416', fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', margin: '0 0 4px' }}>
            Trip log
          </h1>
          <p style={{ color: '#9c8b6e', fontSize: 14, margin: 0 }}>
            {trips.length === 0 ? 'No trips yet' : `${trips.length} trip${trips.length !== 1 ? 's' : ''} — ${done.length} done`}
          </p>
        </div>
        <button onClick={onStartPlan} className="btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}>
          + Plan a trip
        </button>
      </div>

      {trips.length === 0 && (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🗺️</div>
          <div style={{ color: '#2c2416', fontSize: 16, fontWeight: 500, marginBottom: 8 }}>No trips logged yet</div>
          <div style={{ color: '#9c8b6e', fontSize: 14 }}>Plan your first trip to get started.</div>
        </div>
      )}

      {planned.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ color: '#9c8b6e', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
            Planned
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {planned.map(t => (
              <TripCard
                key={t.id}
                entry={t}
                onClick={() => onViewTrip(t.id)}
                onMarkDone={onMarkDone}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {done.length > 0 && (
        <div>
          <div style={{ color: '#9c8b6e', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
            Done
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {done.map(t => (
              <TripCard
                key={t.id}
                entry={t}
                onClick={() => onViewTrip(t.id)}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

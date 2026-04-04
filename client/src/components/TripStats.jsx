export default function TripStats({ trips, onStartPlan }) {
  if (trips.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⛺</div>
        <div style={{ color: '#6b5c42', fontSize: 16, marginBottom: 8 }}>No trips yet</div>
        <div style={{ color: '#9c8b6e', fontSize: 13, marginBottom: 24 }}>Plan your first adventure to start building stats.</div>
        <button className="btn-primary" onClick={onStartPlan}>Plan a trip</button>
      </div>
    );
  }

  const done = trips.filter(t => t.status === 'done');
  const planned = trips.filter(t => t.status !== 'done');
  const rated = done.filter(t => t.rating);

  // Nights camped — from constraints.nights (number) or date range
  const nightsCamped = done.reduce((sum, t) => {
    const n = parseInt(t.constraints?.nights, 10);
    if (!isNaN(n)) return sum + n;
    if (t.constraints?.startDate && t.constraints?.endDate) {
      const diff = (new Date(t.constraints.endDate) - new Date(t.constraints.startDate)) / 86400000;
      return sum + Math.max(0, Math.round(diff));
    }
    return sum;
  }, 0);

  // Unique destinations
  const destinations = [...new Set(
    trips
      .map(t => t.trip?.destination || t.constraints?.location)
      .filter(Boolean)
      .map(d => d.split(',')[0].trim())
  )];

  // Average rating
  const avgRating = rated.length
    ? (rated.reduce((s, t) => s + t.rating, 0) / rated.length).toFixed(1)
    : null;

  // Total photos
  const totalPhotos = trips.reduce((s, t) => s + (t.photos?.length || 0), 0);

  // Best trip
  const bestTrip = [...rated].sort((a, b) => b.rating - a.rating)[0];

  // Most recent completed
  const recentDone = [...done].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ color: '#2c2416', fontSize: 20, fontWeight: 700, margin: 0 }}>Your stats</h2>
        <p style={{ color: '#9c8b6e', fontSize: 13, margin: '4px 0 0' }}>
          {trips.length} trip{trips.length !== 1 ? 's' : ''} in the log
        </p>
      </div>

      {/* Big number cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 10 }}>
        <StatCard value={done.length} label="Trips completed" color="#2d6a2d" />
        <StatCard value={nightsCamped || '—'} label="Nights camped" color="#5c7a3e" />
        <StatCard value={planned.length} label="Upcoming" color="#7a6a50" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 10 }}>
        <StatCard
          value={avgRating ? `${avgRating} ★` : '—'}
          label={rated.length > 0 ? `Avg rating · ${rated.length} rated` : 'No ratings yet'}
          color="#5c7a3e"
        />
        <StatCard value={totalPhotos || '—'} label="Photos saved" color="#7a6a50" />
      </div>

      {/* Destinations */}
      {destinations.length > 0 && (
        <div style={{
          background: '#faf7f0', border: '1px solid #d8cfa8', borderRadius: 10,
          boxShadow: '0 1px 4px rgba(100,80,40,0.08)',
          padding: '14px 16px', marginBottom: 10,
        }}>
          <div style={{ color: '#9c8b6e', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
            Destinations explored · {destinations.length}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {destinations.map(d => (
              <span key={d} style={{
                background: '#f2ede0', border: '1px solid #cbbf96',
                borderRadius: 999, color: '#6b5c42',
                fontSize: 12, padding: '3px 10px',
              }}>
                {d}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Best trip highlight */}
      {bestTrip && (
        <div style={{
          background: '#faf7f0', border: '1px solid #d8cfa8', borderRadius: 10,
          boxShadow: '0 1px 4px rgba(100,80,40,0.08)',
          padding: '14px 16px', marginBottom: 10,
        }}>
          <div style={{ color: '#9c8b6e', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
            Best trip
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ color: '#2c2416', fontSize: 14, fontWeight: 600 }}>
                {bestTrip.trip?.destination || bestTrip.constraints?.location || 'Unknown'}
              </div>
              {bestTrip.constraints?.startDate && (
                <div style={{ color: '#9c8b6e', fontSize: 12, marginTop: 2 }}>
                  {new Date(bestTrip.constraints.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
              {[1,2,3,4,5].map(i => (
                <span key={i} style={{ color: i <= bestTrip.rating ? '#5c7a3e' : '#d8cfa8', fontSize: 18 }}>★</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent completed trips */}
      {recentDone.length > 0 && (
        <div style={{
          background: '#faf7f0', border: '1px solid #d8cfa8', borderRadius: 10,
          boxShadow: '0 1px 4px rgba(100,80,40,0.08)',
          padding: '14px 16px',
        }}>
          <div style={{ color: '#9c8b6e', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
            Recent trips
          </div>
          {recentDone.map((t, i) => (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingBottom: i < recentDone.length - 1 ? 10 : 0,
              marginBottom: i < recentDone.length - 1 ? 10 : 0,
              borderBottom: i < recentDone.length - 1 ? '1px solid #e8e0ca' : 'none',
            }}>
              <div>
                <div style={{ color: '#3d3020', fontSize: 13, fontWeight: 500 }}>
                  {t.trip?.destination || t.constraints?.location || 'Unknown'}
                </div>
                <div style={{ color: '#9c8b6e', fontSize: 11, marginTop: 2 }}>
                  {t.constraints?.nights ? `${t.constraints.nights} night${t.constraints.nights !== 1 ? 's' : ''}` : ''}
                  {t.constraints?.nights && t.constraints?.startDate ? ' · ' : ''}
                  {t.constraints?.startDate
                    ? new Date(t.constraints.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              {t.rating && (
                <div style={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                  {[1,2,3,4,5].map(i => (
                    <span key={i} style={{ color: i <= t.rating ? '#5c7a3e' : '#d8cfa8', fontSize: 13 }}>★</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ value, label, color }) {
  return (
    <div style={{
      background: '#faf7f0', border: '1px solid #d8cfa8', borderRadius: 10,
      boxShadow: '0 1px 4px rgba(100,80,40,0.08)',
      padding: '14px 16px',
    }}>
      <div style={{ color, fontSize: 28, fontWeight: 700, lineHeight: 1, marginBottom: 5 }}>
        {value}
      </div>
      <div style={{ color: '#9c8b6e', fontSize: 11 }}>{label}</div>
    </div>
  );
}

function Stars({ rating }) {
  if (!rating) return null;
  return (
    <span style={{ color: '#5c7a3e', fontSize: 13, letterSpacing: -1 }}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  );
}

export default function TripCard({ entry, onClick, onMarkDone, onDelete, compact }) {
  const { trip, date, status, notes, rating, photos } = entry;
  const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const coverPhoto = photos?.[0];

  return (
    <div
      className="card"
      onClick={onClick}
      style={{
        padding: 0,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        overflow: 'hidden',
      }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.borderColor = '#a2bc82'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(100,80,40,0.12)'; } }}
      onMouseLeave={e => { if (onClick) { e.currentTarget.style.borderColor = '#d8cfa8'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(100,80,40,0.08)'; } }}
    >
      {/* Cover photo */}
      {coverPhoto && (
        <div style={{ height: 130, overflow: 'hidden', position: 'relative' }}>
          <img
            src={coverPhoto}
            alt="Trip cover"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {photos.length > 1 && (
            <span style={{
              position: 'absolute', bottom: 6, right: 8,
              background: 'rgba(0,0,0,0.50)', color: '#fff',
              fontSize: 11, padding: '2px 6px', borderRadius: 4,
            }}>
              +{photos.length - 1} more
            </span>
          )}
        </div>
      )}

      <div style={{ padding: compact ? '12px 16px' : '16px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ color: '#2c2416', fontWeight: 600, fontSize: 15 }}>{trip?.destination || 'Unknown destination'}</span>
            <StatusBadge status={status} />
          </div>
          {trip?.tagline && (
            <div style={{ color: '#9c8b6e', fontSize: 13, marginBottom: 6, lineHeight: 1.4 }}>{trip.tagline}</div>
          )}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            {trip?.region && <Chip>{trip.region}</Chip>}
            {trip?.driveTime && <Chip>🚗 {trip.driveTime}</Chip>}
            {trip?.dogReport?.rating && <Chip>🐕 {trip.dogReport.rating}</Chip>}
            {notes && notes.trim().length > 0 && <Chip>📓 Notes</Chip>}
            {rating > 0 && <Stars rating={rating} />}
            <Chip muted>{formattedDate}</Chip>
          </div>
        </div>
        {(onMarkDone || onDelete) && (
          <div
            style={{ display: 'flex', gap: 6, marginLeft: 12, flexShrink: 0 }}
            onClick={e => e.stopPropagation()}
          >
            {onMarkDone && status !== 'done' && (
              <button
                onClick={() => onMarkDone(entry.id)}
                className="btn-ghost"
                style={{ padding: '5px 10px', fontSize: 12 }}
              >Done</button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(entry.id)}
                style={{ background: 'none', border: 'none', color: '#c8bc96', cursor: 'pointer', fontSize: 18, padding: '2px 6px', lineHeight: 1 }}
              >×</button>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === 'done') return <span className="pill pill-green" style={{ fontSize: 11 }}>✓ Done</span>;
  return <span className="pill pill-slate" style={{ fontSize: 11 }}>Planned</span>;
}

function Chip({ children, muted }) {
  return (
    <span style={{ color: muted ? '#b8aa88' : '#9c8b6e', fontSize: 12 }}>
      {children}
    </span>
  );
}

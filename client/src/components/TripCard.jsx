import { useState } from 'react';

// Format two ISO date strings into readable range + night count
function formatDates(start, end) {
  if (!start) return { tripDates: '', tripLength: '' };
  const s = new Date(start + 'T12:00:00');
  const e = end ? new Date(end + 'T12:00:00') : null;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const fmt = d => `${months[d.getMonth()]} ${d.getDate()}`;
  if (!e || start === end) return { tripDates: fmt(s), tripLength: '1 day' };
  const nights = Math.round((e - s) / (1000 * 60 * 60 * 24));
  const tripDates = s.getMonth() === e.getMonth()
    ? `${fmt(s)}–${e.getDate()}, ${s.getFullYear()}`
    : `${fmt(s)} – ${fmt(e)}, ${s.getFullYear()}`;
  return { tripDates, tripLength: `${nights} night${nights !== 1 ? 's' : ''}` };
}

// Returns true if the trip's planned dates have already passed
function isTripStale(entry) {
  if (entry.status === 'done') return false;
  const startDate = entry.constraints?.tripStartDate;
  if (!startDate) return false;
  const tripDay = new Date(startDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return tripDay < today;
}

function Stars({ rating }) {
  if (!rating) return null;
  return (
    <span style={{ color: '#5c7a3e', fontSize: 13, letterSpacing: -1 }}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  );
}

export default function TripCard({ entry, onClick, onMarkDone, onDelete, onReschedule, compact }) {
  const { trip, date, status, notes, rating, photos, conditionReport } = entry;
  const hasReport = conditionReport && (conditionReport.trailCondition || conditionReport.cleanliness || conditionReport.packedOut !== undefined);
  const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const coverPhoto = photos?.[0];
  const stale = isTripStale(entry);

  const [showReschedule, setShowReschedule] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');

  function handleRescheduleConfirm(e) {
    e.stopPropagation();
    if (!newStart || !onReschedule) return;
    const { tripDates, tripLength } = formatDates(newStart, newEnd);
    onReschedule(entry.id, newStart, newEnd, tripDates, tripLength);
    setShowReschedule(false);
    setNewStart('');
    setNewEnd('');
  }

  return (
    <div
      className="card"
      style={{
        padding: 0,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        overflow: 'hidden',
        // Amber left border on stale trips
        borderLeft: stale ? '3px solid #d97706' : undefined,
      }}
      onClick={onClick}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.borderColor = '#a2bc82'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(100,80,40,0.12)'; } }}
      onMouseLeave={e => { if (onClick) { e.currentTarget.style.borderColor = stale ? '#d97706' : '#d8cfa8'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(100,80,40,0.08)'; } }}
    >
      {/* Cover photo */}
      {coverPhoto && (
        <div style={{ height: 130, overflow: 'hidden', position: 'relative' }}>
          <img src={coverPhoto} alt="Trip cover" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          {photos.length > 1 && (
            <span style={{ position: 'absolute', bottom: 6, right: 8, background: 'rgba(0,0,0,0.50)', color: '#fff', fontSize: 11, padding: '2px 6px', borderRadius: 4 }}>
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
              <StatusBadge status={status} stale={stale} />
            </div>
            {trip?.tagline && (
              <div style={{ color: '#9c8b6e', fontSize: 13, marginBottom: 6, lineHeight: 1.4 }}>{trip.tagline}</div>
            )}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              {trip?.region && <Chip>{trip.region}</Chip>}
              {trip?.driveTime && <Chip>🚗 {trip.driveTime}</Chip>}
              {trip?.dogReport?.rating && <Chip>🐕 {trip.dogReport.rating}</Chip>}
              {notes && notes.trim().length > 0 && <Chip>📓 Notes</Chip>}
              {hasReport && <Chip>🌿 LNT filed</Chip>}
              {rating > 0 && <Stars rating={rating} />}
              <Chip muted>{formattedDate}</Chip>
            </div>
          </div>
          {(onMarkDone || onDelete) && (
            <div style={{ display: 'flex', gap: 6, marginLeft: 12, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
              {onMarkDone && status !== 'done' && (
                <button onClick={() => onMarkDone(entry.id)} className="btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }}>Done</button>
              )}
              {onDelete && (
                <button onClick={() => onDelete(entry.id)} style={{ background: 'none', border: 'none', color: '#c8bc96', cursor: 'pointer', fontSize: 18, padding: '2px 6px', lineHeight: 1 }}>×</button>
              )}
            </div>
          )}
        </div>

        {/* ── Stale trip prompt ── */}
        {stale && !showReschedule && (
          <div
            onClick={e => e.stopPropagation()}
            style={{
              marginTop: 14,
              background: 'rgba(217,119,6,0.07)',
              border: '1px solid rgba(217,119,6,0.25)',
              borderRadius: 8,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <span style={{ color: '#92400e', fontSize: 13 }}>
              📅 These dates have passed — did you go?
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => onMarkDone && onMarkDone(entry.id)}
                style={{
                  background: '#5c7a3e', color: '#fff',
                  border: 'none', borderRadius: 6,
                  padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}
              >
                ✓ We went!
              </button>
              <button
                onClick={() => setShowReschedule(true)}
                style={{
                  background: 'transparent', color: '#92400e',
                  border: '1px solid rgba(217,119,6,0.4)', borderRadius: 6,
                  padding: '5px 12px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                }}
              >
                📅 Reschedule
              </button>
            </div>
          </div>
        )}

        {/* ── Inline date picker for reschedule ── */}
        {stale && showReschedule && (
          <div
            onClick={e => e.stopPropagation()}
            style={{
              marginTop: 14,
              background: 'rgba(217,119,6,0.07)',
              border: '1px solid rgba(217,119,6,0.25)',
              borderRadius: 8,
              padding: '12px 14px',
            }}
          >
            <div style={{ color: '#92400e', fontSize: 13, fontWeight: 500, marginBottom: 10 }}>
              Pick new dates
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              <div>
                <div style={{ color: '#9c8b6e', fontSize: 11, marginBottom: 4 }}>Start</div>
                <input
                  type="date"
                  min={today}
                  value={newStart}
                  onChange={e => setNewStart(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', fontSize: 13, boxSizing: 'border-box', colorScheme: 'light' }}
                />
              </div>
              <div>
                <div style={{ color: '#9c8b6e', fontSize: 11, marginBottom: 4 }}>End</div>
                <input
                  type="date"
                  min={newStart || today}
                  value={newEnd}
                  onChange={e => setNewEnd(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', fontSize: 13, boxSizing: 'border-box', colorScheme: 'light' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleRescheduleConfirm}
                disabled={!newStart}
                style={{
                  background: newStart ? '#5c7a3e' : '#c8bc96', color: '#fff',
                  border: 'none', borderRadius: 6,
                  padding: '6px 14px', fontSize: 12, fontWeight: 600,
                  cursor: newStart ? 'pointer' : 'default',
                }}
              >
                Save new dates
              </button>
              <button
                onClick={() => setShowReschedule(false)}
                style={{ background: 'none', border: 'none', color: '#9c8b6e', fontSize: 12, cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status, stale }) {
  if (status === 'done') return <span className="pill pill-green" style={{ fontSize: 11 }}>✓ Done</span>;
  if (stale) return <span className="pill" style={{ fontSize: 11, background: 'rgba(217,119,6,0.1)', color: '#92400e', border: '1px solid rgba(217,119,6,0.25)' }}>⏰ Past</span>;
  return <span className="pill pill-slate" style={{ fontSize: 11 }}>Planned</span>;
}

function Chip({ children, muted }) {
  return (
    <span style={{ color: muted ? '#b8aa88' : '#9c8b6e', fontSize: 12 }}>
      {children}
    </span>
  );
}

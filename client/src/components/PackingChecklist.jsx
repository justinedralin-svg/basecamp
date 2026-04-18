import { useState } from 'react';

// Parse legacy packingNotes text into items (fallback for old trips)
function parsePackingNotes(notes) {
  if (!notes) return [];
  return notes
    .split(/\n+/)
    .map(line => line.replace(/^[-•*·\d.)]\s*/, '').trim())
    .filter(line => line.length > 4 && !line.match(/^(pack|gear|equipment|items|bring)/i));
}

export default function PackingChecklist({ trip, checked = [], onCheckedChange }) {
  const [expanded, setExpanded] = useState(false);

  // Use structured items if available, fall back to parsing notes
  const items = trip?.packingItems?.length
    ? trip.packingItems
    : parsePackingNotes(trip?.packingNotes);

  if (!items.length) return null;

  const checkedSet = new Set(checked);
  const doneCount = checked.length;
  const allDone = doneCount === items.length;

  function toggle(idx) {
    const next = new Set(checkedSet);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    onCheckedChange([...next]);
  }

  function clearAll() {
    onCheckedChange([]);
  }

  return (
    <div className="card" style={{ padding: 20, marginBottom: 12 }}>
      {/* Header */}
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: expanded ? 14 : 0, cursor: 'pointer' }}
        onClick={() => setExpanded(v => !v)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🎒</span>
          <h3 style={{ color: '#2c2416', fontSize: 15, fontWeight: 600, margin: 0 }}>Pack list</h3>
          <span style={{
            background: allDone ? 'rgba(45,106,45,0.12)' : 'rgba(100,80,40,0.08)',
            color: allDone ? '#2d6a2d' : '#9c8b6e',
            fontSize: 11, fontWeight: 600,
            padding: '2px 8px', borderRadius: 999,
          }}>
            {doneCount}/{items.length}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {doneCount > 0 && (
            <button
              onClick={e => { e.stopPropagation(); clearAll(); }}
              style={{ background: 'none', border: 'none', color: '#b8aa88', fontSize: 11, cursor: 'pointer', padding: 0 }}
            >
              Reset
            </button>
          )}
          <span style={{ color: '#9c8b6e', fontSize: 13 }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div>
          {items.map((item, idx) => {
            const done = checkedSet.has(idx);
            return (
              <div
                key={idx}
                onClick={() => toggle(idx)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '8px 0',
                  borderBottom: idx < items.length - 1 ? '1px solid #f0e8d8' : 'none',
                  cursor: 'pointer',
                  transition: 'opacity 0.15s',
                  opacity: done ? 0.5 : 1,
                }}
              >
                {/* Checkbox */}
                <div style={{
                  width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
                  border: `2px solid ${done ? '#5c7a3e' : '#c8bc96'}`,
                  background: done ? '#5c7a3e' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.12s',
                }}>
                  {done && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="#faf7f0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>

                {/* Text */}
                <span style={{
                  color: done ? '#b8aa88' : '#3d3020',
                  fontSize: 13,
                  lineHeight: 1.5,
                  textDecoration: done ? 'line-through' : 'none',
                  flex: 1,
                }}>
                  {item}
                </span>
              </div>
            );
          })}

          {allDone && (
            <div style={{
              marginTop: 12, textAlign: 'center',
              color: '#5c7a3e', fontSize: 13, fontWeight: 500,
            }}>
              ✓ All packed — have a great trip!
            </div>
          )}
        </div>
      )}
    </div>
  );
}

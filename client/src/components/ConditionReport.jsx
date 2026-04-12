import { useState } from 'react';

const TRAIL_CONDITIONS = [
  { value: 'great', label: '🟢 Great', desc: 'Well maintained, no issues' },
  { value: 'ok', label: '🟡 OK', desc: 'Passable, some wear' },
  { value: 'rough', label: '🔴 Rough', desc: 'Damaged, overgrown, or hazardous' },
];

const CLEANLINESS = [
  { value: 'clean', label: '✨ Clean', desc: 'Site was in great shape' },
  { value: 'some', label: '🗑️ Some trash', desc: 'A bit of litter around' },
  { value: 'trashed', label: '❌ Trashed', desc: 'Significant mess left by others' },
];

const LNT_ITEMS = [
  'Packed out all trash (including micro-trash)',
  'Left the campsite cleaner than we found it',
  'Kept dogs on leash in required areas',
  'Disposed of waste properly (cat holes / pack out)',
  'Respected wildlife and kept dogs from chasing',
  'Stayed on designated trails and camp spots',
];

export default function ConditionReport({ report = {}, onChange, readOnly = false }) {
  const [expanded, setExpanded] = useState(!readOnly || Object.keys(report).length > 0);

  const set = (key, val) => onChange && onChange({ ...report, [key]: val });

  const toggleLnt = (item) => {
    const current = report.lnt || [];
    const next = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item];
    set('lnt', next);
  };

  const filledCount = [
    report.trailCondition,
    report.cleanliness,
    report.packedOut !== undefined,
    (report.lnt || []).length > 0,
  ].filter(Boolean).length;

  const isComplete = filledCount >= 3;

  return (
    <div className="card" style={{ padding: 20, marginBottom: 12 }}>
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          background: 'none', border: 'none', padding: 0, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', marginBottom: expanded ? 16 : 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🌿</span>
          <h3 style={{ color: '#2c2416', fontSize: 15, fontWeight: 600, margin: 0 }}>
            Leave it better report
          </h3>
          {isComplete && (
            <span style={{
              background: 'rgba(45,106,45,0.12)', color: '#2d6a2d',
              fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
            }}>
              Filed ✓
            </span>
          )}
        </div>
        <span style={{ color: '#9c8b6e', fontSize: 13 }}>
          {expanded ? '▲' : '▼'}
        </span>
      </button>

      {expanded && (
        <div>
          {/* Trail condition */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: '#6b5c42', fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Trail & site condition
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {TRAIL_CONDITIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => !readOnly && set('trailCondition', opt.value)}
                  title={opt.desc}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: `1.5px solid ${report.trailCondition === opt.value ? '#5c7a3e' : '#d8cfa8'}`,
                    background: report.trailCondition === opt.value ? 'rgba(92,122,62,0.10)' : '#faf7f0',
                    color: report.trailCondition === opt.value ? '#3a5a28' : '#6b5c42',
                    fontSize: 13,
                    fontWeight: report.trailCondition === opt.value ? 600 : 400,
                    cursor: readOnly ? 'default' : 'pointer',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cleanliness */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: '#6b5c42', fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Site cleanliness when you arrived
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CLEANLINESS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => !readOnly && set('cleanliness', opt.value)}
                  title={opt.desc}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: `1.5px solid ${report.cleanliness === opt.value ? '#5c7a3e' : '#d8cfa8'}`,
                    background: report.cleanliness === opt.value ? 'rgba(92,122,62,0.10)' : '#faf7f0',
                    color: report.cleanliness === opt.value ? '#3a5a28' : '#6b5c42',
                    fontSize: 13,
                    fontWeight: report.cleanliness === opt.value ? 600 : 400,
                    cursor: readOnly ? 'default' : 'pointer',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Packed out extra */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: '#6b5c42', fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Did you pack out extra trash?
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ val: true, label: '👍 Yes' }, { val: false, label: '👎 No' }].map(opt => (
                <button
                  key={String(opt.val)}
                  onClick={() => !readOnly && set('packedOut', opt.val)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 8,
                    border: `1.5px solid ${report.packedOut === opt.val ? '#5c7a3e' : '#d8cfa8'}`,
                    background: report.packedOut === opt.val ? 'rgba(92,122,62,0.10)' : '#faf7f0',
                    color: report.packedOut === opt.val ? '#3a5a28' : '#6b5c42',
                    fontSize: 13,
                    fontWeight: report.packedOut === opt.val ? 600 : 400,
                    cursor: readOnly ? 'default' : 'pointer',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* LNT checklist */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: '#6b5c42', fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Leave No Trace principles
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {LNT_ITEMS.map(item => {
                const checked = (report.lnt || []).includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => !readOnly && toggleLnt(item)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      background: 'none', border: 'none', padding: '4px 0',
                      cursor: readOnly ? 'default' : 'pointer', textAlign: 'left',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
                      <rect x="1" y="1" width="16" height="16" rx="4"
                        fill={checked ? '#5c7a3e' : '#faf7f0'}
                        stroke={checked ? '#5c7a3e' : '#c8bc96'}
                        strokeWidth="1.5"
                      />
                      {checked && (
                        <polyline points="4,9 7.5,13 14,5.5"
                          fill="none" stroke="#faf7f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        />
                      )}
                    </svg>
                    <span style={{
                      fontSize: 13,
                      color: checked ? '#3a5a28' : '#6b5c42',
                      textDecoration: checked ? 'none' : 'none',
                      fontWeight: checked ? 500 : 400,
                    }}>
                      {item}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          {!readOnly && (
            <div>
              <div style={{ color: '#6b5c42', fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Anything to flag for future visitors?
              </div>
              <textarea
                value={report.flagNote || ''}
                onChange={e => set('flagNote', e.target.value)}
                placeholder="e.g. Bear box broken at site 4, water source dry, bridge washed out..."
                style={{
                  width: '100%', minHeight: 70, padding: '10px 14px',
                  fontSize: 13, lineHeight: 1.6, resize: 'vertical', boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          {readOnly && report.flagNote && (
            <div style={{
              background: 'rgba(156,139,110,0.10)', borderRadius: 8,
              padding: '10px 14px', fontSize: 13, color: '#6b5c42', marginTop: 4,
            }}>
              📍 {report.flagNote}
            </div>
          )}

          {isComplete && !readOnly && (
            <div style={{
              marginTop: 12, padding: '10px 14px',
              background: 'rgba(45,106,45,0.08)', borderRadius: 8,
              color: '#2d6a2d', fontSize: 13, fontWeight: 500,
            }}>
              🌿 Thanks for leaving it better than you found it.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

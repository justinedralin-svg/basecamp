/**
 * SampleTrip — a hardcoded but realistic trip plan shown on the home page.
 * Lets first-time visitors see exactly what they'll get before committing
 * to filling out a form.
 */
export default function SampleTrip({ onPlan, dogName }) {
  const name = dogName || 'your dog';
  const possessive = dogName ? `${dogName}'s` : "your dog's";

  return (
    <div style={{ marginBottom: 40 }}>
      {/* Section header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 14,
      }}>
        <div style={{ flex: 1, height: 1, background: '#d8cfa8' }} />
        <span style={{ color: '#9c8b6e', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', whiteSpace: 'nowrap' }}>
          Example trip plan
        </span>
        <div style={{ flex: 1, height: 1, background: '#d8cfa8' }} />
      </div>

      {/* Card */}
      <div style={{
        background: '#faf7f0',
        border: '1.5px solid #d8cfa8',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 2px 16px rgba(44,36,22,0.07)',
        position: 'relative',
      }}>
        {/* "Example" ribbon */}
        <div style={{
          position: 'absolute', top: 14, right: -28,
          background: '#5c7a3e', color: '#faf7f0',
          fontSize: 10, fontWeight: 700, letterSpacing: '0.6px',
          padding: '4px 36px',
          transform: 'rotate(45deg)',
          transformOrigin: 'center',
          textTransform: 'uppercase',
          pointerEvents: 'none',
          zIndex: 2,
        }}>
          Example
        </div>

        {/* Hero strip */}
        <div style={{
          background: 'linear-gradient(135deg, #3d5429 0%, #2c3d1a 100%)',
          padding: '20px 20px 16px',
        }}>
          <div style={{ color: '#a2bc82', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', marginBottom: 4 }}>
            EASTERN SIERRA · 4 HRS FROM LA
          </div>
          <h3 style={{ color: '#faf7f0', fontSize: 22, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.4px' }}>
            June Lake Loop
          </h3>
          <p style={{ color: '#c4d9a8', fontSize: 13, margin: '0 0 12px', fontStyle: 'italic' }}>
            Alpine lakes, pine forest, and a creek Huskies dream about
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Pill>🚗 4 hrs from LA</Pill>
            <Pill>🏕️ Free dispersed</Pill>
            <Pill>🌡 Cool all summer</Pill>
          </div>
        </div>

        {/* Dog report */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e8e0ca' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>🐕</span>
            <span style={{ color: '#2c2416', fontSize: 13, fontWeight: 700 }}>
              {possessive} report
            </span>
            <span style={{
              marginLeft: 'auto',
              background: 'rgba(45,106,45,0.1)',
              color: '#2d6a2d',
              fontSize: 11, fontWeight: 700,
              padding: '3px 10px', borderRadius: 999,
            }}>
              Excellent
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <DogStat icon="🏊" label="Swimming" value="June Lake + Cold Creek" good />
            <DogStat icon="🌲" label="Shade" value="Dense pine, all day" good />
            <DogStat icon="🪨" label="Terrain" value="Soft duff, easy on paws" good />
            <DogStat icon="🌡" label="Heat" value="Stays below 72°F at 7,600 ft" good />
          </div>
          <div style={{
            marginTop: 10,
            background: 'rgba(92,122,62,0.08)',
            border: '1px solid rgba(92,122,62,0.2)',
            borderRadius: 7,
            padding: '9px 12px',
          }}>
            <p style={{ color: '#3d3020', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
              <strong style={{ color: '#2c2416' }}>
                {dogName ? `${dogName} will love this. ` : 'Perfect for high-energy dogs. '}
              </strong>
              At 7,600 ft the air stays cool even in July, the creek runs strong through August,
              and there's a full mile of off-leash shoreline at Silver Lake.
            </p>
          </div>
        </div>

        {/* Highlights / watch-outs */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #e8e0ca', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <div style={{ color: '#2d6a2d', fontSize: 11, fontWeight: 700, marginBottom: 7 }}>✓ HIGHLIGHTS</div>
            {['Swim access at June + Silver Lake', 'Off-leash dispersed camping', 'Any rig welcome — paved to site'].map(h => (
              <div key={h} style={{ color: '#3d3020', fontSize: 12, lineHeight: 1.5, paddingBottom: 5, marginBottom: 5, borderBottom: '1px solid #efe7cc' }}>{h}</div>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <div style={{ color: '#b45309', fontSize: 11, fontWeight: 700, marginBottom: 7 }}>⚠ WATCH OUT</div>
            {['Bear box required at site', 'Crowds peak July 4 weekend', 'Bring water — no hookups'].map(w => (
              <div key={w} style={{ color: '#3d3020', fontSize: 12, lineHeight: 1.5, paddingBottom: 5, marginBottom: 5, borderBottom: '1px solid #efe7cc' }}>{w}</div>
            ))}
          </div>
        </div>

        {/* Map placeholder */}
        <div style={{
          background: 'linear-gradient(135deg, #dde8cc 0%, #c8d8aa 100%)',
          height: 90,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 10,
          borderBottom: '1px solid #e8e0ca',
        }}>
          <span style={{ fontSize: 22 }}>🗺️</span>
          <div>
            <div style={{ color: '#3d5429', fontSize: 12, fontWeight: 600 }}>Interactive topo + BLM map</div>
            <div style={{ color: '#6b7a4a', fontSize: 11 }}>Public lands overlay · Google Maps · Gaia GPS export</div>
          </div>
        </div>

        {/* CTA */}
        <div style={{
          padding: '16px 20px',
          background: '#f5f0e4',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, flexWrap: 'wrap',
        }}>
          <p style={{ color: '#6b5c42', fontSize: 13, margin: 0, lineHeight: 1.4, flex: 1, minWidth: 160 }}>
            {dogName
              ? `Get a plan like this built for ${dogName} — free.`
              : 'Get a plan like this for your dog — free.'}
          </p>
          <button
            onClick={onPlan}
            className="btn-primary"
            style={{ padding: '11px 22px', fontSize: 14, whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            Plan {dogName ? `with ${dogName}` : 'my trip'} →
          </button>
        </div>
      </div>
    </div>
  );
}

function Pill({ children }) {
  return (
    <span style={{
      background: 'rgba(255,255,255,0.12)',
      border: '1px solid rgba(255,255,255,0.2)',
      color: '#d4e8b8',
      fontSize: 11, fontWeight: 500,
      padding: '3px 9px', borderRadius: 999,
    }}>
      {children}
    </span>
  );
}

function DogStat({ icon, label, value, good }) {
  return (
    <div style={{
      background: good ? 'rgba(45,106,45,0.06)' : 'rgba(180,83,9,0.06)',
      border: `1px solid ${good ? 'rgba(45,106,45,0.15)' : 'rgba(180,83,9,0.15)'}`,
      borderRadius: 7, padding: '7px 10px',
    }}>
      <div style={{ fontSize: 14, marginBottom: 2 }}>{icon}</div>
      <div style={{ color: '#9c8b6e', fontSize: 10, fontWeight: 600 }}>{label.toUpperCase()}</div>
      <div style={{ color: '#2c2416', fontSize: 12, fontWeight: 500, marginTop: 2, lineHeight: 1.3 }}>{value}</div>
    </div>
  );
}

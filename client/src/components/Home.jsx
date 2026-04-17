import TripCard from './TripCard.jsx';
import SampleTrip from './SampleTrip.jsx';

const STEPS = [
  { icon: '👤', label: 'Add your dog', desc: 'Name, breed, size — personalizes everything' },
  { icon: '🗺️', label: 'Plan a trip', desc: 'Get dog-friendly spots that actually fit your rig' },
  { icon: '🌿', label: 'Leave it better', desc: 'File a condition report when you get back' },
];

export default function Home({ trips, onStartPlan, onSurpriseMe, onViewLog, onViewTrip, onNavProfile, dogName, dogNames }) {
  const recent = trips.slice(0, 3);
  const isFirstTime = !dogName && trips.length === 0;

  return (
    <div className="fade-in">

      {/* First-time onboarding */}
      {isFirstTime ? (
        <div style={{ padding: '32px 0 32px' }}>
          {/* Hook headline */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🐾</div>
            <h1 style={{ color: '#2c2416', fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 8, lineHeight: 1.2 }}>
              Stop Googling<br /><span style={{ color: '#5c7a3e' }}>"dog-friendly camping near me"</span>
            </h1>
            <p style={{ color: '#9c8b6e', fontSize: 14, maxWidth: 360, margin: '0 auto', lineHeight: 1.7 }}>
              Tell us your dog, your rig, your dates — get a full trip plan with maps, safety info, and a dog report. Free.
            </p>
          </div>

          {/* Social proof */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 0,
            marginBottom: 28,
            background: '#faf7f0',
            border: '1px solid #d8cfa8',
            borderRadius: 12,
            overflow: 'hidden',
          }}>
            {[
              { num: '3,200+', label: 'trips planned' },
              { num: '48', label: 'states covered' },
              { num: '100%', label: 'free to use' },
            ].map((s, i) => (
              <div key={s.label} style={{
                flex: 1, textAlign: 'center',
                padding: '14px 8px',
                borderRight: i < 2 ? '1px solid #d8cfa8' : 'none',
              }}>
                <div style={{ color: '#5c7a3e', fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' }}>{s.num}</div>
                <div style={{ color: '#9c8b6e', fontSize: 11, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* CTAs — above the fold before sample trips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
            <button
              onClick={onStartPlan}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: 15 }}
            >
              🗺️ Plan my first trip →
            </button>
            <button
              onClick={onSurpriseMe}
              style={{
                width: '100%', padding: '12px', fontSize: 14,
                background: '#faf7f0',
                border: '1.5px solid #d8cfa8',
                borderRadius: 10, cursor: 'pointer',
                color: '#5c7a3e', fontWeight: 600,
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#5c7a3e'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#d8cfa8'}
            >
              🎲 Surprise me — just pick something great
            </button>
            <button
              onClick={onNavProfile}
              style={{ background: 'none', border: 'none', color: '#9c8b6e', fontSize: 13, cursor: 'pointer', padding: '6px', textDecoration: 'underline' }}
            >
              Add your dog first for better results
            </button>
          </div>

          {/* Sample trip — the money shot */}
          <SampleTrip onPlan={onStartPlan} dogName={dogName} />

          {/* Steps — below the example, as secondary info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {STEPS.map((s, i) => (
              <div key={s.label} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(92,122,62,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ color: '#9c8b6e', fontSize: 10, fontWeight: 600, marginBottom: 1 }}>STEP {i + 1}</div>
                  <div style={{ color: '#2c2416', fontWeight: 600, fontSize: 13 }}>{s.label}</div>
                  <div style={{ color: '#9c8b6e', fontSize: 12 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Returning user hero */}
          <div style={{ padding: '48px 0 40px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🐾</div>
            <h1 style={{ color: '#2c2416', fontSize: 36, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 12, lineHeight: 1.2 }}>
              {dogName ? `Is this trip right for ${dogName}?` : 'Is this trip going to'}
              {!dogName && <><br /><span style={{ color: '#5c7a3e' }}>actually work?</span></>}
              {dogName && <><br /><span style={{ color: '#5c7a3e' }}>Let's find out.</span></>}
            </h1>
            <p style={{ color: '#9c8b6e', fontSize: 16, maxWidth: 440, margin: '0 auto 32px', lineHeight: 1.6 }}>
              {dogNames
                ? `Plan a dog-friendly camping trip for you and ${dogNames}. Safety info, maps, packing list — all in one place.`
                : 'Tell us your rig, your dogs, and what you\'re after. Get a trip that actually fits — not just a list of campgrounds.'}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={onStartPlan} className="btn-primary" style={{ padding: '14px 28px', fontSize: 15 }}>
                {dogName ? `Plan a trip with ${dogName} →` : 'Plan a Trip →'}
              </button>
              <button
                onClick={onSurpriseMe}
                style={{
                  padding: '14px 20px', fontSize: 15,
                  background: '#faf7f0',
                  border: '1.5px solid #d8cfa8',
                  borderRadius: 10, cursor: 'pointer',
                  color: '#5c7a3e', fontWeight: 600,
                }}
              >
                🎲 Surprise me
              </button>
            </div>
          </div>

          {/* Social proof strip — slim version for returning users */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 20,
            marginBottom: 40, flexWrap: 'wrap',
          }}>
            {['3,200+ trips planned', '48 states covered', '100% free'].map(s => (
              <span key={s} style={{ color: '#9c8b6e', fontSize: 13 }}>
                <span style={{ color: '#5c7a3e', fontWeight: 600 }}>✓</span> {s}
              </span>
            ))}
          </div>

          {/* What makes it different */}
          <div className="grid-3" style={{ marginBottom: 48 }}>
            {[
              { icon: '🐕', title: 'Dog-first', desc: 'Swimming access, shade, heat index — not just "leashes allowed"' },
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
                <button onClick={onViewLog} style={{ background: 'none', border: 'none', color: '#5c7a3e', fontSize: 14, cursor: 'pointer', fontWeight: 500 }}>
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
            <SampleTrip onPlan={onStartPlan} dogName={dogName} />
          )}
        </>
      )}
    </div>
  );
}

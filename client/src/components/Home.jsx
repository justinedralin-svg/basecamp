import { useState } from 'react';
import TripCard from './TripCard.jsx';
import SampleTrip from './SampleTrip.jsx';


export default function Home({ trips, onStartPlan, onSurpriseMe, onViewLog, onViewTrip, onNavProfile, dogName, dogNames }) {
  const recent = trips.slice(0, 3);
  const isFirstTime = !dogName && trips.length === 0;
  const [surpriseLocation, setSurpriseLocation] = useState('');

  return (
    <div className="fade-in">

      {/* First-time onboarding */}
      {isFirstTime ? (
        <div style={{ padding: '24px 0 32px' }}>

          {/* Headline — short, out of the way */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <h1 style={{ color: '#2c2416', fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 8, lineHeight: 1.2 }}>
              AI trip planning built<br /><span style={{ color: '#5c7a3e' }}>for your dog</span>
            </h1>
            {/* Honest trust signals — no made-up stats */}
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 16px' }}>
              {['Free', 'No account needed', 'Takes 2 minutes'].map(s => (
                <span key={s} style={{ color: '#9c8b6e', fontSize: 13 }}>
                  <span style={{ color: '#5c7a3e' }}>✓</span> {s}
                </span>
              ))}
            </div>
          </div>

          {/* Sample trip FIRST — let the output sell itself */}
          <SampleTrip onPlan={onStartPlan} dogName={dogName} />

          {/* Surprise Me */}
          <div style={{
            background: 'rgba(92,122,62,0.05)',
            border: '1px solid rgba(92,122,62,0.2)',
            borderRadius: 12,
            padding: '16px',
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#5c7a3e', marginBottom: 4 }}>🎲 Just surprise me</div>
            <div style={{ fontSize: 12, color: '#9c8b6e', marginBottom: 12, lineHeight: 1.5 }}>
              Tell us where you're coming from and we'll pick a great spot for next weekend.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={surpriseLocation}
                onChange={e => setSurpriseLocation(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && surpriseLocation.trim() && onSurpriseMe(surpriseLocation.trim())}
                placeholder="Your city or zip code"
                style={{
                  flex: 1, padding: '9px 12px', fontSize: 14,
                  borderRadius: 8, border: '1px solid #c8bc96',
                  background: '#faf7f0', color: '#2c2416', outline: 'none',
                }}
              />
              <button
                onClick={() => surpriseLocation.trim() && onSurpriseMe(surpriseLocation.trim())}
                disabled={!surpriseLocation.trim()}
                style={{
                  padding: '9px 16px', fontSize: 14, fontWeight: 600,
                  background: surpriseLocation.trim() ? '#5c7a3e' : '#c8bc96',
                  border: 'none', borderRadius: 8, cursor: surpriseLocation.trim() ? 'pointer' : 'default',
                  color: '#fff', whiteSpace: 'nowrap',
                  transition: 'background 0.15s',
                }}
              >
                Go →
              </button>
            </div>
          </div>

          <button
            onClick={onNavProfile}
            style={{ background: 'none', border: 'none', color: '#9c8b6e', fontSize: 13, cursor: 'pointer', padding: '4px', textDecoration: 'underline', display: 'block', margin: '0 auto' }}
          >
            Add your dog first for better results
          </button>
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

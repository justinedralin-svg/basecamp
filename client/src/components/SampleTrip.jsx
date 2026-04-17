import { useState } from 'react';

const TRIPS = [
  {
    id: 'sierra',
    tab: '⛰️ Mountains',
    region: 'EASTERN SIERRA · 4 HRS FROM LA',
    destination: 'June Lake Loop',
    tagline: 'Alpine lakes, pine forest, and a creek Huskies dream about',
    pills: ['🚗 4 hrs from LA', '🏕️ Free dispersed', '🌡 Cool all summer'],
    dogRating: 'Excellent',
    dogNote: (dog) => `At 7,600 ft the air stays cool even in July, the creek runs strong through August, and there's a mile of off-leash shoreline at Silver Lake.`,
    stats: [
      { icon: '🏊', label: 'Swimming', value: 'June Lake + Cold Creek' },
      { icon: '🌲', label: 'Shade', value: 'Dense pine, all day' },
      { icon: '🪨', label: 'Terrain', value: 'Soft duff, easy on paws' },
      { icon: '🌡', label: 'Heat', value: 'Stays below 72°F at 7,600 ft' },
    ],
    highlights: ['Swim access at June + Silver Lake', 'Off-leash dispersed camping', 'Any rig welcome — paved to site'],
    watchOuts: ['Bear box required at site', 'Crowds peak July 4 weekend', 'Bring water — no hookups'],
    mapDesc: 'Interactive topo + BLM map',
    mapSub: 'Public lands overlay · Google Maps · Gaia GPS export',
  },
  {
    id: 'coast',
    tab: '🌊 Coast',
    region: 'OLYMPIC PENINSULA · 3 HRS FROM SEATTLE',
    destination: 'Hoh Rain Forest Corridor',
    tagline: 'Mossy old-growth, river bars, and zero crowds past the trailhead',
    pills: ['🚗 3 hrs from Seattle', '🌧 Green all year', '🐾 River access'],
    dogRating: 'Excellent',
    dogNote: (dog) => `The Hoh River has wide gravel bars perfect for off-leash runs. Water temp stays cool year-round — great for retrievers and water-loving breeds.`,
    stats: [
      { icon: '🏊', label: 'Swimming', value: 'Hoh River gravel bars' },
      { icon: '🌲', label: 'Shade', value: '100% canopy — stays cool' },
      { icon: '🪨', label: 'Terrain', value: 'Soft forest floor, flat' },
      { icon: '🌡', label: 'Heat', value: 'Never above 65°F, rain likely' },
    ],
    highlights: ['River bars for off-leash runs', 'Free dispersed on Forest Service land', 'Elk sightings most mornings'],
    watchOuts: ['Pack rain gear — always', 'Muddy roads after rain (high clearance helps)', 'Roosevelt elk can spook dogs'],
    mapDesc: 'Forest Service road overlay',
    mapSub: 'MVUM roads · dispersed camping zones · offline GPX',
  },
  {
    id: 'desert',
    tab: '🌵 Desert',
    region: 'WEST TEXAS · 3 HRS FROM EL PASO',
    destination: 'Terlingua Ranch — Big Bend Area',
    tagline: 'Dark skies, canyon views, and a surprising number of creek crossings',
    pills: ['🌌 Best dark skies in Texas', '🏕️ Free dispersed', '🐕 Dog-friendly'],
    dogRating: 'Good',
    dogNote: (dog) => `Desert heat is a real factor — plan hikes before 9 AM or after 5 PM. The Terlingua Creek has shaded pools even in summer. Paw protection on rocky basalt recommended.`,
    stats: [
      { icon: '🏊', label: 'Swimming', value: 'Terlingua Creek pools' },
      { icon: '☀️', label: 'Shade', value: 'Limited — bring shade structure' },
      { icon: '🪨', label: 'Terrain', value: 'Basalt & caliche — boot paws' },
      { icon: '🌡', label: 'Heat', value: 'Hot midday — plan early starts' },
    ],
    highlights: ['Darkest skies in the lower 48', 'Free dispersed on ranch land', 'Epic canyon sunsets from camp'],
    watchOuts: ['Bring paw boots for rocky terrain', 'Heat serious above 90°F — no midday hikes', 'Nearest vet is 1.5 hrs away'],
    mapDesc: 'Satellite + terrain overlay',
    mapSub: 'BLM land · road conditions · offline GPX for remote areas',
  },
];

export default function SampleTrip({ onPlan, dogName }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const trip = TRIPS[activeIdx];
  const possessive = dogName ? `${dogName}'s` : "your dog's";

  return (
    <div style={{ marginBottom: 40 }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, height: 1, background: '#d8cfa8' }} />
        <span style={{ color: '#9c8b6e', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', whiteSpace: 'nowrap' }}>
          Example trip plans
        </span>
        <div style={{ flex: 1, height: 1, background: '#d8cfa8' }} />
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {TRIPS.map((t, i) => (
          <button
            key={t.id}
            onClick={() => setActiveIdx(i)}
            style={{
              flex: 1,
              padding: '8px 4px',
              fontSize: 12,
              fontWeight: activeIdx === i ? 700 : 500,
              background: activeIdx === i ? '#5c7a3e' : '#faf7f0',
              color: activeIdx === i ? '#faf7f0' : '#9c8b6e',
              border: `1.5px solid ${activeIdx === i ? '#5c7a3e' : '#d8cfa8'}`,
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {t.tab}
          </button>
        ))}
      </div>

      {/* Card */}
      <div
        key={trip.id}
        className="fade-in"
        style={{
          background: '#faf7f0',
          border: '1.5px solid #d8cfa8',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 2px 16px rgba(44,36,22,0.07)',
          position: 'relative',
        }}
      >
        {/* "Example" ribbon */}
        <div style={{
          position: 'absolute', top: 14, right: -28,
          background: '#9c8b6e', color: '#faf7f0',
          fontSize: 10, fontWeight: 700, letterSpacing: '0.5px',
          padding: '4px 36px',
          transform: 'rotate(45deg)',
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
            {trip.region}
          </div>
          <h3 style={{ color: '#faf7f0', fontSize: 20, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.3px' }}>
            {trip.destination}
          </h3>
          <p style={{ color: '#c4d9a8', fontSize: 13, margin: '0 0 12px', fontStyle: 'italic' }}>
            {trip.tagline}
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {trip.pills.map(p => <Pill key={p}>{p}</Pill>)}
          </div>
        </div>

        {/* Dog report */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e8e0ca' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>🐕</span>
            <span style={{ color: '#2c2416', fontSize: 13, fontWeight: 700 }}>{possessive} report</span>
            <span style={{
              marginLeft: 'auto',
              background: trip.dogRating === 'Excellent' ? 'rgba(45,106,45,0.1)' : 'rgba(180,83,9,0.1)',
              color: trip.dogRating === 'Excellent' ? '#2d6a2d' : '#b45309',
              fontSize: 11, fontWeight: 700,
              padding: '3px 10px', borderRadius: 999,
            }}>
              {trip.dogRating}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {trip.stats.map(s => (
              <DogStat key={s.label} icon={s.icon} label={s.label} value={s.value} />
            ))}
          </div>

          <div style={{
            marginTop: 10,
            background: 'rgba(92,122,62,0.08)',
            border: '1px solid rgba(92,122,62,0.2)',
            borderRadius: 7,
            padding: '9px 12px',
          }}>
            <p style={{ color: '#3d3020', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
              {trip.dogNote(dogName)}
            </p>
          </div>
        </div>

        {/* Highlights / watch-outs */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #e8e0ca', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <div style={{ color: '#2d6a2d', fontSize: 11, fontWeight: 700, marginBottom: 7 }}>✓ HIGHLIGHTS</div>
            {trip.highlights.map((h, i) => (
              <div key={h} style={{ color: '#3d3020', fontSize: 12, lineHeight: 1.5, paddingBottom: 5, marginBottom: i < trip.highlights.length - 1 ? 5 : 0, borderBottom: i < trip.highlights.length - 1 ? '1px solid #efe7cc' : 'none' }}>{h}</div>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <div style={{ color: '#b45309', fontSize: 11, fontWeight: 700, marginBottom: 7 }}>⚠ WATCH OUT</div>
            {trip.watchOuts.map((w, i) => (
              <div key={w} style={{ color: '#3d3020', fontSize: 12, lineHeight: 1.5, paddingBottom: 5, marginBottom: i < trip.watchOuts.length - 1 ? 5 : 0, borderBottom: i < trip.watchOuts.length - 1 ? '1px solid #efe7cc' : 'none' }}>{w}</div>
            ))}
          </div>
        </div>

        {/* Map placeholder */}
        <div style={{
          background: 'linear-gradient(135deg, #dde8cc 0%, #c8d8aa 100%)',
          height: 80,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 10,
          borderBottom: '1px solid #e8e0ca',
        }}>
          <span style={{ fontSize: 20 }}>🗺️</span>
          <div>
            <div style={{ color: '#3d5429', fontSize: 12, fontWeight: 600 }}>{trip.mapDesc}</div>
            <div style={{ color: '#6b7a4a', fontSize: 11 }}>{trip.mapSub}</div>
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
              ? `Get a plan like this built around ${dogName}.`
              : 'Get a plan like this tailored to your dog.'}
            {' '}<span style={{ color: '#9c8b6e' }}>Free.</span>
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

function DogStat({ icon, label, value }) {
  return (
    <div style={{
      background: 'rgba(92,122,62,0.06)',
      border: '1px solid rgba(92,122,62,0.14)',
      borderRadius: 7, padding: '7px 10px',
    }}>
      <div style={{ fontSize: 14, marginBottom: 2 }}>{icon}</div>
      <div style={{ color: '#9c8b6e', fontSize: 10, fontWeight: 600 }}>{label.toUpperCase()}</div>
      <div style={{ color: '#2c2416', fontSize: 12, fontWeight: 500, marginTop: 2, lineHeight: 1.3 }}>{value}</div>
    </div>
  );
}

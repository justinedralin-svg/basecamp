import { useState, useEffect } from 'react';
import { loadProfile } from './ProfileForm.jsx';
import { getDogName } from '../utils/profile.js';
import { trackEvent } from '../utils/analytics.js';

const ACTIVITIES = ['🥾 Hiking', '🏊 Swimming', '🎣 Fishing', '🧗 Climbing', '🚵 Mountain biking', '📷 Photography', '🌌 Stargazing', '😌 Just vibing'];
const RIG_TYPES = ['Subaru Outback', 'Subaru Forester', 'Toyota 4Runner', 'Toyota Tacoma', 'Toyota Tundra', 'Jeep Wrangler', 'Ford Bronco', 'Sprinter Van', 'Ford F-150', 'Other'];
const CAMPING_STYLES = ['Rooftop tent', 'Ground tent', 'Truck bed / sleeping platform', 'Van / car camping', 'Hammock'];
const ROAD_EXPERIENCE = ['Paved / smooth dirt only', 'Moderate dirt roads (stock is fine)', 'Technical roads (comfortable airing down)', 'I\'ll go anywhere'];
const DRIVE_DISTANCES = ['Up to 2 hours', '2–3 hours', '3–4 hours', '4–5 hours', 'Willing to drive far'];
const DOG_SIZES = ['Small (under 25 lbs)', 'Medium (25–60 lbs)', 'Large (60–100 lbs)', 'XL (100+ lbs)'];

const RAIN_OPTIONS = [
  { label: "Don't care", val: null },
  { label: 'Showers OK (<50%)', val: 50 },
  { label: 'Prefer dry (<30%)', val: 30 },
  { label: 'No rain (<10%)', val: 10 },
];

const ENERGY_LEVELS = [
  { val: 'chill',       emoji: '🌿', label: 'Chill',       desc: 'Easy road, relaxed camp, low miles' },
  { val: 'adventurous', emoji: '🏔️', label: 'Adventurous', desc: 'Good hiking, some dirt road, real scenery' },
  { val: 'epic',        emoji: '⚡', label: 'Epic',        desc: 'Push it — technical terrain, big miles' },
];

const CAMPSITE_TYPES = [
  { val: 'dispersed', label: '🌲 Dispersed / free' },
  { val: 'established', label: '🏕️ Established / reserved' },
  { val: 'any', label: '🤷 No preference' },
];

const DEFAULT_FORM = {
  startingLocation: 'Berkeley, CA',
  tripStartDate: '',
  tripEndDate: '',
  tripDates: '',
  tripLength: '',
  rigType: '',
  rigTypeCustom: '',
  campingStyle: '',
  roadExperience: '',
  hasDogs: true,
  dogs: [{ name: '', breed: '', size: 'Large (60–100 lbs)' }],
  activities: [],
  driveDistance: '2–3 hours',
  energyLevel: 'adventurous',
  campsiteType: 'any',
  weatherPrefs: { maxRainChance: null, minTempF: '', maxTempF: '', avoidWind: false },
  vibe: '',
};

function buildInitialForm(prefill) {
  const profile = loadProfile();
  const profileDefaults = profile ? {
    startingLocation: profile.startingLocation || DEFAULT_FORM.startingLocation,
    rigType: profile.rigType || DEFAULT_FORM.rigType,
    rigTypeCustom: profile.rigTypeCustom || DEFAULT_FORM.rigTypeCustom,
    campingStyle: profile.campingStyle || DEFAULT_FORM.campingStyle,
    roadExperience: profile.roadExperience || DEFAULT_FORM.roadExperience,
    driveDistance: profile.driveDistance || DEFAULT_FORM.driveDistance,
    hasDogs: profile.hasDogs ?? DEFAULT_FORM.hasDogs,
    dogs: profile.dogs?.length ? profile.dogs : DEFAULT_FORM.dogs,
  } : {};

  return { ...DEFAULT_FORM, ...profileDefaults, ...(prefill || {}) };
}

function getLoadingMessages() {
  const name = getDogName(null);
  return [
    'Sniffing out the perfect spot…',
    'Checking fire danger and weather…',
    'Finding dog-friendly trails nearby…',
    'Consulting the paw oracle…',
    'Scouting dispersed sites off the beaten path…',
    'Making sure there\'s a swimming hole…',
    name ? `Checking if ${name} will approve…` : 'Checking if your pup will approve…',
  ];
}

// Format two date strings into a human-readable range and night count
function formatDates(start, end) {
  if (!start) return { tripDates: '', tripLength: '' };
  const s = new Date(start + 'T12:00:00');
  const e = end ? new Date(end + 'T12:00:00') : null;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const fmt = d => `${months[d.getMonth()]} ${d.getDate()}`;
  if (!e || start === end) {
    return { tripDates: fmt(s), tripLength: '1 day' };
  }
  const nights = Math.round((e - s) / (1000 * 60 * 60 * 24));
  const tripDates = s.getMonth() === e.getMonth()
    ? `${fmt(s)}–${e.getDate()}, ${s.getFullYear()}`
    : `${fmt(s)} – ${fmt(e)}, ${s.getFullYear()}`;
  return { tripDates, tripLength: `${nights} night${nights !== 1 ? 's' : ''}` };
}

// Summarize rig for the collapsed view
function rigSummary(form) {
  const parts = [];
  const rig = form.rigType === 'Other' ? form.rigTypeCustom : form.rigType;
  if (rig) parts.push(rig);
  if (form.campingStyle) parts.push(form.campingStyle);
  if (form.roadExperience) parts.push(form.roadExperience);
  return parts.join(' · ') || null;
}

// Summarize dogs for the collapsed view
function dogSummary(dogs) {
  if (!dogs || dogs.length === 0) return null;
  return dogs.map(d => {
    const parts = [d.name, d.breed].filter(Boolean);
    if (d.size) parts.push(d.size.split(' ')[0]); // just "Large"
    return parts.join(' ') || 'Dog';
  }).join(', ');
}

export default function PlanForm({ onComplete, onBack, prefill, onClearPrefill }) {
  const LOADING_MESSAGES = getLoadingMessages();
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [error, setError] = useState(null);
  const [rigExpanded, setRigExpanded] = useState(false);
  const [dogsExpanded, setDogsExpanded] = useState(false);
  const [weatherExpanded, setWeatherExpanded] = useState(false);
  const profile = loadProfile();
  const [form, setForm] = useState(() => buildInitialForm(prefill));

  // Auto-expand rig/dogs if profile is missing key fields
  useEffect(() => {
    if (!profile || !profile.rigType) setRigExpanded(true);
    if (!profile || !profile.dogs?.length) setDogsExpanded(true);
  }, []);

  useEffect(() => {
    if (prefill) {
      setForm(buildInitialForm(prefill));
      setRigExpanded(true);
      setDogsExpanded(true);
      onClearPrefill?.();
    }
  }, [prefill]);

  function set(key, val) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  function setDates(startDate, endDate) {
    const { tripDates, tripLength } = formatDates(startDate, endDate);
    setForm(prev => ({ ...prev, tripStartDate: startDate, tripEndDate: endDate, tripDates, tripLength }));
  }

  function toggleActivity(act) {
    setForm(prev => ({
      ...prev,
      activities: prev.activities.includes(act)
        ? prev.activities.filter(a => a !== act)
        : [...prev.activities, act],
    }));
  }

  function updateDog(idx, key, val) {
    setForm(prev => {
      const dogs = [...prev.dogs];
      dogs[idx] = { ...dogs[idx], [key]: val };
      return { ...prev, dogs };
    });
  }

  function addDog() {
    setForm(prev => ({ ...prev, dogs: [...prev.dogs, { name: '', breed: '', size: 'Large (60–100 lbs)' }] }));
  }

  function removeDog(idx) {
    setForm(prev => ({ ...prev, dogs: prev.dogs.filter((_, i) => i !== idx) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setLoadingMsg(LOADING_MESSAGES[0]);

    let msgIndex = 1;
    const msgInterval = setInterval(() => {
      setLoadingMsg(LOADING_MESSAGES[msgIndex % LOADING_MESSAGES.length]);
      msgIndex++;
    }, 2500);

    const constraints = {
      ...form,
      rigType: form.rigType === 'Other' ? form.rigTypeCustom : form.rigType,
    };

    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ constraints }),
      });

      // Safely parse — if Render times out it returns an HTML page, not JSON
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('The server took too long to respond. Try again — it usually works on the second attempt.');
      }
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      trackEvent('trip_planned');
      onComplete(data.trip, constraints);
    } catch (err) {
      setError(err.message);
    } finally {
      clearInterval(msgInterval);
      setLoading(false);
    }
  }

  const inputStyle = { width: '100%', padding: '10px 14px', fontSize: 15 };
  const labelStyle = { color: '#6b5c42', fontSize: 13, fontWeight: 500, marginBottom: 8, display: 'block' };
  const sectionStyle = { marginBottom: 28 };

  const hasPrefillRig = profile && (profile.rigType || profile.campingStyle);
  const hasPrefillDogs = profile && profile.hasDogs && profile.dogs?.length > 0 && profile.dogs[0].name;
  const rig = rigSummary(form);
  const dogs = dogSummary(form.dogs);

  // Today's date string for min date on picker
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: '#9c8b6e', fontSize: 14, cursor: 'pointer', padding: 0, marginBottom: 16 }}
        >
          ← Back
        </button>
        <h1 style={{ color: '#2c2416', fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', margin: 0 }}>
          {prefill ? 'Re-plan this trip' : 'Plan a trip'}
        </h1>
        <p style={{ color: '#9c8b6e', fontSize: 14, marginTop: 6 }}>
          {prefill ? 'Your previous constraints are pre-filled — tweak anything.' : 'The more you tell me, the more specific I can be.'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>

        {/* ── Starting point ── */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Where are you based?</label>
          <input
            style={inputStyle}
            value={form.startingLocation}
            onChange={e => set('startingLocation', e.target.value)}
            placeholder="Berkeley, CA"
          />
        </div>

        {/* ── Date range picker ── */}
        <div style={sectionStyle}>
          <label style={labelStyle}>When are you going?</label>
          <div className="grid-2" style={{ gap: 10 }}>
            <div>
              <div style={{ color: '#9c8b6e', fontSize: 12, fontWeight: 500, marginBottom: 6 }}>Start date</div>
              <input
                type="date"
                style={{ ...inputStyle, colorScheme: 'light' }}
                value={form.tripStartDate}
                min={today}
                onChange={e => setDates(e.target.value, form.tripEndDate)}
              />
            </div>
            <div>
              <div style={{ color: '#9c8b6e', fontSize: 12, fontWeight: 500, marginBottom: 6 }}>End date</div>
              <input
                type="date"
                style={{ ...inputStyle, colorScheme: 'light' }}
                value={form.tripEndDate}
                min={form.tripStartDate || today}
                onChange={e => setDates(form.tripStartDate, e.target.value)}
              />
            </div>
          </div>
          {form.tripDates && (
            <div style={{ marginTop: 8, color: '#5c7a3e', fontSize: 13, fontWeight: 500 }}>
              📅 {form.tripDates} · {form.tripLength}
            </div>
          )}
        </div>

        {/* ── Energy level ── */}
        <div style={sectionStyle}>
          <label style={labelStyle}>What's the vibe?</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {ENERGY_LEVELS.map(lvl => (
              <button
                type="button"
                key={lvl.val}
                onClick={() => set('energyLevel', lvl.val)}
                style={{
                  border: `2px solid ${form.energyLevel === lvl.val ? '#5c7a3e' : '#d8cfa8'}`,
                  borderRadius: 10,
                  padding: '12px 8px',
                  background: form.energyLevel === lvl.val ? 'rgba(92,122,62,0.08)' : '#faf7f0',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 4 }}>{lvl.emoji}</div>
                <div style={{ color: '#2c2416', fontSize: 13, fontWeight: 600 }}>{lvl.label}</div>
                <div style={{ color: '#9c8b6e', fontSize: 11, marginTop: 2, lineHeight: 1.3 }}>{lvl.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Campsite type ── */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Campsite type</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CAMPSITE_TYPES.map(c => (
              <button
                type="button"
                key={c.val}
                className={`tag-btn${form.campsiteType === c.val ? ' selected' : ''}`}
                onClick={() => set('campsiteType', c.val)}
              >{c.label}</button>
            ))}
          </div>
        </div>

        {/* ── Rig (collapsible if pre-filled) ── */}
        <div style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: rigExpanded ? 12 : 0 }}>
            <label style={{ ...labelStyle, margin: 0 }}>Your rig</label>
            {rig && (
              <button
                type="button"
                onClick={() => setRigExpanded(v => !v)}
                style={{ background: 'none', border: 'none', color: '#5c7a3e', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}
              >
                {rigExpanded ? 'Collapse ↑' : 'Edit ↓'}
              </button>
            )}
          </div>

          {/* Collapsed summary */}
          {!rigExpanded && rig && (
            <div
              onClick={() => setRigExpanded(true)}
              style={{
                background: 'rgba(92,122,62,0.06)', border: '1px solid rgba(92,122,62,0.2)',
                borderRadius: 8, padding: '10px 14px', cursor: 'pointer',
                color: '#3d3020', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <span>🚙</span>
              <span>{rig}</span>
            </div>
          )}

          {/* Expanded rig fields */}
          {rigExpanded && (
            <>
              <div style={{ marginBottom: 16 }}>
                <div style={{ color: '#9c8b6e', fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Vehicle</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {RIG_TYPES.map(r => (
                    <button type="button" key={r} className={`tag-btn${form.rigType === r ? ' selected' : ''}`} onClick={() => set('rigType', r)}>{r}</button>
                  ))}
                </div>
                {form.rigType === 'Other' && (
                  <input style={{ ...inputStyle, marginTop: 10 }} value={form.rigTypeCustom} onChange={e => set('rigTypeCustom', e.target.value)} placeholder="e.g. Chevy Colorado ZR2" />
                )}
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ color: '#9c8b6e', fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Sleeping setup</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {CAMPING_STYLES.map(s => (
                    <button type="button" key={s} className={`tag-btn${form.campingStyle === s ? ' selected' : ''}`} onClick={() => set('campingStyle', s)}>{s}</button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ color: '#9c8b6e', fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Road experience</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {ROAD_EXPERIENCE.map(r => (
                    <button type="button" key={r} className={`tag-btn${form.roadExperience === r ? ' selected' : ''}`} style={{ textAlign: 'left', borderRadius: 8 }} onClick={() => set('roadExperience', r)}>{r}</button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Dogs (collapsible if pre-filled) ── */}
        <div style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <label style={{ ...labelStyle, margin: 0 }}>Dogs coming?</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {form.hasDogs && dogs && (
                <button
                  type="button"
                  onClick={() => setDogsExpanded(v => !v)}
                  style={{ background: 'none', border: 'none', color: '#5c7a3e', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}
                >
                  {dogsExpanded ? 'Collapse ↑' : 'Edit ↓'}
                </button>
              )}
              {[true, false].map(val => (
                <button type="button" key={String(val)} className={`tag-btn${form.hasDogs === val ? ' selected' : ''}`} onClick={() => set('hasDogs', val)}>
                  {val ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
          </div>

          {form.hasDogs && !dogsExpanded && dogs && (
            <div
              onClick={() => setDogsExpanded(true)}
              style={{
                background: 'rgba(92,122,62,0.06)', border: '1px solid rgba(92,122,62,0.2)',
                borderRadius: 8, padding: '10px 14px', cursor: 'pointer',
                color: '#3d3020', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <span>🐾</span>
              <span>{dogs}</span>
            </div>
          )}

          {form.hasDogs && dogsExpanded && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
              {form.dogs.map((dog, idx) => (
                <div key={idx} className="card-inner" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ color: '#6b5c42', fontSize: 13, fontWeight: 500 }}>Dog {idx + 1}</span>
                    {form.dogs.length > 1 && (
                      <button type="button" onClick={() => removeDog(idx)} style={{ background: 'none', border: 'none', color: '#9c8b6e', cursor: 'pointer', fontSize: 13 }}>Remove</button>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <input style={inputStyle} value={dog.name} onChange={e => updateDog(idx, 'name', e.target.value)} placeholder="Name (optional)" />
                    <input style={inputStyle} value={dog.breed} onChange={e => updateDog(idx, 'breed', e.target.value)} placeholder="Breed (e.g. Husky)" />
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {DOG_SIZES.map(s => (
                      <button type="button" key={s} className={`tag-btn${dog.size === s ? ' selected' : ''}`} style={{ fontSize: 13, padding: '5px 12px' }} onClick={() => updateDog(idx, 'size', s)}>{s}</button>
                    ))}
                  </div>
                </div>
              ))}
              <button type="button" onClick={addDog} style={{ background: 'none', border: '1px dashed #c8bc96', borderRadius: 8, color: '#9c8b6e', padding: '10px', fontSize: 14, cursor: 'pointer', textAlign: 'center' }}>
                + Add another dog
              </button>
            </div>
          )}
        </div>

        {/* ── Activities ── */}
        <div style={sectionStyle}>
          <label style={labelStyle}>What do you want to do?</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ACTIVITIES.map(a => (
              <button type="button" key={a} className={`tag-btn${form.activities.includes(a) ? ' selected' : ''}`} onClick={() => toggleActivity(a)}>{a}</button>
            ))}
          </div>
        </div>

        {/* ── Drive distance ── */}
        <div style={sectionStyle}>
          <label style={labelStyle}>How far will you drive from home?</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {DRIVE_DISTANCES.map(d => (
              <button type="button" key={d} className={`tag-btn${form.driveDistance === d ? ' selected' : ''}`} onClick={() => set('driveDistance', d)}>{d}</button>
            ))}
          </div>
        </div>

        {/* ── Weather (collapsible) ── */}
        <div style={sectionStyle}>
          <button
            type="button"
            onClick={() => setWeatherExpanded(v => !v)}
            style={{
              width: '100%', background: 'none', border: '1px solid #d8cfa8',
              borderRadius: 8, padding: '10px 14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              color: '#6b5c42', fontSize: 14,
            }}
          >
            <span>🌤️ Weather preferences <span style={{ color: '#9c8b6e', fontSize: 13 }}>(optional)</span></span>
            <span style={{ color: '#9c8b6e', fontSize: 13 }}>{weatherExpanded ? '↑ Hide' : '↓ Show'}</span>
          </button>

          {weatherExpanded && (
            <div style={{ marginTop: 12, padding: '16px', background: '#faf7f0', border: '1px solid #d8cfa8', borderRadius: 8 }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ color: '#9c8b6e', fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Rain tolerance</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {RAIN_OPTIONS.map(opt => (
                    <button type="button" key={String(opt.val)} className={`tag-btn${form.weatherPrefs.maxRainChance === opt.val ? ' selected' : ''}`} onClick={() => set('weatherPrefs', { ...form.weatherPrefs, maxRainChance: opt.val })}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid-2" style={{ marginBottom: 14 }}>
                <div>
                  <div style={{ color: '#9c8b6e', fontSize: 12, fontWeight: 500, marginBottom: 6 }}>Min low temp (°F)</div>
                  <input type="number" style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} value={form.weatherPrefs.minTempF} onChange={e => set('weatherPrefs', { ...form.weatherPrefs, minTempF: e.target.value })} placeholder="e.g. 40" />
                </div>
                <div>
                  <div style={{ color: '#9c8b6e', fontSize: 12, fontWeight: 500, marginBottom: 6 }}>Max high temp (°F)</div>
                  <input type="number" style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} value={form.weatherPrefs.maxTempF} onChange={e => set('weatherPrefs', { ...form.weatherPrefs, maxTempF: e.target.value })} placeholder="e.g. 90" />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
                <input type="checkbox" checked={form.weatherPrefs.avoidWind} onChange={e => set('weatherPrefs', { ...form.weatherPrefs, avoidWind: e.target.checked })} style={{ width: 16, height: 16, accentColor: '#5c7a3e' }} />
                <span style={{ color: '#6b5c42', fontSize: 13 }}>Avoid high winds (25+ mph)</span>
              </label>
            </div>
          )}
        </div>

        {/* ── Freeform vibe ── */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Anything else? <span style={{ fontWeight: 400, color: '#9c8b6e' }}>(optional)</span></label>
          <textarea
            style={{ ...inputStyle, height: 88, resize: 'vertical', lineHeight: 1.5 }}
            value={form.vibe}
            onChange={e => set('vibe', e.target.value)}
            placeholder="e.g. Want a creek for the dogs, avoid crowds, something with good stargazing..."
          />
        </div>

        {error && (
          <div style={{ background: 'rgba(185,28,28,0.07)', border: '1px solid rgba(185,28,28,0.22)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#b91c1c', fontSize: 14 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
          style={{ width: '100%', padding: '16px', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
        >
          {loading ? (
            <><div className="spinner" />{loadingMsg}</>
          ) : (
            '🐾 Find our next adventure →'
          )}
        </button>
      </form>
    </div>
  );
}

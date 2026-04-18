import { useState, useEffect } from 'react';
import { loadProfile } from './ProfileForm.jsx';
import { getDogName } from '../utils/profile.js';
import { trackEvent } from '../utils/analytics.js';
import RigSearch from './RigSearch.jsx';
import PlanningOverlay from './PlanningOverlay.jsx';

const ACTIVITIES = ['🥾 Hiking', '🏊 Swimming', '🎣 Fishing', '🧗 Climbing', '🚵 Mountain biking', '📷 Photography', '🌌 Stargazing', '😌 Just vibing'];
const CAMPING_STYLES = ['Rooftop tent', 'Ground tent', 'Truck bed / sleeping platform', 'Van / car camping', 'Hammock'];
const ROAD_EXPERIENCE = ['Paved / smooth dirt only', 'Moderate dirt roads (stock is fine)', 'Technical roads (comfortable airing down)', "I'll go anywhere"];
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

// Step definitions
const STEPS = [
  { id: 'when',  label: 'When',   emoji: '📅' },
  { id: 'setup', label: 'Setup',  emoji: '🚙' },
  { id: 'vibe',  label: 'Vibe',   emoji: '🏔️' },
  { id: 'extra', label: 'Extras', emoji: '✨' },
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

// ── Step progress bar ──────────────────────────────────────────────────────
function StepBar({ step }) {
  return (
    <div style={{ marginBottom: 28 }}>
      {/* Step labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        {STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <div key={s.id} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                width: 28, height: 28,
                borderRadius: '50%',
                background: done ? '#5c7a3e' : active ? 'rgba(92,122,62,0.15)' : '#e8e0ca',
                border: active ? '2px solid #5c7a3e' : done ? 'none' : '1.5px solid #d8cfa8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 4px',
                fontSize: done ? 13 : 14,
                color: done ? '#fff' : active ? '#5c7a3e' : '#b8aa88',
                transition: 'all 0.2s',
              }}>
                {done ? '✓' : s.emoji}
              </div>
              <div style={{
                fontSize: 10, fontWeight: active || done ? 600 : 400,
                color: active ? '#5c7a3e' : done ? '#4a6332' : '#b8aa88',
                transition: 'color 0.2s',
              }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Connecting track */}
      <div style={{ height: 3, background: '#e8e0ca', borderRadius: 999, margin: '0 14px' }}>
        <div style={{
          height: '100%',
          width: `${(step / (STEPS.length - 1)) * 100}%`,
          background: 'linear-gradient(90deg, #5c7a3e, #7a9a55)',
          borderRadius: 999,
          transition: 'width 0.35s ease',
        }} />
      </div>
    </div>
  );
}

export default function PlanForm({ onComplete, onBack, prefill, onClearPrefill }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(0); // 0-3
  const [form, setForm] = useState(() => buildInitialForm(prefill));

  useEffect(() => {
    if (prefill) {
      setForm(buildInitialForm(prefill));
      setStep(0);
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

  async function attemptPlan(body) {
    const res = await fetch('/api/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { return null; } // null = retry
    if (!res.ok) throw new Error(data?.error || `Server error ${res.status}`);
    if (!data?.trip) return null;
    return data;
  }

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    const constraints = { ...form };

    let body;
    try {
      body = JSON.stringify({ constraints });
    } catch (err) {
      setError(`Couldn't prepare your request: ${err.message}`);
      setLoading(false);
      return;
    }

    try {
      let data = await attemptPlan(body);
      if (!data) data = await attemptPlan(body); // silent retry on cold start
      if (!data) throw new Error('The server is warming up — wait a few seconds and try again.');
      trackEvent('trip_planned');
      onComplete(data.trip, constraints);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  const inputStyle = { width: '100%', padding: '10px 14px', fontSize: 15 };
  const labelStyle = { color: '#6b5c42', fontSize: 13, fontWeight: 500, marginBottom: 8, display: 'block' };
  const sectionStyle = { marginBottom: 28 };
  const today = new Date().toISOString().split('T')[0];

  const firstDog = form.hasDogs && form.dogs?.[0];
  const overlayDogName = firstDog?.name || getDogName(null) || null;

  // ── Step navigation ───────────────────────────────────────────────────────
  function nextStep() {
    if (step < STEPS.length - 1) {
      const next = step + 1;
      setStep(next);
      trackEvent(`wizard_step_${next}`);
    } else {
      handleSubmit();
    }
  }

  function prevStep() {
    if (step > 0) setStep(s => s - 1);
    else onBack();
  }

  function quickSubmit() {
    trackEvent('quick_submit_used');
    handleSubmit();
  }

  function skipToResults() {
    trackEvent(`skip_used_step_${step}`);
    handleSubmit();
  }

  const isLastStep = step === STEPS.length - 1;
  // Allow submitting from step 0 onward — more steps = better results, but not required
  const canSubmitNow = step >= 0 && form.startingLocation.trim().length > 0;

  // ── Step content ─────────────────────────────────────────────────────────
  function renderStep() {
    // ── STEP 0: When + Where ────────────────────────────────────────────────
    if (step === 0) return (
      <div className="fade-in">
        <div style={sectionStyle}>
          <label style={labelStyle}>Where are you based?</label>
          <input
            style={inputStyle}
            value={form.startingLocation}
            onChange={e => set('startingLocation', e.target.value)}
            placeholder="Berkeley, CA"
            autoFocus
          />
        </div>

        <div style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <label style={{ ...labelStyle, margin: 0 }}>When are you going? <span style={{ color: '#b8aa88', fontWeight: 400 }}>(optional)</span></label>
            {(form.tripStartDate) && (
              <button type="button" onClick={() => setDates('', '')} style={{ background: 'none', border: 'none', color: '#b8aa88', fontSize: 12, cursor: 'pointer', padding: 0 }}>
                Clear
              </button>
            )}
          </div>
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
          {form.tripDates
            ? <div style={{ marginTop: 8, color: '#5c7a3e', fontSize: 13, fontWeight: 500 }}>📅 {form.tripDates} · {form.tripLength}</div>
            : <div style={{ marginTop: 8, color: '#b8aa88', fontSize: 12 }}>No dates? We'll plan for next weekend.</div>
          }
        </div>

        <div style={sectionStyle}>
          <label style={labelStyle}>How far will you drive?</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {DRIVE_DISTANCES.map(d => (
              <button type="button" key={d} className={`tag-btn${form.driveDistance === d ? ' selected' : ''}`} onClick={() => set('driveDistance', d)}>{d}</button>
            ))}
          </div>
        </div>

        {/* Quick-submit shortcut — visible once location is filled */}
        {form.startingLocation.trim().length > 2 && (
          <div className="fade-in" style={{ background: 'rgba(92,122,62,0.06)', border: '1px solid rgba(92,122,62,0.2)', borderRadius: 10, padding: '14px 16px', marginBottom: 4 }}>
            <div style={{ color: '#5c7a3e', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>That's all we need 🐾</div>
            <div style={{ color: '#9c8b6e', fontSize: 12, marginBottom: 12 }}>We'll fill in smart defaults for your rig and preferences — or keep going to customise.</div>
            <button
              type="button"
              onClick={quickSubmit}
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: 15 }}
            >
              🐾 Find my trip now →
            </button>
          </div>
        )}
      </div>
    );

    // ── STEP 1: Rig + Dogs ──────────────────────────────────────────────────
    if (step === 1) return (
      <div className="fade-in">
        {/* Rig */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Your vehicle</label>
          <RigSearch
            value={form.rigType}
            onChange={val => set('rigType', val)}
            placeholder="Search make & model…"
          />
        </div>

        <div style={sectionStyle}>
          <label style={labelStyle}>Sleeping setup</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CAMPING_STYLES.map(s => (
              <button type="button" key={s} className={`tag-btn${form.campingStyle === s ? ' selected' : ''}`} onClick={() => set('campingStyle', s)}>{s}</button>
            ))}
          </div>
        </div>

        <div style={sectionStyle}>
          <label style={labelStyle}>Road experience</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ROAD_EXPERIENCE.map(r => (
              <button type="button" key={r} className={`tag-btn${form.roadExperience === r ? ' selected' : ''}`} style={{ textAlign: 'left', borderRadius: 8 }} onClick={() => set('roadExperience', r)}>{r}</button>
            ))}
          </div>
        </div>

        {/* Dogs */}
        <div style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <label style={{ ...labelStyle, margin: 0 }}>Dogs coming?</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[true, false].map(val => (
                <button type="button" key={String(val)} className={`tag-btn${form.hasDogs === val ? ' selected' : ''}`} onClick={() => set('hasDogs', val)}>
                  {val ? 'Yes 🐾' : 'No'}
                </button>
              ))}
            </div>
          </div>

          {form.hasDogs && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
      </div>
    );

    // ── STEP 2: Vibe + Activities + Campsite ────────────────────────────────
    if (step === 2) return (
      <div className="fade-in">
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

        <div style={sectionStyle}>
          <label style={labelStyle}>What do you want to do?</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ACTIVITIES.map(a => (
              <button type="button" key={a} className={`tag-btn${form.activities.includes(a) ? ' selected' : ''}`} onClick={() => toggleActivity(a)}>{a}</button>
            ))}
          </div>
        </div>

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
      </div>
    );

    // ── STEP 3: Weather + Vibe text ─────────────────────────────────────────
    if (step === 3) return (
      <div className="fade-in">
        <div style={sectionStyle}>
          <label style={labelStyle}>Weather preferences <span style={{ fontWeight: 400, color: '#9c8b6e' }}>(optional)</span></label>
          <div style={{ padding: '16px', background: '#faf7f0', border: '1px solid #d8cfa8', borderRadius: 8 }}>
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
        </div>

        <div style={sectionStyle}>
          <label style={labelStyle}>Anything else? <span style={{ fontWeight: 400, color: '#9c8b6e' }}>(optional)</span></label>
          <textarea
            style={{ ...inputStyle, height: 100, resize: 'vertical', lineHeight: 1.5 }}
            value={form.vibe}
            onChange={e => set('vibe', e.target.value)}
            placeholder="e.g. Want a creek for the dogs, avoid crowds, something with good stargazing..."
            autoFocus
          />
        </div>

        {/* Summary card */}
        <TripSummary form={form} />
      </div>
    );
  }

  return (
    <div className="fade-in">
      {loading && (
        <PlanningOverlay
          dogName={overlayDogName}
          location={form.startingLocation}
        />
      )}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={prevStep}
          style={{ background: 'none', border: 'none', color: '#9c8b6e', fontSize: 14, cursor: 'pointer', padding: 0, marginBottom: 16 }}
        >
          ← {step === 0 ? 'Back' : 'Previous'}
        </button>
        <h1 style={{ color: '#2c2416', fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', margin: '0 0 4px' }}>
          {prefill ? 'Re-plan this trip' : STEP_TITLES[step]}
        </h1>
        <p style={{ color: '#9c8b6e', fontSize: 13, margin: 0 }}>
          {STEP_SUBTITLES[step]}
        </p>
      </div>

      {/* Progress bar */}
      <StepBar step={step} />

      {/* Step content */}
      {renderStep()}

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(185,28,28,0.07)', border: '1px solid rgba(185,28,28,0.22)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#b91c1c', fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Next / Submit button */}
      <button
        type="button"
        onClick={nextStep}
        disabled={loading}
        className="btn-primary"
        style={{ width: '100%', padding: '16px', fontSize: 16, marginTop: 8 }}
      >
        {isLastStep ? '🐾 Find our next adventure →' : `Next: ${STEPS[step + 1]?.label} →`}
      </button>

      {/* Skip to results — available on steps 1–3 */}
      {!isLastStep && step > 0 && (
        <button
          type="button"
          onClick={skipToResults}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: 14,
            marginTop: 8,
            background: 'transparent',
            border: '1px solid rgba(92,122,62,0.3)',
            borderRadius: 10,
            color: '#5c7a3e',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Skip to results →
        </button>
      )}
    </div>
  );
}

const STEP_TITLES = [
  'When & where?',
  'Your rig & dogs',
  "What's the vibe?",
  'Last details',
];

const STEP_SUBTITLES = [
  'Tell me when and how far you want to go.',
  "Help me match the road and campsite to your setup.",
  'This is what makes the recommendation feel right.',
  'Optional details — leave blank and I\'ll use my judgment.',
];

// ── Trip summary shown on last step ────────────────────────────────────────
function TripSummary({ form }) {
  const items = [
    form.startingLocation && { icon: '📍', label: 'From', value: form.startingLocation },
    form.tripDates && { icon: '📅', label: 'Dates', value: `${form.tripDates} · ${form.tripLength}` },
    form.driveDistance && { icon: '🚗', label: 'Drive', value: form.driveDistance },
    form.rigType && { icon: '🚙', label: 'Rig', value: form.rigType },
    form.campingStyle && { icon: '🏕️', label: 'Setup', value: form.campingStyle },
    form.hasDogs && form.dogs?.length && { icon: '🐾', label: 'Dogs', value: form.dogs.map(d => d.name || d.breed || 'Dog').join(', ') },
    { icon: '🏔️', label: 'Vibe', value: ENERGY_LEVELS.find(e => e.val === form.energyLevel)?.label || form.energyLevel },
    form.campsiteType !== 'any' && { icon: '🌲', label: 'Camp type', value: CAMPSITE_TYPES.find(c => c.val === form.campsiteType)?.label || form.campsiteType },
    form.activities?.length && { icon: '🎯', label: 'Activities', value: form.activities.map(a => a.split(' ').slice(1).join(' ')).join(', ') },
  ].filter(Boolean);

  return (
    <div style={{ background: 'rgba(92,122,62,0.05)', border: '1px solid rgba(92,122,62,0.18)', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
      <div style={{ color: '#5c7a3e', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
        Your trip so far
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ fontSize: 13, flexShrink: 0 }}>{item.icon}</span>
            <span style={{ color: '#9c8b6e', fontSize: 12, fontWeight: 500, flexShrink: 0, minWidth: 52 }}>{item.label}</span>
            <span style={{ color: '#3d3020', fontSize: 13, lineHeight: 1.4 }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

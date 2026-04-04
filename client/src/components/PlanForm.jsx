import { useState, useEffect } from 'react';
import { loadProfile } from './ProfileForm.jsx';

const ACTIVITIES = ['Hiking', 'Swimming', 'Fishing', 'Climbing', 'Mountain biking', 'Photography', 'Stargazing', 'Just vibing'];
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

const DEFAULT_FORM = {
  startingLocation: 'Berkeley, CA',
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
  weatherPrefs: { maxRainChance: null, minTempF: '', maxTempF: '', avoidWind: false },
  vibe: '',
};

function buildInitialForm(prefill) {
  const profile = loadProfile();
  // Profile fills in stable fields; prefill (re-plan) takes precedence over both
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

export default function PlanForm({ onComplete, onBack, prefill, onClearPrefill }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const profile = loadProfile();
  const [form, setForm] = useState(() => buildInitialForm(prefill));

  // When re-planning, fill in the previous constraints
  useEffect(() => {
    if (prefill) {
      setForm(buildInitialForm(prefill));
      onClearPrefill?.();
    }
  }, [prefill]);

  function set(key, val) {
    setForm(prev => ({ ...prev, [key]: val }));
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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      onComplete(data.trip, constraints);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = { width: '100%', padding: '10px 14px', fontSize: 15 };
  const labelStyle = { color: '#6b5c42', fontSize: 13, fontWeight: 500, marginBottom: 8, display: 'block' };
  const sectionStyle = { marginBottom: 32 };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
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
          {prefill ? 'Your previous constraints are pre-filled — tweak anything and run it again.' : 'The more you tell me, the more specific I can be.'}
        </p>
      </div>

      {/* Profile pre-fill notice */}
      {profile && !prefill && (
        <div style={{
          background: 'rgba(74,222,128,0.06)',
          border: '1px solid rgba(74,222,128,0.18)',
          borderRadius: 8,
          padding: '10px 14px',
          marginBottom: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}>
          <span style={{ color: '#2d6a2d', fontSize: 13 }}>
            ✓ Pre-filled from your profile
          </span>
          <span style={{ color: '#9c8b6e', fontSize: 12 }}>
            Rig, dogs, home base — just add dates &amp; vibe
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Starting point */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Where are you based?</label>
          <input
            style={inputStyle}
            value={form.startingLocation}
            onChange={e => set('startingLocation', e.target.value)}
            placeholder="Berkeley, CA"
          />
        </div>

        {/* Dates */}
        <div className="grid-2" style={{ marginBottom: 32 }}>
          <div>
            <label style={labelStyle}>When?</label>
            <input
              style={inputStyle}
              value={form.tripDates}
              onChange={e => set('tripDates', e.target.value)}
              placeholder="This weekend / Aug 15–17"
            />
          </div>
          <div>
            <label style={labelStyle}>How long?</label>
            <input
              style={inputStyle}
              value={form.tripLength}
              onChange={e => set('tripLength', e.target.value)}
              placeholder="2 nights / 3 days"
            />
          </div>
        </div>

        {/* Rig */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Your rig</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {RIG_TYPES.map(r => (
              <button
                type="button"
                key={r}
                className={`tag-btn${form.rigType === r ? ' selected' : ''}`}
                onClick={() => set('rigType', r)}
              >{r}</button>
            ))}
          </div>
          {form.rigType === 'Other' && (
            <input
              style={{ ...inputStyle, marginTop: 10 }}
              value={form.rigTypeCustom}
              onChange={e => set('rigTypeCustom', e.target.value)}
              placeholder="e.g. Chevy Colorado ZR2"
            />
          )}
        </div>

        {/* Camping style */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Camping style</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CAMPING_STYLES.map(s => (
              <button
                type="button"
                key={s}
                className={`tag-btn${form.campingStyle === s ? ' selected' : ''}`}
                onClick={() => set('campingStyle', s)}
              >{s}</button>
            ))}
          </div>
        </div>

        {/* Road experience */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Road experience</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ROAD_EXPERIENCE.map(r => (
              <button
                type="button"
                key={r}
                className={`tag-btn${form.roadExperience === r ? ' selected' : ''}`}
                style={{ textAlign: 'left', borderRadius: 8 }}
                onClick={() => set('roadExperience', r)}
              >{r}</button>
            ))}
          </div>
        </div>

        {/* Dogs */}
        <div style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <label style={{ ...labelStyle, margin: 0 }}>Dogs coming?</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[true, false].map(val => (
                <button
                  type="button"
                  key={String(val)}
                  className={`tag-btn${form.hasDogs === val ? ' selected' : ''}`}
                  onClick={() => set('hasDogs', val)}
                >{val ? 'Yes' : 'No'}</button>
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
                      <button type="button" onClick={() => removeDog(idx)}
                        style={{ background: 'none', border: 'none', color: '#9c8b6e', cursor: 'pointer', fontSize: 13 }}>
                        Remove
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <input
                      style={inputStyle}
                      value={dog.name}
                      onChange={e => updateDog(idx, 'name', e.target.value)}
                      placeholder="Name (optional)"
                    />
                    <input
                      style={inputStyle}
                      value={dog.breed}
                      onChange={e => updateDog(idx, 'breed', e.target.value)}
                      placeholder="Breed (e.g. Husky)"
                    />
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {DOG_SIZES.map(s => (
                      <button
                        type="button"
                        key={s}
                        className={`tag-btn${dog.size === s ? ' selected' : ''}`}
                        style={{ fontSize: 13, padding: '5px 12px' }}
                        onClick={() => updateDog(idx, 'size', s)}
                      >{s}</button>
                    ))}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addDog}
                style={{ background: 'none', border: '1px dashed #c8bc96', borderRadius: 8, color: '#9c8b6e', padding: '10px', fontSize: 14, cursor: 'pointer', textAlign: 'center' }}
              >
                + Add another dog
              </button>
            </div>
          )}
        </div>

        {/* Activities */}
        <div style={sectionStyle}>
          <label style={labelStyle}>What do you want to do?</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ACTIVITIES.map(a => (
              <button
                type="button"
                key={a}
                className={`tag-btn${form.activities.includes(a) ? ' selected' : ''}`}
                onClick={() => toggleActivity(a)}
              >{a}</button>
            ))}
          </div>
        </div>

        {/* Drive distance */}
        <div style={sectionStyle}>
          <label style={labelStyle}>How far will you drive from home?</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {DRIVE_DISTANCES.map(d => (
              <button
                type="button"
                key={d}
                className={`tag-btn${form.driveDistance === d ? ' selected' : ''}`}
                onClick={() => set('driveDistance', d)}
              >{d}</button>
            ))}
          </div>
        </div>

        {/* Weather preferences */}
        <div style={sectionStyle}>
          <label style={labelStyle}>
            Weather preferences
            <span style={{ fontWeight: 400, color: '#9c8b6e', marginLeft: 6 }}>(optional)</span>
          </label>

          <div style={{ marginBottom: 14 }}>
            <div style={{ color: '#9c8b6e', fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Rain tolerance</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {RAIN_OPTIONS.map(opt => (
                <button
                  type="button"
                  key={String(opt.val)}
                  className={`tag-btn${form.weatherPrefs.maxRainChance === opt.val ? ' selected' : ''}`}
                  onClick={() => set('weatherPrefs', { ...form.weatherPrefs, maxRainChance: opt.val })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: 14 }}>
            <div>
              <div style={{ color: '#9c8b6e', fontSize: 12, fontWeight: 500, marginBottom: 6 }}>Min low temp (°F)</div>
              <input
                type="number"
                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
                value={form.weatherPrefs.minTempF}
                onChange={e => set('weatherPrefs', { ...form.weatherPrefs, minTempF: e.target.value })}
                placeholder="e.g. 40"
              />
            </div>
            <div>
              <div style={{ color: '#9c8b6e', fontSize: 12, fontWeight: 500, marginBottom: 6 }}>Max high temp (°F)</div>
              <input
                type="number"
                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
                value={form.weatherPrefs.maxTempF}
                onChange={e => set('weatherPrefs', { ...form.weatherPrefs, maxTempF: e.target.value })}
                placeholder="e.g. 90"
              />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={form.weatherPrefs.avoidWind}
              onChange={e => set('weatherPrefs', { ...form.weatherPrefs, avoidWind: e.target.checked })}
              style={{ width: 16, height: 16, accentColor: '#5c7a3e' }}
            />
            <span style={{ color: '#6b5c42', fontSize: 13 }}>Avoid high winds (25+ mph)</span>
          </label>
        </div>

        {/* Freeform vibe */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Anything else? (optional)</label>
          <textarea
            style={{ ...inputStyle, height: 88, resize: 'vertical', lineHeight: 1.5 }}
            value={form.vibe}
            onChange={e => set('vibe', e.target.value)}
            placeholder="e.g. Want a creek for the dogs, prefer dispersed over established sites, avoiding fire-restricted areas..."
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
            <>
              <div className="spinner" />
              Finding your trip...
            </>
          ) : (
            'Find my trip →'
          )}
        </button>
      </form>
    </div>
  );
}

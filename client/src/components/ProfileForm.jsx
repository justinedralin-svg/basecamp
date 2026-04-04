import { useState } from 'react';

const RIG_TYPES = ['Subaru Outback', 'Subaru Forester', 'Toyota 4Runner', 'Toyota Tacoma', 'Toyota Tundra', 'Jeep Wrangler', 'Ford Bronco', 'Sprinter Van', 'Ford F-150', 'Other'];
const CAMPING_STYLES = ['Rooftop tent', 'Ground tent', 'Truck bed / sleeping platform', 'Van / car camping', 'Hammock'];
const ROAD_EXPERIENCE = ['Paved / smooth dirt only', 'Moderate dirt roads (stock is fine)', 'Technical roads (comfortable airing down)', 'I\'ll go anywhere'];
const DRIVE_DISTANCES = ['Up to 2 hours', '2–3 hours', '3–4 hours', '4–5 hours', 'Willing to drive far'];
const DOG_SIZES = ['Small (under 25 lbs)', 'Medium (25–60 lbs)', 'Large (60–100 lbs)', 'XL (100+ lbs)'];

export const PROFILE_KEY = 'basecamp_profile';

export function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY)) || null;
  } catch {
    return null;
  }
}

const EMPTY_PROFILE = {
  startingLocation: '',
  rigType: '',
  rigTypeCustom: '',
  campingStyle: '',
  roadExperience: '',
  driveDistance: '2–3 hours',
  hasDogs: false,
  dogs: [{ name: '', breed: '', size: 'Large (60–100 lbs)' }],
};

export default function ProfileForm({ onBack }) {
  const existing = loadProfile();
  const [form, setForm] = useState(existing || { ...EMPTY_PROFILE });
  const [saved, setSaved] = useState(false);

  function set(key, val) {
    setForm(prev => ({ ...prev, [key]: val }));
    setSaved(false);
  }

  function updateDog(idx, key, val) {
    setForm(prev => {
      const dogs = [...prev.dogs];
      dogs[idx] = { ...dogs[idx], [key]: val };
      return { ...prev, dogs };
    });
    setSaved(false);
  }

  function addDog() {
    setForm(prev => ({ ...prev, dogs: [...prev.dogs, { name: '', breed: '', size: 'Large (60–100 lbs)' }] }));
  }

  function removeDog(idx) {
    setForm(prev => ({ ...prev, dogs: prev.dogs.filter((_, i) => i !== idx) }));
  }

  function handleSave() {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(form));
    setSaved(true);
  }

  function handleClear() {
    if (!window.confirm('Clear your profile? The planning form will go back to defaults.')) return;
    localStorage.removeItem(PROFILE_KEY);
    setForm({ ...EMPTY_PROFILE });
    setSaved(false);
  }

  const inputStyle = { width: '100%', padding: '10px 14px', fontSize: 15, boxSizing: 'border-box' };
  const labelStyle = { color: '#6b5c42', fontSize: 13, fontWeight: 500, marginBottom: 8, display: 'block' };
  const sectionStyle = { marginBottom: 32 };
  const sublabelStyle = { color: '#9c8b6e', fontSize: 12, fontWeight: 500, marginBottom: 8 };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: '#9c8b6e', fontSize: 14, cursor: 'pointer', padding: 0, marginBottom: 16 }}
        >
          ← Back
        </button>
        <h1 style={{ color: '#2c2416', fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', margin: '0 0 6px' }}>
          Your profile
        </h1>
        <p style={{ color: '#9c8b6e', fontSize: 14, margin: 0 }}>
          Saved once, pre-filled every time you plan a trip.
        </p>
      </div>

      {/* Home base */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Where are you based?</label>
        <input
          style={inputStyle}
          value={form.startingLocation}
          onChange={e => set('startingLocation', e.target.value)}
          placeholder="Berkeley, CA"
        />
      </div>

      {/* Rig */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Your rig</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {RIG_TYPES.map(r => (
            <button
              key={r}
              type="button"
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
              key={s}
              type="button"
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
              key={r}
              type="button"
              className={`tag-btn${form.roadExperience === r ? ' selected' : ''}`}
              style={{ textAlign: 'left', borderRadius: 8 }}
              onClick={() => set('roadExperience', r)}
            >{r}</button>
          ))}
        </div>
      </div>

      {/* Default drive distance */}
      <div style={sectionStyle}>
        <label style={labelStyle}>How far do you typically drive?</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {DRIVE_DISTANCES.map(d => (
            <button
              key={d}
              type="button"
              className={`tag-btn${form.driveDistance === d ? ' selected' : ''}`}
              onClick={() => set('driveDistance', d)}
            >{d}</button>
          ))}
        </div>
      </div>

      {/* Dogs */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <label style={{ ...labelStyle, margin: 0 }}>Dogs?</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[true, false].map(val => (
              <button
                key={String(val)}
                type="button"
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
                    placeholder="Name"
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

      {/* Save */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button
          onClick={handleSave}
          className="btn-primary"
          style={{ flex: 1, padding: '14px', fontSize: 15 }}
        >
          {saved ? '✓ Profile saved' : 'Save profile'}
        </button>
        {existing && (
          <button
            onClick={handleClear}
            className="btn-ghost"
            style={{ padding: '14px 18px', color: '#9c8b6e' }}
          >
            Clear
          </button>
        )}
      </div>

      {saved && (
        <p style={{ color: '#2d6a2d', fontSize: 13, textAlign: 'center', marginTop: 12 }}>
          Your profile will pre-fill the planning form from now on.
        </p>
      )}
    </div>
  );
}

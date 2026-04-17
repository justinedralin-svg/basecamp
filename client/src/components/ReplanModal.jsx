import { useState } from 'react';
import { trackEvent } from '../utils/analytics.js';
import PlanningOverlay from './PlanningOverlay.jsx';

export default function ReplanModal({ entry, onClose, onComplete }) {
  const [changeRequest, setChangeRequest] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    if (!changeRequest.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          constraints: entry.constraints,
          changeRequest: changeRequest.trim(),
          originalTrip: entry.trip,
        }),
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('The server took too long to respond. Try again — it usually works on the second attempt.');
      }
      if (data.error) throw new Error(data.error);
      trackEvent('trip_replanned');
      onComplete(data.trip, entry.constraints);
    } catch (err) {
      setError(err.message || 'Something went wrong — try again');
    } finally {
      setLoading(false);
    }
  }

  const c = entry.constraints || {};
  const dogs = c.hasDogs && c.dogs?.length > 0
    ? c.dogs.map(d => d.name || 'Dog').join(' & ')
    : null;

  if (loading) {
    return <PlanningOverlay dogName={dogs} location={entry.constraints?.startingLocation} />;
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.72)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Bottom sheet */}
      <div
        className="fade-in"
        style={{
          width: '100%', maxWidth: 760,
          background: '#faf7f0',
          border: '1px solid #d8cfa8',
          borderRadius: '16px 16px 0 0',
          padding: '28px 24px 44px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <div style={{ color: '#9c8b6e', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 5 }}>
              ✏️ Re-planning
            </div>
            <h2 style={{ color: '#2c2416', fontSize: 20, fontWeight: 700, margin: 0 }}>
              {entry.trip?.destination}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#9c8b6e', fontSize: 18, cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* Original context chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 22 }}>
          {c.startingLocation && (
            <span className="pill pill-slate">📍 {c.startingLocation}</span>
          )}
          {c.tripDates && (
            <span className="pill pill-slate">📅 {c.tripDates}</span>
          )}
          {c.tripLength && (
            <span className="pill pill-slate">⏱ {c.tripLength}</span>
          )}
          {c.rigType && (
            <span className="pill pill-slate">🚙 {c.rigType}</span>
          )}
          {dogs && (
            <span className="pill pill-slate">🐕 {dogs}</span>
          )}
        </div>

        {/* The key input */}
        <label style={{ color: '#6b5c42', fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 8 }}>
          What do you want to change?
        </label>
        <textarea
          value={changeRequest}
          onChange={e => setChangeRequest(e.target.value)}
          placeholder={'e.g. "same trip but more shade for the dogs"\n"push it further north, more remote"\n"want better swimming this time"\n"avoid high clearance roads"'}
          autoFocus
          rows={4}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px 14px',
            fontSize: 14,
            lineHeight: 1.6,
            resize: 'vertical',
            boxSizing: 'border-box',
            opacity: loading ? 0.6 : 1,
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
          }}
        />
        <div style={{ color: '#9c8b6e', fontSize: 11, marginTop: 5, marginBottom: 16 }}>
          ⌘↵ to generate · all your other preferences stay the same
        </div>

        {error && (
          <div style={{
            color: '#b91c1c', fontSize: 13, marginBottom: 14,
            background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(185,28,28,0.18)',
            borderRadius: 6, padding: '8px 12px',
          }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            disabled={loading}
            className="btn-ghost"
            style={{ flex: 1, padding: '12px' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!changeRequest.trim() || loading}
            className="btn-primary"
            style={{
              flex: 2, padding: '12px',
              opacity: (!changeRequest.trim() || loading) ? 0.6 : 1,
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                Planning your trip...
              </span>
            ) : 'Generate new trip →'}
          </button>
        </div>
      </div>
    </div>
  );
}

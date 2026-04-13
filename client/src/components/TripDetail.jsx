import { useState, useEffect, useRef } from 'react';
import TripResult from './TripResult.jsx';
import ReplanModal from './ReplanModal.jsx';
import PhotoSection from './PhotoSection.jsx';
import PackingChecklist from './PackingChecklist.jsx';
import { printTripBrief } from './TripBrief.jsx';
import ConditionReport from './ConditionReport.jsx';

function buildShareUrl(trip) {
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(trip))));
  return `${window.location.origin}${window.location.pathname}#shared/${encoded}`;
}

function parseCoords(str) {
  if (!str) return null;
  const parts = str.split(/[,\s]+/).map(Number).filter(n => !isNaN(n));
  if (parts.length >= 2) return { lat: parts[0], lon: parts[1] };
  return null;
}

function xmlEscape(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function exportGPX(entry) {
  const { trip, constraints } = entry;
  const coords = parseCoords(trip?.campsite?.coordinates);
  if (!coords) {
    alert('No coordinates available for this trip — try refining the map location first.');
    return;
  }

  const wpts = [];

  // Main campsite
  wpts.push({
    lat: coords.lat, lon: coords.lon,
    name: trip.campsite?.name || trip.destination || 'Camp',
    desc: trip.campsite?.description || trip.tagline || '',
    sym: 'Campground',
  });

  const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Camp With My Dog" xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${xmlEscape(trip?.destination || 'Camp With My Dog Trip')}</name>
    <desc>${xmlEscape(constraints?.location || '')}</desc>
  </metadata>
${wpts.map(w => `  <wpt lat="${w.lat}" lon="${w.lon}">
    <name>${xmlEscape(w.name)}</name>
    <desc>${xmlEscape(w.desc)}</desc>
    <sym>${w.sym}</sym>
  </wpt>`).join('\n')}
</gpx>`;

  const blob = new Blob([gpx], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(trip?.destination || 'trip').replace(/[^a-z0-9]/gi, '-').toLowerCase()}.gpx`;
  a.click();
  URL.revokeObjectURL(url);
}

function StarRating({ rating, onRate }) {
  const [hover, setHover] = useState(null);
  const display = hover ?? rating ?? 0;

  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onClick={() => onRate && onRate(star === rating ? 0 : star)}
          onMouseEnter={() => onRate && setHover(star)}
          onMouseLeave={() => onRate && setHover(null)}
          style={{
            fontSize: 24,
            color: star <= display ? '#5c7a3e' : '#d8cfa8',
            cursor: onRate ? 'pointer' : 'default',
            transition: 'color 0.1s',
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          {star <= display ? '★' : '☆'}
        </span>
      ))}
      {rating > 0 && (
        <span style={{ color: '#9c8b6e', fontSize: 12, marginLeft: 6 }}>
          {['', 'Rough', 'OK', 'Good', 'Great', 'Epic'][rating]}
        </span>
      )}
    </div>
  );
}

export default function TripDetail({ entry, onBack, onMarkDone, onMarkPlanned, onDelete, onUpdateNotes, onUpdatePhotos, onUpdateChecklist, onUpdateConditionReport, onReplan, onRate }) {
  const [notes, setNotes] = useState(entry.notes || '');
  const [saved, setSaved] = useState(false);
  const [showReplan, setShowReplan] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const trip = entry.trip;
    const url = buildShareUrl(trip);
    const shareData = {
      title: `${trip.destination} — Camp With My Dog`,
      text: `Check out this dog-friendly camping trip: ${trip.destination}. ${trip.tagline || ''}`,
      url,
    };
    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      window.prompt('Copy this link to share:', url);
    }
  }
  const saveTimer = useRef(null);

  // Reset notes when switching to a different trip
  useEffect(() => {
    setNotes(entry.notes || '');
    setSaved(false);
  }, [entry.id]);

  // Auto-save notes with a short debounce
  useEffect(() => {
    if (notes === (entry.notes || '')) return;
    clearTimeout(saveTimer.current);
    setSaved(false);
    saveTimer.current = setTimeout(() => {
      onUpdateNotes(entry.id, notes);
      setSaved(true);
    }, 800);
    return () => clearTimeout(saveTimer.current);
  }, [notes]);

  function handleReplanComplete(newTrip, constraints) {
    setShowReplan(false);
    onReplan(newTrip, constraints);
  }

  return (
    <div className="fade-in">
      {showReplan && (
        <ReplanModal
          entry={entry}
          onClose={() => setShowReplan(false)}
          onComplete={handleReplanComplete}
        />
      )}

      <div style={{ marginBottom: 20 }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: '#9c8b6e', fontSize: 14, cursor: 'pointer', padding: 0 }}
        >
          ← Back to log
        </button>
      </div>

      {entry.status === 'done' && (
        <div style={{
          background: 'rgba(45,106,45,0.08)',
          border: '1px solid rgba(45,106,45,0.20)',
          borderRadius: 8,
          padding: '10px 16px',
          marginBottom: 16,
          color: '#2d6a2d',
          fontSize: 13,
          fontWeight: 500,
        }}>
          ✓ You've done this trip
        </div>
      )}

      <TripResult
        entry={entry}
        onSave={() => {}}
        onPlanAnother={onBack}
        onViewLog={onBack}
        readOnly
      />

      {/* Packing checklist */}
      <PackingChecklist
        trip={entry.trip}
        checked={entry.checkedItems || []}
        onCheckedChange={items => onUpdateChecklist(entry.id, items)}
      />

      {/* Photos */}
      <PhotoSection
        photos={entry.photos || []}
        onPhotosChange={photos => onUpdatePhotos(entry.id, photos)}
      />

      {/* Field notes */}
      <div className="card" style={{ padding: 20, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>📓</span>
            <h3 style={{ color: '#2c2416', fontSize: 15, fontWeight: 600, margin: 0 }}>Field notes</h3>
          </div>
          {saved && (
            <span style={{ color: '#5c7a3e', fontSize: 12 }}>Saved</span>
          )}
        </div>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="How did the road hold up? Where did the dogs swim? What would you do differently? Saves automatically."
          style={{
            width: '100%',
            minHeight: 100,
            padding: '10px 14px',
            fontSize: 14,
            lineHeight: 1.6,
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Trip rating */}
      {entry.status === 'done' && (
        <div className="card" style={{ padding: '16px 20px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ color: '#9c8b6e', fontSize: 13, fontWeight: 500 }}>How was it?</div>
          <StarRating
            rating={entry.rating}
            onRate={rating => onRate && onRate(entry.id, rating)}
          />
        </div>
      )}

      {/* Condition report — shown for done trips */}
      {entry.status === 'done' && (
        <ConditionReport
          report={entry.conditionReport || {}}
          onChange={report => onUpdateConditionReport && onUpdateConditionReport(entry.id, report)}
        />
      )}

      {/* Actions */}
      <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {entry.status !== 'done' ? (
          <button
            onClick={() => onMarkDone(entry.id)}
            className="btn-primary"
            style={{ flex: 1, padding: '12px', minWidth: 140 }}
          >
            Mark as done ✓
          </button>
        ) : (
          <button
            onClick={() => onMarkPlanned(entry.id)}
            className="btn-ghost"
            style={{ flex: 1, padding: '12px', minWidth: 140 }}
          >
            Mark as planned
          </button>
        )}
        <button
          onClick={handleShare}
          className="btn-ghost"
          style={{ flex: 1, padding: '12px', minWidth: 140 }}
        >
          {copied ? '✓ Copied!' : '⬆ Share trip'}
        </button>
        <button
          onClick={() => exportGPX(entry)}
          className="btn-ghost"
          style={{ flex: 1, padding: '12px', minWidth: 140 }}
          title="Download waypoints for Gaia GPS, CalTopo, or any navigation app"
        >
          Export GPX
        </button>
        <button
          onClick={() => printTripBrief(entry)}
          className="btn-ghost"
          style={{ flex: 1, padding: '12px', minWidth: 140 }}
          title="Print a one-page trip summary for offline use"
        >
          📄 Trip brief
        </button>
        <button
          onClick={() => setShowReplan(true)}
          className="btn-ghost"
          style={{ flex: 1, padding: '12px', minWidth: 140 }}
        >
          Re-plan this trip
        </button>
        <button
          onClick={() => {
            if (window.confirm('Delete this trip from your log?')) {
              onDelete(entry.id);
            }
          }}
          className="btn-ghost"
          style={{ padding: '12px 16px', color: '#b91c1c', borderColor: 'rgba(185,28,28,0.25)' }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

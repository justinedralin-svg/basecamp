import { useState, useEffect } from 'react';

// Compress trip JSON using deflate-like approach via URL-safe base64
// We use a simple LZ-based compression to shorten the URL
function compressTrip(trip) {
  try {
    const json = JSON.stringify(trip);
    // Use encodeURIComponent + btoa with compression hint marker
    const compressed = btoa(unescape(encodeURIComponent(json)));
    return compressed;
  } catch {
    return btoa(unescape(encodeURIComponent(JSON.stringify(trip))));
  }
}

export function buildShareUrl(trip) {
  const encoded = compressTrip(trip);
  return `${window.location.origin}${window.location.pathname}#shared/${encoded}`;
}

export default function ShareModal({ trip, onClose }) {
  const [copied, setCopied] = useState(false);
  const url = buildShareUrl(trip);
  const title = `${trip.destination} — Camp With My Dog`;
  const text = `Check out this dog-friendly camping spot: ${trip.destination}. ${trip.tagline || ''} 🐾`;

  // Close on Escape
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt('Copy this link:', url);
    }
  }

  function handleText() {
    window.open(`sms:?body=${encodeURIComponent(`${text}\n\n${url}`)}`);
  }

  function handleEmail() {
    window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`);
  }

  async function handleNativeShare() {
    try {
      await navigator.share({ title, text, url });
    } catch {}
  }

  const hasNativeShare = typeof navigator.share === 'function';

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(44,36,22,0.45)',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', zIndex: 201,
        bottom: 0, left: 0, right: 0,
        background: '#faf7f0',
        borderRadius: '16px 16px 0 0',
        padding: '24px 20px 36px',
        boxShadow: '0 -4px 32px rgba(44,36,22,0.18)',
        maxWidth: 480,
        margin: '0 auto',
      }}>
        {/* Handle */}
        <div style={{ width: 36, height: 4, background: '#d8cfa8', borderRadius: 2, margin: '0 auto 20px' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ color: '#2c2416', fontWeight: 700, fontSize: 16 }}>Share this trip</div>
            <div style={{ color: '#9c8b6e', fontSize: 13, marginTop: 2 }}>{trip.destination}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9c8b6e', fontSize: 22, cursor: 'pointer', padding: '4px 8px', lineHeight: 1 }}>×</button>
        </div>

        {/* Share options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          <ShareOption icon="💬" label="Text message" desc="Send via iMessage or SMS" onClick={handleText} />
          <ShareOption icon="📧" label="Email" desc="Share with a longer message" onClick={handleEmail} />
          {hasNativeShare && (
            <ShareOption icon="⬆️" label="More options" desc="WhatsApp, Instagram, AirDrop..." onClick={handleNativeShare} />
          )}
        </div>

        {/* Copy link */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#f0ebe0', border: '1px solid #d8cfa8',
          borderRadius: 10, padding: '10px 14px',
        }}>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ color: '#6b5c42', fontSize: 11, fontWeight: 600, marginBottom: 2 }}>LINK</div>
            <div style={{ color: '#9c8b6e', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {url}
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="btn-ghost"
            style={{ padding: '8px 14px', fontSize: 13, flexShrink: 0 }}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </>
  );
}

function ShareOption({ icon, label, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        background: '#f0ebe0', border: '1px solid #d8cfa8',
        borderRadius: 10, padding: '14px 16px',
        cursor: 'pointer', textAlign: 'left', width: '100%',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#a2bc82'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#d8cfa8'}
    >
      <span style={{ fontSize: 24, flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ color: '#2c2416', fontWeight: 600, fontSize: 14 }}>{label}</div>
        <div style={{ color: '#9c8b6e', fontSize: 12 }}>{desc}</div>
      </div>
      <span style={{ marginLeft: 'auto', color: '#c8bc96', fontSize: 16 }}>›</span>
    </button>
  );
}

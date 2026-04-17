import { useState, useEffect } from 'react';

const BASE_MESSAGES = [
  { emoji: '🐾', text: 'Sniffing out dispersed sites off the beaten path…' },
  { emoji: '💧', text: 'Locating creek access and swimming holes…' },
  { emoji: '🌲', text: 'Checking shade coverage for afternoon naps…' },
  { emoji: '🗺️', text: "Plotting the route — checking your rig's clearance…" },
  { emoji: '🌡️', text: 'Running the heat index for {dog}…' },
  { emoji: '🐻', text: 'Checking recent bear activity reports…' },
  { emoji: '🌅', text: 'Finding the best sunrise view from camp…' },
  { emoji: '🔥', text: 'Scanning for fire restrictions and open roads…' },
  { emoji: '📡', text: 'Confirming emergency cell coverage at the site…' },
  { emoji: '🪵', text: "Almost there — writing {dog}'s trip report…" },
];

// Fun dog camping facts to show mid-wait
const DOG_FACTS = [
  'Dogs navigate by smell — they can detect water sources up to a mile away.',
  "Most BLM land allows dogs off-leash as long as they're under voice control.",
  "A dog's paw pads can overheat on dark granite above 75°F.",
  'Bears are much more attracted to dog food than to dogs themselves.',
  'The Leave No Trace guideline for dogs: pack out all waste, even on dispersed land.',
  'Dogs sleep up to 50% better after a day of hiking than a day of rest.',
];

export default function PlanningOverlay({ dogName, location }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(4); // start visible, not at zero
  const [factIndex] = useState(() => Math.floor(Math.random() * DOG_FACTS.length));

  const dog = dogName || 'your pup';
  const messages = BASE_MESSAGES.map(m => ({
    ...m,
    text: m.text.replace(/\{dog\}/g, dog),
  }));

  // Cycle through messages every 2.8s
  useEffect(() => {
    const id = setInterval(() => {
      setMsgIndex(i => (i + 1) % messages.length);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  // Fake progress bar: rushes to ~88% then stalls waiting for the API
  useEffect(() => {
    let current = 0;
    const id = setInterval(() => {
      current += Math.random() * 4 + 1;
      if (current >= 88) {
        current = 88;
        clearInterval(id);
      }
      setProgress(current);
    }, 400);
    return () => clearInterval(id);
  }, []);

  const { emoji, text } = messages[msgIndex];

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: '#f2ede0',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px',
        animation: 'fadeIn 0.35s ease-out',
      }}
    >
      {/* Floating paw prints background */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {PAW_POSITIONS.map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y,
              fontSize: p.size,
              opacity: p.opacity,
              animation: `float-up ${p.duration}s ease-in-out ${p.delay}s infinite`,
              color: '#5c7a3e',
            }}
          >
            🐾
          </div>
        ))}
      </div>

      {/* Inject float-up keyframes */}
      <style>{`
        @keyframes float-up {
          0%   { transform: translateY(0)   rotate(0deg);   opacity: inherit; }
          50%  { transform: translateY(-18px) rotate(6deg);  opacity: 0.6; }
          100% { transform: translateY(0)   rotate(-4deg);  opacity: inherit; }
        }
        @keyframes msg-fade {
          0%   { opacity: 0; transform: translateY(6px); }
          15%  { opacity: 1; transform: translateY(0); }
          85%  { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-4px); }
        }
      `}</style>

      {/* Main card */}
      <div style={{
        position: 'relative',
        background: '#faf7f0',
        border: '1.5px solid #d8cfa8',
        borderRadius: 20,
        padding: '40px 36px',
        maxWidth: 420,
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 8px 40px rgba(44,36,22,0.1)',
      }}>
        {/* Big animated emoji */}
        <div
          key={msgIndex}
          style={{
            fontSize: 56,
            marginBottom: 20,
            animation: 'msg-fade 2.8s ease forwards',
            display: 'block',
          }}
        >
          {emoji}
        </div>

        {/* Destination chip */}
        {location && (
          <div style={{
            display: 'inline-block',
            background: 'rgba(92,122,62,0.1)',
            border: '1px solid rgba(92,122,62,0.25)',
            borderRadius: 999,
            color: '#5c7a3e',
            fontSize: 12, fontWeight: 600,
            padding: '4px 14px',
            marginBottom: 16,
            letterSpacing: '0.3px',
          }}>
            📍 {location}
          </div>
        )}

        {/* Heading */}
        <h2 style={{
          color: '#2c2416',
          fontSize: 22, fontWeight: 700,
          letterSpacing: '-0.4px',
          margin: '0 0 8px',
        }}>
          Planning {dogName ? `${dogName}'s` : 'your'} trip
        </h2>

        {/* Cycling message */}
        <div style={{ minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p
            key={msgIndex}
            style={{
              color: '#6b5c42',
              fontSize: 14,
              lineHeight: 1.55,
              margin: 0,
              animation: 'msg-fade 2.8s ease forwards',
            }}
          >
            {text}
          </p>
        </div>

        {/* Progress bar */}
        <div style={{
          margin: '24px 0 20px',
          height: 6,
          background: '#e8e0ca',
          borderRadius: 999,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #5c7a3e, #7a9a55)',
            borderRadius: 999,
            transition: 'width 0.4s ease',
          }} />
        </div>

        {/* Dog fact */}
        <div style={{
          background: 'rgba(92,122,62,0.06)',
          border: '1px solid rgba(92,122,62,0.15)',
          borderRadius: 10,
          padding: '12px 16px',
          textAlign: 'left',
        }}>
          <div style={{ color: '#5c7a3e', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 5 }}>
            🐕 Did you know?
          </div>
          <p style={{ color: '#4a3c28', fontSize: 12, lineHeight: 1.6, margin: 0 }}>
            {DOG_FACTS[factIndex]}
          </p>
        </div>
      </div>

      {/* Reassurance below card */}
      <p style={{ color: '#9c8b6e', fontSize: 13, marginTop: 20, textAlign: 'center' }}>
        This usually takes 10–15 seconds ·&nbsp;
        <span style={{ color: '#b8aa88' }}>Powered by Claude AI</span>
      </p>
    </div>
  );
}

// Pre-generated paw print positions so they don't shift on re-render
const PAW_POSITIONS = [
  { x: '5%',  y: '10%', size: 18, opacity: 0.07, duration: 4.2, delay: 0 },
  { x: '88%', y: '8%',  size: 14, opacity: 0.06, duration: 5.1, delay: 1 },
  { x: '15%', y: '75%', size: 22, opacity: 0.08, duration: 3.8, delay: 0.5 },
  { x: '75%', y: '70%', size: 16, opacity: 0.06, duration: 4.5, delay: 1.8 },
  { x: '50%', y: '90%', size: 12, opacity: 0.05, duration: 6.0, delay: 0.8 },
  { x: '92%', y: '45%', size: 20, opacity: 0.07, duration: 4.8, delay: 2.2 },
  { x: '3%',  y: '50%', size: 15, opacity: 0.06, duration: 5.5, delay: 1.4 },
  { x: '40%', y: '5%',  size: 18, opacity: 0.07, duration: 4.0, delay: 0.3 },
];

export default function Nav({ view, onNav, tripCount, hasProfile }) {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(36,28,16,0.96)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #3d3020',
      padding: '0 20px',
    }}>
      <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <button
          onClick={() => onNav('home')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <span style={{ fontSize: 20 }}>⛺</span>
          <span style={{ color: '#f2ede0', fontWeight: 700, fontSize: 16, letterSpacing: '-0.3px' }}>
            Base Camp
          </span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <NavBtn active={view === 'home'} onClick={() => onNav('home')}>Home</NavBtn>
          <NavBtn active={view === 'plan'} onClick={() => onNav('plan')}>Plan</NavBtn>
          <NavBtn active={view === 'stats'} onClick={() => onNav('stats')}>Stats</NavBtn>
          <NavBtn
            active={view === 'log' || view === 'detail'}
            onClick={() => onNav('log')}
          >
            Log {tripCount > 0 && (
              <span style={{
                marginLeft: 4,
                background: 'rgba(92,122,62,0.25)',
                color: '#a2bc82',
                fontSize: 11,
                fontWeight: 600,
                padding: '1px 6px',
                borderRadius: 999,
              }}>{tripCount}</span>
            )}
          </NavBtn>

          {/* Profile */}
          <button
            onClick={() => onNav('profile')}
            title="Your profile"
            style={{
              background: view === 'profile' ? 'rgba(92,122,62,0.18)' : 'transparent',
              border: 'none',
              borderRadius: 6,
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              marginLeft: 2,
            }}
          >
            <span style={{ fontSize: 17 }}>👤</span>
            {hasProfile && view !== 'profile' && (
              <span style={{
                position: 'absolute',
                top: 5,
                right: 5,
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#7a9a55',
                border: '1.5px solid rgba(36,28,16,0.9)',
              }} />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}

function NavBtn({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? 'rgba(92,122,62,0.18)' : 'transparent',
        border: 'none',
        color: active ? '#a2bc82' : '#9c8b6e',
        fontWeight: active ? 600 : 400,
        fontSize: 14,
        padding: '6px 12px',
        borderRadius: 6,
        cursor: 'pointer',
        transition: 'all 0.15s',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      {children}
    </button>
  );
}

import { useState, useRef, useEffect } from 'react';

// Comprehensive overlanding/camping vehicle database
// Organised by category so we can show smart groupings
const VEHICLES = [
  // ── Trucks ──────────────────────────────────────────────────────────
  'Toyota Tacoma', 'Toyota Tundra', 'Toyota Hilux',
  'Ford F-150', 'Ford F-250', 'Ford F-350', 'Ford Ranger', 'Ford Maverick',
  'Chevrolet Silverado 1500', 'Chevrolet Silverado 2500', 'Chevrolet Colorado',
  'GMC Sierra 1500', 'GMC Sierra 2500', 'GMC Canyon',
  'Ram 1500', 'Ram 2500', 'Ram 3500',
  'Nissan Frontier', 'Nissan Titan',
  'Honda Ridgeline',
  'Jeep Gladiator',
  'Rivian R1T',
  'Canoo Pickup',

  // ── Body-on-frame SUVs ───────────────────────────────────────────────
  'Toyota 4Runner', 'Toyota Land Cruiser', 'Toyota Land Cruiser 200', 'Toyota FJ Cruiser', 'Toyota Sequoia',
  'Jeep Wrangler', 'Jeep Wrangler Unlimited', 'Jeep Grand Cherokee', 'Jeep Grand Wagoneer', 'Jeep Cherokee',
  'Ford Bronco', 'Ford Bronco Sport', 'Ford Expedition',
  'Chevrolet Tahoe', 'Chevrolet Suburban', 'Chevrolet Blazer K5',
  'GMC Yukon', 'GMC Yukon XL',
  'Ram 1500 Classic', 'Dodge Durango',
  'Nissan Patrol', 'Nissan Armada',
  'Land Rover Defender', 'Land Rover Discovery', 'Land Rover Range Rover',
  'Mercedes-Benz G-Class',
  'Lexus GX', 'Lexus LX',
  'Lincoln Navigator',

  // ── Crossovers & Subaru ──────────────────────────────────────────────
  'Subaru Outback', 'Subaru Forester', 'Subaru Ascent', 'Subaru Crosstrek',
  'Toyota RAV4', 'Toyota RAV4 Hybrid', 'Toyota Venza', 'Toyota Highlander',
  'Honda CR-V', 'Honda Passport', 'Honda Pilot',
  'Ford Explorer', 'Ford Edge',
  'Chevrolet Equinox', 'Chevrolet Traverse', 'Chevrolet Trailblazer',
  'GMC Terrain', 'GMC Acadia',
  'Jeep Compass', 'Jeep Renegade',
  'Kia Telluride', 'Kia Sorento', 'Kia Sportage',
  'Hyundai Palisade', 'Hyundai Santa Fe', 'Hyundai Tucson',
  'Mazda CX-5', 'Mazda CX-50', 'Mazda CX-9',
  'Nissan Pathfinder', 'Nissan Murano', 'Nissan Rogue',
  'Volvo XC90', 'Volvo XC60',
  'BMW X5', 'BMW X3',
  'Audi Q7', 'Audi Q5',
  'Mercedes-Benz GLE', 'Mercedes-Benz GLC',
  'Rivian R1S',
  'Cadillac Escalade', 'Cadillac XT6',
  'Lincoln Aviator',

  // ── Vans ─────────────────────────────────────────────────────────────
  'Mercedes-Benz Sprinter', 'Mercedes-Benz Metris',
  'Ford Transit', 'Ford Transit Connect', 'Ford E-Series / Econoline',
  'Ram ProMaster', 'Ram ProMaster City',
  'Chevrolet Express', 'GMC Savana',
  'Volkswagen Transporter', 'Volkswagen Crafter',
  'Nissan NV', 'Nissan NV200',
  'Toyota HiAce',
  'Fiat Ducato',
  'Winnebago Travato', 'Airstream Interstate',

  // ── Wagons / Station wagons ──────────────────────────────────────────
  'Volvo V90 Cross Country', 'Volvo V60 Cross Country',
  'Audi A4 Allroad', 'Audi A6 Allroad',
  'Subaru Legacy Outback',
  'Volkswagen Golf Alltrack', 'Volkswagen Passat Alltrack',
  'BMW 3 Series xDrive Touring',

  // ── Electric / Hybrid overlanders ───────────────────────────────────
  'Ford F-150 Lightning', 'Ford Explorer PHEV',
  'Chevrolet Silverado EV',
  'GMC Hummer EV',
  'Ram 1500 REV',
  'Toyota Tacoma Hybrid',
  'Jeep Grand Cherokee 4xe', 'Jeep Wrangler 4xe',
  'Rivian R1T', 'Rivian R1S',
  'Tesla Model Y', 'Tesla Model X',
];

// Deduplicate and sort alphabetically
const ALL_VEHICLES = [...new Set(VEHICLES)].sort((a, b) => a.localeCompare(b));

export default function RigSearch({ value, onChange, placeholder = 'Search your vehicle...' }) {
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Sync external value changes (e.g. profile pre-fill)
  useEffect(() => {
    if (value && value !== query) setQuery(value);
  }, [value]);

  const filtered = query.trim().length < 1
    ? ALL_VEHICLES.slice(0, 12)   // show popular options when empty
    : ALL_VEHICLES.filter(v =>
        v.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 20);

  const showCustomOption = query.trim().length > 1 &&
    !ALL_VEHICLES.some(v => v.toLowerCase() === query.trim().toLowerCase());

  const allOptions = showCustomOption
    ? [...filtered, `Use "${query.trim()}"`]
    : filtered;

  function select(option) {
    const val = option.startsWith('Use "') ? query.trim() : option;
    setQuery(val);
    onChange(val);
    setOpen(false);
  }

  function handleKeyDown(e) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') setOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted(h => Math.min(h + 1, allOptions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allOptions[highlighted]) select(allOptions[highlighted]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  function handleChange(e) {
    setQuery(e.target.value);
    onChange(e.target.value);
    setOpen(true);
    setHighlighted(0);
  }

  function handleBlur(e) {
    // Delay so click on option fires first
    setTimeout(() => setOpen(false), 150);
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '10px 36px 10px 14px',
            fontSize: 15,
            boxSizing: 'border-box',
          }}
          autoComplete="off"
        />
        {/* Search / clear icon */}
        {query ? (
          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); setQuery(''); onChange(''); setOpen(false); }}
            style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#9c8b6e', fontSize: 16, lineHeight: 1, padding: 2,
            }}
          >×</button>
        ) : (
          <span style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            color: '#c8bc96', fontSize: 14, pointerEvents: 'none',
          }}>🔍</span>
        )}
      </div>

      {open && allOptions.length > 0 && (
        <div
          ref={listRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 100,
            background: '#fffdf8',
            border: '1px solid #c8bc96',
            borderTop: 'none',
            borderRadius: '0 0 8px 8px',
            boxShadow: '0 4px 16px rgba(44,36,22,0.12)',
            maxHeight: 260,
            overflowY: 'auto',
          }}
        >
          {query.trim().length < 1 && (
            <div style={{ padding: '8px 14px 4px', color: '#b8aa88', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Popular
            </div>
          )}
          {allOptions.map((option, i) => {
            const isCustom = option.startsWith('Use "');
            return (
              <div
                key={option}
                onMouseDown={() => select(option)}
                style={{
                  padding: '9px 14px',
                  fontSize: 14,
                  cursor: 'pointer',
                  background: i === highlighted ? 'rgba(92,122,62,0.1)' : 'transparent',
                  color: isCustom ? '#5c7a3e' : '#2c2416',
                  fontStyle: isCustom ? 'normal' : 'normal',
                  fontWeight: isCustom ? 500 : 400,
                  borderTop: isCustom ? '1px solid #e8e0ca' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                onMouseEnter={() => setHighlighted(i)}
              >
                {isCustom && <span style={{ fontSize: 12 }}>✏️</span>}
                {option}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

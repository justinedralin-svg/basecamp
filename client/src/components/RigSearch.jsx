import { useState, useEffect } from 'react';

// Vehicle database — Make → Models
// Focused on trucks, SUVs, vans, and wagons used for camping/overlanding
const VEHICLE_DB = {
  'Audi':              ['A4 Allroad', 'A6 Allroad', 'Q5', 'Q7', 'Q8'],
  'BMW':               ['X3', 'X5', 'X7'],
  'Cadillac':          ['Escalade', 'XT5', 'XT6'],
  'Chevrolet':         ['Blazer', 'Colorado', 'Equinox', 'Express Van', 'Silverado 1500', 'Silverado 2500HD', 'Silverado 3500HD', 'Suburban', 'Tahoe', 'Traverse', 'Trailblazer'],
  'Dodge':             ['Durango', 'Ram 1500', 'Ram 2500', 'Ram 3500'],
  'Ford':              ['Bronco', 'Bronco Sport', 'E-Series / Econoline', 'Expedition', 'Explorer', 'F-150', 'F-150 Lightning', 'F-250 Super Duty', 'F-350 Super Duty', 'Maverick', 'Ranger', 'Transit', 'Transit Connect'],
  'GMC':               ['Acadia', 'Canyon', 'Envoy', 'Jimmy', 'Safari', 'Savana Van', 'Sierra 1500', 'Sierra 2500HD', 'Sierra 3500HD', 'Terrain', 'Yukon', 'Yukon XL'],
  'Honda':             ['CR-V', 'Element', 'Passport', 'Pilot', 'Ridgeline'],
  'Hyundai':           ['Palisade', 'Santa Fe', 'Tucson'],
  'Isuzu':             ['Trooper', 'VehiCROSS'],
  'Jeep':              ['Cherokee', 'Compass', 'Gladiator', 'Grand Cherokee', 'Grand Cherokee 4xe', 'Grand Wagoneer', 'Renegade', 'Wrangler', 'Wrangler 4xe', 'Wrangler Unlimited'],
  'Kia':               ['Sorento', 'Sportage', 'Telluride'],
  'Land Rover':        ['Defender', 'Discovery', 'Discovery Sport', 'Freelander', 'LR3', 'LR4', 'Range Rover', 'Range Rover Sport'],
  'Lexus':             ['GX 460', 'GX 470', 'LX 570', 'LX 600'],
  'Lincoln':           ['Aviator', 'Navigator'],
  'Mazda':             ['CX-5', 'CX-50', 'CX-9'],
  'Mercedes-Benz':     ['G-Class', 'GLE', 'Metris', 'Sprinter 1500', 'Sprinter 2500', 'Sprinter 3500'],
  'Mitsubishi':        ['Montero', 'Outlander', 'Pajero'],
  'Nissan':            ['Armada', 'Frontier', 'Murano', 'NV Cargo', 'NV Passenger', 'Pathfinder', 'Patrol', 'Rogue', 'Titan', 'Xterra'],
  'Ram':               ['1500', '1500 Classic', '2500', '3500', 'ProMaster', 'ProMaster City'],
  'Rivian':            ['R1S', 'R1T'],
  'Subaru':            ['Ascent', 'Crosstrek', 'Forester', 'Legacy Outback', 'Outback'],
  'Tesla':             ['Model X', 'Model Y'],
  'Toyota':            ['4Runner', 'FJ Cruiser', 'HiAce', 'Highlander', 'Land Cruiser', 'Land Cruiser 200', 'Land Cruiser 300', 'RAV4', 'RAV4 Hybrid', 'Sequoia', 'Tacoma', 'Tacoma Hybrid', 'Tundra'],
  'Volkswagen':        ['Atlas', 'Crafter', 'Golf Alltrack', 'Touareg', 'Transporter'],
  'Volvo':             ['V60 Cross Country', 'V90 Cross Country', 'XC60', 'XC90'],
};

const MAKES = Object.keys(VEHICLE_DB).sort();

// Generate year options — current year down to 1990
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1989 }, (_, i) => String(currentYear - i));

const selectStyle = {
  width: '100%',
  padding: '10px 14px',
  fontSize: 15,
  boxSizing: 'border-box',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%239c8b6e' d='M6 8L0 0h12z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 14px center',
  paddingRight: 36,
  cursor: 'pointer',
};

export default function RigSearch({ value, onChange }) {
  // Parse an existing value like "2021 Toyota Tacoma" or "Toyota Tacoma"
  function parseValue(val) {
    if (!val) return { year: '', make: '', model: '' };
    const parts = val.trim().split(' ');
    if (/^\d{4}$/.test(parts[0])) {
      const year = parts[0];
      const rest = parts.slice(1).join(' ');
      const make = MAKES.find(m => rest.startsWith(m)) || '';
      const model = make ? rest.slice(make.length).trim() : rest;
      return { year, make, model };
    }
    const make = MAKES.find(m => val.startsWith(m)) || '';
    const model = make ? val.slice(make.length).trim() : '';
    return { year: '', make, model };
  }

  const parsed = parseValue(value);
  const [year, setYear]   = useState(parsed.year);
  const [make, setMake]   = useState(parsed.make);
  const [model, setModel] = useState(parsed.model);

  // Sync external value changes (profile pre-fill)
  useEffect(() => {
    const p = parseValue(value);
    setYear(p.year);
    setMake(p.make);
    setModel(p.model);
  }, [value]);

  function emit(y, mk, mo) {
    const parts = [y, mk, mo].filter(Boolean);
    onChange(parts.join(' '));
  }

  function handleYear(val) {
    setYear(val);
    emit(val, make, model);
  }

  function handleMake(val) {
    setMake(val);
    setModel('');
    emit(year, val, '');
  }

  function handleModel(val) {
    setModel(val);
    emit(year, make, val);
  }

  const models = make ? (VEHICLE_DB[make] || []) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Row 1: Year + Make */}
      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 10 }}>
        <div>
          <div style={{ color: '#9c8b6e', fontSize: 11, fontWeight: 500, marginBottom: 5 }}>Year</div>
          <select
            value={year}
            onChange={e => handleYear(e.target.value)}
            style={selectStyle}
          >
            <option value="">Any</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <div style={{ color: '#9c8b6e', fontSize: 11, fontWeight: 500, marginBottom: 5 }}>Make</div>
          <select
            value={make}
            onChange={e => handleMake(e.target.value)}
            style={selectStyle}
          >
            <option value="">Select make…</option>
            {MAKES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* Row 2: Model (full width, only active once make is chosen) */}
      <div>
        <div style={{ color: '#9c8b6e', fontSize: 11, fontWeight: 500, marginBottom: 5 }}>Model</div>
        {make ? (
          <select
            value={model}
            onChange={e => handleModel(e.target.value)}
            style={selectStyle}
          >
            <option value="">Select model…</option>
            {models.map(m => <option key={m} value={m}>{m}</option>)}
            <option value="Other">Other / not listed</option>
          </select>
        ) : (
          <select disabled style={{ ...selectStyle, opacity: 0.45, cursor: 'not-allowed' }}>
            <option>Select a make first</option>
          </select>
        )}
      </div>

      {/* Free-text fallback for "Other" model */}
      {model === 'Other' && (
        <input
          type="text"
          placeholder="Type your model (e.g. Tacoma TRD Pro)"
          style={{ width: '100%', padding: '10px 14px', fontSize: 15, boxSizing: 'border-box' }}
          onBlur={e => { if (e.target.value) { setModel(e.target.value); emit(year, make, e.target.value); } }}
          defaultValue=""
          autoFocus
        />
      )}

      {/* Summary pill */}
      {make && model && model !== 'Other' && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(92,122,62,0.09)', border: '1px solid rgba(92,122,62,0.22)',
          borderRadius: 999, padding: '4px 14px', fontSize: 13,
          color: '#3d5429', fontWeight: 500, alignSelf: 'flex-start',
        }}>
          🚙 {[year, make, model].filter(Boolean).join(' ')}
        </div>
      )}
    </div>
  );
}

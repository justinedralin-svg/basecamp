import { useEffect, useState } from 'react';

// WMO weather code → emoji + label
function weatherIcon(code) {
  if (code === 0) return { icon: '☀️', label: 'Clear' };
  if (code <= 3) return { icon: '⛅', label: 'Partly cloudy' };
  if (code <= 48) return { icon: '🌫️', label: 'Foggy' };
  if (code <= 57) return { icon: '🌦️', label: 'Drizzle' };
  if (code <= 67) return { icon: '🌧️', label: 'Rain' };
  if (code <= 77) return { icon: '❄️', label: 'Snow' };
  if (code <= 82) return { icon: '🌦️', label: 'Showers' };
  if (code <= 86) return { icon: '🌨️', label: 'Snow showers' };
  if (code <= 99) return { icon: '⛈️', label: 'Thunderstorm' };
  return { icon: '🌡️', label: 'Unknown' };
}

function parseCoords(coordStr) {
  if (!coordStr) return null;
  const parts = coordStr.split(/[,\s]+/).map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
  if (parts.length >= 2) {
    const [lat, lon] = parts;
    if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) return { lat, lon };
  }
  return null;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Dog heat risk — dogs can't sweat, they pant, making them far more vulnerable than humans
function dogHeatRisk(highF) {
  if (highF >= 95) return {
    level: 'danger',
    color: '#b91c1c',
    bg: 'rgba(185,28,28,0.06)',
    border: 'rgba(185,28,28,0.25)',
    icon: '🚨',
    label: 'Danger',
    message: `Highs of ${highF}°F — serious heatstroke risk for dogs. Avoid strenuous activity, keep them in shade, and have cold water ready at all times.`,
  };
  if (highF >= 85) return {
    level: 'warning',
    color: '#b45309',
    bg: 'rgba(180,83,9,0.06)',
    border: 'rgba(180,83,9,0.25)',
    icon: '⚠️',
    label: 'Hot',
    message: `Highs of ${highF}°F — limit exercise to early morning or evening. Bring extra water and watch for heavy panting, drooling, or stumbling.`,
  };
  if (highF >= 75) return {
    level: 'caution',
    color: '#92620a',
    bg: 'rgba(146,98,10,0.06)',
    border: 'rgba(146,98,10,0.20)',
    icon: '🌡️',
    label: 'Warm',
    message: `Highs of ${highF}°F — warm conditions for dogs. Keep water handy and watch brachycephalic breeds (pugs, bulldogs) closely.`,
  };
  return null;
}

export default function WeatherStrip({ coordinates, tripDates, destination, weatherPrefs }) {
  const [weather, setWeather] = useState(null);
  const [tripStart, setTripStart] = useState(null);
  const [tripEnd, setTripEnd] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const coords = parseCoords(coordinates);
    if (!coords) return;

    setLoading(true);
    setError(null);

    fetch(`/api/weather?lat=${coords.lat}&lon=${coords.lon}&dates=${encodeURIComponent(tripDates || '')}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setWeather(data.weather);
        setTripStart(data.tripStart);
        setTripEnd(data.tripEnd);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [coordinates, tripDates]);

  if (!parseCoords(coordinates)) return null;

  // Thresholds — use user prefs if set, fall back to camping safety defaults
  const wp = weatherPrefs || {};
  const rainThreshold = wp.maxRainChance ?? 60;   // alert if rain >= this %
  const coldThreshold = wp.minTempF ? parseFloat(wp.minTempF) : 28;
  const hotThreshold  = wp.maxTempF ? parseFloat(wp.maxTempF) : 95;
  const windThreshold = wp.avoidWind ? 25 : 999;  // 999 = effectively disabled

  // Collect violations on trip days for the summary banner
  const violations = [];

  return (
    <div className="card" style={{ padding: 20, marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 18 }}>🌤️</span>
        <h3 style={{ color: '#2c2416', fontSize: 15, fontWeight: 600, margin: 0 }}>
          Weather forecast
        </h3>
        {tripDates && (
          <span style={{ color: '#9c8b6e', fontSize: 12, marginLeft: 4 }}>· {tripDates}</span>
        )}
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9c8b6e', fontSize: 13 }}>
          <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
          Fetching forecast...
        </div>
      )}

      {error && (
        <div style={{ color: '#9c8b6e', fontSize: 13 }}>
          Forecast unavailable for this location.
        </div>
      )}

      {weather && (() => {
        // Collect violations in a first pass
        const dayViolations = [];
        let maxTripHighF = null;
        weather.time.forEach((dateStr, i) => {
          const isTripDay = tripStart && tripEnd && dateStr >= tripStart && dateStr <= tripEnd;
          if (!isTripDay) return;
          const date = new Date(dateStr + 'T12:00:00');
          const day = DAY_LABELS[date.getDay()];
          const high = Math.round(weather.temperature_2m_max[i]);
          const low = Math.round(weather.temperature_2m_min[i]);
          const rain = weather.precipitation_probability_max[i];
          const wind = Math.round(weather.windspeed_10m_max[i]);

          if (rain >= rainThreshold) dayViolations.push(`${day}: ${rain}% rain`);
          if (low < coldThreshold) dayViolations.push(`${day}: low ${low}°F`);
          if (high > hotThreshold) dayViolations.push(`${day}: high ${high}°F`);
          if (wind >= windThreshold) dayViolations.push(`${day}: ${wind}mph winds`);
          if (maxTripHighF === null || high > maxTripHighF) maxTripHighF = high;
        });

        const heatRisk = maxTripHighF !== null ? dogHeatRisk(maxTripHighF) : null;

        return (
          <>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, paddingTop: 10 }}>
              {weather.time.map((dateStr, i) => {
                const date = new Date(dateStr + 'T12:00:00');
                const dayLabel = DAY_LABELS[date.getDay()];
                const monthDay = `${date.getMonth() + 1}/${date.getDate()}`;
                const { icon, label } = weatherIcon(weather.weathercode[i]);
                const high = Math.round(weather.temperature_2m_max[i]);
                const low = Math.round(weather.temperature_2m_min[i]);
                const rain = weather.precipitation_probability_max[i];
                const wind = Math.round(weather.windspeed_10m_max[i]);
                const isTripDay = tripStart && tripEnd && dateStr >= tripStart && dateStr <= tripEnd;

                // Per-day alerts use user thresholds
                const hotAlert  = high > hotThreshold;
                const coldAlert = low < coldThreshold;
                const rainAlert = rain >= rainThreshold;
                const windAlert = wind >= windThreshold;
                const hasAlert  = hotAlert || coldAlert || rainAlert || windAlert;

                return (
                  <div
                    key={dateStr}
                    style={{
                      flex: '0 0 auto',
                      minWidth: 90,
                      background: isTripDay ? 'rgba(92,122,62,0.09)' : '#f0ebe0',
                      border: `1px solid ${isTripDay ? (hasAlert ? '#b91c1c' : '#5c7a3e') : hasAlert ? 'rgba(185,28,28,0.2)' : '#d8cfa8'}`,
                      borderRadius: 8,
                      padding: '10px 12px',
                      textAlign: 'center',
                      position: 'relative',
                    }}
                  >
                    {isTripDay && (
                      <div style={{
                        position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
                        background: hasAlert ? '#b91c1c' : '#5c7a3e',
                        color: '#faf7f0',
                        fontSize: 9, fontWeight: 700, padding: '1px 6px',
                        borderRadius: 999, whiteSpace: 'nowrap', letterSpacing: '0.3px',
                      }}>
                        TRIP
                      </div>
                    )}
                    <div style={{ color: isTripDay ? '#4a6332' : '#9c8b6e', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                      {dayLabel} {monthDay}
                    </div>
                    <div style={{ fontSize: 22, marginBottom: 4 }} title={label}>{icon}</div>
                    <div style={{ color: '#2c2416', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                      {high}° <span style={{ color: '#9c8b6e', fontWeight: 400 }}>{low}°</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {rain > 0 && (
                        <div style={{ color: rainAlert ? '#1d6a8a' : '#9c8b6e', fontSize: 11 }}>
                          💧 {rain}%
                        </div>
                      )}
                      {wind > 0 && (
                        <div style={{ color: windAlert ? '#4a6332' : '#9c8b6e', fontSize: 11 }}>
                          💨 {wind}mph
                        </div>
                      )}
                    </div>
                    {hasAlert && isTripDay && (
                      <div style={{ marginTop: 5, color: '#b91c1c', fontSize: 10, lineHeight: 1.3 }}>
                        {hotAlert && 'Too hot ⚠'}
                        {coldAlert && 'Too cold ⚠'}
                        {rainAlert && 'Rain ⚠'}
                        {windAlert && 'Wind ⚠'}
                      </div>
                    )}
                    {hasAlert && !isTripDay && (
                      <div style={{ marginTop: 5, color: '#9c8b6e', fontSize: 10, lineHeight: 1.3 }}>
                        {hotAlert && 'Heat ⚠'}
                        {coldAlert && 'Freeze ⚠'}
                        {rainAlert && 'Rain ⚠'}
                        {windAlert && 'Wind ⚠'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Dog heat warning banner */}
            {heatRisk && (
              <div style={{
                marginTop: 12,
                background: heatRisk.bg,
                border: `1px solid ${heatRisk.border}`,
                borderRadius: 8,
                padding: '10px 14px',
              }}>
                <div style={{ color: heatRisk.color, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  {heatRisk.icon} Dog heat {heatRisk.label}
                </div>
                <div style={{ color: '#6b5c42', fontSize: 12, lineHeight: 1.5 }}>
                  {heatRisk.message}
                </div>
                {heatRisk.level === 'danger' && (
                  <div style={{ color: '#b91c1c', fontSize: 11, marginTop: 6, fontWeight: 500 }}>
                    Signs of heatstroke: excessive panting, drooling, vomiting, collapse. Cool with water immediately and find a vet.
                  </div>
                )}
              </div>
            )}

            {/* Violation banner — shown when trip days conflict with user's preferences */}
            {dayViolations.length > 0 && (
              <div style={{
                marginTop: 12,
                background: 'rgba(185,28,28,0.06)',
                border: '1px solid rgba(185,28,28,0.20)',
                borderRadius: 8,
                padding: '10px 14px',
              }}>
                <div style={{ color: '#b91c1c', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  ⚠ Forecast conflicts with your weather preferences
                </div>
                <div style={{ color: '#6b5c42', fontSize: 12, lineHeight: 1.5 }}>
                  {dayViolations.join(' · ')}
                </div>
                <div style={{ color: '#9c8b6e', fontSize: 11, marginTop: 6 }}>
                  Consider re-planning for different dates or a higher-elevation spot.
                </div>
              </div>
            )}
          </>
        );
      })()}

      {weather && (
        <div style={{ color: '#b8aa88', fontSize: 10, marginTop: 10 }}>
          Forecast from Open-Meteo · {destination}
        </div>
      )}
    </div>
  );
}

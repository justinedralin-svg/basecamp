/**
 * TripBrief — generates a print-optimized one-pager for offline use.
 * Opens in a new window so the main app is untouched.
 */
export function printTripBrief(entry) {
  const { trip, constraints } = entry;
  if (!trip) return;

  const t = trip;
  const c = constraints || {};

  const dogNames = c.dogs?.map(d => d.name).filter(Boolean).join(' & ') || 'Dogs';
  const packItems = t.packingItems?.length
    ? t.packingItems
    : (t.packingNotes || '').split(/\n+/).map(l => l.replace(/^[-•*·\d.)]\s*/, '').trim()).filter(l => l.length > 4);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${t.destination} — Camp With My Dog Trip Brief</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
      font-size: 11px;
      line-height: 1.4;
      color: #1a1208;
      background: #fff;
      padding: 18px 22px;
    }
    .header {
      border-bottom: 2.5px solid #5c7a3e;
      padding-bottom: 10px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .title { font-size: 22px; font-weight: 700; letter-spacing: -0.4px; color: #1a1208; }
    .tagline { font-size: 12px; color: #5c7a3e; font-style: italic; margin-top: 2px; }
    .meta { font-size: 10px; color: #7a6a50; text-align: right; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 10px; }
    .box {
      border: 1px solid #d8cfa8;
      border-radius: 6px;
      padding: 8px 10px;
      background: #faf7f0;
    }
    .box-label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #9c8b6e;
      margin-bottom: 5px;
    }
    .box-title {
      font-size: 12px;
      font-weight: 700;
      color: #2c2416;
      margin-bottom: 3px;
    }
    .row { display: flex; gap: 8px; margin-bottom: 3px; }
    .row-label { font-size: 10px; color: #9c8b6e; font-weight: 600; min-width: 72px; flex-shrink: 0; }
    .row-val { font-size: 10px; color: #3d3020; }
    .pack-grid { columns: 2; gap: 12px; }
    .pack-item {
      display: flex; align-items: flex-start; gap: 6px;
      margin-bottom: 4px; break-inside: avoid;
    }
    .checkbox {
      width: 12px; height: 12px; border: 1.5px solid #c8bc96;
      border-radius: 2px; flex-shrink: 0; margin-top: 0.5px;
      background: #fff;
    }
    .pack-text { font-size: 10px; color: #3d3020; line-height: 1.4; }
    .alert {
      border: 1px solid rgba(185,28,28,0.3);
      background: rgba(185,28,28,0.05);
      border-radius: 5px;
      padding: 5px 8px;
      margin-bottom: 4px;
      font-size: 10px;
      color: #8b1c1c;
    }
    .highlight-list { padding-left: 0; list-style: none; }
    .highlight-list li { margin-bottom: 3px; padding-left: 14px; position: relative; font-size: 10px; color: #3d3020; }
    .highlight-list li.green::before { content: '✓'; position: absolute; left: 0; color: #2d6a2d; font-weight: 700; }
    .highlight-list li.red::before { content: '⚠'; position: absolute; left: 0; color: #b91c1c; }
    .coords {
      font-family: 'SF Mono', 'Menlo', 'Courier New', monospace;
      font-size: 10px; color: #5c7a3e; font-weight: 600;
    }
    .footer {
      border-top: 1px solid #d8cfa8;
      padding-top: 7px;
      margin-top: 10px;
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #b8aa88;
    }
    .section-full {
      border: 1px solid #d8cfa8;
      border-radius: 6px;
      padding: 8px 10px;
      background: #faf7f0;
      margin-bottom: 10px;
    }
    @media print {
      body { padding: 10px 14px; }
      @page { margin: 0.4in; size: letter; }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div>
      <div class="title">⛺ ${t.destination}</div>
      ${t.tagline ? `<div class="tagline">${t.tagline}</div>` : ''}
    </div>
    <div class="meta">
      Camp With My Dog Trip Brief<br/>
      Printed ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}<br/>
      ${c.tripDates ? `Dates: ${c.tripDates}` : ''}
    </div>
  </div>

  <!-- Top row: Spot + Drive -->
  <div class="grid">
    <div class="box">
      <div class="box-label">📍 The Spot</div>
      <div class="box-title">${t.campsite?.name || t.destination}</div>
      ${t.campsite?.type ? `<div class="row"><span class="row-label">Type</span><span class="row-val">${t.campsite.type}</span></div>` : ''}
      ${t.campsite?.coordinates ? `<div class="row"><span class="row-label">Coords</span><span class="coords">${t.campsite.coordinates}</span></div>` : ''}
      ${t.campsite?.description ? `<div style="font-size:10px;color:#4a3c28;margin-top:5px;line-height:1.4">${t.campsite.description}</div>` : ''}
    </div>

    <div class="box">
      <div class="box-label">🚙 Getting There</div>
      ${t.region ? `<div class="row"><span class="row-label">Region</span><span class="row-val">${t.region}</span></div>` : ''}
      ${t.driveTime ? `<div class="row"><span class="row-label">Drive time</span><span class="row-val">${t.driveTime} from ${c.startingLocation || 'home'}</span></div>` : ''}
      ${t.route?.overview ? `<div class="row"><span class="row-label">Route</span><span class="row-val">${t.route.overview}</span></div>` : ''}
      ${t.route?.lastMiles ? `<div class="row"><span class="row-label">Last miles</span><span class="row-val">${t.route.lastMiles}</span></div>` : ''}
      ${t.route?.rigRating ? `<div class="row"><span class="row-label">Road rating</span><span class="row-val">${t.route.rigRating}</span></div>` : ''}
    </div>
  </div>

  <!-- Dog + Conditions row -->
  <div class="grid">
    <div class="box">
      <div class="box-label">🐕 ${dogNames}</div>
      ${t.dogReport?.rating ? `<div class="row"><span class="row-label">Overall</span><span class="row-val">${t.dogReport.rating}</span></div>` : ''}
      ${t.dogReport?.swimming ? `<div class="row"><span class="row-label">Swimming</span><span class="row-val">${t.dogReport.swimming}</span></div>` : ''}
      ${t.dogReport?.shade ? `<div class="row"><span class="row-label">Shade</span><span class="row-val">${t.dogReport.shade}</span></div>` : ''}
      ${t.dogReport?.heatConsiderations ? `<div class="row"><span class="row-label">Heat/elev</span><span class="row-val">${t.dogReport.heatConsiderations}</span></div>` : ''}
      ${t.dogReport?.notes ? `<div style="font-size:10px;color:#4a3c28;margin-top:5px;line-height:1.4">${t.dogReport.notes}</div>` : ''}
    </div>

    <div class="box">
      <div class="box-label">🌤️ Conditions</div>
      ${t.conditions?.bestSeason ? `<div class="row"><span class="row-label">Best season</span><span class="row-val">${t.conditions.bestSeason}</span></div>` : ''}
      ${t.conditions?.currentNotes ? `<div class="row"><span class="row-label">Now</span><span class="row-val">${t.conditions.currentNotes}</span></div>` : ''}
      ${t.conditions?.fireRestrictions ? `<div class="row"><span class="row-label">Fire</span><span class="row-val">${t.conditions.fireRestrictions}</span></div>` : ''}
      ${t.conditions?.waterAvailability ? `<div class="row"><span class="row-label">Water</span><span class="row-val">${t.conditions.waterAvailability}</span></div>` : ''}
    </div>
  </div>

  <!-- Safety row -->
  ${(t.safetyBriefing?.campfirePermit || t.safetyBriefing?.emergencyInfo || t.safetyBriefing?.bearCanister) ? `
  <div class="box" style="margin-bottom:10px">
    <div class="box-label">⛺ Safety</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 16px">
      ${t.safetyBriefing?.campfirePermit ? `<div class="row"><span class="row-label">🪵 Fire permit</span><span class="row-val">${t.safetyBriefing.campfirePermit}</span></div>` : ''}
      ${t.safetyBriefing?.bearCanister ? `<div class="row"><span class="row-label">🐻 Bear can</span><span class="row-val">${t.safetyBriefing.bearCanister}</span></div>` : ''}
      ${t.safetyBriefing?.emergencyInfo ? `<div class="row" style="grid-column:1/-1"><span class="row-label">🚑 Emergency</span><span class="row-val">${t.safetyBriefing.emergencyInfo}</span></div>` : ''}
    </div>
  </div>` : ''}

  <!-- Highlights / Watch-outs -->
  ${((t.highlights?.length || t.watchOuts?.length)) ? `
  <div class="grid">
    ${t.highlights?.length ? `
    <div class="box">
      <div class="box-label">✓ Highlights</div>
      <ul class="highlight-list">
        ${t.highlights.map(h => `<li class="green">${h}</li>`).join('')}
      </ul>
    </div>` : '<div></div>'}
    ${t.watchOuts?.length ? `
    <div class="box">
      <div class="box-label">⚠ Watch out</div>
      <ul class="highlight-list">
        ${t.watchOuts.map(w => `<li class="red">${w}</li>`).join('')}
      </ul>
    </div>` : '<div></div>'}
  </div>` : ''}

  <!-- Pack list -->
  ${packItems.length ? `
  <div class="section-full">
    <div class="box-label" style="margin-bottom:7px">🎒 Pack list</div>
    <div class="pack-grid">
      ${packItems.map(item => `
      <div class="pack-item">
        <div class="checkbox"></div>
        <span class="pack-text">${item}</span>
      </div>`).join('')}
    </div>
  </div>` : ''}

  <!-- LNT Principles -->
  <div class="section-full" style="margin-top:10px; border-top: 1px solid #d8cfa8; padding-top:10px;">
    <div class="box-label" style="margin-bottom:6px">🌿 Leave No Trace reminders</div>
    <div class="pack-grid">
      ${['Pack out ALL trash including micro-trash', 'Leave the campsite better than you found it', 'Keep dogs leashed in required areas', 'Proper waste disposal (cat holes or pack out)', 'Respect wildlife — no chasing or feeding', 'Stay on designated trails and campsites'].map(tip => `
      <div class="pack-item">
        <div class="checkbox"></div>
        <span class="pack-text" style="color:#5c7a3e">${tip}</span>
      </div>`).join('')}
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <span>🐾 Camp With My Dog · campwithmydog.com</span>
    <span>${t.campsite?.coordinates ? `📍 ${t.campsite.coordinates}` : ''}</span>
    <span>Generated ${new Date().toLocaleDateString()}</span>
  </div>

  <script>window.onload = () => window.print();</script>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) {
    alert('Pop-up blocked — please allow pop-ups for this page and try again.');
    return;
  }
  win.document.write(html);
  win.document.close();
}

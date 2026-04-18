// ── SEO Landing Pages ─────────────────────────────────────────────────────────
// Pure HTML pages served before the React catch-all so Google can index them.
// URL pattern: /dog-friendly-camping/:state  and  /dog-friendly-camping

const APP_URL = process.env.APP_URL || 'https://campwithmydog.com';

// ── Shared HTML shell ─────────────────────────────────────────────────────────
function shell({ title, description, canonicalPath, h1, intro, body, breadcrumb }) {
  const canonical = `${APP_URL}${canonicalPath}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${APP_URL}/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f2ede0;color:#2c2416;line-height:1.7}
  a{color:#5c7a3e;text-decoration:none}
  a:hover{text-decoration:underline}
  .wrap{max-width:720px;margin:0 auto;padding:0 20px}
  nav{background:#2c2416;padding:0 20px}
  .nav-inner{max-width:720px;margin:0 auto;height:52px;display:flex;align-items:center;justify-content:space-between}
  .nav-logo{color:#f2ede0;font-weight:700;font-size:16px;text-decoration:none}
  .nav-cta{background:#5c7a3e;color:#fff;font-size:13px;font-weight:600;padding:7px 16px;border-radius:20px;text-decoration:none}
  .hero{background:#2c2416;padding:48px 20px 40px;text-align:center;color:#f2ede0}
  .hero-paw{font-size:40px;margin-bottom:12px}
  .hero h1{font-size:clamp(24px,5vw,34px);font-weight:700;letter-spacing:-0.5px;line-height:1.2;margin-bottom:12px}
  .hero p{color:#b8aa88;font-size:16px;max-width:520px;margin:0 auto 28px;line-height:1.6}
  .hero-btn{display:inline-block;background:#5c7a3e;color:#fff;font-size:16px;font-weight:600;padding:14px 32px;border-radius:10px;text-decoration:none}
  .breadcrumb{padding:14px 0;font-size:13px;color:#9c8b6e}
  .breadcrumb a{color:#9c8b6e}
  .content{padding:32px 0 48px}
  .content h2{font-size:20px;font-weight:700;color:#2c2416;margin:32px 0 12px;padding-top:8px}
  .content h3{font-size:16px;font-weight:600;color:#3d3020;margin:20px 0 8px}
  .content p{color:#3d3020;font-size:15px;margin-bottom:14px}
  .content ul{padding-left:20px;margin-bottom:14px}
  .content li{color:#3d3020;font-size:15px;margin-bottom:6px}
  .spot-card{background:#fff;border:1px solid #d8cfa8;border-radius:10px;padding:20px;margin-bottom:16px}
  .spot-card h3{color:#2c2416;font-size:16px;font-weight:700;margin:0 0 6px}
  .spot-card .meta{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:10px}
  .pill{display:inline-block;background:#f0ebe0;border:1px solid #d8cfa8;border-radius:20px;font-size:12px;font-weight:600;color:#6b5c42;padding:2px 10px}
  .pill-green{background:#f0f7ec;border-color:#c3ddb8;color:#2d6a2d}
  .pill-amber{background:#fef9ec;border-color:#f5d57a;color:#854d0e}
  .pill-red{background:#fff0f0;border-color:#fca5a5;color:#b91c1c}
  .spot-card p{color:#6b5c42;font-size:14px;margin:0}
  .cta-box{background:#2c2416;border-radius:12px;padding:32px 24px;text-align:center;margin:40px 0}
  .cta-box h2{color:#f2ede0;font-size:20px;font-weight:700;margin-bottom:8px}
  .cta-box p{color:#9c8b6e;font-size:14px;margin-bottom:20px}
  .cta-box a{display:inline-block;background:#5c7a3e;color:#fff;font-size:15px;font-weight:600;padding:13px 28px;border-radius:9px;text-decoration:none}
  .states-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;margin:16px 0}
  .state-link{background:#fff;border:1px solid #d8cfa8;border-radius:8px;padding:12px 14px;color:#3d3020;font-size:14px;font-weight:500;text-decoration:none;display:block}
  .state-link:hover{border-color:#5c7a3e;color:#5c7a3e;text-decoration:none}
  footer{background:#2c2416;padding:24px 20px;text-align:center;color:#9c8b6e;font-size:13px}
  footer a{color:#9c8b6e;margin:0 10px}
  @media(max-width:600px){.hero h1{font-size:24px}.hero-btn{font-size:14px;padding:12px 24px}}
</style>
</head>
<body>
<nav>
  <div class="nav-inner">
    <a class="nav-logo" href="/">🐾 Camp With My Dog</a>
    <a class="nav-cta" href="/">Plan my trip →</a>
  </div>
</nav>
<div class="hero">
  <div class="hero-paw">🐾</div>
  <h1>${h1}</h1>
  <p>${intro}</p>
  <a class="hero-btn" href="/">Plan my dog's trip free →</a>
</div>
<div class="wrap">
  <div class="breadcrumb">
    <a href="/">Home</a> › <a href="/dog-friendly-camping">Dog-Friendly Camping</a>${breadcrumb ? ` › ${breadcrumb}` : ''}
  </div>
  <div class="content">
    ${body}
    <div class="cta-box">
      <h2>Get a trip plan built around your dog</h2>
      <p>Tell us your dog's breed and size, your rig, and your dates. We'll plan the whole thing — campsite, route, packing list, dog report.</p>
      <a href="/">Plan my trip free →</a>
    </div>
  </div>
</div>
<footer>
  <div>
    <a href="/">Home</a>
    <a href="/dog-friendly-camping">All states</a>
    <a href="/privacy">Privacy</a>
  </div>
  <div style="margin-top:8px;color:#6b5c42">© Camp With My Dog — free trip planning for dog owners</div>
</footer>
</body>
</html>`;
}

// ── Spot card helper ──────────────────────────────────────────────────────────
function spot({ name, type, dogRating, rigRating, coords, desc }) {
  const ratingClass = { Excellent: 'pill-green', Good: 'pill-green', Fair: 'pill-amber', Challenging: 'pill-red' };
  return `
<div class="spot-card">
  <h3>${name}</h3>
  <div class="meta">
    ${type ? `<span class="pill">${type}</span>` : ''}
    ${dogRating ? `<span class="pill ${ratingClass[dogRating] || ''}">${dogRating} for dogs</span>` : ''}
    ${rigRating ? `<span class="pill">${rigRating}</span>` : ''}
    ${coords ? `<span class="pill">📍 ${coords}</span>` : ''}
  </div>
  <p>${desc}</p>
</div>`;
}

// ── State page data ───────────────────────────────────────────────────────────
const STATE_PAGES = {
  california: {
    title: 'Dog-Friendly Camping in California | Camp With My Dog',
    description: 'The best dog-friendly camping in California — from Sierra Nevada dispersed sites to Los Padres coast camps. Free trip planner for dog owners with rig-specific route advice.',
    h1: 'Dog-Friendly Camping in California',
    intro: 'California has more dog-friendly camping than any state in the country — but the best spots require knowing where to look, when to go, and how to keep your dog safe in the heat.',
    body: `
<p>California offers everything from free dispersed camping in the Sierra Nevada to coastal sites with ocean breezes. The challenge is heat — from June through September, many inland sites hit 95°F+ by noon, which is dangerous for most dogs. The good news: elevation solves almost everything. Get above 7,000 feet and summer temperatures drop to the mid-60s.</p>

<h2>Best Regions for Dogs</h2>

${spot({ name: 'June Lake Loop — Inyo National Forest', type: 'Dispersed / Established', dogRating: 'Excellent', rigRating: 'Stock-accessible', coords: '37.7810, -119.0723', desc: 'Four lakes within a 5-mile loop, consistent water access for dogs all summer. June Lake and Reversed Lake both have gradual entries perfect for swimming. Elevation keeps temps in the 60–75°F range even in August. Dispersed camping allowed on the forest roads off Highway 158. No crowds compared to Mammoth.' })}

${spot({ name: 'Mendocino National Forest — Upper Lake District', type: 'Dispersed (free)', dogRating: 'Good', rigRating: 'Moderate clearance', coords: '39.4521, -122.8234', desc: 'One of the least-visited national forests in California. Off-trail camping allowed throughout. Dog-friendly trails, minimal crowds, and creek access at lower elevations spring through early summer. Avoid July–September at lower elevations — heat and rattlesnakes.' })}

${spot({ name: 'Modoc National Forest', type: 'Dispersed (free)', dogRating: 'Excellent', rigRating: 'Stock-accessible', coords: '41.5868, -120.8987', desc: 'Far northeastern California — fewer than 200 visitors on most weekends. Meadows, ponderosa pine, and seasonal streams. Elevation stays around 5,000–6,500 feet so heat is rarely an issue. Dogs can run off-leash on most forest roads. Warner Mountains section has the best access.' })}

${spot({ name: 'Los Padres National Forest — Figueroa Mountain', type: 'Dispersed + Established', dogRating: 'Good', rigRating: 'Stock-accessible', coords: '34.7407, -119.9793', desc: 'Santa Barbara backcountry with wildflowers in spring and mild temperatures year-round compared to inland California. Cachuma Saddle and Figueroa Mountain Road both allow dispersed camping. Popular on weekends — go Thursday through Saturday for sites.' })}

<h2>California Dog Camping Tips</h2>

<h3>Heat safety</h3>
<p>Most dog emergencies in California happen when owners don't account for ground temperature. Granite slabs, sandy desert, and asphalt can hit 150°F surface temp when air temps are 90°F. If you can't hold your hand on the ground for 5 seconds, your dog shouldn't walk on it. Above 7,000 feet, this is rarely an issue from May through October.</p>

<h3>Rattlesnakes</h3>
<p>Present at elevations below 8,000 feet April through October, most active at dusk and dawn. Keep dogs on leash near rocky outcroppings and brush. Rattlesnake vaccine for dogs is available from most California vets — worth it if you camp often.</p>

<h3>Fire restrictions</h3>
<p>California enforces Stage 1 and Stage 2 fire restrictions broadly from June through October. Stage 1 typically prohibits campfires outside established fire rings. Stage 2 prohibits all fires including camp stoves using solid fuel. Always check <a href="https://www.preventwildfireca.org/campfire-permit/" target="_blank">preventwildfireca.org</a> before you go — violations carry $1,000+ fines.</p>

<h3>Water</h3>
<p>Most Sierra Nevada streams run strong through July, then slow significantly by September. Carry 1 gallon per dog per day in addition to human water. Desert and coastal areas often have no water — plan accordingly.</p>
    `,
  },

  colorado: {
    title: 'Dog-Friendly Camping in Colorado | Camp With My Dog',
    description: 'Best dog-friendly camping in Colorado — dispersed sites in San Juan, White River, and Routt National Forests. Altitude, weather, and rig advice for camping with your dog.',
    h1: 'Dog-Friendly Camping in Colorado',
    intro: 'Colorado has the most dispersed camping options of any state east of the Sierra. The altitude is both the appeal and the risk — beautiful alpine camps, but thin air and afternoon thunderstorms that can turn dangerous fast.',
    body: `
<p>Colorado's national forests cover nearly 15 million acres, most of which allow dispersed camping within 300 feet of existing roads. That means your dog can sleep under the stars on your schedule — no reservations, no campsite fees, and usually no crowds if you go mid-week. The trade-off: altitude hits dogs harder than people expect.</p>

<h2>Best Regions for Dogs</h2>

${spot({ name: 'San Juan National Forest — Missionary Ridge Road', type: 'Dispersed (free)', dogRating: 'Excellent', rigRating: 'Moderate clearance', coords: '37.4512, -107.7023', desc: 'Rolling mountain terrain northeast of Durango with consistent access to Vallecito Creek and its tributaries. Dogs can swim in multiple spots. Elevation 8,000–10,000 feet — cool even in July. Forest roads are well-maintained for trucks and mild clearance rigs.' })}

${spot({ name: 'Routt National Forest — Seedhouse Road', type: 'Dispersed (free)', dogRating: 'Excellent', rigRating: 'Stock-accessible', coords: '40.8234, -106.9012', desc: 'North of Steamboat Springs, the Elk River Valley has some of Colorado\'s best dog camping. Riverside sites with direct creek access, meadow views, and light traffic on weekdays. Elk rut in September brings bugling within earshot. Dogs must be on leash — frequent moose sightings.' })}

${spot({ name: 'White River National Forest — Flat Tops Wilderness Edge', type: 'Dispersed (free)', dogRating: 'Good', rigRating: 'High clearance', coords: '39.9876, -107.3445', desc: 'Plateau country at 10,000 feet with large meadows and small alpine lakes. Few hikers, spectacular scenery. The flat terrain is easier on older dogs and smaller breeds. Snow possible any month — be prepared for cold nights even in summer.' })}

${spot({ name: 'Rio Grande National Forest — Pass Creek Area', type: 'Dispersed (free)', dogRating: 'Good', rigRating: 'Moderate clearance', coords: '37.6234, -106.1987', desc: 'San Luis Valley edge with access to creeks and aspen groves. Less popular than the San Juan side, which means better odds of finding a site on weekends. Mosquitoes can be heavy near water July through early August.' })}

<h2>Colorado Dog Camping Tips</h2>

<h3>Altitude and your dog</h3>
<p>Dogs can get altitude sickness just like people. Symptoms include lethargy, loss of appetite, and labored breathing. If you're camping above 10,000 feet and your dog is used to sea level, spend a night at 7,000–8,000 feet first. Brachycephalic breeds (bulldogs, pugs, boxers) are particularly vulnerable — keep them below 9,000 feet.</p>

<h3>Afternoon thunderstorms</h3>
<p>Colorado's summer pattern is predictable: clear mornings, building clouds by 11am, storms by 2–4pm, clearing by evening. Plan hikes to summit or exposed ridges before noon. At camp, have a tent or vehicle to shelter your dog — lightning in an open meadow at 10,000 feet is genuinely dangerous.</p>

<h3>Wildlife</h3>
<p>Moose are the primary dog danger — they're more aggressive than bears and move fast. If you see a moose, leash your dog immediately and give it 100+ yards of clearance. Black bears are common but usually retreat from noise. Bear canisters are not required in most of Colorado but are strongly recommended.</p>
    `,
  },

  oregon: {
    title: 'Dog-Friendly Camping in Oregon | Camp With My Dog',
    description: 'Dog-friendly camping in Oregon — coast, Cascades, and high desert. Best spots for overlanders and car campers with dogs, with specific rig and breed advice.',
    h1: 'Dog-Friendly Camping in Oregon',
    intro: 'Oregon rewards dog owners who explore past the Instagram spots. The coast is mild year-round, the Cascades are spectacular in summer, and the eastern high desert offers almost total solitude — with almost no one checking that your dog is on a leash.',
    body: `
<p>Oregon has one of the most dog-friendly camping cultures in the country. Dogs are allowed on most national forest trails (on leash), all BLM land, and many state beaches. The Willamette, Deschutes, Fremont-Winema, and Wallowa-Whitman national forests each have distinct character — coastal rain forest, volcanic plateau, pine steppe, and alpine — and all allow dispersed camping off established roads.</p>

<h2>Best Regions for Dogs</h2>

${spot({ name: 'Deschutes National Forest — Three Sisters Dispersed', type: 'Dispersed (free)', dogRating: 'Excellent', rigRating: 'Stock-accessible', coords: '44.0234, -121.7456', desc: 'Central Oregon\'s volcanic landscape with black lava fields, alpine lakes, and pine forest. Cultus Lake and Elk Lake both have dog-friendly water access. Sites along FR 4635 and FR 4290 are typically open June through October. No drinking water — bring your own for you and your dog.' })}

${spot({ name: 'Wallowa-Whitman NF — Eagle Cap Wilderness Edge', type: 'Dispersed (free)', dogRating: 'Excellent', rigRating: 'Moderate clearance', coords: '45.1876, -117.2345', desc: 'Oregon\'s Alps — granite peaks, cold clear lakes, minimal crowds compared to anything in Washington or California. Wallowa Lake State Park is nearby for supplies. Dogs on leash in wilderness, but you\'ll have trail sections entirely to yourself on weekdays.' })}

${spot({ name: 'Fremont-Winema NF — Gearhart Mountain Area', type: 'Dispersed (free)', dogRating: 'Good', rigRating: 'Stock-accessible', coords: '42.5234, -120.7654', desc: 'South-central Oregon high desert forest. Undervisited, dog-tolerant, and usually snow-free June through October. Sprague River and its tributaries provide water access for dogs. The remoteness means you\'ll often have entire road corridors to yourselves.' })}

${spot({ name: 'Oregon Coast — Siuslaw NF Dispersed', type: 'Dispersed (free)', dogRating: 'Good', rigRating: 'Stock-accessible', coords: '44.2345, -124.0987', desc: 'The Oregon Coast is mild year-round (50–65°F most months) making it ideal for heat-sensitive breeds. Many coastal beaches allow dogs off-leash outside posted areas. Dispersed camping is limited on the coast — book established sites as backup. Wet ground means muddy dogs guaranteed.' })}

<h2>Oregon Dog Camping Tips</h2>

<h3>Rain and moisture</h3>
<p>West of the Cascades, plan for rain any month of the year. Even "sunny" July in the Willamette Valley means overcast mornings. Bring a dog towel and a waterproof layer for your dog if they're short-haired. The east side of the Cascades is dramatically drier — same latitude, different world.</p>

<h3>Ticks and foxtails</h3>
<p>Oregon's coast and valley floors have ticks spring through fall. The high desert has foxtail grass (Hordeum jubatum) that can work into dog ears, paws, and skin — potentially requiring vet extraction. Check your dog after every meadow walk.</p>
    `,
  },

  washington: {
    title: 'Dog-Friendly Camping in Washington State | Camp With My Dog',
    description: 'Dog-friendly camping in Washington state — Olympic Peninsula, Cascades, and Okanogan Highlands. Best dispersed sites for dogs with breed and rig-specific advice.',
    h1: 'Dog-Friendly Camping in Washington State',
    intro: 'Washington has some of the most dramatic camping in the country — but it comes with real navigation challenges. Olympic NP is mostly off-limits to dogs on trails. The Cascades have strict quotas. Knowing where dogs are actually welcome is half the work.',
    body: `
<p>The good news: the Okanogan-Wenatchee, Colville, and Gifford Pinchot national forests are all dog-friendly with extensive dispersed camping. The bad news: the most-photographed spots — Enchantments, Olympic coast, Mt. Rainier trails — either ban dogs or require permits that book out in February. Plan around the crowds and you'll find Washington's dog camping is genuinely exceptional.</p>

<h2>Best Regions for Dogs</h2>

${spot({ name: 'Okanogan-Wenatchee NF — Methow Valley', type: 'Dispersed (free)', dogRating: 'Excellent', rigRating: 'Stock-accessible', coords: '48.5678, -120.1234', desc: 'Eastern Washington\'s dry side of the Cascades. The Methow Valley gets 300 days of sunshine compared to Seattle\'s gray winters. The Chewuch River and Twisp River drainages both offer water access for dogs. Less crowded than any comparable terrain west of the crest.' })}

${spot({ name: 'Colville National Forest — Sullivan Lake Area', type: 'Dispersed + Established', dogRating: 'Excellent', rigRating: 'Stock-accessible', coords: '48.8456, -117.2876', desc: 'Northeast Washington near the Canadian border — pine forest, lake swimming, and virtually no one in the campgrounds on weekdays. Sullivan Lake allows dogs and has a gradual beach entry for swimming. Grizzly bears are present in the Selkirks — hang your food.' })}

${spot({ name: 'Gifford Pinchot NF — Lewis River Corridor', type: 'Dispersed + Established', dogRating: 'Good', rigRating: 'Stock-accessible', coords: '46.0923, -121.8234', desc: 'South Cascades near Mt. St. Helens. The Lewis River has multiple waterfalls and swimming holes that dogs love. Old growth forest keeps temperatures cool even in summer. Dogs allowed on most trails — check individual trailhead signs.' })}

<h2>Washington Dog Camping Tips</h2>

<h3>Cascades permits</h3>
<p>Many Cascades trailheads require a Northwest Forest Pass ($30/year or $5/day). Dogs are banned from Enchantments core zone, most of Olympic NP backcountry, and several Mt. Rainier trails. Always check recreation.gov and the specific ranger district before planning a hike-in site.</p>

<h3>Bear country</h3>
<p>The Cascades and northeast Washington have both black bears and, in the Selkirks, grizzlies. Use bear canisters or bear boxes. Keep your dog from investigating any wildlife — a dog that charges a bear is a dog in serious trouble. Many Washington campgrounds have food storage lockers — use them.</p>
    `,
  },

  utah: {
    title: 'Dog-Friendly Camping in Utah | Camp With My Dog',
    description: 'Dog-friendly camping in Utah — BLM dispersed in canyon country, Dixie NF in the mountains. Heat safety, water strategy, and rig advice for camping with dogs in Utah.',
    h1: 'Dog-Friendly Camping in Utah',
    intro: 'Utah is the best state in the country for dispersed BLM camping — millions of acres of canyon country with no permit required and no fee. The challenge is heat, water scarcity, and the fact that all five national parks heavily restrict dogs on trails.',
    body: `
<p>The secret to dog camping in Utah is going where the crowds aren't — and in Utah, that's everywhere except Arches, Zion, Bryce, Canyonlands, and Capitol Reef. The vast BLM lands of the San Rafael Swell, Bears Ears, and Grand Staircase-Escalante are legally open to dispersed camping, genuinely remote, and almost entirely uncrowded. Avoid May through September for low elevations — heat is dangerous for dogs. The mountain forests in the north are a different story.</p>

<h2>Best Regions for Dogs</h2>

${spot({ name: 'Dixie National Forest — Boulder Mountain', type: 'Dispersed (free)', dogRating: 'Excellent', rigRating: 'Stock-accessible', coords: '37.9234, -111.4567', desc: 'High plateau at 9,000–11,000 feet with aspen forests and small lakes. While the national parks below swelter in summer heat, Boulder Mountain stays in the 60–75°F range. Dogs can swim in several trout lakes. Stock vehicles can access most sites on Highway 12 forest roads.' })}

${spot({ name: 'BLM — San Rafael Swell (spring/fall only)', type: 'Dispersed (free)', dogRating: 'Good', rigRating: 'Moderate clearance', coords: '38.8765, -110.6543', desc: 'Spectacular canyon country with canyons, mesas, and slot canyon access. Spring (March–May) and fall (September–November) are the only safe windows for dogs — summer heat regularly exceeds 105°F. Goblin Valley State Park is nearby for a contrast. No water — carry everything.' })}

${spot({ name: 'Fishlake National Forest — Fish Lake', type: 'Established (fee)', dogRating: 'Excellent', rigRating: 'Stock-accessible', coords: '38.5432, -111.7123', desc: 'Central Utah\'s hidden gem — a large alpine lake at 8,800 feet that\'s warm enough for dogs to swim in July and August. Campgrounds are established with hookups available. Aspen groves turn gold in late September, making it one of Utah\'s best fall camping destinations.' })}

<h2>Utah Dog Camping Tips</h2>

<h3>National park restrictions</h3>
<p>Utah's five national parks allow dogs in parking lots, campgrounds, and paved roads — but almost all trails are off-limits. This is a hard rule with $150+ fines. Plan your Utah dog trip around the national forests and BLM land, using the parks only as scenic drives.</p>

<h3>Heat and paw burns</h3>
<p>Slickrock and dark canyon sandstone can hit 160°F surface temperature in summer sun. If your dog is walking on exposed rock below 7,000 feet from June through August, carry booties or plan to walk only in the early morning and evening. Carry 1.5 gallons of water per dog per day in desert terrain — there are almost no reliable natural sources.</p>
    `,
  },

  montana: {
    title: 'Dog-Friendly Camping in Montana | Camp With My Dog',
    description: 'Dog-friendly camping in Montana — Gallatin, Beaverhead, and Kootenai NF dispersed sites. Bear country protocols, river access, and rig advice for camping with your dog in Montana.',
    h1: 'Dog-Friendly Camping in Montana',
    intro: 'Montana has the most dispersed camping of any state in the lower 48 — and some of the most spectacular. It\'s also genuine bear and wolf country. Your dog needs to be leashed and your camp needs to be clean.',
    body: `
<p>Montana's national forests — Gallatin, Beaverhead-Deerlodge, Kootenai, Flathead, Helena-Lewis and Clark, and Custer — total over 17 million acres, most of which allows free dispersed camping. Rivers are cold and clear enough for dogs to drink directly from (giardia risk is real — filter or treat). The biggest adjustment for most dog owners is managing wildlife encounters seriously.</p>

<h2>Best Regions for Dogs</h2>

${spot({ name: 'Gallatin NF — West Fork Madison River', type: 'Dispersed (free)', dogRating: 'Excellent', rigRating: 'Stock-accessible', coords: '44.9876, -111.5678', desc: 'South of Bozeman, the Madison River drainage offers cold, clear swimming for dogs from June through September. Bears present — hang food and keep dogs in at night. The canyon walls and meadows make for spectacular scenery. Popular with fly fishermen — quiet sites are a short drive off the main corridor.' })}

${spot({ name: 'Kootenai NF — Cabinet Mountains', type: 'Dispersed (free)', dogRating: 'Good', rigRating: 'Moderate clearance', coords: '48.1234, -115.8765', desc: 'Northwest Montana\'s wet Kootenai forest is often overlooked. Thick old-growth cedar and hemlock, multiple lakes, and lighter crowds than Glacier area. Grizzly habitat — bear spray required. Bull Lake and Upper Stillwater Lake both allow dogs.' })}

${spot({ name: 'Beaverhead-Deerlodge NF — Big Hole Valley', type: 'Dispersed (free)', dogRating: 'Excellent', rigRating: 'Stock-accessible', coords: '45.6789, -113.5432', desc: 'The Big Hole Valley is one of Montana\'s least-visited areas — a wide mountain basin with the Big Hole River running through it. Cold nights even in summer, superb fly fishing, and dog-friendly access throughout. Dispersed sites are everywhere along the river road.' })}

<h2>Montana Dog Camping Tips</h2>

<h3>Bear country — non-negotiable rules</h3>
<p>All of Montana's national forests have active grizzly populations west of the Divide, and black bears throughout. Store food, dog food, and anything with scent in bear canisters or vehicle. Never leave dog food out overnight. Keep your dog leashed at night — a dog running loose is both a prey target and can lead a bear back to camp. Carry bear spray and know how to use it.</p>

<h3>Seasons</h3>
<p>Montana's camping season is compressed. Most forest roads open mid-June and close with first significant snow, typically mid-October. Mid-July through mid-September is reliably accessible. Spring and fall shoulder seasons are spectacular but require 4WD and patience for road closures.</p>
    `,
  },

  arizona: {
    title: 'Dog-Friendly Camping in Arizona | Camp With My Dog',
    description: 'Dog-friendly camping in Arizona — Coconino NF, White Mountains, and Mogollon Rim. Avoiding summer heat, finding water, and keeping your dog safe in the desert Southwest.',
    h1: 'Dog-Friendly Camping in Arizona',
    intro: 'Arizona has two dog camping seasons: the sky islands and high country from May through October, and the desert lowlands from November through April. Getting the timing wrong in Arizona is genuinely dangerous for dogs.',
    body: `
<p>Arizona rewards flexible dog owners who follow the elevation and the season. In summer, the Mogollon Rim, White Mountains, and Flagstaff area (all 6,500–9,000 feet) are mild and accessible. In winter, the Sonoran Desert outside Tucson, the Verde Valley, and the BLM lands near Quartzsite offer warm camping when everywhere else is frozen. The middle — desert in summer — is dangerous for most dogs.</p>

<h2>Best Regions for Dogs</h2>

${spot({ name: 'Coconino NF — Mogollon Rim', type: 'Dispersed (free)', dogRating: 'Excellent', rigRating: 'Stock-accessible', coords: '34.4567, -111.2345', desc: 'The Rim is a 200-mile escarpment at 7,000–8,000 feet — ponderosa pines, scattered lakes, and temperatures in the 70s while Phoenix cooks at 110°F below. FR 300 (Rim Road) runs along the top with dozens of dispersed sites. Dogs love Blue Ridge Reservoir for swimming.' })}

${spot({ name: 'Apache-Sitgreaves NF — White Mountains', type: 'Dispersed + Established', dogRating: 'Excellent', rigRating: 'Stock-accessible', coords: '33.9123, -109.7654', desc: 'East-central Arizona\'s high country with meadows, streams, and the Little Colorado River headwaters. Show Low and Pinetop are service towns nearby. Black bears present but rarely aggressive. Dogs can swim in the Black River and its tributaries.' })}

${spot({ name: 'BLM Sonoran Desert — Kofa NWR Edge (winter)', type: 'Dispersed (free)', dogRating: 'Good', rigRating: 'Stock-accessible', coords: '33.3456, -114.0987', desc: 'December through February, the desert near Quartzsite and Yuma is 65–75°F — perfect for dogs that struggle with heat. The snowbird crowd concentrates on Highway 95 — get a few miles off the highway for solitude. No water — self-sufficient camping required.' })}

<h2>Arizona Dog Camping Tips</h2>

<h3>Heat — the real risk</h3>
<p>Dogs die in Arizona heat every summer, often within 15 minutes of being left in a hot vehicle or walked on hot pavement. Below 5,000 feet from May through September, limit activity to before 9am and after 5pm. If ground temperature burns your hand in 5 seconds, do not walk your dog on it. Carry a collapsible bowl and water at all times.</p>

<h3>Scorpions and thorns</h3>
<p>Check your dog's bedding every morning in desert camp — scorpions seek warmth. Cholla cactus ("jumping cactus") grabs fur on contact and requires needle-nose pliers to remove. Keep dogs on leash in desert terrain. Carry tweezers and a comb for spine removal.</p>
    `,
  },

  'new-mexico': {
    title: 'Dog-Friendly Camping in New Mexico | Camp With My Dog',
    description: 'Dog-friendly camping in New Mexico — Gila NF, Carson NF, and Lincoln NF. High desert to alpine, with specific dog and rig advice for the Land of Enchantment.',
    h1: 'Dog-Friendly Camping in New Mexico',
    intro: 'New Mexico is one of the most underrated camping states in the Southwest — high elevation means it stays cooler than Arizona, and the Gila is one of the most dog-friendly wilderness areas anywhere.',
    body: `
<p>New Mexico's national forests cover 9 million acres across radically different terrain: alpine tundra in the Sangre de Cristo, old-growth pine in the Sacramento Mountains, and the Gila's canyon and mesa country that looks like nothing else in the country. Free dispersed camping is available throughout, and the state park system allows dogs in campgrounds (on leash).</p>

<h2>Best Regions for Dogs</h2>

${spot({ name: 'Gila National Forest — Gila River Corridor', type: 'Dispersed (free)', dogRating: 'Excellent', rigRating: 'Moderate clearance', coords: '33.2345, -108.2987', desc: 'The Gila is the crown jewel of New Mexico dog camping — the river has warm, shallow crossings perfect for dogs, and the forest roads through the Mogollon Mountains access dozens of secluded sites. Snow free June through October. Hot springs along the river as a bonus.' })}

${spot({ name: 'Carson NF — Enchanted Circle', type: 'Dispersed + Established', dogRating: 'Good', rigRating: 'Stock-accessible', coords: '36.5678, -105.3456', desc: 'North of Taos, the Enchanted Circle route (Highway 64/38 loop) passes through aspen and spruce at 9,000–12,000 feet. Dispersed camping along forest roads. Eagle Nest Lake allows dogs and has fishing access from the bank. Cool even in summer, spectacular fall colors in late September.' })}

${spot({ name: 'Lincoln NF — Sacramento Mountains', type: 'Dispersed (free)', dogRating: 'Good', rigRating: 'Stock-accessible', coords: '32.9876, -105.7234', desc: 'Southern New Mexico\'s high-elevation escape from the desert. Cloudcroft sits at 8,650 feet — a genuine mountain town in the middle of the Chihuahuan Desert basin. Dog-friendly trails in the forest, cool temperatures, and great views west into White Sands.' })}

<h2>New Mexico Dog Camping Tips</h2>

<h3>Altitude and desert elevation</h3>
<p>New Mexico is high — Albuquerque sits at 5,300 feet, Santa Fe at 7,000, and many camping areas exceed 9,000 feet. Dogs from low elevations may show altitude fatigue on arrival. Give them 24 hours to adjust before long hikes. Water sources can be seasonal — always confirm with the ranger district before relying on a creek.</p>
    `,
  },
};

// ── Activity pages ────────────────────────────────────────────────────────────
const ACTIVITY_PAGES = {
  overlanding: {
    title: 'Overlanding with Dogs | Camp With My Dog',
    description: 'Complete guide to overlanding with dogs — rig setup, water planning, heat management, and finding dog-friendly dispersed sites. From a trip planner built for dog owners.',
    h1: 'Overlanding with Dogs',
    intro: 'Your rig is dialed. Your dog is ready. Here\'s how to make sure your trip actually works — from the right setup to the right spots.',
    body: `
<p>Overlanding with a dog changes almost everything about trip planning — where you can camp (water access matters more), how you manage heat (especially in a rooftop tent), and what you carry. The good news: dogs make overlanding better in almost every way, and most dispersed BLM and national forest land is dog-friendly.</p>

<h2>Rig Setup for Dogs</h2>

<h3>Sleeping arrangements</h3>
<p>Rooftop tents work well for dogs under 60 lbs who can climb the ladder or be carried. For larger dogs, a ground tent beside the rig or a pull-out sleeping platform in the bed works better. Dogs in the bed of the truck (covered or uncovered) should be secured with a dog-specific tether attached to the bed rail — not the tailgate, which can drop open.</p>

<h3>Water storage</h3>
<p>The standard overlanding recommendation is 1 gallon per person per day. Add 1 gallon per 30 lbs of dog per day, more in heat above 85°F. A 65-gallon water tank fills the gap. Collapsible silicone bowls pack flat and work anywhere. If you're relying on natural water sources, bring a Sawyer Squeeze or similar — dogs can and do get giardia from backcountry water.</p>

<h3>Vehicle temperature</h3>
<p>The inside of a vehicle in direct sun can exceed 130°F within 20 minutes — lethal in under an hour for most dogs. Never leave a dog in a closed vehicle in warm weather. If you need to leave camp briefly, use a secure long-line with a shaded spot, carry water, and don't stay gone longer than 30 minutes at a time.</p>

<h2>Finding Dog-Friendly Dispersed Sites</h2>

<h3>BLM land</h3>
<p>BLM land allows dogs on leash throughout, with no permit required for stays under 14 days. Use the BLM's Map My Ride/Recreation Maps to identify open travel corridors. The California Desert District, Utah's Canyon Country District, and Wyoming's High Desert District all have exceptional dispersed options within easy drive of water sources.</p>

<h3>National Forests</h3>
<p>National forests allow dogs on almost all trails and all dispersed camping areas. The exception is wilderness areas within forests, where dogs must be on leash at all times. Download the Motor Vehicle Use Map (MVUM) for any national forest before you go — it shows which roads are legal for camping and which are restricted.</p>

<h2>Health and Safety in the Field</h2>

<h3>First aid kit for dogs</h3>
<p>The basics: antiseptic wipes, vet wrap, tweezers (for thorns and ticks), a foil emergency blanket, activated charcoal, Benadryl (ask your vet for correct dosage), and your vet's after-hours number saved. Satellite communicator (Garmin inReach or SPOT) is worth carrying in remote areas where cell coverage drops.</p>

<h3>Know your dog's limits</h3>
<p>Huskies and malamutes can handle technical cold-weather trips that would be dangerous for a Frenchie. Flat-faced breeds struggle above 8,000 feet and in heat above 80°F. Older dogs tire faster on rough road vibration than on smooth pavement. Know your dog's specific limits — not just general dog advice — and build your trip around them.</p>
    `,
  },

  'van-camping': {
    title: 'Van Camping and Car Camping with Dogs | Camp With My Dog',
    description: 'Van life and car camping with dogs — ventilation, heat management, gear setup, and the best spots for stealth and dispersed camping with your dog.',
    h1: 'Van Life and Car Camping with Dogs',
    intro: 'Van camping with a dog is one of the best ways to travel — your dog always has a home base, you always have company. It just requires planning the things most van build guides skip.',
    body: `
<p>Van life with a dog is fundamentally different from van life without one. Every camping decision — where to park, when to run errands, how long to leave camp — now has a dog variable. Most of the challenges are manageable once you build your systems around your dog, not around yourself.</p>

<h2>The Core Challenge: Heat</h2>

<p>A van with closed windows in direct sun becomes dangerous in under 20 minutes on a warm day. Your options:</p>
<ul>
  <li><strong>Fan ventilation</strong> — a Fan-Tastic or Maxxair roof fan on high creates enough airflow to keep the van 10–15°F above ambient when parked. Works below 85°F ambient. Above that, you need shade or AC.</li>
  <li><strong>Reflective window covers</strong> — cut reflected heat significantly. Required for van camping with dogs in any warm climate.</li>
  <li><strong>Diesel heater for winter</strong> — Webasto and Espar units are dog-safe and reliable. Running a diesel heater unattended with a dog in the van is fine; running a propane unit is not (CO risk).</li>
  <li><strong>Camp in shade</strong> — obvious but underrated. Seek north-facing sites or tree cover when temperatures exceed 80°F.</li>
</ul>

<h2>Best Van-Friendly Spots with Dogs</h2>

${spot({ name: 'BLM dispersed — any 14-day site', type: 'Dispersed (free)', dogRating: 'Excellent', rigRating: 'Stock-accessible', desc: 'BLM dispersed areas allow 14-day stays, dogs on leash, and no permit. The Escalante River corridor in Utah, Alabama Hills in California, and Jarbidge in Nevada are all van-accessible with great dog camping.' })}

${spot({ name: 'National Forest dispersed — 100 feet from water, 300 feet from road', type: 'Dispersed (free)', dogRating: 'Excellent', rigRating: 'Stock-accessible', desc: 'National forests allow dispersed camping within 300 feet of existing roads, staying at least 100 feet from water. Dog-friendly throughout. Download the Motor Vehicle Use Map before each forest — it shows legal roads for camping.' })}

<h2>Gear That Actually Matters</h2>

<h3>For sleeping</h3>
<p>Most van dogs settle on a dedicated sleeping pad or dog bed. Elevated cots work well in hot weather — they create airflow underneath. In cold weather, dogs generate real warmth and can actually help keep the van comfortable overnight.</p>

<h3>For food and water</h3>
<p>A mounted water tank with a push-button spigot at dog height makes watering easy. Stainless steel bowls mount cleanly to cabinet faces with rare-earth magnets. Keep dog food in a hard-sided container to avoid attracting wildlife.</p>

<h3>For muddy days</h3>
<p>A dog-specific rinsing setup — either a small 12V pump connected to your tank, or a gravity-fed camp shower — keeps mud out of your van sleeping area. A dedicated dog towel hanging near the door becomes the most-used item in your rig.</p>
    `,
  },
};

// ── Hub page ──────────────────────────────────────────────────────────────────
const ALL_STATES = [
  { slug: 'california', label: 'California' },
  { slug: 'colorado', label: 'Colorado' },
  { slug: 'oregon', label: 'Oregon' },
  { slug: 'washington', label: 'Washington' },
  { slug: 'utah', label: 'Utah' },
  { slug: 'montana', label: 'Montana' },
  { slug: 'arizona', label: 'Arizona' },
  { slug: 'new-mexico', label: 'New Mexico' },
];

function hubPage() {
  const stateLinks = ALL_STATES.map(s =>
    `<a class="state-link" href="/dog-friendly-camping/${s.slug}">🐾 ${s.label}</a>`
  ).join('');

  const activityLinks = `
    <a class="state-link" href="/dog-friendly-camping/overlanding">🚙 Overlanding with dogs</a>
    <a class="state-link" href="/dog-friendly-camping/van-camping">🚐 Van camping with dogs</a>
  `;

  const body = `
<p>Dog-friendly camping doesn't mean any campsite that technically allows dogs. It means sites with water access for swimming, shade, terrain your dog can actually walk on, and routes that match your rig. We cover the real details — not just "leashes required."</p>

<h2>Browse by State</h2>
<div class="states-grid">${stateLinks}</div>

<h2>By Activity</h2>
<div class="states-grid">${activityLinks}</div>

<h2>Or just let the AI plan it</h2>
<p>Tell us your dog's breed and size, your rig, your starting location, and your dates. We'll generate a complete trip plan with specific campsite coordinates, a dog report, packing list, and route advice — in about 30 seconds. Free.</p>
  `;

  return shell({
    title: 'Dog-Friendly Camping — By State & Activity | Camp With My Dog',
    description: 'Dog-friendly camping guides by state — California, Colorado, Oregon, Washington, Utah, Montana, and more. Real spot recommendations, rig advice, and breed-specific tips.',
    canonicalPath: '/dog-friendly-camping',
    h1: 'Dog-Friendly Camping Guides',
    intro: 'State-by-state guides to the best spots for overlanders and car campers with dogs — real campsite recommendations, not just lists.',
    breadcrumb: null,
    body,
  });
}

// ── Route registration ────────────────────────────────────────────────────────
function registerLandingPages(app) {
  // Hub
  app.get('/dog-friendly-camping', (req, res) => {
    res.send(hubPage());
  });

  // State pages
  for (const [slug, data] of Object.entries(STATE_PAGES)) {
    app.get(`/dog-friendly-camping/${slug}`, (req, res) => {
      res.send(shell({
        ...data,
        canonicalPath: `/dog-friendly-camping/${slug}`,
        breadcrumb: data.h1,
      }));
    });
  }

  // Activity pages
  for (const [slug, data] of Object.entries(ACTIVITY_PAGES)) {
    app.get(`/dog-friendly-camping/${slug}`, (req, res) => {
      res.send(shell({
        ...data,
        canonicalPath: `/dog-friendly-camping/${slug}`,
        breadcrumb: data.h1,
      }));
    });
  }
}

module.exports = { registerLandingPages, STATE_PAGES, ACTIVITY_PAGES, ALL_STATES };

# 🐾 Camp With My Dog

An AI-powered camping trip planner built for dog owners. Find dog-friendly campsites, check fire and weather safety, pack smarter, and leave it better than you found it.

🌐 [campwithmydog.com](https://campwithmydog.com)

---

## What it does

Tell Base Camp your vehicle, your dogs, and what you're after. It generates a trip plan that actually fits:

- **Dog-first planning** — swimming access, shade, heat index, terrain, and breed-specific notes (huskies, we see you)
- **Rig-aware routing** — road difficulty and clearance for your specific setup
- **Live safety briefing** — active fire incidents within 100 miles + NWS weather alerts (Red Flag, High Wind, Flash Flood, etc.)
- **7-day weather forecast** — alerts if your trip dates conflict with your weather preferences
- **Interactive map** — satellite + USFS Motor Vehicle Use Map + BLM public lands overlay, with one-tap links to Google Maps, Apple Maps, and Gaia GPS
- **GPX export** — download a waypoint file for any navigation app
- **Trip log** — save, rate, and add field notes and photos to every trip
- **Packing checklist** — AI-generated pack list specific to your trip, with tappable checkboxes
- **Trip brief** — print a one-page offline summary before you lose signal

---

## Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **AI:** Anthropic Claude API (`claude-sonnet-4-6`)
- **Maps:** Leaflet.js, ESRI World Imagery, USFS MVUM, BLM SMA tiles
- **Weather:** Open-Meteo (forecast), NWS API (alerts), NIFC ArcGIS (fire incidents)
- **Storage:** localStorage — no database, no account needed

---

## Running locally

```bash
# 1. Clone and install dependencies
git clone https://github.com/yourusername/basecamp.git
cd basecamp
npm install
cd client && npm install && cd ..

# 2. Add your Anthropic API key
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env

# 3. Start the backend (terminal 1)
npm run dev

# 4. Start the frontend (terminal 2)
npm run client
```

Open [http://localhost:5173](http://localhost:5173).

Get a free API key at [console.anthropic.com](https://console.anthropic.com).

---

## Deploying to Render

Render's free tier works great for sharing with friends. Auto-deploys on every push to `main`.

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → **New → Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Environment:** Node
   - **Build command:** `npm run build`
   - **Start command:** `npm start`
5. Add environment variable: `ANTHROPIC_API_KEY` → your key
6. Click **Deploy** — first build takes ~3 minutes

---

## Project structure

```
basecamp/
├── server.js               # Express API, AI prompt, tile proxies, weather/fire
├── client/
│   ├── index.html          # Global CSS (field journal theme)
│   └── src/
│       ├── App.jsx
│       └── components/
│           ├── MapPin.jsx              # Interactive Leaflet map
│           ├── WeatherStrip.jsx        # 7-day forecast
│           ├── SafetySection.jsx       # Fire incidents + NWS alerts
│           ├── PackingChecklist.jsx    # Tappable pack list
│           ├── TripBrief.jsx           # Print one-pager
│           ├── TripDetail.jsx
│           ├── TripResult.jsx
│           ├── TripStats.jsx
│           └── ...
└── .env                    # Never commit this
```

---

## License

MIT

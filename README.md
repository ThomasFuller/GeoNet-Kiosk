# GeoNet Kiosk Demo

Touch-first outreach kiosk for schools and public venues, designed for a **fixed 1920×1080** display. Brand, type, logo and icons follow [beta.geonet.org.nz](https://beta.geonet.org.nz). Live data comes from GeoNet’s open APIs.

## Run

```bash
./dev.sh
# or: npm install && npm run dev
```

Open `http://localhost:5173` in fullscreen / kiosk mode. The UI is composed at 1920×1080 and letterboxed/scaled to the window.

Production-style (static `dist` + API proxy for waveforms):

```bash
npm run kiosk
```

## GitHub Pages

Yes. The UI is a static Vite app with HashRouter, so it can live on GitHub Pages.

GeoNet’s **quake, volcano and Tilde** APIs send `Access-Control-Allow-Origin: *`, so those stay live in the browser. **Camera metadata and FDSN waveforms** do not, so Pages cannot proxy them. The deploy workflow snapshots camera lists and the currently operating station inventory into `public/data/` at build time. Camera JPEGs still load as images. Near-real-time ground wiggles (miniSEED) will be quiet on Pages unless you run `npm run kiosk` locally.

1. Push this repo to GitHub.
2. Settings → Pages → **Source: GitHub Actions**.
3. Push to `main` (or run the **Deploy GitHub Pages** workflow).
4. Open `https://<user>.github.io/<repo>/`.

## Data sources

| Feed | Source |
|------|--------|
| Recent earthquakes | `api.geonet.org.nz/quake` |
| 7-day counts | `api.geonet.org.nz/quake/stats` |
| Felt reports | `api.geonet.org.nz/intensity?type=reported` |
| Volcanic alert levels | `api.geonet.org.nz/volcano/val` |
| Volcano cameras | `images.geonet.org.nz` |
| Geomagnetic time series | `tilde.geonet.org.nz` (EYWM F total field) |
| Currently operating sensors | `api.geonet.org.nz/network/station` (same inventory as the [sensor search map](https://www.geonet.org.nz/data/network/sensor/search)) |
| SeedLink (waveforms) | `link.geonet.org.nz:18000` (binary protocol; documented in UI) |

Locally, Vite and `server.mjs` proxy cameras and FDSN so waveforms work. On GitHub Pages those same feeds use public GeoNet URLs plus a build-time snapshot for CORS-blocked metadata.

## Notes

- Not an official emergency alerting product — follow Civil Defence / NEMA guidance.
- Idle timeout returns visitors to Home after ~3 minutes.
- Māori toggle switches key home labels to te reo.
- Felt It? stays on-kiosk (does not jump to an external browser).

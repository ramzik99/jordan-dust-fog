# Global Dust & Fog for Windy

Experimental Windy plugin by Ramzi Kandah, hosted in the original jordan-dust-fog repository. **Version 0.2.0 adds worldwide dust forecasts. Fog forecasting, satellite analysis, ground confirmation and calibrated alerts are not implemented. This is an unpublished development preview.**

## Global dust preview

- Worldwide NASA GEOS-FP surface dust, fine dust (PM₂.₅ dust component), and column dust optical depth.
- A 1.25° × 1.25° overview sampled directly from the native 0.25° latitude × 0.3125° longitude grid. These are sampled model nodes, not averages or finer-resolution estimates.
- Click anywhere on the globe, use a named location, or enter signed latitude and longitude.
- Correct longitude wrapping at the date line, including repeated world views. Polar values are available by coordinates; the Mercator map itself ends near 85° latitude.
- One compressed forecast period loads at a time. Up to four recently viewed periods are cached.
- A canvas renders the visible grid without creating tens of thousands of map polygons.
- The Windy timeline and interval buttons select actual supported three-hour means. No extrapolation beyond available GEOS periods.
- Unknown values stay unknown. Expired data and model runs older than 36 hours are hidden.
- Model-run and retrieval timestamps are visible in the device timezone.

The global overview intentionally samples more coarsely than native GEOS. It may miss local gradients and dust features between sampled nodes. Zooming in does not increase forecast resolution.

## Data pipeline

The six-hour GitHub Actions ingestion job downloads a dated GEOS-FP cycle, exports a small global manifest and separate gzip-compressed forecast files, validates every frame, then commits all files together. Initial averaging intervals before forecast initialization are omitted without shifting timestamps. Incomplete newer cycles can fall back to a recent complete cycle, but an already-exported global forecast cannot be replaced by an older run.

Global manifest:

https://raw.githubusercontent.com/ramzik99/jordan-dust-fog/main/data/global/latest.json

The manifest preserves units, native resolution, sampling method, run time, retrieval time and represented intervals. Each frame path is pinned to a dated run and valid time. The browser validates the manifest and selected frame, limits compressed and decompressed sizes, cancels obsolete requests, and never presents a previous period as a new one. The current and preceding manifest runs are retained for clients already viewing them. Repository history still grows with forecast updates; this is prototype hosting rather than a long-term forecast archive.

The earlier regional data feed remains available at data/latest.json for v0.1.0 preview compatibility.

NASA catalogue:

https://opendap.nccs.nasa.gov/dods/GEOS-5/fp/0.25_deg/fcast/tavg3_2d_aer_Nx/

Units: DUSMASS and DUSMASS25 are converted from kg/m³ to µg/m³; DUEXTTAU is dimensionless. Source units are checked when supplied, with the GEOS-FP specification recorded as the basis otherwise. Missing, fill, negative and nonfinite values remain null. No synthetic forecast is installed as live data. Forecast accuracy has not been validated against observations.

## Test before publishing

Open https://www.windy.com/developer-mode in a desktop browser and load the pinned JavaScript preview URL provided after a successful build. The preview branch is refreshed by the Check plugin workflow; this does not publish the plugin to Windy's directory. The workflow verifies JavaScript MIME type and browser cross-origin access through the CDN.

Choose Amman, London, New York, Delhi, Sydney, Cape Town or São Paulo, or enter coordinates and select Go. Enable Dust map and select an available forecast interval. Try the date line at 179.9°E and −180.1° longitude. A compatible browser must support DecompressionStream; unsupported browsers show an explicit error.

Verified v0.2.0 test URL (paste into Windy developer mode):

```text
https://cdn.jsdelivr.net/gh/ramzik99/jordan-dust-fog@ee4d6a2c8d19650604e5e4499611c72928ae28fe/plugin.js
```

Live global retrieval and validation passed for the 2026-10-17T00:00:00Z run: 37 three-hour frames, from 2026-10-17T12:00:00Z to 2026-10-22T03:00:00Z. All 16 unit tests and compilation passed. The CDN JavaScript response and browser cross-origin headers were verified. Full interaction and appearance inside the Windy host have not yet been verified.

## Development and verification

Node 22+ and Python 3.12+:

```sh
npm install
npm test
python -m unittest discover -s test -p 'test_*.py'
npm run build
```

Regional and global ingestion:

```sh
pip install -r requirements.txt
python scripts/ingest_geos.py
python scripts/ingest_geos.py --global --output data/global/latest.json
node scripts/validate-global.mjs
```

For local Windy development, run npm start and load https://localhost:9999/plugin.js in developer mode. Build output is in dist/. Windy host interaction and desktop/mobile visual checks are still required; unit tests, source retrieval and compilation do not establish forecast accuracy.

## Interpretation and remaining work

Surface dust is modelled dust mass, not total PM₁₀. Fine dust is only the dust contribution to PM₂.₅. Column optical depth is not surface visibility. Map concentration bins are display bins, not health limits or calibrated warning levels.

Fog and satellite controls retain unavailable states. The external EUMETSAT viewer link is not an integrated satellite-analysis feed and does not provide worldwide geostationary coverage by itself. Worldwide satellite monitoring will require complementary satellite sources. Satellite low cloud alone cannot confirm fog at the ground.

Next stages: independent source comparisons, Windy desktop/mobile testing, finer dust data where practical, terrain-aware fog guidance, global satellite observations, surface reports, and validated location-specific alert criteria. There are no push notifications or official warnings. Never commit API keys; future publication credentials belong in GitHub Actions secrets.

The repository and package identifiers retain their original names to preserve existing preview compatibility. Display branding and coverage are global.

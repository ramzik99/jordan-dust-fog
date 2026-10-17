# Jordan Dust & Fog for Windy

Experimental Windy plugin by Ramzi Kandah. **Version 0.1.0 implements a dust-forecast frontend and GEOS-FP ingestion pipeline. Fog forecasting, satellite analysis, ground confirmation and calibrated alerts are not implemented yet.** No operational warning capability or forecast skill is claimed.

## First version

- NASA GEOS-FP surface dust, fine dust (PM₂.₅ dust component), and column dust optical depth.
- Native-grid dust map over a buffered region (28–34°N, 34–40°E), including Jordan and neighbouring areas.
- Windy timeline integration and explicit three-hour averaging intervals.
- Map-click point inspection and eight named Jordan locations.
- Unknown values stay unknown; expired and stale forecasts are rejected.
- Model-run time, retrieval time, native resolution and device-local valid times are visible.
- Scheduled retrieval every six hours in GitHub Actions; only validated data is committed.

## Data status

**Live numerical retrieval verified on 2026-10-17T09:11:16Z.** GitHub Actions successfully downloaded a regional subset from the 2026-10-16T18:00:00Z GEOS-FP cycle and validated the exported forecast contract. The first verified export contained 5 three-hour frames on a 25 × 20 native grid, from 2026-10-17T09:00:00Z to 2026-10-18T00:00:00Z. This is a technical retrieval check, not forecast-accuracy validation. The available lead time varies by cycle; the plugin shows only represented source intervals. Local network restrictions still prevent direct retrieval from the coding environment.

Plugin default data URL:

https://raw.githubusercontent.com/ramzik99/jordan-dust-fog/main/data/latest.json

If ingestion fails or the forecast expires, the UI reports unavailable or stale data. No synthetic sample forecast is installed as live data.

Source catalogue:

https://opendap.nccs.nasa.gov/dods/GEOS-5/fp/0.25_deg/fcast/tavg3_2d_aer_Nx/

The ingestion script discovers a dated cycle, selects up to four recent cycles if newer cycles are incomplete, and pins each retrieval to its dated dataset. It refuses cycles older than 36 hours, preserves native coordinates and checks the three-hour cadence. Initial averaging intervals before the forecast run are omitted without shifting valid times. It converts DUSMASS and DUSMASS25 from kg/m³ to µg/m³. Source units are checked if supplied; otherwise the documented GEOS-FP product units are recorded as the basis. Fill values, negative values and nonfinite values export as null. A validated file replaces the previous file atomically; a failed job never writes a zero forecast.

GEOS-FP is 0.25° latitude × 0.3125° longitude in this collection. The frontend shows native cells and nearest-cell values rather than implying street-level resolution.

## Build and check

Requires Node 22+ and Python 3.12+ for ingestion.

```sh
npm install
npm test
python -m unittest discover -s test -p 'test_*.py'
npm run build
```

For live ingestion:

```sh
pip install -r requirements.txt
python scripts/ingest_geos.py
```

For Windy development:

```sh
npm start
```

Build output is in `dist/`. The Check plugin workflow uploads a downloadable build artifact after successful compilation. The plugin is not automatically published to Windy. Browser execution in the Windy host, desktop/mobile appearance and real source values require verification before release.

## Interpretation

Surface dust is modelled dust mass, not total PM₁₀. Fine dust is only the dust contribution to PM₂.₅, not total PM₂.₅. Optical depth describes the atmospheric column and is not a direct visibility estimate. Map bins at 100, 300 and 1,000 µg/m³ are visual display bins, not health limits or calibrated warning thresholds. Transparent cells may indicate unavailable data; the panel reports source status.

Satellite observations and fog forecasting have explicit unavailable states. The EUMETSAT viewer link is an external viewing aid, not an integrated or analysed satellite feed. Ground confirmation must be separate from satellite detection; satellite low cloud alone cannot establish fog at the surface.

## Next implementation stages

1. Independently compare the retrieved GEOS fields with NASA charts and surface observations; numerical access and schema validation now pass.
2. Test the built plugin in Windy on desktop and mobile.
3. Connect a verified fog forecast feed, including terrain/cloud intersection and radiation fog.
4. Connect appropriately licensed Meteosat dust and low-cloud products with observation timestamps.
5. Add surface reports and calibrate location-specific alert thresholds against Jordanian observations.

No push notifications are currently implemented. Never commit API keys; any future publishing credentials belong in GitHub Actions secrets.

Uses the Windy plugin configuration and build conventions of [Wintry Forecast](https://github.com/ramzik99/wintry-forecast), without modifying that repository.

## Test directly in Windy

No local installation is needed for this development build:

1. Open https://www.windy.com/developer-mode in a desktop browser.
2. Paste the following JavaScript URL into the plugin URL field and load it:

```text
https://cdn.jsdelivr.net/gh/ramzik99/jordan-dust-fog@8663d4e5b7a2dfa5f1093b71bc23d3208797ca75/plugin.js
```

3. Select Amman, enable Dust map, and choose an available forecast interval.

This pinned preview was built successfully and its JavaScript MIME type and cross-origin response headers were verified. It has not yet been visually or interactively verified inside the Windy host. Only dust forecasting is implemented in this build. This is a development preview, not a published Windy release.

The `preview` branch is refreshed after successful main-branch checks. To test a later build, replace the commit in the CDN URL with the current preview branch commit; pinned URLs keep each test reproducible.

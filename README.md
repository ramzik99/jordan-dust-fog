# Synoptic Atlas for Windy

Unpublished v1.1.0 development preview by Ramzi Kandah. Worldwide NASA GEOS-FP dust forecasts, point threshold guidance, and EUMETSAT satellite dust imagery. No fog features.

## Features

- All 721 x 1152 GEOS source-grid nodes: 0.25 degrees latitude x 0.3125 degrees longitude, with no spatial downsampling in the displayed native fields.
- Surface dust, fine dust (the dust contribution to PM2.5), and column dust optical depth.
- Windy timeline synchronization for the available three-hour forecast means. The horizon follows the provider's actual dated cycle; missing periods are never extrapolated.
- Worldwide point selection by map click, named locations, or coordinates, including longitude wrapping and polar point values. The Mercator map ends near 85 degrees latitude.
- A configurable surface-dust threshold for the selected point and period, saved locations, and an on-demand point forecast table.
- Separate satellite mode: global three-hour dust RGB composite and ten-minute Meteosat Dust RGB for Europe, Africa and the Middle East. Observation time is independent of Windy's forecast timeline. Blank satellite areas can mean no observation; polar coverage is limited.
- Native PNG transport, bounded frame caching, cancellable requests, mobile layout, missing-data states, and stale-run protection.

## Test before publishing

1. Open https://www.windy.com/developer-mode in a desktop browser, signing in if Windy requests it.
2. Load the development plugin URL:

   https://cdn.jsdelivr.net/gh/ramzik99/jordan-dust-fog@preview/plugin.js

3. Open **Synoptic Atlas**. Choose a place or click the map, then select an available interval in **Forecast periods** or on Windy's timeline.
4. Check all three fields, change the point threshold, and try coordinates near the date line. Under **Point forecast**, load the complete table only when wanted; native frames can total tens of MB.
5. Select **Satellite**, choose the source, and check the observation timestamp. Satellite RGB supports visual tracking and does not supply surface concentration.

The preview branch updates after the build and browser checks pass. An immutable preview URL can be formed by replacing `preview` with that branch's full commit SHA. CDN caches can delay the moving URL; use the pinned URL supplied with a completed build when checking a specific version. This workflow does not publish to Windy's plugin directory.

## Independent weather isolines

Open **Weather isolines** and tick **Geopotential height**, **Temperature**, and **MSLP** independently. They can appear together over dust or satellite imagery. **Synoptic preset** enables 500 hPa height, 850 hPa temperature and MSLP. **Clear contours** removes all three. Each line family has its own colour and contour spacing; labels include levels and units.

Upper-air levels: 925, 850, 700, 500 and 300 hPa. MSLP is always mean sea-level pressure. Height uses decametres (1 dam = 10 m); temperature uses Celsius; pressure uses hPa. Values below terrain are masked, and missing cells leave gaps.

The source is NASA GEOS-FP `inst3_3d_asm_Np`: H in metres is converted to dam, T from Kelvin to Celsius, and SLP from Pa to hPa. Units follow the [NASA file specification](https://gmao.gsfc.nasa.gov/GMAO_products/documents/GEOS_5_FP_File_Specification_ON4v1_2.pdf) and are checked against attributes when supplied. These are three-hourly instantaneous meteorological snapshots. They are separate from the three-hour dust averaging intervals. The nearest snapshot is used only within 90 minutes of Windy's selected forecast time, and its exact valid time and source run are displayed. Satellite time remains independent.

Contour geometry is computed from a sampled 1.25-degree grid using marching squares, including periodic longitude closure. This is a synoptic overview, with coarser spatial sampling than the native dust map. Labels and line interpolation do not add forecast resolution. Contour spacing and units do not follow Windy's native isoline settings.

Live contour manifest:

https://raw.githubusercontent.com/ramzik99/jordan-dust-fog/geos-synoptic-data/contours/latest.json

The meteorological feed refreshes independently of the dust feed, so their available runs and forecast horizons may differ. An unavailable layer clears while the other enabled layers remain visible. The contour feed retains the current and previous runs on its own generated-data branch. All contour layers start off by default; user choices are saved locally. The plugin does not change Windy's weather model, background layer or native isolines.

## Forecast pipeline

The six-hour scheduled workflow downloads a dated NASA GEOS-FP cycle from:

https://opendap.nccs.nasa.gov/dods/GEOS-5/fp/0.25_deg/fcast/tavg3_2d_aer_Nx/

`DUSMASS` and `DUSMASS25` are converted from kg/m3 to micrograms/m3; `DUEXTTAU` is dimensionless. The service's native coordinate arrays, dimensions, units when provided, and averaging intervals are checked. Incomplete newer cycles can fall back to a recent supported cycle; the exported run cannot regress. Expired forecasts and runs older than 36 hours are unavailable in the plugin.

Live native manifest:

https://raw.githubusercontent.com/ramzik99/jordan-dust-fog/geos-dust-data/global/latest.json

Two opaque RGB PNGs carry three 16-bit logarithmically packed fields per period. All spatial nodes remain present. Numeric packing introduces small quantization differences: code 0 is genuine zero, 65535 is missing, and other codes decode as `expm1(code * scale)`. Positive values never round to zero. The browser decodes numeric PNG bytes without colour-space conversion or interpolation and samples the nearest source node. Native maps use those decoded values. The index also retains a 1.25-degree coarse compatibility export; the v1 plugin does not use it for displayed native values.

Validated files live on a dedicated generated-data branch, keeping the source branch free of new forecast commits. The current and previous runs are retained; each generated branch replacement uses an expected-head lease. This is a preview delivery service, not an uptime-guaranteed archive. Older clients may lose access to a run after retention expires and should refresh.

## Satellite sources

- Global: https://view.eumetsat.int/geoserver/mumi/wms, layer `wideareacoverage_rgb_dust`.
- Meteosat: https://view.eumetsat.int/geoserver/mtg_fd/wms, layer `rgb_dust`.

The plugin reads capabilities for observation timestamps and requests dated WMS PNGs with browser cross-origin access. Imagery comes directly from EUMETSAT EUMETView. Its cadence, coverage, latency and availability depend on the provider. The latest-image indicator highlights delayed imagery. RGB imagery requires interpretation and cannot confirm surface dust or visibility by itself.

## Development and verification

Node 22+ and Python 3.12+:

```sh
npm install
pip install -r requirements.txt
npm test
python -m unittest discover -s test -p 'test_*.py'
npm run build
npx playwright install --with-deps chromium
npm run test:browser
python scripts/check_satellite.py
```

The browser suite runs the compiled Svelte plugin, PNG decoder, canvas overlays and controls in a mock Windy host at desktop and mobile sizes. It covers fields, thresholds, period changes, coordinates, saved places, point tables, satellite time/source changes, unavailable data, enabling/disabling, minimization and teardown. This does not replace a manual test inside the real Windy host. CI separately retrieves actual dated satellite images and verifies browser CORS. Screenshots are saved in the browser-smoke workflow artifact.

Run ingestion with `python scripts/native_dust.py --output generated/global/latest.json`, then validate with `node scripts/validate-global.mjs generated/global/latest.json` and `python scripts/verify-native.py generated/global/latest.json`.

For local Windy development, run `npm start` and load `https://localhost:9999/plugin.js` in developer mode. Build output is in `dist/`.

## Interpretation

Surface dust is modelled mineral dust, not total PM10. Fine dust is only the dust component of PM2.5. Column optical depth is not a visibility estimate. The point threshold is a user setting, not a validated health limit or official warning. There are no background or push notifications. Forecast accuracy and threshold performance have not been independently validated against surface observations.

The original repository and package identifiers remain stable for compatibility; the displayed plugin is dust-only. No publication credentials are needed to test it.

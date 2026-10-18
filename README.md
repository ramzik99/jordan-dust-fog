# Synoptic Atlas — standalone Windy plugin

Package ID: `windy-plugin-synoptic-atlas`. This is an independent contour-only plugin with its own UI, preferences and development preview. It uses NOAA GFS meteorology for worldwide contour overlays.

Tick geopotential height and temperature independently, or choose **Synoptic preset** for 500 hPa height + 850 hPa temperature. Upper-air levels: 925, 850, 700, 500 and 300 hPa. Each field has its own spacing. Lines and labels use the supplied value-based color palettes, with expandable legends.

Published version 1.2.0 — load this installation URL in Windy:

https://windy-plugins.com/458307/windy-plugin-synoptic-atlas/1.2.0/plugin.min.js

Development preview:

https://cdn.jsdelivr.net/gh/ramzik99/jordan-dust-fog@synoptic-preview/synoptic-atlas.js

The dedicated preview updates after its own build and browser tests pass. For a fixed version replace `synoptic-preview` with the preview branch's commit SHA. Publication to Windy hosting succeeded; inclusion in the public gallery is subject to Windy review.

Instantaneous fields are sampled to 1.25 degrees for contouring. The exact valid time is shown. No snapshot is used beyond 90 minutes from the requested Windy forecast time. Heights use dam, temperature Celsius. Below-terrain values and missing data are masked. Contours do not change Windy's background model or native isolines.

Install dependencies with `npm install`, then run `npm run build`. The contour engine is `src/contours.mjs`; the UI and configuration are in `src/`.

Run `npm test` for contour tests and `python -m unittest discover -s test -p 'test_synoptic.py'` for ingestion tests. For browser checks install Python requirements, run `npx playwright install chromium`, then `npm run test:browser`. Browser tests use a simulated Windy host; test the preview in your Windy account before publication.

The former GEOS Dust plugin and its scheduled data updater have been removed. Only Synoptic Atlas is maintained here.

Compact controls stay above map overlays; additional settings are under More. Three-hourly forecast delivery extends through model hour 384 to cover the 360-hour Windy timeline. The contour source is independent of Windy’s background model.

Version 1.2.0 was uploaded from the tested build at source commit `64bde0f5bf8a5375e9d4df7261682d264b565ce6`. The publishing workflow is on the `publish-synoptic-atlas-1.2.0` branch of `ramzik99/wintry-forecast`, where the existing Windy publishing credential is configured. No Wintry Forecast code was changed.

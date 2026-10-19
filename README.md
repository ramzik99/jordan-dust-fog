# Synoptic Atlas — Windy contours

Geopotential height and temperature contours follow the **forecast model selected in Windy** and its timeline. Switch models using Windy's normal selector; the plugin refreshes both layers automatically without changing the background overlay or native isolines.

Each field has independent visibility, pressure level (925, 850, 700, 500 or 300 hPa), spacing, value-based colors and labels. The controller sits on the left on desktop and below the timeline on mobile. No color legend.

The plugin reads Windy's native decoded forecast tiles for the selected model. Height is converted from metres to dam; temperature from Kelvin to Celsius. Tile values are interpolated estimates sampled on a bounded viewport grid, not original model grid values. Missing data and areas outside regional coverage remain blank. Unsupported models, levels and hours show an availability message; there is no fallback to a different forecast model. Long-range contours are available only where Windy supplies the selected model's forecast, including hour 360 when available.

Model calendars and tile paths are resolved on each load. New data is checked every five minutes while the plugin is visible; update frequency and access follow Windy's model delivery and your account.

Development preview: https://cdn.jsdelivr.net/gh/ramzik99/jordan-dust-fog@synoptic-preview/synoptic-atlas.js

Published installation URL (v1.2.3): https://windy-plugins.com/458307/windy-plugin-synoptic-atlas/1.2.3/plugin.min.js

Build with `npm install` and `npm run build`. Run `npm test` for contour/provider unit tests. Browser regressions compile the real plugin against a simulated Windy host and exercise desktop/mobile controls, model changes, cancellations, unsupported fields and forecast range limits. The legacy GFS ingestion scripts remain for reference; the plugin no longer requests their data.

Package ID: `windy-plugin-synoptic-atlas`. Windy hosting publication and gallery review are separate.

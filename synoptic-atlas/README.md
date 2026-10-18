# Synoptic Atlas — standalone Windy plugin

Package ID: `windy-plugin-synoptic-atlas`. This is an independent contour-only plugin with its own UI, preferences and development preview. It shares the existing GEOS meteorology delivery service and contour engine. No dust or satellite interface is included.

Tick geopotential height, temperature and MSLP independently, or choose **Synoptic preset** for 500 hPa height + 850 hPa temperature + MSLP. Upper-air levels: 925, 850, 700, 500 and 300 hPa. Each field has its own spacing and colour; labels can be toggled.

In Windy developer mode load:

https://cdn.jsdelivr.net/gh/ramzik99/jordan-dust-fog@synoptic-preview/synoptic-atlas.js

The dedicated preview updates after its own build and browser tests pass. For a fixed version replace `synoptic-preview` with the preview branch's commit SHA. It remains unpublished to the Windy directory.

GEOS instantaneous fields are sampled to 1.25 degrees for contouring. The exact snapshot and model run are shown. No snapshot is used beyond 90 minutes from the requested Windy forecast time. Heights use dam, temperature Celsius and MSLP hPa. Below-terrain values and missing data are masked. Contours do not change Windy's background model or native isolines.

From the repository root install dependencies with `npm install` and `npm --prefix synoptic-atlas install`, then `npm --prefix synoptic-atlas run build`. The shared source module is `src/contours.mjs`; standalone UI/configuration are under this directory's `src/`.

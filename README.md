# Jordan Dust & Fog for Windy

A planned Windy external plugin by Ramzi Kandah for dust and fog forecast guidance and satellite monitoring over Jordan.

## Status

Project initialized. No functional plugin, live data pipeline, or published Windy release yet. This repository currently documents the implementation scope. No forecast accuracy or operational warning capability is claimed.

## Agreed data sources

- Dust forecast: NASA GEOS-FP, replacing CAMS.
- Primary surface-impact field: DUSMASS (kg/m³; multiply by 1e9 for µg/m³).
- Supporting fields: DUEXTTAU (column dust optical depth), DUSMASS25 (fine-dust surface concentration), winds and vertical dust information where available.
- Fog forecast: meteorological profiles, near-surface temperature/dew point, wind, low cloud and terrain. The exact accessible forecast feed remains to be verified.
- Satellite monitoring: Meteosat dust and low-cloud/fog products. Endpoint availability, access requirements and redistribution terms remain to be verified.
- Ground confirmation: visibility and present-weather reports where accessible; particulate observations where available.

NASA forecast catalogue: https://opendap.nccs.nasa.gov/dods/GEOS-5/fp/0.25_deg/fcast/

The catalogue has been browsed successfully. Numeric data download has NOT yet been verified: the initial direct request from the development environment failed DNS resolution. Catalogue access is not proof of a working data feed.

## Intended interface

- Jordan map with independent Dust forecast, Fog risk, and Satellite observation controls.
- Windy timeline for forecast valid times; satellite imagery uses explicit observation timestamps.
- Click a location for source values, forecast onset/duration, confidence and data age.
- Separate expected, satellite-detected and ground-confirmed statuses.
- Compact desktop and mobile panels following the conventions of https://github.com/ramzik99/wintry-forecast.
- In-plugin guidance initially. Background/push notifications require separate infrastructure and are not implemented.

## Architecture

1. Python ingestion retrieves a regional subset of GEOS-FP, checking available model cycles and variables.
2. Validate units, coordinates, forecast times, missing values and source freshness before exporting compact JSON or map tiles.
3. A Svelte/TypeScript Windy frontend requests bounded regional data and renders independent layers and point guidance.
4. Satellite frames are fetched through an approved source and retain their observation times.
5. Surface reports provide point confirmation without claiming to confirm an entire governorate or road.

Forecast exports must preserve run time, valid time, represented averaging interval, units and native resolution. New runs replace old runs atomically. Missing or stale data must never become an all-clear.

## Scientific safeguards

Column dust optical depth is not a surface concentration or a direct visibility measurement. Satellite-detected low cloud is not sufficient to confirm ground fog. Fog rules must include hill/cloud-intersection cases as well as radiation fog. Numerical thresholds remain provisional until calibrated against Jordan observations; guidance must not be labelled official Jordanian warnings.

## Implementation order

- [ ] Verify numeric GEOS-FP retrieval for Jordan and inspect current variable metadata.
- [ ] Implement ingestion and documented forecast export schema.
- [ ] Build and test the Windy plugin shell and dust forecast layer.
- [ ] Verify the fog forecast feed and add terrain-aware fog-risk guidance.
- [ ] Verify satellite access and add observation layers.
- [ ] Add surface verification, freshness handling and location guidance.
- [ ] Test in Windy on desktop and mobile before publishing.

Never commit API keys or access tokens. Publication credentials belong in GitHub Actions secrets.

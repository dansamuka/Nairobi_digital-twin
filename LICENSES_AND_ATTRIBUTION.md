# Sources, Licences and Attribution

This repository distinguishes **source/reference material** from **redistributable runtime assets**.

## OpenStreetMap

Roads, footprints, rail, parks and other vector geometry may be derived from OpenStreetMap.

Required public attribution:

> © OpenStreetMap contributors

OSM database content is licensed under the Open Data Commons Open Database License (ODbL). The Phase 1 data pipeline must preserve source IDs and extraction dates.

Primary reference:
- https://www.openstreetmap.org/copyright
- https://www.openstreetmap.org/export/

## Copernicus DEM

Copernicus DEM GLO-30/GLO-90 may be used subject to the applicable Copernicus licence and attribution language. Access rules for the GLO-30 view service changed in 2026, so the pipeline must not depend on anonymous view-service access.

Primary reference:
- https://doi.org/10.5270/ESA-c5d3d65

## Mapillary

Mapillary may be used as street-level reference imagery where licence/attribution requirements are satisfied. Do not silently package reference images into the runtime build.

Reference:
- https://help.mapillary.com/hc/en-us/articles/115001770409-CC-BY-SA-license-for-open-data

## Wikimedia Commons / Wikidata

Wikidata structured data is useful for coordinate/name cross-checking. Wikimedia Commons images may be used only when the individual file's licence and author attribution are recorded.

## Official institutional websites

Official Kenyan institutional pages are used as authoritative references for building identity, address, operational status and institutional context. Website imagery is reference-only unless reuse rights are explicitly established.

## Runtime asset rule

No third-party texture, model or image may be committed under `assets/` unless these are recorded:

```json
{
  "asset": "...",
  "source": "...",
  "author": "...",
  "license": "...",
  "attribution_required": true,
  "redistribution_permitted": true
}
```

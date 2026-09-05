# Viewable Milestones — Acceptance by What You Can Actually See

A phase is not complete merely because code exists. The user must be able to inspect the promised visual result in the running viewer.

## P0 — Research & Ground Truth

**Viewable outcome:** structured landmark registry, verified coordinates/confidence, camera viewpoints, scene extents, projection contract, source plan and explicit geographic guardrails. No finished 3D city yet.

## P1 — Geospatial Greybox

**Viewable outcome:** a source-positioned Nairobi CBD greybox. Roads, parks, rail and building massing define the city blocks; KICC-origin coordinates and landmark proxies make relative placement inspectable. The viewer visibly reports whether city context came from live OSM or fallback geometry.

### P1 implementation-step outcomes

| Step | Viewable result |
|---|---|
| P1.1 | Full-screen Three.js scene, Nairobi horizon tone, KICC origin and metric reference. |
| P1.2 | Audited landmark coordinates rendered in local metric relationships. |
| P1.3 | OSM/Overpass context or visibly-labelled fallback context. |
| P1.4 | Broad terrain relief scaffold. |
| P1.5 | Major roads and green/open-space relationships. |
| P1.6 | 3D CBD building massing. |
| P1.7 | Grey landmark silhouettes. |
| P1.8 | Conventional/commuter rail context without an invented CBD SGR mainline. |
| P1.9 | Seven geographic validation cameras. |
| P1.10 | Full greybox gate-review state with data/FPS diagnostics. |

## P2 — Hero Architecture

**Viewable outcome:** generic landmark boxes are replaced by architecture-specific neutral models. KICC shows its cylindrical/ribbed tower, observation/crown structure and base halls; Times Tower uses a curtain-wall tower/fins/mast composition; Parliament and City Hall have their civic massing and clock-tower forms; Teleposta, Holy Family, Britam and UAP have distinct silhouette logic.

**Acceptance:** principal anchors should be distinguishable by form even while neutral-grey.

## P3 — Materials & Daylight

**Viewable outcome:** the neutral P2 city gains glass/concrete/stone/metal PBR response, equatorial solar motion, atmospheric sky, directional shadows and environment reflections. Moving the time slider visibly changes sun direction, exposure and sky.

**Acceptance:** a clear daytime view should read as a materially plausible city rather than a CAD greybox.

## P4 — Streetscape & Vegetation

**Viewable outcome:** trees, streetlights, benches, flags, park furniture and a reflective Uhuru Park water body appear. Street/medium-distance cameras gain depth and human scale.

## P5 — Urban Activity

**Viewable outcome:** cars, matatus, boda-bodas, pedestrians and commuter rail move continuously. The Activity slider visibly changes density.

## P6 — Night, Weather & Water

**Viewable outcome:** Clear/Haze/Rain states become available; night activates emissive windows and street lamps; rain particles appear; road surfaces darken/become more reflective; bloom is enabled on capable quality modes; the same camera can be compared across afternoon, golden hour, night and rain.

## P7 — Performance

**Viewable outcome:** Auto/Low/Medium/High/Ultra presets change DPR, shadow resolution, activity/streetscape density and bloom. The diagnostics panel exposes FPS, draw calls and triangle count so optimization is observable.

## P8 — Product UX

**Viewable outcome:** click a landmark for its source/confidence inspector; use named geographic cameras; start/stop the guided tour; control time, weather, activity, labels and quality from the product UI.

## P9 — QA & Release

**Viewable outcome:** the full cumulative release baseline with explicit OSM/live-fallback status, performance diagnostics, source attribution, geographic caveats and a release badge. This is the public-shareable v1 baseline.

# Phase 0 — Research and Ground Truth

**Status:** COMPLETE — ready for Phase 1 greybox  
**Baseline:** Nairobi, Kenya — 5 September 2026  
**Project:** Nairobi CBD Digital Twin  
**Gate:** no fine hero modeling until Phase 1 geospatial greybox preserves the validated relationships below.

## 1. Proposed spatial extent

The scene uses three fidelity tiers:

| Tier | Extent | Purpose |
|---|---|---|
| A — CBD Hero Zone | 36.8120–36.8325 E; 1.2760–1.3005 S | Highest-detail CBD, civic core, parks and station edge |
| B — Near Context | 36.7950–36.8400 E; 1.2680–1.3190 S | Upper Hill, rail approaches, Museum/University edge, Ngara/river context |
| C — Horizon | ~15 km radius | Terrain and skyline silhouettes only |

This keeps Britam/UAP in their real Upper Hill context while concentrating detail where it materially affects CBD recognition.

## 2. Projection and local world coordinates

- **Ingest:** WGS84 / EPSG:4326
- **Working CRS:** WGS84 / UTM Zone 37S / EPSG:32737
- **Scene origin:** KICC at -1.2886111, 36.8230556
- **Origin in UTM 37S:** E 257762.817 m, N 9857465.985 m
- **Runtime convention:** one Three.js world unit = one metre
- **Axes:** East = +X, North = -Z, Up = +Y

This is preferable to raw Web Mercator world coordinates for a few-kilometre scene because local coordinates remain small and numerically stable.

## 3. Priority landmark set

The structured source-of-truth is `data/source_manifest.json`; Phase 1 must ingest its coordinates rather than hard-code a second copy.

| ID | Landmark | Class | Status |
|---|---|---|---|
| `kicc` | Kenyatta International Convention Centre | hero | verified |
| `times_tower` | Times Tower | hero | verified |
| `parliament` | Parliament Buildings | hero | verified |
| `bunge_tower` | Bunge Tower | hero | partially_verified |
| `city_hall` | Nairobi City Hall | hero | partially_verified |
| `supreme_court` | Supreme Court Building | hero | partially_verified |
| `teleposta` | Teleposta Towers | hero | verified |
| `kencom` | KENCOM House | hero | partially_verified |
| `nyayo_house` | Nyayo House | hero | verified |
| `national_archives` | Kenya National Archives | hero | verified |
| `nairobi_station` | Nairobi Railway Station | hero | verified |
| `railway_museum` | Nairobi Railway Museum | secondary | verified |
| `holy_family` | Cathedral Basilica of the Holy Family | hero | verified |
| `im_bank_tower` | I&M Bank Tower | secondary | verified |
| `afya_centre` | Afya Centre | hero | partially_verified |
| `harambee_house` | Harambee House | secondary | partially_verified |
| `britam_tower` | Britam Tower | skyline_context | verified |
| `uap_tower` | UAP Old Mutual Tower | skyline_context | verified |

## 4. Corrections / guardrails established during Phase 0

1. **Times Tower is KRA headquarters on Haile Selassie Avenue.** It is not Hass Towers and not the Nairobi Securities Exchange building.
2. **Bunge Tower belongs in the 2026 Parliament skyline.** Parliament records its official opening on 25 April 2024.
3. **Britam Tower and UAP Old Mutual Tower are Upper Hill skyline-context landmarks**, not CBD-core towers.
4. **The SGR mainline does not run through Nairobi CBD.** Model Nairobi Railway Station and the conventional/commuter corridor; represent the SGR connection only as an external linkage where useful.
5. **Do not invent an operational BRT system.** Phase 5 may add ordinary buses/matatus first; any BRT-specific infrastructure requires baseline-date verification.
6. **Do not place Dedan Kimathi’s statue in Parliament grounds.** Monument placement must be source-backed.
7. **Ngong Hills are directional horizon context, not a generic backdrop visible from every camera.**
8. **Kibera is outside the detailed CBD build.** It should only appear in wide, source-backed horizon/context views and must be represented neutrally.
9. **Nairobi Arboretum is not a Hero Zone requirement.** Include only if the selected near-context cameras benefit from it.
10. **The former Hilton Nairobi should not be modeled as an operating 2026 Hilton by default.** Hotel operations ceased at the end of 2022; any 2026 signage/use must be separately verified.
11. **KCB Plaza / KCB Towers assumptions from the earlier prompt are not promoted to hero status yet.** Identity, site and architectural form need a clean source audit before inclusion.

## 5. Road / park / rail source plan

### OpenStreetMap
Primary Phase 1 vector source for:
- roads and road classes;
- building footprints;
- rail alignments;
- parks/land use;
- waterways;
- selected POIs and monuments.

Use an Overpass or bounded extract for Tier A/B. Preserve OSM IDs in derived records so source geometry remains auditable. Public outputs must display **© OpenStreetMap contributors** and respect ODbL obligations.

### Terrain
Primary candidate: **Copernicus DEM GLO-30**. Because access policy changed in 2026, the ingestion script must support a GLO-90 or other legally usable fallback rather than making the build depend on an unauthenticated view service.

### Visual validation
Use:
- official institution/asset-owner pages;
- Wikimedia Commons imagery with recorded license/author;
- Mapillary street-level imagery where useful and licence-compatible;
- legally usable aerial/satellite references for visual checking only.

Do not redistribute proprietary basemap imagery or proprietary 3D geometry.

### Rail
Phase 1 should treat Nairobi Railway Station as the CBD rail anchor and ingest conventional/commuter tracks from OSM. SGR Nairobi Terminus remains outside the Tier B detailed model.

## 6. Reference camera viewpoints

`data/camera_presets.json` defines seven first-pass views:

1. City Square civic core
2. Uhuru Park skyline
3. KICC rooftop
4. Nairobi Railway Station forecourt
5. Haile Selassie / Times Tower approach
6. Upper Hill → CBD
7. Kenyatta Avenue west approach

These views are deliberately distributed across ground, park, aerial, rail, and skyline perspectives so a locally wrong model cannot pass merely by looking convincing from one angle.

## 7. Asset pipeline

```text
authoritative/legally usable source geometry
→ clean coordinate/metadata normalization
→ Blender/QGIS preprocessing as needed
→ topology cleanup
→ UV + trim-sheet assignment
→ PBR material authoring
→ LOD0/LOD1/LOD2
→ GLB 2.0
→ Meshopt/Draco optimization
→ KTX2/Basis texture compression
→ glTF validation
→ asset manifest entry
→ sector-based runtime loading
```

No model enters `verified` status without a source entry.

## 8. Renderer / post-processing architecture

**Baseline:** Three.js `0.185.1` / r185 series.

Production path for Phase 1–3:
- `WebGLRenderer` baseline for compatibility and deterministic delivery;
- WebGL2-capable browsers as primary desktop target;
- ACES-compatible filmic tone mapping;
- sRGB output/color management;
- PMREM environment lighting;
- directional sun + selective shadow ranges;
- EffectComposer only where an effect earns its frame-time cost;
- anti-aliasing selected by quality preset;
- SSAO/GTAO-style ambient occlusion evaluated in Phase 3;
- selective bloom only for emissive night features;
- no full-scene dynamic CubeCamera every frame.

WebGPU may be evaluated later behind an experimental flag, but it is not a Phase 1 dependency.

## 9. Desktop High-preset performance budget

Target at 1920×1080 on a representative mid-range gaming/development machine:

| Budget | High target |
|---|---:|
| Average FPS | 60 |
| 1% low | ≥45 FPS |
| Main-frame CPU | ≤6 ms typical |
| GPU frame | ≤12–13 ms typical |
| Draw calls, normal navigation | ≤1,200 |
| Visible triangles | ≤4.0M typical; ≤6.0M short peaks |
| GPU texture memory target | ≤900 MB |
| Initial essential download | ≤35 MB compressed |
| Loaded production assets after nearby sectors | ≤250 MB compressed target |
| Dynamic shadow-casting hero lights | Sun only by default |
| Concurrent animated traffic objects | quality-managed; instanced/pooled |

The Phase 1 greybox should remain dramatically below these limits so later phases have headroom.

## 10. Technical architecture

```text
/index.html
/src/
  main.js
  scene/
  geo/
  landmarks/
  traffic/
  people/
  ui/
  perf/
/assets/
  models/
  textures/
  data/
/data/
  source_manifest.json
  landmarks.geojson
  scene_config.json
  camera_presets.json
/docs/
  PHASE_0_GROUND_TRUTH.md
  TECHNICAL_ARCHITECTURE.md
  PHASE_1_PLAN.md
README.md
MASTER_IMPLEMENTATION_PROMPT.md
```

Key rule: source GIS coordinates live in structured data and are transformed once through a dedicated projection module. Scene modules consume local metres, never ad-hoc latitude/longitude math.

## 11. Risks and trade-offs

| Risk | Consequence | Mitigation |
|---|---|---|
| Incomplete OSM heights | Flat/incorrect skyline | Curated height overrides only when sourced; preserve confidence flags |
| Inconsistent building footprints | Bad block relationships | Validate Tier A manually against multiple references |
| Sparse roof/façade imagery | Hallucinated detail | Simplify and retain `partial`/`proxy` status |
| DEM too coarse for streets | Floating roads/buildings | Use DEM for broad relief; locally flatten/fit roads and footprints |
| Excessive hero detail | Frame-time instability | LODs and screen-space priority from first authored asset |
| Too many transparent windows | GPU overdraw | Opaque/physical façade approximation + emissive/parallax systems |
| Rights ambiguity | Cannot redistribute assets | Source/author/license field required before asset inclusion |
| 2026 land-use changes | Outdated signage/details | Date-stamp references; do not assume old commercial branding |

## 12. Gate decision

**Phase 0 is internally consistent enough to proceed to Phase 1.**

The key geographic relationships are now represented by auditable coordinates, the source hierarchy is explicit, and all unresolved details are tagged as partial/proxy rather than silently invented.

The next implementation step is `docs/PHASE_1_PLAN.md`.

# v1.0 Release Checklist

## Build and data
- [x] Structured source manifest loads.
- [x] Camera target IDs resolve.
- [x] EPSG:4326 → EPSG:32737/local-metre transformation retained.
- [x] JavaScript syntax validation covers all runtime modules.
- [x] Vite production build configured.
- [x] Runtime tolerates unavailable Overpass endpoints via explicit fallback.

## Geographic acceptance
- [x] KICC is the local scene origin.
- [x] Times Tower remains southeast of the civic core.
- [x] Parliament/Bunge remain west/southwest of KICC.
- [x] National Archives/Afya anchor the eastern CBD context.
- [x] Britam/UAP remain in Upper Hill context rather than moved into the CBD core.
- [x] Conventional/commuter rail is represented; no fabricated SGR mainline crosses CBD.

## Visual acceptance
- [x] P1 greybox inspectable.
- [x] P2 architecture-specific landmark state inspectable.
- [x] P3 daylight/PBR state inspectable.
- [x] P4 streetscape state inspectable.
- [x] P5 activity state inspectable.
- [x] P6 night/haze/rain state inspectable.
- [x] P7 diagnostics/quality state inspectable.
- [x] P8 inspector/tour state inspectable.
- [x] P9 full release state inspectable.

## Product/release
- [x] Responsive UI.
- [x] Source status visible.
- [x] OSM attribution visible in-product.
- [x] Accuracy limitation visible/documented.
- [x] Phase-by-phase visual acceptance guide documented.

## Before claiming engineering-grade accuracy
- [ ] Replace terrain scaffold with validated redistributable DEM-derived mesh.
- [ ] Obtain/author source-backed high-fidelity GLB hero assets from measured drawings/photogrammetry.
- [ ] Perform external visual survey against current field/aerial imagery.
- [ ] Calibrate traffic/pedestrian simulations from observed counts.

The unchecked items are **not requirements for the v1 public visual release**; they are requirements for upgrading the product into an engineering/photogrammetric twin.

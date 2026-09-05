const steps = [
  ['P1.1', 'Project shell', 'A clean Three.js viewport, Nairobi horizon tone, metric grid and KICC scene origin.'],
  ['P1.2', 'Coordinate system', 'Verified landmark pins appear at their projected real-world positions around KICC.'],
  ['P1.3', 'OSM spatial context', 'Live OpenStreetMap-derived city geometry loads when Overpass is available; an explicitly labelled fallback appears otherwise.'],
  ['P1.4', 'Terrain scaffold', 'A broad Nairobi relief surface appears under the city; this is a scaffold until the DEM asset is committed.'],
  ['P1.5', 'Roads + parks', 'CBD corridors, green-space polygons and open-space relationships become visible.'],
  ['P1.6', 'Building massing', 'The CBD becomes a solid urban volume: source-backed OSM extrusions when live data succeeds, deterministic fallback massing otherwise.'],
  ['P1.7', 'Hero proxies', 'Recognizable silhouette proxies appear for KICC, Times Tower, Parliament, Bunge Tower, City Hall, Teleposta, Holy Family, Britam/UAP and other anchors.'],
  ['P1.8', 'Rail context', 'The conventional/commuter railway corridor and Nairobi Railway Station relationship are visible; no SGR mainline is drawn through the CBD.'],
  ['P1.9', 'Camera validation', 'Named viewpoints let you inspect civic core, Uhuru Park skyline, KICC rooftop, railway edge, Kenyatta Avenue and Upper Hill.'],
  ['P1.10', 'Gate review', 'All greybox layers are visible together with diagnostics, ready for placement/silhouette sign-off before Phase 2.']
];

export function createUI(root, callbacks) {
  root.innerHTML = `
    <div class="viewer-shell">
      <div id="viewport" class="viewport"></div>
      <header class="topbar">
        <div>
          <div class="eyebrow">NAIROBI DIGITAL TWIN</div>
          <h1>Phase 1 · Geospatial Greybox</h1>
        </div>
        <div class="badges">
          <span class="badge">EPSG:32737</span>
          <span class="badge">1 unit = 1 m</span>
          <span class="badge" id="fpsBadge">— FPS</span>
        </div>
      </header>
      <aside class="panel left-panel">
        <div class="panel-title">Implementation steps</div>
        <div id="stepList" class="step-list"></div>
      </aside>
      <aside class="panel right-panel">
        <div class="panel-title">View validation</div>
        <div id="cameraList" class="camera-list"></div>
        <div class="separator"></div>
        <div class="panel-title">Data status</div>
        <div class="data-row"><span>OSM</span><strong id="osmStatus">Loading…</strong></div>
        <div class="data-row"><span>Buildings</span><strong id="buildingCount">—</strong></div>
        <div class="data-row"><span>Road ways</span><strong id="roadCount">—</strong></div>
        <div class="data-row"><span>Rail ways</span><strong id="railCount">—</strong></div>
        <div class="data-row"><span>Landmarks</span><strong id="landmarkCount">—</strong></div>
      </aside>
      <section class="milestone-card" id="milestoneCard"></section>
      <footer class="footer-note">Phase 1 is intentionally a neutral greybox. © OpenStreetMap contributors when live OSM layers are displayed. Hero façades and photoreal materials begin in later phases.</footer>
    </div>`;

  const list = root.querySelector('#stepList');
  steps.forEach(([id, name], i) => {
    const b = document.createElement('button');
    b.className = 'step-button';
    b.innerHTML = `<span>${id}</span><strong>${name}</strong>`;
    b.onclick = () => callbacks.onStep(i + 1);
    list.appendChild(b);
  });

  return {
    viewport: root.querySelector('#viewport'),
    setStep(step) {
      [...list.children].forEach((el, i) => el.classList.toggle('active', i === step - 1));
      const [id, name, desc] = steps[step - 1];
      root.querySelector('#milestoneCard').innerHTML = `<div class="eyebrow">WHAT YOU CAN VIEW AT THIS STEP</div><h2>${id} · ${name}</h2><p>${desc}</p>`;
    },
    setCameras(presets) {
      const el = root.querySelector('#cameraList');
      el.innerHTML = '';
      presets.forEach((p, i) => {
        const b = document.createElement('button');
        b.className = 'camera-button';
        b.textContent = p.name;
        b.onclick = () => callbacks.onCamera(i);
        el.appendChild(b);
      });
    },
    setStats({ osm, buildings, roads, rail, landmarks }) {
      root.querySelector('#osmStatus').textContent = osm;
      root.querySelector('#buildingCount').textContent = buildings;
      root.querySelector('#roadCount').textContent = roads;
      root.querySelector('#railCount').textContent = rail;
      root.querySelector('#landmarkCount').textContent = landmarks;
    },
    setFps(fps) { root.querySelector('#fpsBadge').textContent = `${Math.round(fps)} FPS`; }
  };
}

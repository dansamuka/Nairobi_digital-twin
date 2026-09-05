const phases = [
  ['P1','Geospatial Greybox','Terrain scaffold, audited coordinates, OSM context, roads/parks/building massing, rail corridor and validation cameras.'],
  ['P2','Hero Architecture','Landmark-specific procedural architecture replaces generic proxies. Major Nairobi anchors should be identifiable by silhouette and proportions.'],
  ['P3','Materials + Daylight','PBR glass/concrete/metal, equatorial solar path, Nairobi sky, shadows and reflections turn the greybox into a credible daytime city.'],
  ['P4','Streetscape + Vegetation','Trees, streetlights, benches, civic flags, park detail and water make street and medium-distance views feel occupied and contextual.'],
  ['P5','Urban Activity','Cars, matatus, boda-bodas, pedestrians and commuter rail move through the scene with adjustable density.'],
  ['P6','Night + Weather','Time-of-day lighting, emissive windows, street lights, rain, haze, wet-response and bloom create daylight, dusk, night and storm states.'],
  ['P7','Performance','Quality presets, auto quality, render diagnostics and density scaling keep the experience usable across hardware.'],
  ['P8','Product UX','Landmark inspector, guided tour, camera presets, source/provenance status and full scene controls turn the simulation into a usable product.'],
  ['P9','QA + Release','Release-mode viewer with explicit caveats, attribution, build status and acceptance checklist. This is the public-shareable baseline.']
];

export function createUI(root, callbacks = {}) {
  root.innerHTML = `
  <div class="app-shell">
    <div id="viewport" class="viewport"></div>
    <header class="topbar glass-panel">
      <div class="brand-block"><div class="eyebrow">NAIROBI DIGITAL TWIN · 2026 BASELINE</div><h1 id="phaseTitle">P9 · QA + Release</h1></div>
      <div class="top-actions"><span class="pill" id="sourcePill">OSM · loading</span><span class="pill" id="qualityPill">HIGH</span><span class="pill" id="fpsPill">— FPS</span><button id="tourButton" class="primary-button">Start tour</button></div>
    </header>
    <aside class="phase-panel glass-panel"><div class="panel-title">Build phases</div><div id="phaseList" class="phase-list"></div></aside>
    <aside class="control-panel glass-panel">
      <div class="panel-title">Scene controls</div>
      <label class="control-row"><span>Time <strong id="timeValue">09:30</strong></span><input id="timeRange" type="range" min="0" max="24" step="0.05" value="9.5"></label>
      <label class="control-row"><span>Weather</span><select id="weatherSelect"><option value="clear">Clear</option><option value="haze">Haze</option><option value="rain">Rain</option></select></label>
      <label class="control-row"><span>Activity <strong id="activityValue">65%</strong></span><input id="activityRange" type="range" min="0" max="100" step="1" value="65"></label>
      <label class="control-row"><span>Quality</span><select id="qualitySelect"><option value="auto">Auto</option><option value="low">Low</option><option value="medium">Medium</option><option value="high" selected>High</option><option value="ultra">Ultra</option></select></label>
      <label class="toggle-row"><input id="labelsToggle" type="checkbox" checked><span>Landmark labels</span></label>
      <div class="separator"></div><div class="panel-title">Camera validation</div><div id="cameraList" class="camera-list"></div>
      <div class="separator"></div><div class="panel-title">Live diagnostics</div>
      <div class="stat-grid"><div><span>Buildings</span><strong id="buildingCount">—</strong></div><div><span>Roads</span><strong id="roadCount">—</strong></div><div><span>Rail</span><strong id="railCount">—</strong></div><div><span>Landmarks</span><strong id="landmarkCount">—</strong></div><div><span>Draw calls</span><strong id="drawCalls">—</strong></div><div><span>Triangles</span><strong id="triangles">—</strong></div></div>
    </aside>
    <section id="milestoneCard" class="milestone-card glass-panel"></section><section id="inspector" class="inspector glass-panel hidden"></section>
    <button id="controlsToggle" class="mobile-controls">Controls</button>
    <footer class="footer-note">Geographic reconstruction for visual exploration — not cadastral/survey grade. © OpenStreetMap contributors where OSM-derived geometry is displayed.</footer>
  </div>`;

  const phaseList = root.querySelector('#phaseList');
  phases.forEach(([id,name],i)=>{ const b=document.createElement('button'); b.className='phase-button'; b.innerHTML=`<span>${id}</span><strong>${name}</strong>`; b.onclick=()=>callbacks.onPhase?.(i+1); phaseList.appendChild(b); });
  const timeRange=root.querySelector('#timeRange'), weatherSelect=root.querySelector('#weatherSelect'), activityRange=root.querySelector('#activityRange'), qualitySelect=root.querySelector('#qualitySelect'), labelsToggle=root.querySelector('#labelsToggle');
  timeRange.oninput=()=>{ const v=Number(timeRange.value); setTimeText(v); callbacks.onTime?.(v); };
  weatherSelect.onchange=()=>callbacks.onWeather?.(weatherSelect.value);
  activityRange.oninput=()=>{root.querySelector('#activityValue').textContent=`${activityRange.value}%`;callbacks.onActivity?.(Number(activityRange.value)/100);};
  qualitySelect.onchange=()=>callbacks.onQuality?.(qualitySelect.value); labelsToggle.onchange=()=>callbacks.onLabels?.(labelsToggle.checked);
  root.querySelector('#tourButton').onclick=()=>callbacks.onTour?.(); root.querySelector('#controlsToggle').onclick=()=>root.querySelector('.control-panel').classList.toggle('mobile-open');
  function setTimeText(hour) { let h=Math.floor(hour),m=Math.round((hour-h)*60); if(m===60){h=(h+1)%24;m=0;} root.querySelector('#timeValue').textContent=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`; }
  setTimeText(9.5);
  return {
    viewport:root.querySelector('#viewport'), phaseCount:phases.length,
    setPhase(phase){ const p=Math.max(1,Math.min(phases.length,phase)); const [id,name,desc]=phases[p-1]; [...phaseList.children].forEach((el,i)=>el.classList.toggle('active',i===p-1)); root.querySelector('#phaseTitle').textContent=`${id} · ${name}`; root.querySelector('#milestoneCard').innerHTML=`<div class="eyebrow">WHAT YOU CAN VIEW AT THIS PHASE</div><h2>${id} · ${name}</h2><p>${desc}</p>`; root.dataset.phase=String(p); },
    setCameras(presets){const el=root.querySelector('#cameraList');el.innerHTML='';presets.forEach((p,i)=>{const b=document.createElement('button');b.className='camera-button';b.textContent=p.name;b.onclick=()=>callbacks.onCamera?.(i);el.appendChild(b);});},
    setStats({osm,buildings,roads,rail,landmarks}){if(osm!=null){root.querySelector('#sourcePill').textContent=osm;root.querySelector('#sourcePill').dataset.mode=String(osm).includes('LIVE')?'live':'fallback';}if(buildings!=null)root.querySelector('#buildingCount').textContent=buildings;if(roads!=null)root.querySelector('#roadCount').textContent=roads;if(rail!=null)root.querySelector('#railCount').textContent=rail;if(landmarks!=null)root.querySelector('#landmarkCount').textContent=landmarks;},
    setFps(fps){root.querySelector('#fpsPill').textContent=`${Math.round(fps)} FPS`;},
    setDiagnostics(d){root.querySelector('#drawCalls').textContent=d.drawCalls?.toLocaleString?.()??d.drawCalls??'—';root.querySelector('#triangles').textContent=d.triangles?.toLocaleString?.()??d.triangles??'—';root.querySelector('#qualityPill').textContent=`${String(d.effective||'').toUpperCase()} · ${d.dpr||1}×`;},
    setTourState(running){root.querySelector('#tourButton').textContent=running?'Stop tour':'Start tour';root.querySelector('#tourButton').classList.toggle('active',running);},
    setInspector(lm){const el=root.querySelector('#inspector');if(!lm){el.classList.add('hidden');return;}const sources=(lm.sources||[]).slice(0,3).map(s=>`<li>${safe(s.replace(/^https?:\/\//,''))}</li>`).join('');el.innerHTML=`<button class="inspector-close" aria-label="Close">×</button><div class="eyebrow">LANDMARK INSPECTOR</div><h2>${safe(lm.canonical_name)}</h2><div class="inspector-grid"><span>Status</span><strong>${safe(lm.status||'unknown')}</strong><span>Location confidence</span><strong>${safe(lm.location_confidence||'—')}</strong><span>Model role</span><strong>${safe(lm.category||'—')}</strong></div><p>${safe(lm.notes||'')}</p>${sources?`<details><summary>Source references</summary><ul>${sources}</ul></details>`:''}`;el.querySelector('.inspector-close').onclick=()=>el.classList.add('hidden');el.classList.remove('hidden');},
    setControlAvailability(phase){root.querySelectorAll('.control-panel input,.control-panel select').forEach(el=>el.disabled=false);root.querySelector('#weatherSelect').disabled=phase<6;root.querySelector('#activityRange').disabled=phase<5;root.querySelector('#qualitySelect').disabled=phase<7;root.querySelector('#tourButton').disabled=phase<8;},
    setReleaseStatus(text){root.querySelector('#milestoneCard').insertAdjacentHTML('beforeend',`<div class="release-chip">${safe(text)}</div>`);}
  };
}
function safe(value=''){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

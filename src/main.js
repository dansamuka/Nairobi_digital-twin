import * as THREE from 'three';
import { createUI } from './ui.js';
import { createProjection } from './geo.js';
import { createScene, createTerrainScaffold, createRainSystem, updateRain, animate } from './scene.js';
import { createLandmarkLayers } from './landmarks.js';
import { fetchOsm, buildOsmLayers, buildFallbackContext } from './osm.js';
import { createStreetscape } from './streetscape.js';
import { createActivity } from './activity.js';
import { createQualityManager } from './performance.js';
import { createTour, smoothCamera } from './tour.js';

const app=document.querySelector('#app');
let phase=9, time=14.2, weather='clear', activityDensity=0.65;
let sceneKit, projection, manifest, cameraPresets, landmarkLayers, contextLayers, terrain, rain, streetscape, activity, quality, tour;
let labelsVisible=true;

const ui=createUI(app,{
  onPhase(p){phase=p;applyPhase();},
  onCamera(i){tour?.stop();goToCamera(i,true);},
  onTime(v){time=v;updateEnvironment();},
  onWeather(v){weather=v;updateEnvironment();},
  onActivity(v){activityDensity=v;activity?.setDensity(v);},
  onQuality(v){quality?.setMode(v);},
  onLabels(v){labelsVisible=v;landmarkLayers?.setLabels(v);},
  onTour(){tour?.toggle();}
});

async function loadJson(path){const r=await fetch(path);if(!r.ok)throw new Error(`${path}: ${r.status}`);return r.json();}

async function init(){
  [manifest,cameraPresets]=await Promise.all([loadJson('./data/source_manifest.json'),loadJson('./data/camera_presets.json')]);
  projection=createProjection(manifest.coordinate_convention.origin);
  sceneKit=createScene(ui.viewport);

  terrain=createTerrainScaffold(); sceneKit.scene.add(terrain);
  rain=createRainSystem(); sceneKit.scene.add(rain);
  landmarkLayers=createLandmarkLayers(manifest); sceneKit.scene.add(landmarkLayers.pins,landmarkLayers.grey,landmarkLayers.detailed);
  streetscape=createStreetscape(projection); sceneKit.scene.add(streetscape.group);
  activity=createActivity(projection); sceneKit.scene.add(activity.group); activity.setDensity(activityDensity);

  quality=createQualityManager(sceneKit,{onPreset(name,preset){sceneKit.bloom.enabled=phase>=6&&preset.bloom;activity?.setDensity(activityDensity*preset.activity);streetscape?.setDensity(preset.streetscape);ui.setDiagnostics(quality?.snapshot?.()||{effective:name,dpr:sceneKit.renderer.getPixelRatio()});}});
  quality.setMode('high');

  ui.setCameras(cameraPresets.presets);
  ui.setStats({osm:'OSM · loading',buildings:'—',roads:'—',rail:'—',landmarks:manifest.landmarks.length});
  ui.setPhase(phase); ui.setControlAvailability(phase);

  try{const osm=await fetchOsm();contextLayers=buildOsmLayers(osm,projection);addContextLayers(contextLayers);ui.setStats({osm:'LIVE · OSM',buildings:contextLayers.stats.buildingCount,roads:contextLayers.stats.roadCount,rail:contextLayers.stats.railCount,landmarks:manifest.landmarks.length});}
  catch(err){console.warn('Using fallback context',err);contextLayers=buildFallbackContext(projection);addContextLayers(contextLayers);ui.setStats({osm:'FALLBACK · OSM unavailable',buildings:contextLayers.stats.buildingCount,roads:contextLayers.stats.roadCount,rail:contextLayers.stats.railCount,landmarks:manifest.landmarks.length});}

  setupPicking();
  tour=createTour(sceneKit,cameraPresets.presets,(i,smooth)=>goToCamera(i,smooth),(running)=>ui.setTourState(running));
  applyPhase(); goToCamera(1,false);

  animate(sceneKit,{
    update(dt){activity?.update(dt);tour?.update(dt);updateRain(rain,dt,sceneKit.camera);quality?.update(lastFps,dt);},
    onFrame(fps){lastFps=fps;ui.setFps(fps);if(frameCounter++%30===0)ui.setDiagnostics(quality.snapshot());}
  });
}
let lastFps=60,frameCounter=0;

function addContextLayers(layers){sceneKit.scene.add(layers.sourceContext,layers.roads,layers.parks,layers.rail,layers.buildings);}

function setMaterialPhase(){
  if(!contextLayers)return;
  const night=sceneKit.environment.state.night; const wet=weather==='rain'&&phase>=6;
  contextLayers.buildings.traverse(o=>{if(!o.isMesh)return;if(phase<3){o.material.color.set(0xa5aaab);o.material.roughness=0.92;o.material.metalness=0.02;}
    else{o.material.color.set(night?0x68757a:0x8d999c);o.material.roughness=0.62;o.material.metalness=0.08;}});
  contextLayers.roads.traverse(o=>{if(!o.isMesh)return;o.material.color.set(wet?0x252a2d:0x414648);o.material.roughness=wet?0.34:0.92;o.material.metalness=wet?0.1:0.01;});
  contextLayers.parks.traverse(o=>{if(o.isMesh){o.material.color.set(night?0x33483a:0x5d7557);o.material.roughness=1;}});
}

function updateEnvironment(){
  if(!sceneKit)return;
  const activeWeather=phase>=6?weather:'clear';
  sceneKit.environment.update({time:phase>=3?time:14.2,weather:activeWeather,phase});
  const night=phase>=6&&sceneKit.environment.state.night;
  landmarkLayers?.setNight(night); streetscape?.setNight(night); streetscape?.setWetness(activeWeather==='rain'); activity?.setNight(night);
  if(rain)rain.visible=phase>=6&&activeWeather==='rain';
  if(sceneKit.bloom)sceneKit.bloom.enabled=phase>=6&&quality?.presets?.[quality.effective]?.bloom===true;
  setMaterialPhase();
}

function applyPhase(){
  if(!sceneKit)return;
  ui.setPhase(phase);ui.setControlAvailability(phase);
  sceneKit.grid.visible=phase===1; sceneKit.origin.visible=phase===1;
  terrain.visible=phase>=1;
  landmarkLayers.pins.visible=false;
  landmarkLayers.grey.visible=phase===1;
  landmarkLayers.detailed.visible=phase>=2;
  landmarkLayers.setPhaseLook(phase);
  landmarkLayers.setLabels(labelsVisible);
  if(contextLayers){contextLayers.sourceContext.visible=phase===1;contextLayers.roads.visible=phase>=1;contextLayers.parks.visible=phase>=1;contextLayers.buildings.visible=phase>=1;contextLayers.rail.visible=phase>=1;}
  streetscape.group.visible=phase>=4;
  activity.group.visible=phase>=5;
  rain.visible=phase>=6&&weather==='rain';
  sceneKit.bloom.enabled=phase>=6&&quality?.presets?.[quality.effective]?.bloom===true;
  if(phase<5)activity.setDensity(0);else activity.setDensity(activityDensity*(quality?.presets?.[quality.effective]?.activity??1));
  updateEnvironment();
  if(phase===9)ui.setReleaseStatus('Release baseline · source-auditable · CI validated');
}

function targetForPreset(preset){const targets=preset.target_ids.map(id=>manifest.landmarks.find(l=>l.id===id)).filter(Boolean);if(!targets.length)return new THREE.Vector3(0,25,0);return new THREE.Vector3(targets.reduce((s,l)=>s+l.local_x_m,0)/targets.length,32,targets.reduce((s,l)=>s+l.local_z_m,0)/targets.length);}

function cameraPose(index){const p=cameraPresets.presets[index];const[lon,lat]=p.anchor_wgs84;const a=projection.project(lon,lat);const target=targetForPreset(p);const eyeY=Math.max(p.eye_height_m,index===2?110:7);const anchor=new THREE.Vector3(a.x,eyeY,a.z);const toward=target.clone().sub(anchor);if(toward.length()<80)toward.set(0,-0.1,-1);toward.normalize();const backoff=index===2?0:55;return{position:anchor.clone().addScaledVector(toward,-backoff),target};}
async function goToCamera(index,smooth=true){if(!sceneKit||!cameraPresets)return;const pose=cameraPose(index);if(smooth)await smoothCamera(sceneKit,pose.position,pose.target,1.1);else{sceneKit.camera.position.copy(pose.position);sceneKit.controls.target.copy(pose.target);sceneKit.controls.update();}}

function setupPicking(){
  const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2();
  sceneKit.renderer.domElement.addEventListener('pointerdown',event=>{
    if(phase<8)return;const rect=sceneKit.renderer.domElement.getBoundingClientRect();pointer.x=((event.clientX-rect.left)/rect.width)*2-1;pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;raycaster.setFromCamera(pointer,sceneKit.camera);
    const hits=raycaster.intersectObjects(landmarkLayers.detailed.children,true);if(!hits.length){ui.setInspector(null);return;}let o=hits[0].object;while(o&&!o.userData?.landmark)o=o.parent;ui.setInspector(o?.userData?.landmark||null);
  });
}

init().catch(err=>{console.error(err);ui.setStats({osm:'INIT ERROR',buildings:'—',roads:'—',rail:'—',landmarks:'—'});});

import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';

const LAT = -1.286389;
const LON = 36.817223;
const BASE_DATE = { year: 2026, month: 9, day: 5 };

function degToRad(v) { return v * Math.PI / 180; }
function radToDeg(v) { return v * 180 / Math.PI; }

function solarPosition(localHour) {
  const date = new Date(Date.UTC(BASE_DATE.year, BASE_DATE.month - 1, BASE_DATE.day, 0, 0, 0));
  const start = new Date(Date.UTC(BASE_DATE.year, 0, 0));
  const day = Math.floor((date - start) / 86400000);
  const gamma = (2 * Math.PI / 365) * (day - 1 + (localHour - 12) / 24);
  const eqtime = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma) - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));
  const decl = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma) - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma) - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma);
  const timezone = 3;
  const timeOffset = eqtime + 4 * LON - 60 * timezone;
  const tst = localHour * 60 + timeOffset;
  const ha = degToRad(tst / 4 - 180);
  const lat = degToRad(LAT);
  const cosZenith = Math.sin(lat) * Math.sin(decl) + Math.cos(lat) * Math.cos(decl) * Math.cos(ha);
  const zenith = Math.acos(THREE.MathUtils.clamp(cosZenith, -1, 1));
  const elevation = Math.PI / 2 - zenith;
  let az = Math.atan2(Math.sin(ha), Math.cos(ha) * Math.sin(lat) - Math.tan(decl) * Math.cos(lat));
  az += Math.PI;
  return { azimuth: az, elevation, elevationDeg: radToDeg(elevation) };
}

function skyColorForHour(hour) {
  const day = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI));
  const dawn = Math.exp(-Math.pow((hour - 6.2) / 1.3, 2));
  const dusk = Math.exp(-Math.pow((hour - 18.2) / 1.3, 2));
  const night = 1 - Math.min(1, day * 1.6);
  const c = new THREE.Color(0x0a1424);
  c.lerp(new THREE.Color(0x8fb9d6), day);
  c.lerp(new THREE.Color(0xe5a06b), Math.min(0.52, dawn * 0.5 + dusk * 0.5));
  c.lerp(new THREE.Color(0x07111d), night * 0.72);
  return c;
}

export function createEnvironment(scene, renderer) {
  const sky = new Sky();
  sky.scale.setScalar(450000);
  scene.add(sky);
  const uniforms = sky.material.uniforms;
  uniforms.turbidity.value = 5.5;
  uniforms.rayleigh.value = 2.3;
  uniforms.mieCoefficient.value = 0.006;
  uniforms.mieDirectionalG.value = 0.79;

  const hemi = new THREE.HemisphereLight(0xdfeeff, 0x6f6a59, 1.7);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d2, 3.1);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -1800;
  sun.shadow.camera.right = 1800;
  sun.shadow.camera.top = 1800;
  sun.shadow.camera.bottom = -1800;
  sun.shadow.camera.near = 10;
  sun.shadow.camera.far = 6000;
  sun.shadow.bias = -0.00012;
  scene.add(sun);

  const moon = new THREE.DirectionalLight(0x8aa6d9, 0.0);
  moon.position.set(1200, 1800, -900);
  scene.add(moon);
  const ambient = new THREE.AmbientLight(0xffffff, 0.12);
  scene.add(ambient);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0xb9c8d1);
  const envTarget = pmrem.fromScene(envScene, 0.03);
  scene.environment = envTarget.texture;
  const state = { time: 14.2, weather: 'clear', phase: 3, night: false, sunElevation: 45 };

  function update({ time = state.time, weather = state.weather, phase = state.phase } = {}) {
    state.time = Number(time); state.weather = weather; state.phase = phase;
    const solar = solarPosition(state.time);
    state.sunElevation = solar.elevationDeg; state.night = solar.elevationDeg < -2;
    const radius = 3000;
    const y = Math.sin(solar.elevation) * radius;
    const horizontal = Math.cos(solar.elevation) * radius;
    const x = Math.sin(solar.azimuth) * horizontal;
    const z = -Math.cos(solar.azimuth) * horizontal;
    sun.position.set(x, Math.max(80, y), z);
    uniforms.sunPosition.value.copy(sun.position).normalize();
    const daylight = THREE.MathUtils.clamp((solar.elevationDeg + 5) / 28, 0, 1);
    sun.intensity = phase >= 3 ? 0.18 + 3.4 * daylight : 2.2;
    moon.intensity = phase >= 6 ? (1 - daylight) * 0.38 : 0;
    hemi.intensity = phase >= 3 ? 0.22 + daylight * 1.7 : 1.7;
    ambient.intensity = phase >= 6 && state.night ? 0.25 : 0.12;
    sun.color.set(state.time < 8 || state.time > 17 ? 0xffc78c : 0xfff2d7);
    const background = skyColorForHour(state.time);
    if (weather === 'rain') background.lerp(new THREE.Color(0x59656c), 0.67);
    if (weather === 'haze') background.lerp(new THREE.Color(0xb7b1a2), 0.42);
    scene.background = background;
    scene.fog.color.copy(background);
    scene.fog.density = weather === 'rain' ? 0.00046 : weather === 'haze' ? 0.00038 : 0.00018;
    uniforms.turbidity.value = weather === 'haze' ? 11 : weather === 'rain' ? 13 : 5.5;
    uniforms.rayleigh.value = weather === 'rain' ? 0.8 : 2.3;
    renderer.toneMappingExposure = state.night ? 0.78 : state.time < 8 || state.time > 17 ? 0.95 : 1.05;
  }
  update();
  return { sky, sun, moon, hemi, ambient, state, update, dispose() { envTarget.dispose(); pmrem.dispose(); } };
}

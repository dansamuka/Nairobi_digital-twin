import * as THREE from 'three';

export function createTour(sceneKit, presets, goToCamera, onState = () => {}) {
  let running = false; let index = 0; let elapsed = 0; const hold = 6.5;
  function start() { running = true; index = 0; elapsed = 0; goToCamera(index, true); onState(true, index); }
  function stop() { running = false; onState(false, index); }
  function toggle() { if (running) stop(); else start(); }
  function update(dt) { if (!running || !presets?.length) return; elapsed += dt; if (elapsed >= hold) { elapsed = 0; index = (index + 1) % presets.length; goToCamera(index, true); onState(true, index); } }
  return { start, stop, toggle, update, get running(){return running;} };
}

export function smoothCamera(sceneKit, targetPosition, targetLookAt, duration = 1.2) {
  const fromPos = sceneKit.camera.position.clone(); const fromTarget = sceneKit.controls.target.clone(); const started = performance.now();
  const ease = t => 1 - Math.pow(1 - t, 3);
  return new Promise(resolve => {
    function frame(now) { const t = THREE.MathUtils.clamp((now - started) / (duration * 1000), 0, 1); const e = ease(t); sceneKit.camera.position.lerpVectors(fromPos, targetPosition, e); sceneKit.controls.target.lerpVectors(fromTarget, targetLookAt, e); sceneKit.controls.update(); if (t < 1) requestAnimationFrame(frame); else resolve(); }
    requestAnimationFrame(frame);
  });
}

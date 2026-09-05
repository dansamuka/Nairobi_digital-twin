const PRESETS = {
  low: { dpr: 1.0, shadow: 512, bloom: false, activity: 0.35, streetscape: 0.35, far: 5000 },
  medium: { dpr: 1.25, shadow: 1024, bloom: false, activity: 0.58, streetscape: 0.65, far: 8000 },
  high: { dpr: 1.6, shadow: 2048, bloom: true, activity: 0.82, streetscape: 1.0, far: 12000 },
  ultra: { dpr: 2.0, shadow: 4096, bloom: true, activity: 1.0, streetscape: 1.0, far: 18000 }
};

export function createQualityManager(sceneKit, callbacks = {}) {
  let mode = 'auto'; let effective = 'high'; let fpsEma = 60; let cooldown = 0;
  function apply(name) {
    const p = PRESETS[name] || PRESETS.high; effective = name;
    sceneKit.renderer.setPixelRatio(Math.min(devicePixelRatio, p.dpr));
    sceneKit.environment.sun.shadow.mapSize.set(p.shadow, p.shadow);
    sceneKit.environment.sun.shadow.map?.dispose?.();
    sceneKit.camera.far = p.far; sceneKit.camera.updateProjectionMatrix();
    callbacks.onPreset?.(name, p); return p;
  }
  function setMode(next) { mode = next; if (mode === 'auto') apply(effective); else apply(mode); }
  function update(fps, dt = 1 / 60) {
    fpsEma = fpsEma * 0.94 + fps * 0.06; if (mode !== 'auto') return;
    cooldown = Math.max(0, cooldown - dt); if (cooldown > 0) return;
    const order = ['low','medium','high','ultra']; let i = order.indexOf(effective);
    if (fpsEma < 43 && i > 0) { i--; apply(order[i]); cooldown = 5; }
    else if (fpsEma > 57 && i < 2) { i++; apply(order[i]); cooldown = 8; }
  }
  function snapshot(renderer = sceneKit.renderer) {
    const info = renderer.info;
    return { qualityMode: mode, effective, fps: Math.round(fpsEma), drawCalls: info.render.calls, triangles: info.render.triangles, geometries: info.memory.geometries, textures: info.memory.textures, dpr: Number(renderer.getPixelRatio().toFixed(2)) };
  }
  apply('high');
  return { setMode, update, snapshot, get mode(){return mode;}, get effective(){return effective;}, presets: PRESETS };
}

import proj4 from 'proj4';

const UTM37S = '+proj=utm +zone=37 +south +datum=WGS84 +units=m +no_defs';
proj4.defs('EPSG:32737', UTM37S);

export function createProjection(origin) {
  const [ox, oy] = proj4('EPSG:4326', 'EPSG:32737', [origin.lon, origin.lat]);
  return {
    originUtm: { x: ox, y: oy },
    project(lon, lat) {
      const [x, y] = proj4('EPSG:4326', 'EPSG:32737', [lon, lat]);
      return { x: x - ox, z: -(y - oy) };
    }
  };
}

export function polygonAreaXZ(points) {
  let a = 0;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const q = points[(i + 1) % points.length];
    a += p.x * q.z - q.x * p.z;
  }
  return Math.abs(a) * 0.5;
}

export function centroidXZ(points) {
  let x = 0, z = 0;
  for (const p of points) { x += p.x; z += p.z; }
  return { x: x / Math.max(1, points.length), z: z / Math.max(1, points.length) };
}

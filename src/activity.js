import * as THREE from 'three';

function material(color, roughness = 0.6, metalness = 0.15, emissive = 0x000000, emissiveIntensity = 0) { return new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive, emissiveIntensity }); }
function projectPath(projection, coords) { return coords.map(([lon,lat]) => projection.project(lon,lat)); }
function pathLengths(points) { const seg = []; let total = 0; for (let i=0;i<points.length;i++) { const a=points[i], b=points[(i+1)%points.length]; const len=Math.hypot(b.x-a.x,b.z-a.z); seg.push(len); total+=len; } return { seg, total }; }
function pointAt(points, meta, distance) { let d=((distance%meta.total)+meta.total)%meta.total; for (let i=0;i<meta.seg.length;i++) { if (d<=meta.seg[i]) { const a=points[i],b=points[(i+1)%points.length],t=d/meta.seg[i]; return { x:THREE.MathUtils.lerp(a.x,b.x,t), z:THREE.MathUtils.lerp(a.z,b.z,t), angle:Math.atan2(b.x-a.x,b.z-a.z) }; } d-=meta.seg[i]; } return {x:points[0].x,z:points[0].z,angle:0}; }

function createVehicleInstances(max, geometry, mat, routes, speeds, y=1) {
  const mesh = new THREE.InstancedMesh(geometry, mat, max); mesh.castShadow=true; mesh.receiveShadow=true; mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const items=[], metas=routes.map(pathLengths), q=new THREE.Quaternion(), s=new THREE.Vector3(1,1,1), m=new THREE.Matrix4();
  for(let i=0;i<max;i++) items.push({ route:i%routes.length, dist:(i*137.7)%(metas[i%routes.length].total), speed:speeds[i%speeds.length]*(0.9+(i%7)*0.025), lane:((i%3)-1)*3.0 });
  function update(dt,countScale=1){ const count=Math.max(0,Math.min(max,Math.floor(max*countScale))); mesh.count=count; for(let i=0;i<count;i++){const it=items[i],pts=routes[it.route],meta=metas[it.route];it.dist+=it.speed*dt;const p=pointAt(pts,meta,it.dist);const nx=Math.cos(p.angle)*it.lane,nz=-Math.sin(p.angle)*it.lane;q.setFromAxisAngle(new THREE.Vector3(0,1,0),p.angle);m.compose(new THREE.Vector3(p.x+nx,y,p.z+nz),q,s);mesh.setMatrixAt(i,m);} mesh.instanceMatrix.needsUpdate=true; }
  return {mesh,update};
}

export function createActivity(projection) {
  const group=new THREE.Group(); group.name='urban-activity';
  const routes=[
    projectPath(projection,[[36.8148,-1.2867],[36.8190,-1.2864],[36.8246,-1.2857],[36.8292,-1.2848],[36.8284,-1.2870],[36.8240,-1.2876],[36.8190,-1.2878]]),
    projectPath(projection,[[36.8180,-1.2926],[36.8210,-1.2892],[36.8232,-1.2866],[36.8258,-1.2828],[36.8266,-1.2844],[36.8240,-1.2881],[36.8210,-1.2914]]),
    projectPath(projection,[[36.8161,-1.2918],[36.8218,-1.2914],[36.8282,-1.2912],[36.8275,-1.2892],[36.8216,-1.2896]])
  ];
  const carMat=material(0x7b8286,0.42,0.28), matatuMat=material(0xc8b239,0.38,0.22,0x193b55,0), bodaMat=material(0x343a3c,0.48,0.25), pedMat=material(0x8f7768,0.82,0.02); matatuMat.userData.activityGlow=true;
  const cars=createVehicleInstances(120,new THREE.BoxGeometry(4.4,1.45,1.9),carMat,routes,[9,11,13,8],1.05);
  const matatus=createVehicleInstances(30,new THREE.BoxGeometry(6.2,2.6,2.3),matatuMat,routes,[7,8.5,9],1.45);
  const bodas=createVehicleInstances(60,new THREE.BoxGeometry(2.1,0.8,0.65),bodaMat,routes,[10,12,14],0.75); group.add(cars.mesh,matatus.mesh,bodas.mesh);

  const pedRoutes=[projectPath(projection,[[36.8210,-1.2865],[36.8248,-1.2858],[36.8278,-1.2849],[36.8262,-1.2838],[36.8225,-1.2850]]),projectPath(projection,[[36.8180,-1.2895],[36.8201,-1.2868],[36.8187,-1.2843],[36.8168,-1.2868]])];
  const pedMeta=pedRoutes.map(pathLengths), pedMax=220, pedGeo=new THREE.CapsuleGeometry(0.28,1.25,2,5), peds=new THREE.InstancedMesh(pedGeo,pedMat,pedMax); peds.instanceMatrix.setUsage(THREE.DynamicDrawUsage); peds.castShadow=true;
  const pedItems=Array.from({length:pedMax},(_,i)=>({route:i%pedRoutes.length,dist:(i*17.2)%pedMeta[i%pedRoutes.length].total,speed:1.0+(i%5)*0.18,lane:((i%5)-2)*1.5}));
  const matrix=new THREE.Matrix4(), quat=new THREE.Quaternion(), scale=new THREE.Vector3(1,1,1), up=new THREE.Vector3(0,1,0);
  function updatePeds(dt,density){const count=Math.floor(pedMax*density);peds.count=count;for(let i=0;i<count;i++){const it=pedItems[i],pts=pedRoutes[it.route],meta=pedMeta[it.route];it.dist+=it.speed*dt;const p=pointAt(pts,meta,it.dist);const nx=Math.cos(p.angle)*it.lane,nz=-Math.sin(p.angle)*it.lane;quat.setFromAxisAngle(up,p.angle);matrix.compose(new THREE.Vector3(p.x+nx,0.9,p.z+nz),quat,scale);peds.setMatrixAt(i,matrix);}peds.instanceMatrix.needsUpdate=true;} group.add(peds);

  const trainGroup=new THREE.Group(), trainBody=material(0x9da5a6,0.48,0.25), stripe=material(0x2b5460,0.5,0.18);
  for(let i=0;i<4;i++){const car=new THREE.Group(),b=new THREE.Mesh(new THREE.BoxGeometry(18,3.6,3.2),trainBody);b.position.y=2.1;car.add(b);const s1=new THREE.Mesh(new THREE.BoxGeometry(18.1,0.65,3.25),stripe);s1.position.y=2.4;car.add(s1);car.position.x=-i*19;trainGroup.add(car);} group.add(trainGroup);
  const railPath=projectPath(projection,[[36.8168,-1.2960],[36.8220,-1.2940],[36.8284,-1.2918],[36.8320,-1.2920]]), railMeta=pathLengths(railPath); let trainDist=0;
  function updateTrain(dt,density){trainDist+=dt*(6+5*density);const p=pointAt(railPath,railMeta,trainDist);trainGroup.position.set(p.x,0.35,p.z);trainGroup.rotation.y=p.angle;trainGroup.visible=density>0.18;}
  let density=0.65;
  function update(dt){cars.update(dt,density);matatus.update(dt,Math.min(1,density*0.7));bodas.update(dt,Math.min(1,density*0.8));updatePeds(dt,Math.min(1,density));updateTrain(dt,density);}
  function setDensity(v){density=THREE.MathUtils.clamp(Number(v),0,1);}
  function setNight(night){matatuMat.emissiveIntensity=night?1.8:0;}
  return {group,update,setDensity,setNight,get density(){return density;}};
}

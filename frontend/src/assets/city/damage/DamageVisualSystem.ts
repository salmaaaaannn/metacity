import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export interface DamageGeometry {
  body: THREE.BufferGeometry;
  debris?: THREE.BufferGeometry;
}

// Pseudo-random generator for deterministic placement
function random(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Damage level 1: Minor — cracked appearance, broken windows (darken texture)
export function createMinorDamageGeometry(w: number, d: number, h: number): DamageGeometry {
  const bodyGeoms: THREE.BufferGeometry[] = [];
  
  // Main body
  const mainGeo = new THREE.BoxGeometry(w, h, d);
  mainGeo.translate(0, h / 2, 0);
  bodyGeoms.push(mainGeo);

  // Add some cracks/scratches
  const numCracks = Math.floor(w * d * 0.1);
  let seed = w * d * h;
  for (let i = 0; i < numCracks; i++) {
    const cw = 0.2 + random(seed++) * 0.3;
    const ch = 2 + random(seed++) * 3;
    const cd = 0.2 + random(seed++) * 0.3;
    const crack = new THREE.BoxGeometry(cw, ch, cd);
    const x = (random(seed++) - 0.5) * w;
    const y = random(seed++) * h;
    const z = (random(seed++) - 0.5) * d;
    crack.translate(x, y, z);
    bodyGeoms.push(crack);
  }

  // Debris at base
  const debrisGeoms: THREE.BufferGeometry[] = [];
  const numDebris = Math.floor((w + d) * 1.5);
  for (let i = 0; i < numDebris; i++) {
    const dw = 0.5 + random(seed++) * 0.5;
    const dh = 0.5 + random(seed++) * 0.5;
    const dd = 0.5 + random(seed++) * 0.5;
    const rubble = new THREE.BoxGeometry(dw, dh, dd);
    
    // Position around the base
    const angle = random(seed++) * Math.PI * 2;
    const radius = Math.max(w, d) / 2 + random(seed++) * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = dh / 2 + random(seed++) * 0.5;
    
    rubble.rotateX(random(seed++) * Math.PI);
    rubble.rotateY(random(seed++) * Math.PI);
    rubble.rotateZ(random(seed++) * Math.PI);
    rubble.translate(x, y, z);
    debrisGeoms.push(rubble);
  }

  return {
    body: mergeGeometries(bodyGeoms, false) || mainGeo,
    debris: debrisGeoms.length > 0 ? mergeGeometries(debrisGeoms, false) || undefined : undefined
  };
}

// Damage level 2: Major — top 30% of building removed, debris pile at base
export function createMajorDamageGeometry(w: number, d: number, h: number): DamageGeometry {
  const bodyGeoms: THREE.BufferGeometry[] = [];
  const debrisGeoms: THREE.BufferGeometry[] = [];
  let seed = w * d * h * 2;
  
  const damagedHeight = h * 0.7;
  
  // Base body
  const mainGeo = new THREE.BoxGeometry(w, damagedHeight, d);
  mainGeo.translate(0, damagedHeight / 2, 0);
  bodyGeoms.push(mainGeo);
  
  // Jagged top
  const numChunks = Math.floor((w * d) / 4);
  for (let i = 0; i < numChunks; i++) {
    const cw = w * (0.2 + random(seed++) * 0.3);
    const ch = h * (0.1 + random(seed++) * 0.2);
    const cd = d * (0.2 + random(seed++) * 0.3);
    const chunk = new THREE.BoxGeometry(cw, ch, cd);
    
    const x = (random(seed++) - 0.5) * (w - cw);
    const y = damagedHeight + (random(seed++) - 0.5) * ch * 0.5;
    const z = (random(seed++) - 0.5) * (d - cd);
    
    chunk.translate(x, y, z);
    bodyGeoms.push(chunk);
  }
  
  // Exposed rebar
  const numRebar = Math.floor((w + d) * 0.5);
  for (let i = 0; i < numRebar; i++) {
    const rh = 1 + random(seed++) * 2;
    const rebar = new THREE.CylinderGeometry(0.05, 0.05, rh, 4);
    
    const x = (random(seed++) - 0.5) * w * 0.8;
    const y = damagedHeight + rh / 2;
    const z = (random(seed++) - 0.5) * d * 0.8;
    
    rebar.rotateX((random(seed++) - 0.5) * 0.5);
    rebar.rotateZ((random(seed++) - 0.5) * 0.5);
    rebar.translate(x, y, z);
    debrisGeoms.push(rebar);
  }

  // Large debris pile at base
  const numDebris = Math.floor(w * d * 0.5);
  for (let i = 0; i < numDebris; i++) {
    const dw = 1 + random(seed++) * 1.5;
    const dh = 1 + random(seed++) * 1.5;
    const dd = 1 + random(seed++) * 1.5;
    const rubble = new THREE.BoxGeometry(dw, dh, dd);
    
    const angle = random(seed++) * Math.PI * 2;
    const radius = random(seed++) * Math.max(w, d) * 0.8;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    // Pile height depends on distance from center
    const distNormalized = radius / (Math.max(w, d) * 0.8);
    const pileHeight = 3 * (1 - distNormalized) * random(seed++);
    const y = dh / 2 + pileHeight;
    
    rubble.rotateX(random(seed++) * Math.PI);
    rubble.rotateY(random(seed++) * Math.PI);
    rubble.rotateZ(random(seed++) * Math.PI);
    rubble.translate(x, y, z);
    debrisGeoms.push(rubble);
  }

  return {
    body: mergeGeometries(bodyGeoms, false) || mainGeo,
    debris: debrisGeoms.length > 0 ? mergeGeometries(debrisGeoms, false) || undefined : undefined
  };
}

// Damage level 3: Destroyed — rubble pile only
export function createDestroyedGeometry(w: number, d: number, h: number): DamageGeometry {
  const debrisGeoms: THREE.BufferGeometry[] = [];
  let seed = w * d * h * 3;
  
  // Create rubble mound
  const numDebris = Math.floor(w * d * 1.5);
  for (let i = 0; i < numDebris; i++) {
    const dw = 1 + random(seed++) * 2;
    const dh = 1 + random(seed++) * 2;
    const dd = 1 + random(seed++) * 2;
    const rubble = new THREE.BoxGeometry(dw, dh, dd);
    
    const angle = random(seed++) * Math.PI * 2;
    const maxRadius = Math.max(w, d);
    const radius = random(seed++) * maxRadius;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    const distNormalized = radius / maxRadius;
    const pileHeight = 4 * Math.pow(1 - distNormalized, 2) * random(seed++);
    const y = dh / 2 + pileHeight;
    
    rubble.rotateX(random(seed++) * Math.PI);
    rubble.rotateY(random(seed++) * Math.PI);
    rubble.rotateZ(random(seed++) * Math.PI);
    rubble.translate(x, y, z);
    debrisGeoms.push(rubble);
  }
  
  // Steel beams
  const numBeams = Math.floor((w + d) * 0.3);
  for (let i = 0; i < numBeams; i++) {
    const bw = 0.2;
    const bh = 3 + random(seed++) * 4;
    const bd = 0.2;
    const beam = new THREE.BoxGeometry(bw, bh, bd);
    
    const angle = random(seed++) * Math.PI * 2;
    const radius = random(seed++) * Math.max(w, d) * 0.5;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = bh / 2 + random(seed++) * 2;
    
    beam.rotateX(random(seed++) * Math.PI);
    beam.rotateY(random(seed++) * Math.PI);
    beam.rotateZ(random(seed++) * Math.PI);
    beam.translate(x, y, z);
    debrisGeoms.push(beam);
  }
  
  const bodyGeo = mergeGeometries(debrisGeoms, false) || new THREE.BoxGeometry(1, 1, 1);
  
  return {
    body: bodyGeo
  };
}

// Material for damaged structures
export const damagedConcreteMaterial = new THREE.MeshStandardMaterial({
  color: '#6B6B6B',
  roughness: 0.95,
  metalness: 0.05,
});

export const rubbleMaterial = new THREE.MeshStandardMaterial({
  color: '#8B8682',
  roughness: 0.98,
  metalness: 0.02,
});

export const rebarMaterial = new THREE.MeshStandardMaterial({
  color: '#8B4513',
  roughness: 0.6,
  metalness: 0.7,
});

// Map disaster severity (1-5) to damage level (1-3)
export function severityToDamageLevel(severity: number): 1 | 2 | 3 {
  if (severity <= 2) return 1;
  if (severity <= 4) return 2;
  return 3;
}

// Geometry cache for damage
const damageCache = new Map<string, DamageGeometry>();

export function getDamageGeometry(w: number, d: number, h: number, level: 1 | 2 | 3): DamageGeometry {
  const rw = Math.round(w);
  const rd = Math.round(d);
  const rh = Math.round(h);
  const key = `damage_${level}_${rw}_${rd}_${rh}`;
  if (damageCache.has(key)) return damageCache.get(key)!;
  
  let geom: DamageGeometry;
  switch (level) {
    case 1: geom = createMinorDamageGeometry(rw, rd, rh); break;
    case 2: geom = createMajorDamageGeometry(rw, rd, rh); break;
    case 3: geom = createDestroyedGeometry(rw, rd, rh); break;
  }
  damageCache.set(key, geom);
  return geom;
}

import * as THREE from 'three'

/**
 * Unique Architectural Landmarks for METACITY
 * Provides hero structures: Central Tower (CBD), City Hall, Grand Central Station, Grand Hospital.
 */

export interface LandmarkData {
  id: string
  name: string
  x: number
  z: number
  type: 'central_tower' | 'city_hall' | 'grand_station' | 'grand_hospital'
}

export const METACITY_LANDMARKS: LandmarkData[] = [
  {
    id: 'landmark_central_tower',
    name: 'Metacity Central Tower',
    x: 4000,
    z: 4400,
    type: 'central_tower',
  },
  {
    id: 'landmark_city_hall',
    name: 'Metacity City Hall',
    x: 3800,
    z: 4800,
    type: 'city_hall',
  },
  {
    id: 'landmark_grand_station',
    name: 'Central Grand Railway Terminal',
    x: 4000,
    z: 4000,
    type: 'grand_station',
  },
  {
    id: 'landmark_grand_hospital',
    name: 'Metacity Metropolitan Medical Center',
    x: 3600,
    z: 4400,
    type: 'grand_hospital',
  },
]

/**
 * 1. Metacity Central Tower (Supertall 140m Landmark Skyscraper)
 * Stepped prismatic glass tower with observation deck, crown illuminated beacon, and communications mast.
 */
export function createCentralTowerGroup(isNight: boolean): THREE.Group {
  const group = new THREE.Group()

  const glassMat = new THREE.MeshStandardMaterial({
    color: isNight ? '#0D1B2A' : '#415A77',
    roughness: 0.1,
    metalness: 0.9,
    emissive: isNight ? new THREE.Color('#00E5FF') : new THREE.Color('#000000'),
    emissiveIntensity: isNight ? 0.35 : 0,
  })

  const steelMat = new THREE.MeshStandardMaterial({
    color: '#778DA9',
    roughness: 0.3,
    metalness: 0.8,
  })

  // Tier 1: Podium & Grand Lobby (0-30m)
  const tier1 = new THREE.Mesh(new THREE.BoxGeometry(45, 30, 45), glassMat)
  tier1.position.y = 15
  group.add(tier1)

  // Tier 2: Mid-tower (30-80m)
  const tier2 = new THREE.Mesh(new THREE.BoxGeometry(36, 50, 36), glassMat)
  tier2.position.y = 55
  group.add(tier2)

  // Tier 3: Upper-tower (80-120m)
  const tier3 = new THREE.Mesh(new THREE.BoxGeometry(26, 40, 26), glassMat)
  tier3.position.y = 100
  group.add(tier3)

  // Observation Skydeck & Crown (120-130m)
  const skydeck = new THREE.Mesh(new THREE.CylinderGeometry(18, 14, 10, 16), steelMat)
  skydeck.position.y = 125
  group.add(skydeck)

  // Glowing Spire (130-160m)
  const spireMat = new THREE.MeshBasicMaterial({ color: isNight ? '#00E5FF' : '#E0E1DD' })
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.8, 30, 8), spireMat)
  spire.position.y = 145
  group.add(spire)

  // Aviation warning beacon on tip
  const beacon = new THREE.Mesh(
    new THREE.SphereGeometry(1.5, 8, 8),
    new THREE.MeshBasicMaterial({ color: '#FF1744' })
  )
  beacon.position.y = 160
  group.add(beacon)

  return group
}

/**
 * 2. City Hall
 * Civic architecture with grand entrance colonnade, pediment, and copper dome.
 */
export function createCityHallGroup(): THREE.Group {
  const group = new THREE.Group()

  const stoneMat = new THREE.MeshStandardMaterial({
    color: '#D6CEBE',
    roughness: 0.8,
    metalness: 0.1,
  })

  const domeMat = new THREE.MeshStandardMaterial({
    color: '#4E876A', // Weathered green copper
    roughness: 0.4,
    metalness: 0.3,
  })

  // Main civic hall base
  const base = new THREE.Mesh(new THREE.BoxGeometry(60, 18, 40), stoneMat)
  base.position.y = 9
  group.add(base)

  // Colonnade (front columns)
  for (let c = -20; c <= 20; c += 8) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.2, 14, 12), stoneMat)
    col.position.set(c, 7, 22)
    group.add(col)
  }

  // Classical triangular pediment
  const pediment = new THREE.Mesh(new THREE.ConeGeometry(24, 7, 4), stoneMat)
  pediment.rotation.y = Math.PI / 4
  pediment.position.set(0, 17.5, 22)
  group.add(pediment)

  // Central Rotunda & Dome
  const rotunda = new THREE.Mesh(new THREE.CylinderGeometry(12, 12, 12, 16), stoneMat)
  rotunda.position.y = 24
  group.add(rotunda)

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(12, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    domeMat
  )
  dome.position.y = 30
  group.add(dome)

  return group
}

/**
 * 3. Grand Central Station
 * Vaulted steel arch train shed with glass skylight ribs.
 */
export function createGrandStationGroup(): THREE.Group {
  const group = new THREE.Group()

  const metalMat = new THREE.MeshStandardMaterial({
    color: '#37474F',
    roughness: 0.5,
    metalness: 0.7,
  })

  const glassMat = new THREE.MeshStandardMaterial({
    color: '#81D4FA',
    roughness: 0.1,
    metalness: 0.9,
    transparent: true,
    opacity: 0.7,
  })

  // Concourse Main Hall
  const concourse = new THREE.Mesh(new THREE.BoxGeometry(50, 16, 30), metalMat)
  concourse.position.y = 8
  group.add(concourse)

  // Train shed arched barrel vault
  const archGeom = new THREE.CylinderGeometry(18, 18, 70, 16, 1, false, 0, Math.PI)
  const arch = new THREE.Mesh(archGeom, glassMat)
  arch.rotation.z = Math.PI / 2
  arch.rotation.y = Math.PI / 2
  arch.position.set(0, 14, -40)
  group.add(arch)

  // Arched steel support ribs
  for (let z = -70; z <= -10; z += 15) {
    const ribGeom = new THREE.TorusGeometry(18.2, 0.6, 8, 16, Math.PI)
    const rib = new THREE.Mesh(ribGeom, metalMat)
    rib.rotation.y = Math.PI / 2
    rib.position.set(0, 14, z)
    group.add(rib)
  }

  return group
}

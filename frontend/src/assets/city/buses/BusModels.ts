import * as THREE from 'three'
import { headlightDayMat, headlightNightMat, taillightDayMat, taillightNightMat } from '../vehicles/VehicleModels'

/**
 * Realistic City Transit Bus & Bus Stop Infrastructure
 */

const busBodyMat = new THREE.MeshStandardMaterial({
  color: '#FB8C00', // Modern transit orange/blue livery
  roughness: 0.35,
  metalness: 0.3,
})

const busWhiteMat = new THREE.MeshStandardMaterial({
  color: '#ECEFF1',
  roughness: 0.2,
  metalness: 0.1,
})

const busGlassMat = new THREE.MeshStandardMaterial({
  color: '#263238',
  roughness: 0.1,
  metalness: 0.9,
  transparent: true,
  opacity: 0.85,
})

const wheelRubberMat = new THREE.MeshStandardMaterial({
  color: '#1E1E1E',
  roughness: 0.9,
  metalness: 0.1,
})

const wheelRimMat = new THREE.MeshStandardMaterial({
  color: '#90A4AE',
  roughness: 0.3,
  metalness: 0.85,
})

const ledSignMat = new THREE.MeshBasicMaterial({
  color: '#FFD54F', // Yellow LED destination sign
})

/**
 * Creates a realistic aerodynamic city bus model
 */
export function createBusGroup(isNight: boolean): THREE.Group {
  const group = new THREE.Group()

  const busL = 12.0
  const busW = 3.2
  const busH = 3.4

  // 1. Lower Chassis
  const lowerChassis = new THREE.Mesh(
    new THREE.BoxGeometry(busW, 1.4, busL),
    busBodyMat
  )
  lowerChassis.position.y = 1.2
  group.add(lowerChassis)

  // 2. White Aerodynamic Roof Cap
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(busW * 0.96, 0.4, busL * 0.98),
    busWhiteMat
  )
  roof.position.y = busH
  group.add(roof)

  // 3. Panoramic Tinted Windows Band (Front, Sides, Rear)
  const windowBand = new THREE.Mesh(
    new THREE.BoxGeometry(busW * 0.98, 1.4, busL * 0.96),
    busGlassMat
  )
  windowBand.position.y = 2.4
  group.add(windowBand)

  // 4. Front LED Destination Route Display
  const ledSign = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.4, 0.1),
    ledSignMat
  )
  ledSign.position.set(0, 3.0, busL / 2 + 0.02)
  group.add(ledSign)

  // 5. Wheels (Front single pair, Rear dual axle pair)
  const wheelGeom = new THREE.CylinderGeometry(0.55, 0.55, 0.5, 16)
  wheelGeom.rotateZ(Math.PI / 2)

  const wheelPositions = [
    [-busW / 2 + 0.15, 0.55, 3.8],
    [busW / 2 - 0.15, 0.55, 3.8],
    [-busW / 2 + 0.15, 0.55, -3.2],
    [busW / 2 - 0.15, 0.55, -3.2],
    [-busW / 2 + 0.15, 0.55, -4.5],
    [busW / 2 - 0.15, 0.55, -4.5],
  ]

  for (const [x, y, z] of wheelPositions) {
    const wheel = new THREE.Mesh(wheelGeom, wheelRubberMat)
    wheel.position.set(x, y, z)
    group.add(wheel)

    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.52, 8),
      wheelRimMat
    )
    cap.rotateZ(Math.PI / 2)
    cap.position.set(x, y, z)
    group.add(cap)
  }

  // 6. Headlights & Taillights
  const hlMat = isNight ? headlightNightMat : headlightDayMat
  const tlMat = isNight ? taillightNightMat : taillightDayMat

  const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.1), hlMat)
  hlL.position.set(-1.1, 0.9, busL / 2 + 0.02)
  group.add(hlL)

  const hlR = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.1), hlMat)
  hlR.position.set(1.1, 0.9, busL / 2 + 0.02)
  group.add(hlR)

  const tlL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.1), tlMat)
  tlL.position.set(-1.1, 1.2, -busL / 2 - 0.02)
  group.add(tlL)

  const tlR = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.1), tlMat)
  tlR.position.set(1.1, 1.2, -busL / 2 - 0.02)
  group.add(tlR)

  return group
}

/**
 * Creates a modern glass bus stop passenger shelter
 */
export function createBusStopShelterGroup(): THREE.Group {
  const group = new THREE.Group()

  const shelterSteelMat = new THREE.MeshStandardMaterial({
    color: '#37474F',
    metalness: 0.8,
  })

  const shelterGlassMat = new THREE.MeshStandardMaterial({
    color: '#80DEEA',
    roughness: 0.1,
    transparent: true,
    opacity: 0.6,
  })

  const woodBenchMat = new THREE.MeshStandardMaterial({
    color: '#8D6E63',
    roughness: 0.7,
  })

  // Glass Rear Wall
  const rearWall = new THREE.Mesh(
    new THREE.BoxGeometry(5.0, 2.6, 0.1),
    shelterGlassMat
  )
  rearWall.position.set(0, 1.3, -1.0)
  group.add(rearWall)

  // Curved Roof
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(5.4, 0.15, 2.8),
    shelterSteelMat
  )
  roof.position.set(0, 2.65, 0)
  group.add(roof)

  // Steel Corner Posts
  const postGeom = new THREE.CylinderGeometry(0.08, 0.08, 2.6, 8)
  for (const [x, z] of [
    [-2.5, -1.0],
    [2.5, -1.0],
    [-2.5, 1.2],
    [2.5, 1.2],
  ]) {
    const post = new THREE.Mesh(postGeom, shelterSteelMat)
    post.position.set(x, 1.3, z)
    group.add(post)
  }

  // Waiting Bench
  const bench = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 0.1, 0.6),
    woodBenchMat
  )
  bench.position.set(0, 0.5, -0.6)
  group.add(bench)

  // Timetable Route Sign Totem
  const totem = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 2.2, 0.1),
    new THREE.MeshStandardMaterial({ color: '#FB8C00' })
  )
  totem.position.set(3.2, 1.1, 0)
  group.add(totem)

  return group
}

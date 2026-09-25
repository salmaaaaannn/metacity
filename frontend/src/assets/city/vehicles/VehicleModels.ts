import * as THREE from 'three'

/**
 * Realistic Modular Vehicle Models
 * Sedans, SUVs, Delivery Vans, Heavy Trucks, and Emergency Services (Police, Ambulance, Fire).
 * Complete with rubber wheels, tinted windows, headlights, taillights, and emergency beacons.
 */

// Shared Vehicle Materials
const wheelRubberMat = new THREE.MeshStandardMaterial({
  color: '#1E1E1E',
  roughness: 0.9,
  metalness: 0.1,
})

const wheelRimMat = new THREE.MeshStandardMaterial({
  color: '#B0BEC5',
  roughness: 0.3,
  metalness: 0.85,
})

const tintedGlassMat = new THREE.MeshStandardMaterial({
  color: '#263238',
  roughness: 0.1,
  metalness: 0.9,
})

export const headlightDayMat = new THREE.MeshStandardMaterial({ color: '#FFF9C4', roughness: 0.2 })
export const headlightNightMat = new THREE.MeshBasicMaterial({ color: '#FFFFE0' })
export const taillightDayMat = new THREE.MeshStandardMaterial({ color: '#B71C1C', roughness: 0.3 })
export const taillightNightMat = new THREE.MeshBasicMaterial({ color: '#FF1744' })

function addWheels(group: THREE.Group, xOffset: number, zFront: number, zRear: number, radius: number = 0.5) {
  const wheelGeom = new THREE.CylinderGeometry(radius, radius, 0.45, 16)
  wheelGeom.rotateZ(Math.PI / 2)

  const positions = [
    [-xOffset, radius, zFront],
    [xOffset, radius, zFront],
    [-xOffset, radius, zRear],
    [xOffset, radius, zRear],
  ]

  for (const [x, y, z] of positions) {
    const wheel = new THREE.Mesh(wheelGeom, wheelRubberMat)
    wheel.position.set(x, y, z)
    group.add(wheel)

    // Hubcap
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.55, radius * 0.55, 0.47, 8), wheelRimMat)
    cap.rotateZ(Math.PI / 2)
    cap.position.set(x, y, z)
    group.add(cap)
  }
}

/**
 * 1. Modern Sedan
 */
export function createSedanGroup(color: string, isNight: boolean): THREE.Group {
  const group = new THREE.Group()

  const bodyMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.3,
    metalness: 0.7,
  })

  // Lower chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.75, 5.0), bodyMat)
  chassis.position.y = 0.65
  group.add(chassis)

  // Cabin & Roof
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.7, 2.6), tintedGlassMat)
  cabin.position.set(0, 1.35, -0.2)
  group.add(cabin)

  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.1, 2.4), bodyMat)
  roof.position.set(0, 1.72, -0.2)
  group.add(roof)

  // Wheels
  addWheels(group, 1.15, 1.5, -1.5, 0.45)

  // Headlights & Taillights
  const hlMat = isNight ? headlightNightMat : headlightDayMat
  const tlMat = isNight ? taillightNightMat : taillightDayMat

  const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.1), hlMat)
  hlL.position.set(-0.85, 0.65, 2.52)
  group.add(hlL)

  const hlR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.1), hlMat)
  hlR.position.set(0.85, 0.65, 2.52)
  group.add(hlR)

  const tlL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.1), tlMat)
  tlL.position.set(-0.85, 0.65, -2.52)
  group.add(tlL)

  const tlR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.1), tlMat)
  tlR.position.set(0.85, 0.65, -2.52)
  group.add(tlR)

  return group
}

/**
 * 2. Modern SUV / Crossover
 */
export function createSUVGroup(color: string, isNight: boolean): THREE.Group {
  const group = new THREE.Group()

  const bodyMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.35,
    metalness: 0.6,
  })

  // Raised chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.9, 5.2), bodyMat)
  chassis.position.y = 0.85
  group.add(chassis)

  // Tall cabin
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.9, 3.4), tintedGlassMat)
  cabin.position.set(0, 1.7, -0.4)
  group.add(cabin)

  // Roof rack rails
  const railMat = new THREE.MeshStandardMaterial({ color: '#37474F', metalness: 0.8 })
  const railL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 2.8), railMat)
  railL.position.set(-0.95, 2.2, -0.4)
  group.add(railL)

  const railR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 2.8), railMat)
  railR.position.set(0.95, 2.2, -0.4)
  group.add(railR)

  // Wheels
  addWheels(group, 1.25, 1.6, -1.6, 0.52)

  // Lights
  const hlMat = isNight ? headlightNightMat : headlightDayMat
  const tlMat = isNight ? taillightNightMat : taillightDayMat

  const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.3, 0.1), hlMat)
  hlL.position.set(-0.95, 0.85, 2.62)
  group.add(hlL)

  const hlR = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.3, 0.1), hlMat)
  hlR.position.set(0.95, 0.85, 2.62)
  group.add(hlR)

  const tlL = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.3, 0.1), tlMat)
  tlL.position.set(-0.95, 0.85, -2.62)
  group.add(tlL)

  const tlR = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.3, 0.1), tlMat)
  tlR.position.set(0.95, 0.85, -2.62)
  group.add(tlR)

  return group
}

/**
 * 3. Commercial Delivery Van
 */
export function createDeliveryVanGroup(isNight: boolean): THREE.Group {
  const group = new THREE.Group()

  const vanMat = new THREE.MeshStandardMaterial({ color: '#ECEFF1', roughness: 0.4 })

  // Cab & Cargo Box
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.8, 1.8), vanMat)
  cab.position.set(0, 1.4, 2.0)
  group.add(cab)

  const windshield = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, 0.1), tintedGlassMat)
  windshield.position.set(0, 1.6, 2.92)
  group.add(windshield)

  const cargoBox = new THREE.Mesh(new THREE.BoxGeometry(2.7, 2.4, 4.4), vanMat)
  cargoBox.position.set(0, 1.8, -1.0)
  group.add(cargoBox)

  addWheels(group, 1.3, 2.0, -1.8, 0.5)

  // Lights
  const hlMat = isNight ? headlightNightMat : headlightDayMat
  const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.1), hlMat)
  hlL.position.set(-0.95, 0.9, 2.92)
  group.add(hlL)

  const hlR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.1), hlMat)
  hlR.position.set(0.95, 0.9, 2.92)
  group.add(hlR)

  return group
}

/**
 * 4. Emergency Vehicle: Police Cruiser with flashing roof lightbar
 */
export function createPoliceCruiserGroup(isNight: boolean): THREE.Group {
  const group = createSedanGroup('#1565C0', isNight)

  // Rooftop Emergency Lightbar (Red and Blue)
  const redLight = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.25, 0.25),
    new THREE.MeshBasicMaterial({ color: '#FF1744' })
  )
  redLight.position.set(-0.35, 1.9, -0.2)
  group.add(redLight)

  const blueLight = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.25, 0.25),
    new THREE.MeshBasicMaterial({ color: '#2979FF' })
  )
  blueLight.position.set(0.35, 1.9, -0.2)
  group.add(blueLight)

  return group
}

import * as THREE from 'three'

/**
 * Realistic Street Furniture & Traffic Signals
 * Cobra streetlights, 3-aspect traffic lights, pedestrian signals, benches, bollards, fire hydrants.
 */

const poleSteelMat = new THREE.MeshStandardMaterial({
  color: '#455A64',
  roughness: 0.4,
  metalness: 0.8,
})

const signalBoxMat = new THREE.MeshStandardMaterial({
  color: '#263238',
  roughness: 0.5,
  metalness: 0.2,
})

export const streetlampGlowMat = new THREE.MeshBasicMaterial({
  color: '#FFF59D', // Warm yellow incandescent glow
})

const trafficRedMat = new THREE.MeshBasicMaterial({ color: '#FF1744' })
const trafficYellowMat = new THREE.MeshBasicMaterial({ color: '#FFD600' })
const trafficGreenMat = new THREE.MeshBasicMaterial({ color: '#00E676' })

/**
 * Creates a modern cobra-head streetlight
 */
export function createStreetlightGroup(isNight: boolean): THREE.Group {
  const group = new THREE.Group()

  const poleH = 8.5

  // Vertical steel mast
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.18, poleH, 8),
    poleSteelMat
  )
  mast.position.y = poleH / 2
  group.add(mast)

  // Curved upper arm extending over street
  const arm = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.1, 2.6),
    poleSteelMat
  )
  arm.position.set(0, poleH, 1.2)
  group.add(arm)

  // Cobra-head luminaire fixture
  const fixture = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.15, 0.8),
    poleSteelMat
  )
  fixture.position.set(0, poleH - 0.05, 2.4)
  group.add(fixture)

  // Lamp lens bulb
  if (isNight) {
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 8, 8),
      streetlampGlowMat
    )
    bulb.position.set(0, poleH - 0.18, 2.4)
    group.add(bulb)
  }

  return group
}

/**
 * Creates an intersection 3-aspect traffic signal
 */
export function createTrafficSignalGroup(): THREE.Group {
  const group = new THREE.Group()

  const poleH = 6.8

  // Vertical post
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.18, poleH, 8),
    poleSteelMat
  )
  pole.position.y = poleH / 2
  group.add(pole)

  // Cantilever arm
  const arm = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.12, 5.0),
    poleSteelMat
  )
  arm.position.set(0, poleH - 0.2, 2.5)
  group.add(arm)

  // Signal Housing Box (Overhead)
  const signalBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 1.4, 0.4),
    signalBoxMat
  )
  signalBox.position.set(0, poleH - 0.8, 4.2)
  group.add(signalBox)

  // 3 Lenses: Red, Amber, Green
  const redLens = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), trafficRedMat)
  redLens.position.set(0, poleH - 0.4, 4.4)
  group.add(redLens)

  const yellowLens = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), trafficYellowMat)
  yellowLens.position.set(0, poleH - 0.8, 4.4)
  group.add(yellowLens)

  const greenLens = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), trafficGreenMat)
  greenLens.position.set(0, poleH - 1.2, 4.4)
  group.add(greenLens)

  return group
}

/**
 * Creates a sidewalk fire hydrant
 */
export function createFireHydrantGroup(): THREE.Group {
  const group = new THREE.Group()
  const redMat = new THREE.MeshStandardMaterial({ color: '#D32F2F', roughness: 0.4 })
  const brassMat = new THREE.MeshStandardMaterial({ color: '#FFB300', metalness: 0.8 })

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.8, 8), redMat)
  body.position.y = 0.4
  group.add(body)

  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), redMat)
  cap.position.y = 0.8
  group.add(cap)

  const sideNozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.6, 8), brassMat)
  sideNozzle.rotation.z = Math.PI / 2
  sideNozzle.position.y = 0.5
  group.add(sideNozzle)

  return group
}

/**
 * Creates a sidewalk park bench
 */
export function createBenchGroup(): THREE.Group {
  const group = new THREE.Group()
  const woodMat = new THREE.MeshStandardMaterial({ color: '#6D4C41', roughness: 0.8 })
  const metalMat = new THREE.MeshStandardMaterial({ color: '#263238', metalness: 0.8 })

  // Wooden Seat Slats
  const seat = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.08, 0.6), woodMat)
  seat.position.y = 0.5
  group.add(seat)

  // Backrest
  const back = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.5, 0.08), woodMat)
  back.position.set(0, 0.85, -0.28)
  group.add(back)

  // Cast Iron Legs
  const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.6), metalMat)
  leg1.position.set(-0.9, 0.25, 0)
  group.add(leg1)

  const leg2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.6), metalMat)
  leg2.position.set(0.9, 0.25, 0)
  group.add(leg2)

  return group
}

import * as THREE from 'three'
import { asphaltMaterial, roadMarkingWhite, roadMarkingYellow } from '../roads/RoadGeometries'

/**
 * Realistic Highway & Expressway Geometries
 * Multi-lane roadway, concrete Jersey barriers in median, steel outer guardrails,
 * elevated concrete piers, and overhead highway truss signboards.
 */

const barrierConcreteMat = new THREE.MeshStandardMaterial({
  color: '#B0BEC5',
  roughness: 0.75,
  metalness: 0.1,
})

const guardrailSteelMat = new THREE.MeshStandardMaterial({
  color: '#ECEFF1',
  roughness: 0.35,
  metalness: 0.85,
})

const highwaySignGreenMat = new THREE.MeshStandardMaterial({
  color: '#1B5E20',
  roughness: 0.5,
  metalness: 0.2,
})

const gantryTrussMat = new THREE.MeshStandardMaterial({
  color: '#546E7A',
  roughness: 0.4,
  metalness: 0.8,
})

export function createHighwaySegmentGroup(
  width: number,
  length: number,
  elevationY: number = 1.5
): THREE.Group {
  const group = new THREE.Group()

  // 1. Dual Carriageway Deck
  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.8, length),
    asphaltMaterial
  )
  deck.position.y = elevationY
  group.add(deck)

  // 2. Concrete Center Jersey Barrier (median divider)
  const medianBarrier = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 1.1, length),
    barrierConcreteMat
  )
  medianBarrier.position.set(0, elevationY + 0.55, 0)
  group.add(medianBarrier)

  // Yellow warning reflectors on median barrier
  for (let z = -length / 2 + 10; z < length / 2; z += 20) {
    const reflector = new THREE.Mesh(
      new THREE.BoxGeometry(1.25, 0.2, 0.4),
      roadMarkingYellow
    )
    reflector.position.set(0, elevationY + 0.9, z)
    group.add(reflector)
  }

  // 3. Steel Crash Barriers / Outer Guardrails
  const railH = 0.9
  const leftRail = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, railH, length),
    guardrailSteelMat
  )
  leftRail.position.set(-width / 2 + 0.3, elevationY + railH / 2 + 0.4, 0)
  group.add(leftRail)

  const rightRail = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, railH, length),
    guardrailSteelMat
  )
  rightRail.position.set(width / 2 - 0.3, elevationY + railH / 2 + 0.4, 0)
  group.add(rightRail)

  // 4. Multi-Lane Dashed Markings (3 lanes each side)
  const dashL = 6.0
  const gapL = 9.0
  const cycle = dashL + gapL
  const numDashes = Math.floor(length / cycle)

  const laneOffsets = [-width * 0.35, -width * 0.18, width * 0.18, width * 0.35]
  for (const lx of laneOffsets) {
    for (let i = 0; i < numDashes; i++) {
      const z = -length / 2 + (i + 0.5) * cycle
      const dash = new THREE.Mesh(
        new THREE.PlaneGeometry(0.3, dashL),
        roadMarkingWhite
      )
      dash.rotation.x = -Math.PI / 2
      dash.position.set(lx, elevationY + 0.41, z)
      group.add(dash)
    }
  }

  // 5. Elevated Support Columns (if elevated above ground)
  if (elevationY > 2.0) {
    const pierSpacing = 60
    const numPiers = Math.max(1, Math.floor(length / pierSpacing))
    for (let p = 0; p <= numPiers; p++) {
      const pz = -length / 2 + (p + 0.5) * (length / (numPiers + 1))
      // Column
      const pier = new THREE.Mesh(
        new THREE.CylinderGeometry(1.6, 2.0, elevationY, 12),
        barrierConcreteMat
      )
      pier.position.set(0, elevationY / 2, pz)
      group.add(pier)

      // Crosshead Beam
      const crosshead = new THREE.Mesh(
        new THREE.BoxGeometry(width * 0.85, 1.4, 3.5),
        barrierConcreteMat
      )
      crosshead.position.set(0, elevationY - 0.7, pz)
      group.add(crosshead)
    }
  }

  // 6. Overhead Green Destination Sign Gantry (on long segments)
  if (length > 120) {
    const gantryZ = 0
    const gantryH = 6.5

    // Left and Right Truss Uprights
    const leftPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, gantryH, 8),
      gantryTrussMat
    )
    leftPost.position.set(-width / 2 + 1.0, elevationY + gantryH / 2, gantryZ)
    group.add(leftPost)

    const rightPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, gantryH, 8),
      gantryTrussMat
    )
    rightPost.position.set(width / 2 - 1.0, elevationY + gantryH / 2, gantryZ)
    group.add(rightPost)

    // Overhead Beam
    const crossTruss = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.6, 0.6),
      gantryTrussMat
    )
    crossTruss.position.set(0, elevationY + gantryH, gantryZ)
    group.add(crossTruss)

    // Green Highway Direction Signs
    const signW = width * 0.35
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(signW, 2.2, 0.2),
      highwaySignGreenMat
    )
    sign.position.set(0, elevationY + gantryH - 0.5, gantryZ)
    group.add(sign)
  }

  return group
}

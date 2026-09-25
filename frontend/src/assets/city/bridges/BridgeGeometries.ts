import * as THREE from 'three'
import { asphaltMaterial, roadMarkingWhite, roadMarkingYellow, sidewalkMaterial } from '../roads/RoadGeometries'

/**
 * Realistic Structural Bridges
 * Concrete box girder deck, massive river piers anchored into the water,
 * structural steel arch/truss cables, safety guardrails, pedestrian sidewalks, and lampposts.
 */

const pierConcreteMat = new THREE.MeshStandardMaterial({
  color: '#78909C',
  roughness: 0.8,
  metalness: 0.15,
})

const trussSteelMat = new THREE.MeshStandardMaterial({
  color: '#455A64',
  roughness: 0.35,
  metalness: 0.8,
})

const cableSteelMat = new THREE.MeshStandardMaterial({
  color: '#B0BEC5',
  roughness: 0.2,
  metalness: 0.9,
})

export function createBridgeSegmentGroup(
  width: number,
  length: number,
  deckHeight: number = 4.5
): THREE.Group {
  const group = new THREE.Group()

  // 1. Concrete Box-Girder Road Deck
  const deckThickness = 1.4
  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(width, deckThickness, length),
    asphaltMaterial
  )
  deck.position.y = deckHeight
  group.add(deck)

  // 2. Concrete Underside Girder Taper
  const underside = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.75, 1.8, length),
    pierConcreteMat
  )
  underside.position.y = deckHeight - deckThickness / 2 - 0.9
  group.add(underside)

  // 3. Sidewalks & Heavy Guardrails
  const walkW = 2.0
  const railH = 1.2

  // Left Sidewalk & Guardrail
  const leftWalk = new THREE.Mesh(
    new THREE.BoxGeometry(walkW, 0.4, length),
    sidewalkMaterial
  )
  leftWalk.position.set(-width / 2 + walkW / 2, deckHeight + deckThickness / 2 + 0.2, 0)
  group.add(leftWalk)

  const leftRail = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, railH, length),
    trussSteelMat
  )
  leftRail.position.set(-width / 2 + 0.2, deckHeight + deckThickness / 2 + railH / 2, 0)
  group.add(leftRail)

  // Right Sidewalk & Guardrail
  const rightWalk = new THREE.Mesh(
    new THREE.BoxGeometry(walkW, 0.4, length),
    sidewalkMaterial
  )
  rightWalk.position.set(width / 2 - walkW / 2, deckHeight + deckThickness / 2 + 0.2, 0)
  group.add(rightWalk)

  const rightRail = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, railH, length),
    trussSteelMat
  )
  rightRail.position.set(width / 2 - 0.2, deckHeight + deckThickness / 2 + railH / 2, 0)
  group.add(rightRail)

  // 4. Center Double Yellow Lines
  const centerLine = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, length),
    roadMarkingYellow
  )
  centerLine.rotation.x = -Math.PI / 2
  centerLine.position.set(0, deckHeight + deckThickness / 2 + 0.02, 0)
  group.add(centerLine)

  // 5. Massive River Support Piers (anchoring into water below)
  const pierSpacing = Math.min(80, length / 2)
  const numPiers = Math.max(1, Math.floor(length / pierSpacing))

  for (let p = 0; p <= numPiers; p++) {
    const pz = -length / 2 + (p + 0.5) * (length / (numPiers + 1))

    // Hydrodynamic tapered concrete river pier
    const pier = new THREE.Mesh(
      new THREE.CylinderGeometry(2.8, 4.2, deckHeight + 2.0, 16),
      pierConcreteMat
    )
    pier.position.set(0, (deckHeight - 2.0) / 2, pz)
    group.add(pier)

    // Bridge Pier Cap
    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(width + 1.0, 1.2, 5.0),
      pierConcreteMat
    )
    cap.position.set(0, deckHeight - deckThickness / 2 - 0.6, pz)
    group.add(cap)
  }

  // 6. Suspension / Cable-Stayed Pylons (if bridge is long)
  if (length >= 80) {
    const pylonH = 30
    const pylonX = width / 2 - 1.0

    // Twin Suspension Towers at center
    const towerL = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, pylonH, 2.0),
      trussSteelMat
    )
    towerL.position.set(-pylonX, deckHeight + pylonH / 2, 0)
    group.add(towerL)

    const towerR = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, pylonH, 2.0),
      trussSteelMat
    )
    towerR.position.set(pylonX, deckHeight + pylonH / 2, 0)
    group.add(towerR)

    // Top cross-brace between towers
    const crossBrace = new THREE.Mesh(
      new THREE.BoxGeometry(width, 1.4, 1.4),
      trussSteelMat
    )
    crossBrace.position.set(0, deckHeight + pylonH - 2, 0)
    group.add(crossBrace)

    // Diagonal Stay Cables radiating down to deck
    for (let offset = 15; offset <= length / 2 - 10; offset += 20) {
      for (const sign of [-1, 1]) {
        const cableTargetZ = sign * offset
        const cableLength = Math.sqrt(pylonH * pylonH + offset * offset)
        const cableAngle = Math.atan2(offset, pylonH)

        // Left cable
        const cableL = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.12, cableLength, 6),
          cableSteelMat
        )
        cableL.position.set(-pylonX, deckHeight + pylonH / 2, cableTargetZ / 2)
        cableL.rotation.x = sign * cableAngle
        group.add(cableL)

        // Right cable
        const cableR = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.12, cableLength, 6),
          cableSteelMat
        )
        cableR.position.set(pylonX, deckHeight + pylonH / 2, cableTargetZ / 2)
        cableR.rotation.x = sign * cableAngle
        group.add(cableR)
      }
    }
  }

  return group
}

import * as THREE from 'three'

/**
 * Realistic 3D Road Geometries & Materials
 * Asphalt surface, white dashed lane markings, yellow center dividers, curbs, sidewalks, and crosswalks.
 */

// Road PBR Materials
export const asphaltMaterial = new THREE.MeshStandardMaterial({
  color: '#212529',
  roughness: 0.88,
  metalness: 0.08,
})

export const sidewalkMaterial = new THREE.MeshStandardMaterial({
  color: '#9E9E9E',
  roughness: 0.9,
  metalness: 0.05,
})

export const roadMarkingWhite = new THREE.MeshBasicMaterial({
  color: '#F8F9FA',
})

export const roadMarkingYellow = new THREE.MeshBasicMaterial({
  color: '#FFCA28',
})

/**
 * Constructs a rich 3D road segment with asphalt deck, sidewalks, curbs, lane markings, and zebra crosswalks.
 */
export function createRoadSegmentGroup(
  width: number,
  length: number,
  roadType: string = 'arterial'
): THREE.Group {
  const group = new THREE.Group()

  const isHighway = roadType === 'highway' || roadType === 'expressway'
  const isLocal = roadType === 'local'

  // Local streets: ultra-simple geometry (just asphalt, edge lines, narrow sidewalks)
  if (isLocal) {
    return createLocalRoadSegment(width, length)
  }

  const sidewalkWidth = isHighway ? 0 : roadType === 'collector' ? 2.5 : 3.5
  const roadWidth = width
  const totalDeckWidth = roadWidth + sidewalkWidth * 2

  // 1. Asphalt Roadway Deck (raised 0.15m above terrain)
  const asphaltDeck = new THREE.Mesh(
    new THREE.BoxGeometry(roadWidth, 0.3, length),
    asphaltMaterial
  )
  asphaltDeck.position.y = 0.15
  group.add(asphaltDeck)

  // 2. Concrete Sidewalks & Curbs (if not an expressway)
  if (sidewalkWidth > 0) {
    const curbHeight = 0.45

    // Left Sidewalk
    const leftWalk = new THREE.Mesh(
      new THREE.BoxGeometry(sidewalkWidth, curbHeight, length),
      sidewalkMaterial
    )
    leftWalk.position.set(-roadWidth / 2 - sidewalkWidth / 2, curbHeight / 2, 0)
    group.add(leftWalk)

    // Right Sidewalk
    const rightWalk = new THREE.Mesh(
      new THREE.BoxGeometry(sidewalkWidth, curbHeight, length),
      sidewalkMaterial
    )
    rightWalk.position.set(roadWidth / 2 + sidewalkWidth / 2, curbHeight / 2, 0)
    group.add(rightWalk)
  }

  // 3. Lane Markings
  // Solid White Edge Lines
  const edgeLineW = 0.25
  const leftEdge = new THREE.Mesh(
    new THREE.PlaneGeometry(edgeLineW, length),
    roadMarkingWhite
  )
  leftEdge.rotation.x = -Math.PI / 2
  leftEdge.position.set(-roadWidth / 2 + 0.6, 0.31, 0)
  group.add(leftEdge)

  const rightEdge = new THREE.Mesh(
    new THREE.PlaneGeometry(edgeLineW, length),
    roadMarkingWhite
  )
  rightEdge.rotation.x = -Math.PI / 2
  rightEdge.position.set(roadWidth / 2 - 0.6, 0.31, 0)
  group.add(rightEdge)

  // Double Yellow Center Lines (for 2-way roads) or Dashed White
  if (!isHighway) {
    const centerLine1 = new THREE.Mesh(
      new THREE.PlaneGeometry(0.2, length),
      roadMarkingYellow
    )
    centerLine1.rotation.x = -Math.PI / 2
    centerLine1.position.set(-0.25, 0.31, 0)
    group.add(centerLine1)

    const centerLine2 = new THREE.Mesh(
      new THREE.PlaneGeometry(0.2, length),
      roadMarkingYellow
    )
    centerLine2.rotation.x = -Math.PI / 2
    centerLine2.position.set(0.25, 0.31, 0)
    group.add(centerLine2)
  }

  // Dashed White Lane Dividers
  const dashLength = 4.0
  const dashGap = 5.0
  const cycle = dashLength + dashGap
  const numDashes = Math.floor(length / cycle)

  const dashLanes = isHighway ? [-roadWidth * 0.28, roadWidth * 0.28] : [-roadWidth * 0.25, roadWidth * 0.25]

  if (roadWidth >= 16) {
    for (const laneX of dashLanes) {
      for (let i = 0; i < numDashes; i++) {
        const z = -length / 2 + (i + 0.5) * cycle
        const dash = new THREE.Mesh(
          new THREE.PlaneGeometry(0.25, dashLength),
          roadMarkingWhite
        )
        dash.rotation.x = -Math.PI / 2
        dash.position.set(laneX, 0.31, z)
        group.add(dash)
      }
    }
  }

  // 4. Zebra Crosswalks at segment ends (for urban roads)
  if (!isHighway && length > 30) {
    const crosswalkZ = [-length / 2 + 5, length / 2 - 5]
    for (const z of crosswalkZ) {
      for (let x = -roadWidth / 2 + 1.5; x <= roadWidth / 2 - 1.5; x += 1.8) {
        const stripe = new THREE.Mesh(
          new THREE.PlaneGeometry(0.9, 3.5),
          roadMarkingWhite
        )
        stripe.rotation.x = -Math.PI / 2
        stripe.position.set(x, 0.32, z)
        group.add(stripe)
      }
    }
  }

  return group
}

// ── Local Road Material (slightly lighter asphalt for visual distinction) ────
const localAsphaltMaterial = new THREE.MeshStandardMaterial({
  color: '#2C3034',
  roughness: 0.92,
  metalness: 0.04,
})

/**
 * Lightweight local road segment: thin asphalt strip + narrow edge lines.
 * No sidewalks, no center dividers, no crosswalks — optimized for dense grids.
 */
export function createLocalRoadSegment(width: number, length: number): THREE.Group {
  const group = new THREE.Group()

  // 1. Thin asphalt deck (0.12m raised)
  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.24, length),
    localAsphaltMaterial
  )
  deck.position.y = 0.12
  group.add(deck)

  // 2. Thin white edge lines
  const edgeW = 0.15
  const leftEdge = new THREE.Mesh(
    new THREE.PlaneGeometry(edgeW, length),
    roadMarkingWhite
  )
  leftEdge.rotation.x = -Math.PI / 2
  leftEdge.position.set(-width / 2 + 0.4, 0.25, 0)
  group.add(leftEdge)

  const rightEdge = new THREE.Mesh(
    new THREE.PlaneGeometry(edgeW, length),
    roadMarkingWhite
  )
  rightEdge.rotation.x = -Math.PI / 2
  rightEdge.position.set(width / 2 - 0.4, 0.25, 0)
  group.add(rightEdge)

  return group
}

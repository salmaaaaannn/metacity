import * as THREE from 'three'

/**
 * Realistic Animated River & Riverbank Quay Walls
 * Spans x: 4900 to 5100, z: 0 to 8000 with animated wave displacement,
 * stone retaining quay walls, riverside promenade paths, and safety railings.
 */

export const quayStoneMat = new THREE.MeshStandardMaterial({
  color: '#78909C',
  roughness: 0.85,
  metalness: 0.1,
})

export const promenadeMat = new THREE.MeshStandardMaterial({
  color: '#B0BEC5',
  roughness: 0.9,
  metalness: 0.05,
})

export const railingSteelMat = new THREE.MeshStandardMaterial({
  color: '#37474F',
  roughness: 0.3,
  metalness: 0.85,
})

export function createWaterMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: '#006064', // Deep cyan river water
    roughness: 0.08,
    metalness: 0.92,
    transparent: true,
    opacity: 0.88,
  })
}

/**
 * Builds the complete river channel with quay retaining walls, promenade sidewalks, and safety railings.
 */
export function createRiverEnvironmentGroup(waterMaterial: THREE.Material): THREE.Group {
  const group = new THREE.Group()

  const riverCenterX = 5000
  const riverWidth = 200 // 4900 to 5100
  const riverLength = 8000
  const waterY = -0.4

  // 1. Water Surface Mesh
  const waterGeom = new THREE.PlaneGeometry(riverWidth, riverLength, 32, 128)
  const waterMesh = new THREE.Mesh(waterGeom, waterMaterial)
  waterMesh.rotation.x = -Math.PI / 2
  waterMesh.position.set(riverCenterX, waterY, riverLength / 2)
  group.add(waterMesh)

  // 2. Concrete/Stone Quay Embankments (Left at x=4900, Right at x=5100)
  const wallThickness = 4.0
  const wallHeight = 2.0
  const wallGeom = new THREE.BoxGeometry(wallThickness, wallHeight, riverLength)

  // West Riverbank Quay Wall
  const westWall = new THREE.Mesh(wallGeom, quayStoneMat)
  westWall.position.set(riverCenterX - riverWidth / 2 - wallThickness / 2, wallHeight / 2 - 1.0, riverLength / 2)
  group.add(westWall)

  // East Riverbank Quay Wall
  const eastWall = new THREE.Mesh(wallGeom, quayStoneMat)
  eastWall.position.set(riverCenterX + riverWidth / 2 + wallThickness / 2, wallHeight / 2 - 1.0, riverLength / 2)
  group.add(eastWall)

  // 3. Riverside Pedestrian Promenade Walkways (8m wide paved pathways along banks)
  const promW = 8.0
  const promGeom = new THREE.BoxGeometry(promW, 0.25, riverLength)

  const westProm = new THREE.Mesh(promGeom, promenadeMat)
  westProm.position.set(riverCenterX - riverWidth / 2 - wallThickness - promW / 2, 0.12, riverLength / 2)
  group.add(westProm)

  const eastProm = new THREE.Mesh(promGeom, promenadeMat)
  eastProm.position.set(riverCenterX + riverWidth / 2 + wallThickness + promW / 2, 0.12, riverLength / 2)
  group.add(eastProm)

  // 4. Safety Guardrail along water edge
  const railGeom = new THREE.BoxGeometry(0.2, 1.1, riverLength)

  const westRail = new THREE.Mesh(railGeom, railingSteelMat)
  westRail.position.set(riverCenterX - riverWidth / 2 - 0.5, 0.55, riverLength / 2)
  group.add(westRail)

  const eastRail = new THREE.Mesh(railGeom, railingSteelMat)
  eastRail.position.set(riverCenterX + riverWidth / 2 + 0.5, 0.55, riverLength / 2)
  group.add(eastRail)

  return group
}

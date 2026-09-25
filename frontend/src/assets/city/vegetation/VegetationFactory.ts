import * as THREE from 'three'

/**
 * Realistic Vegetation & Park Environment Assets
 * High-performance shared geometries for deciduous trees, conifer pines, hedges, and park fountains.
 */

// Shared Materials
export const trunkWoodMat = new THREE.MeshStandardMaterial({
  color: '#4E3629',
  roughness: 0.9,
  metalness: 0.05,
})

export const foliageGreen1Mat = new THREE.MeshStandardMaterial({
  color: '#2E7D32', // Deep forest green
  roughness: 0.8,
  metalness: 0.05,
})

export const foliageGreen2Mat = new THREE.MeshStandardMaterial({
  color: '#43A047', // Fresh lawn green
  roughness: 0.75,
  metalness: 0.05,
})

export const foliageGreen3Mat = new THREE.MeshStandardMaterial({
  color: '#66BB6A', // Bright lime/spring green
  roughness: 0.7,
  metalness: 0.05,
})

export const pineGreenMat = new THREE.MeshStandardMaterial({
  color: '#1B5E20', // Dark evergreen pine
  roughness: 0.85,
  metalness: 0.05,
})

/**
 * Creates a lush deciduous tree (trunk + layered organic foliage canopy)
 */
export function createDeciduousTreeGroup(scale: number = 1.0): THREE.Group {
  const group = new THREE.Group()

  const trunkH = 5.0 * scale
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35 * scale, 0.6 * scale, trunkH, 8),
    trunkWoodMat
  )
  trunk.position.y = trunkH / 2
  group.add(trunk)

  // Multi-tiered organic foliage crown (3 overlapping spheres for natural silhouette)
  const f1 = new THREE.Mesh(
    new THREE.DodecahedronGeometry(3.2 * scale, 1),
    foliageGreen1Mat
  )
  f1.position.y = trunkH + 1.8 * scale
  group.add(f1)

  const f2 = new THREE.Mesh(
    new THREE.DodecahedronGeometry(2.6 * scale, 1),
    foliageGreen2Mat
  )
  f2.position.set(0.8 * scale, trunkH + 2.8 * scale, -0.6 * scale)
  group.add(f2)

  const f3 = new THREE.Mesh(
    new THREE.DodecahedronGeometry(2.4 * scale, 1),
    foliageGreen3Mat
  )
  f3.position.set(-0.7 * scale, trunkH + 3.2 * scale, 0.7 * scale)
  group.add(f3)

  return group
}

/**
 * Creates an evergreen conifer / pine tree
 */
export function createPineTreeGroup(scale: number = 1.0): THREE.Group {
  const group = new THREE.Group()

  const trunkH = 4.0 * scale
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3 * scale, 0.5 * scale, trunkH, 8),
    trunkWoodMat
  )
  trunk.position.y = trunkH / 2
  group.add(trunk)

  // 3 Stacked Cones
  const tiers = [
    { r: 3.0 * scale, h: 3.5 * scale, y: trunkH },
    { r: 2.3 * scale, h: 3.2 * scale, y: trunkH + 2.2 * scale },
    { r: 1.5 * scale, h: 2.8 * scale, y: trunkH + 4.2 * scale },
  ]

  for (const t of tiers) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(t.r, t.h, 8), pineGreenMat)
    cone.position.y = t.y + t.h / 2
    group.add(cone)
  }

  return group
}

/**
 * Creates a circular decorative park water fountain
 */
export function createParkFountainGroup(): THREE.Group {
  const group = new THREE.Group()

  const stoneMat = new THREE.MeshStandardMaterial({
    color: '#B0BEC5',
    roughness: 0.7,
    metalness: 0.1,
  })

  const waterMat = new THREE.MeshStandardMaterial({
    color: '#00BCD4',
    roughness: 0.1,
    metalness: 0.8,
    transparent: true,
    opacity: 0.8,
  })

  // Outer stone basin rim
  const rim = new THREE.Mesh(
    new THREE.CylinderGeometry(8, 8.5, 1.2, 24, 1, true),
    stoneMat
  )
  rim.position.y = 0.6
  group.add(rim)

  // Basin Water Surface
  const water = new THREE.Mesh(
    new THREE.CircleGeometry(8, 24),
    waterMat
  )
  water.rotation.x = -Math.PI / 2
  water.position.y = 0.8
  group.add(water)

  // Center Tiered Pedestal
  const ped1 = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2.0, 2.5, 16), stoneMat)
  ped1.position.y = 1.25
  group.add(ped1)

  const upperBowl = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 2.0, 1.0, 16), stoneMat)
  upperBowl.position.y = 2.8
  group.add(upperBowl)

  return group
}

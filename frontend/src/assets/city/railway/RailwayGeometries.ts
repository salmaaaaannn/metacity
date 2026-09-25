import * as THREE from 'three'

/**
 * Realistic Railway Infrastructure
 * Crushed stone ballast bed, wooden/concrete cross-ties (sleepers), dual steel rails with metallic specular,
 * overhead catenary electrification masts with cantilever arms, and realistic railway station platforms.
 */

const ballastMat = new THREE.MeshStandardMaterial({
  color: '#374151',
  roughness: 0.95,
  metalness: 0.05,
})

const sleeperMat = new THREE.MeshStandardMaterial({
  color: '#4B3621', // Creosote dark timber
  roughness: 0.85,
  metalness: 0.05,
})

const steelRailMat = new THREE.MeshStandardMaterial({
  color: '#9CA3AF',
  roughness: 0.25,
  metalness: 0.9,
})

const catenarySteelMat = new THREE.MeshStandardMaterial({
  color: '#6B7280',
  roughness: 0.4,
  metalness: 0.8,
})

const platformMat = new THREE.MeshStandardMaterial({
  color: '#9E9E9E',
  roughness: 0.8,
  metalness: 0.1,
})

const tactileEdgeMat = new THREE.MeshBasicMaterial({
  color: '#FFD600', // Yellow safety tactile edge
})

/**
 * Builds a realistic dual-rail track segment with sleepers and ballast bed.
 */
export function createRailwayTrackGroup(points: THREE.Vector3[]): THREE.Group {
  const group = new THREE.Group()
  if (points.length < 2) return group

  const curve = new THREE.CatmullRomCurve3(points)
  const length = curve.getLength()

  // 1. Ballast Bed (trapezoidal / box gravel bed along track)
  const ballastGeom = new THREE.TubeGeometry(curve, Math.max(16, Math.floor(length / 8)), 2.8, 6, false)
  const ballast = new THREE.Mesh(ballastGeom, ballastMat)
  ballast.scale.set(1.4, 0.4, 1.4) // Flatten tube to create gravel bed
  group.add(ballast)

  // 2. Cross-ties (sleepers) placed every 1.5m
  const numSleepers = Math.floor(length / 1.6)
  const sleeperGeom = new THREE.BoxGeometry(3.6, 0.25, 0.5)

  // 3. Dual Steel Rails (gauge = 1.435m standard gauge, ~2.0m outer spacing)
  const railSpacing = 1.0 // 1m left and right of centerline
  const railGeom = new THREE.BoxGeometry(0.12, 0.2, 1.6)

  for (let i = 0; i <= numSleepers; i++) {
    const t = i / numSleepers
    const pos = curve.getPoint(t)
    const tangent = curve.getTangent(t)
    const angle = Math.atan2(tangent.x, tangent.z)

    // Sleeper
    const sleeper = new THREE.Mesh(sleeperGeom, sleeperMat)
    sleeper.position.set(pos.x, pos.y + 0.15, pos.z)
    sleeper.rotation.y = angle + Math.PI / 2
    group.add(sleeper)

    // Dual rail segments on top of sleeper
    const perpX = -tangent.z * railSpacing
    const perpZ = tangent.x * railSpacing

    const leftRail = new THREE.Mesh(railGeom, steelRailMat)
    leftRail.position.set(pos.x + perpX, pos.y + 0.35, pos.z + perpZ)
    leftRail.rotation.y = angle
    group.add(leftRail)

    const rightRail = new THREE.Mesh(railGeom, steelRailMat)
    rightRail.position.set(pos.x - perpX, pos.y + 0.35, pos.z - perpZ)
    rightRail.rotation.y = angle
    group.add(rightRail)

    // 4. Overhead Catenary Mast every 40m
    if (i % 25 === 0) {
      const mastH = 6.8
      const mast = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.22, mastH, 8),
        catenarySteelMat
      )
      const mastX = pos.x + perpX * 2.2
      const mastZ = pos.z + perpZ * 2.2
      mast.position.set(mastX, pos.y + mastH / 2, mastZ)
      group.add(mast)

      // Cantilever arm reaching over tracks
      const arm = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.14, 3.2),
        catenarySteelMat
      )
      arm.position.set(pos.x, pos.y + mastH - 0.2, pos.z)
      arm.rotation.y = angle + Math.PI / 2
      group.add(arm)
    }
  }

  return group
}

/**
 * Builds a realistic ground/elevated Railway Station Platform with passenger canopy and signage.
 */
export function createRailwayStationGroup(name: string): THREE.Group {
  const group = new THREE.Group()

  const platformL = 60
  const platformW = 12
  const platformH = 1.2

  // Concrete Station Platform
  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(platformW, platformH, platformL),
    platformMat
  )
  platform.position.y = platformH / 2
  group.add(platform)

  // Yellow tactile warning edge along track sides
  const edgeL = new THREE.Mesh(
    new THREE.PlaneGeometry(0.6, platformL),
    tactileEdgeMat
  )
  edgeL.rotation.x = -Math.PI / 2
  edgeL.position.set(-platformW / 2 + 0.3, platformH + 0.01, 0)
  group.add(edgeL)

  const edgeR = new THREE.Mesh(
    new THREE.PlaneGeometry(0.6, platformL),
    tactileEdgeMat
  )
  edgeR.rotation.x = -Math.PI / 2
  edgeR.position.set(platformW / 2 - 0.3, platformH + 0.01, 0)
  group.add(edgeR)

  // Modern Cantilevered Station Canopy Roof
  const canopyH = 4.8
  const canopy = new THREE.Mesh(
    new THREE.BoxGeometry(platformW * 0.8, 0.4, platformL * 0.75),
    catenarySteelMat
  )
  canopy.position.set(0, canopyH, 0)
  group.add(canopy)

  // Canopy support pillars
  for (let z = -platformL * 0.3; z <= platformL * 0.3; z += 12) {
    const col = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, canopyH - platformH, 8),
      catenarySteelMat
    )
    col.position.set(0, (canopyH + platformH) / 2, z)
    group.add(col)
  }

  return group
}

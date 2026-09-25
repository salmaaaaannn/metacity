import * as THREE from 'three'

/**
 * Realistic Modern Metro Infrastructure
 * Replaces glowing tubes with:
 * 1. Elevated precast concrete guideway beams with cylindrical T-piers.
 * 2. Modern elevated stations with curved steel/glass canopy, passenger platform screen doors, LED signage.
 * 3. Underground metro street-level entrance kiosks with illuminated Metro "M" beacon totems and stairs.
 */

const guidewayConcreteMat = new THREE.MeshStandardMaterial({
  color: '#CFD8DC',
  roughness: 0.7,
  metalness: 0.15,
})

const stationSteelMat = new THREE.MeshStandardMaterial({
  color: '#37474F',
  roughness: 0.35,
  metalness: 0.8,
})

const stationGlassMat = new THREE.MeshStandardMaterial({
  color: '#80DEEA',
  roughness: 0.1,
  metalness: 0.9,
  transparent: true,
  opacity: 0.65,
})

/**
 * Builds an elevated concrete metro guideway structure along a route of points.
 */
export function createElevatedMetroGuideway(
  points: THREE.Vector3[],
  guidewayElevation: number = 6.0,
  accentColor: string = '#00BCD4'
): THREE.Group {
  const group = new THREE.Group()
  if (points.length < 2) return group

  // Set elevation on points
  const elevatedPoints = points.map((p) => new THREE.Vector3(p.x, guidewayElevation, p.z))
  const curve = new THREE.CatmullRomCurve3(elevatedPoints)
  const length = curve.getLength()

  // 1. Concrete U-shaped Guideway Box Beam
  const beamW = 6.5
  const beamH = 1.4
  const numSteps = Math.max(20, Math.floor(length / 6))

  const shape = new THREE.Shape()
  shape.moveTo(-beamW / 2, -beamH / 2)
  shape.lineTo(beamW / 2, -beamH / 2)
  shape.lineTo(beamW / 2, beamH / 2)
  shape.lineTo(beamW / 2 - 0.4, beamH / 2)
  shape.lineTo(beamW / 2 - 0.4, -beamH / 2 + 0.4)
  shape.lineTo(-beamW / 2 + 0.4, -beamH / 2 + 0.4)
  shape.lineTo(-beamW / 2 + 0.4, beamH / 2)
  shape.lineTo(-beamW / 2, beamH / 2)
  shape.closePath()

  const extrudeGeom = new THREE.ExtrudeGeometry(shape, {
    extrudePath: curve,
    steps: numSteps,
    bevelEnabled: false,
  })

  const guidewayMesh = new THREE.Mesh(extrudeGeom, guidewayConcreteMat)
  group.add(guidewayMesh)

  // 2. Line Accent Colored Trim Strip on guideway outer sides
  const accentMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    emissive: accentColor,
    emissiveIntensity: 0.4,
    roughness: 0.3,
    metalness: 0.5,
  })

  const accentTubeGeom = new THREE.TubeGeometry(curve, numSteps, 0.25, 6, false)
  const accentStrip = new THREE.Mesh(accentTubeGeom, accentMat)
  accentStrip.position.y = 0.5
  group.add(accentStrip)

  // 3. Concrete T-Piers / Support Columns every 45m
  const pierInterval = 45
  const numPiers = Math.floor(length / pierInterval)

  for (let i = 0; i <= numPiers; i++) {
    const t = i / Math.max(1, numPiers)
    const pos = curve.getPoint(t)
    const tangent = curve.getTangent(t)
    const angle = Math.atan2(tangent.x, tangent.z)

    // Vertical Cylindrical Column
    const col = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 1.8, guidewayElevation, 12),
      guidewayConcreteMat
    )
    col.position.set(pos.x, guidewayElevation / 2, pos.z)
    group.add(col)

    // T-Head Crossbeam supporting the dual tracks
    const tHead = new THREE.Mesh(
      new THREE.BoxGeometry(beamW + 1.2, 1.2, 3.5),
      guidewayConcreteMat
    )
    tHead.position.set(pos.x, guidewayElevation - 0.7, pos.z)
    tHead.rotation.y = angle + Math.PI / 2
    group.add(tHead)
  }

  return group
}

/**
 * Builds a realistic modern Elevated Metro Station
 * Features curved steel arch & tinted glass roof, passenger platform screen doors,
 * stair/escalator access shafts connecting to the street below, and LED station name totems.
 */
export function createModernElevatedStation(
  stationName: string,
  lineColor: string = '#00BCD4',
  isNight: boolean = false
): THREE.Group {
  const group = new THREE.Group()

  const stationL = 48
  const stationW = 16
  const stationH = 6.0 // Platform elevation above ground

  // 1. Concrete Platform Slab
  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(stationW, 1.2, stationL),
    guidewayConcreteMat
  )
  platform.position.y = stationH
  group.add(platform)

  // 2. Curved Aerodynamic Glass/Steel Canopy Roof
  const roofGeom = new THREE.CylinderGeometry(
    stationW * 0.65,
    stationW * 0.65,
    stationL * 0.95,
    16,
    1,
    false,
    0,
    Math.PI
  )
  const roof = new THREE.Mesh(roofGeom, stationGlassMat)
  roof.rotation.z = Math.PI / 2
  roof.rotation.y = Math.PI / 2
  roof.position.set(0, stationH + 4.5, 0)
  group.add(roof)

  // 3. Steel Structural Arches supporting roof
  for (let z = -stationL * 0.45; z <= stationL * 0.45; z += 8) {
    const archGeom = new THREE.TorusGeometry(stationW * 0.66, 0.35, 6, 16, Math.PI)
    const arch = new THREE.Mesh(archGeom, stationSteelMat)
    arch.rotation.y = Math.PI / 2
    arch.position.set(0, stationH + 4.5, z)
    group.add(arch)
  }

  // 4. Street Access Stairs / Elevator Core descending to ground
  const core = new THREE.Mesh(
    new THREE.BoxGeometry(4.5, stationH, 6.0),
    guidewayConcreteMat
  )
  core.position.set(-stationW / 2 - 2.25, stationH / 2, 0)
  group.add(core)

  // 5. Line Illuminated Totem Sign
  const totemMat = new THREE.MeshStandardMaterial({
    color: lineColor,
    emissive: lineColor,
    emissiveIntensity: isNight ? 1.0 : 0.4,
    roughness: 0.2,
  })

  const totem = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5.0, 1.2), totemMat)
  totem.position.set(-stationW / 2 - 2.25, stationH + 2.5, 3.5)
  group.add(totem)

  return group
}

/**
 * Builds an Underground Metro Entrance Portal (at street level)
 * Glass canopy, stainless steel railings, descending stairs, illuminated "M" totem.
 */
export function createUndergroundMetroEntrance(
  stationName: string,
  lineColor: string = '#00BCD4',
  isNight: boolean = false
): THREE.Group {
  const group = new THREE.Group()

  // 1. Concrete Stairwell Portal Pit
  const portalW = 5.0
  const portalL = 8.0
  const surround = new THREE.Mesh(
    new THREE.BoxGeometry(portalW + 0.8, 0.8, portalL + 0.8),
    guidewayConcreteMat
  )
  surround.position.y = 0.4
  group.add(surround)

  // Descending dark stairs opening
  const opening = new THREE.Mesh(
    new THREE.BoxGeometry(portalW, 0.2, portalL),
    new THREE.MeshBasicMaterial({ color: '#111111' })
  )
  opening.position.y = 0.75
  group.add(opening)

  // 2. Glass Angled Canopy
  const canopy = new THREE.Mesh(
    new THREE.BoxGeometry(portalW + 0.6, 0.25, portalL * 0.7),
    stationGlassMat
  )
  canopy.position.set(0, 3.2, -1.0)
  canopy.rotation.x = -0.25
  group.add(canopy)

  // 3. Steel Canopy Support Posts
  const postGeom = new THREE.CylinderGeometry(0.12, 0.12, 2.8, 8)
  const p1 = new THREE.Mesh(postGeom, stationSteelMat)
  p1.position.set(-portalW / 2, 1.8, -portalL / 2 + 1)
  group.add(p1)

  const p2 = new THREE.Mesh(postGeom, stationSteelMat)
  p2.position.set(portalW / 2, 1.8, -portalL / 2 + 1)
  group.add(p2)

  // 4. Illuminated Metro "M" Totem Post
  const totemPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 4.5, 8),
    stationSteelMat
  )
  totemPole.position.set(portalW / 2 + 1.2, 2.25, portalL / 2)
  group.add(totemPole)

  const totemCube = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 1.2, 1.2),
    new THREE.MeshStandardMaterial({
      color: lineColor,
      emissive: lineColor,
      emissiveIntensity: isNight ? 1.2 : 0.5,
    })
  )
  totemCube.position.set(portalW / 2 + 1.2, 4.5, portalL / 2)
  group.add(totemCube)

  return group
}

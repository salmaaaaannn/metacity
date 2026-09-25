import * as THREE from 'three'

/**
 * Procedural Geometries for Diverse Building Archetypes
 * Generates realistic modular geometries (main massing, setbacks, roof equipment, spires, canopies)
 */

export interface BuildingArchetypeGeometries {
  body: THREE.BufferGeometry
  details?: THREE.BufferGeometry
  roofEquip?: THREE.BufferGeometry
  spireOrCrane?: THREE.BufferGeometry
}

// Simple geometry merge helper without requiring external modules
function mergeBufferGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  if (geometries.length === 0) return new THREE.BufferGeometry()
  if (geometries.length === 1) return geometries[0]

  let totalVertices = 0
  let totalIndices = 0

  for (const g of geometries) {
    totalVertices += g.attributes.position.count
    if (g.index) {
      totalIndices += g.index.count
    }
  }

  const mergedPos = new Float32Array(totalVertices * 3)
  const mergedNorm = new Float32Array(totalVertices * 3)
  const mergedUv = new Float32Array(totalVertices * 2)
  const mergedIndices = new Uint32Array(totalIndices)

  let vertOffset = 0
  let indexOffset = 0

  for (const g of geometries) {
    const pos = g.attributes.position
    const norm = g.attributes.normal
    const uv = g.attributes.uv

    for (let i = 0; i < pos.count; i++) {
      mergedPos[(vertOffset + i) * 3] = pos.getX(i)
      mergedPos[(vertOffset + i) * 3 + 1] = pos.getY(i)
      mergedPos[(vertOffset + i) * 3 + 2] = pos.getZ(i)

      if (norm) {
        mergedNorm[(vertOffset + i) * 3] = norm.getX(i)
        mergedNorm[(vertOffset + i) * 3 + 1] = norm.getY(i)
        mergedNorm[(vertOffset + i) * 3 + 2] = norm.getZ(i)
      }
      if (uv) {
        mergedUv[(vertOffset + i) * 2] = uv.getX(i)
        mergedUv[(vertOffset + i) * 2 + 1] = uv.getY(i)
      }
    }

    if (g.index) {
      for (let i = 0; i < g.index.count; i++) {
        mergedIndices[indexOffset + i] = g.index.getX(i) + vertOffset
      }
      indexOffset += g.index.count
    }

    vertOffset += pos.count
  }

  const merged = new THREE.BufferGeometry()
  merged.setAttribute('position', new THREE.BufferAttribute(mergedPos, 3))
  merged.setAttribute('normal', new THREE.BufferAttribute(mergedNorm, 3))
  merged.setAttribute('uv', new THREE.BufferAttribute(mergedUv, 2))
  if (totalIndices > 0) {
    merged.setIndex(new THREE.BufferAttribute(mergedIndices, 1))
  }
  return merged
}

/**
 * 1. Skyscraper / Modern Glass Tower (CBD)
 * Features tiered setbacks, rooftop HVAC chiller units, and an illuminated communications spire.
 */
export function createSkyscraperGeometry(w: number, d: number, h: number): BuildingArchetypeGeometries {
  const geoms: THREE.BufferGeometry[] = []
  const detailGeoms: THREE.BufferGeometry[] = []

  // Base tier (0 to 60% height)
  const h1 = h * 0.6
  const baseBox = new THREE.BoxGeometry(w, h1, d)
  baseBox.translate(0, h1 / 2, 0)
  geoms.push(baseBox)

  // Mid tier (setback)
  const h2 = h * 0.25
  const midBox = new THREE.BoxGeometry(w * 0.82, h2, d * 0.82)
  midBox.translate(0, h1 + h2 / 2, 0)
  geoms.push(midBox)

  // Crown tier
  const h3 = h * 0.15
  const crownBox = new THREE.BoxGeometry(w * 0.64, h3, d * 0.64)
  crownBox.translate(0, h1 + h2 + h3 / 2, 0)
  geoms.push(crownBox)

  // Rooftop mechanical penthouse & chillers
  const hvac = new THREE.BoxGeometry(w * 0.35, 3.5, d * 0.35)
  hvac.translate(0, h + 1.75, 0)
  detailGeoms.push(hvac)

  // Communications spire on top
  const spireH = Math.max(12, h * 0.18)
  const spire = new THREE.CylinderGeometry(0.3, 0.9, spireH, 8)
  spire.translate(0, h + spireH / 2, 0)

  return {
    body: mergeBufferGeometries(geoms),
    details: mergeBufferGeometries(detailGeoms),
    spireOrCrane: spire,
  }
}

/**
 * 2. High-Rise Apartment Tower
 * Vertical residential building with wrap-around balconies and roof parapet.
 */
export function createApartmentTowerGeometry(w: number, d: number, h: number): BuildingArchetypeGeometries {
  const geoms: THREE.BufferGeometry[] = []
  const detailGeoms: THREE.BufferGeometry[] = []

  // Main body
  const body = new THREE.BoxGeometry(w, h, d)
  body.translate(0, h / 2, 0)
  geoms.push(body)

  // Balcony projections on front and back
  const floors = Math.max(4, Math.floor(h / 3.5))
  for (let f = 1; f < floors; f++) {
    const y = f * 3.5
    // Front balcony slab
    const balF = new THREE.BoxGeometry(w * 0.7, 0.4, 2.0)
    balF.translate(0, y, d / 2 + 1.0)
    detailGeoms.push(balF)

    // Back balcony slab
    const balB = new THREE.BoxGeometry(w * 0.7, 0.4, 2.0)
    balB.translate(0, y, -d / 2 - 1.0)
    detailGeoms.push(balB)
  }

  // Rooftop elevator room
  const elevator = new THREE.BoxGeometry(w * 0.3, 4.0, d * 0.3)
  elevator.translate(0, h + 2.0, 0)
  detailGeoms.push(elevator)

  return {
    body: mergeBufferGeometries(geoms),
    details: mergeBufferGeometries(detailGeoms),
  }
}

/**
 * 3. Mid-Rise Apartment / Townhouse Block
 * Brick residential with cornice, entrance canopy, and roof stair penthouse.
 */
export function createMidRiseApartmentGeometry(w: number, d: number, h: number): BuildingArchetypeGeometries {
  const geoms: THREE.BufferGeometry[] = []
  const detailGeoms: THREE.BufferGeometry[] = []

  // Main body
  const body = new THREE.BoxGeometry(w, h, d)
  body.translate(0, h / 2, 0)
  geoms.push(body)

  // Decorative roof cornice
  const cornice = new THREE.BoxGeometry(w + 1.2, 0.8, d + 1.2)
  cornice.translate(0, h + 0.4, 0)
  detailGeoms.push(cornice)

  // Ground floor entrance canopy
  const canopy = new THREE.BoxGeometry(4.5, 0.3, 3.0)
  canopy.translate(0, 3.2, d / 2 + 1.5)
  detailGeoms.push(canopy)

  // Roof access penthouse
  const penthouse = new THREE.BoxGeometry(w * 0.35, 3.0, d * 0.35)
  penthouse.translate(0, h + 1.5, 0)
  detailGeoms.push(penthouse)

  return {
    body: mergeBufferGeometries(geoms),
    details: mergeBufferGeometries(detailGeoms),
  }
}

/**
 * 4. Suburban Detached House
 * Pitched gabled roof, chimney, front porch, and garage wing.
 */
export function createSuburbanHouseGeometry(w: number, d: number, h: number): BuildingArchetypeGeometries {
  const geoms: THREE.BufferGeometry[] = []
  const detailGeoms: THREE.BufferGeometry[] = []

  const houseH = Math.min(h, 7.5)
  const mainBox = new THREE.BoxGeometry(w * 0.75, houseH, d * 0.75)
  mainBox.translate(0, houseH / 2, 0)
  geoms.push(mainBox)

  // Pitched roof (triangular prism / cone approximation or squashed pyramid)
  const roofH = 3.5
  const roof = new THREE.ConeGeometry(Math.max(w, d) * 0.58, roofH, 4)
  roof.rotateY(Math.PI / 4)
  roof.translate(0, houseH + roofH / 2, 0)
  detailGeoms.push(roof)

  // Chimney
  const chimney = new THREE.BoxGeometry(1.2, 5.0, 1.2)
  chimney.translate(w * 0.22, houseH + 2.5, d * 0.15)
  detailGeoms.push(chimney)

  // Front porch
  const porch = new THREE.BoxGeometry(4.0, 0.3, 2.5)
  porch.translate(0, 0.3, d * 0.75 / 2 + 1.25)
  detailGeoms.push(porch)

  // Garage
  const garage = new THREE.BoxGeometry(w * 0.4, houseH * 0.75, d * 0.4)
  garage.translate(w * 0.35, (houseH * 0.75) / 2, 0)
  detailGeoms.push(garage)

  // Driveway
  const driveway = new THREE.BoxGeometry(4, 0.05, 6)
  driveway.translate(w * 0.35, 0.025, d * 0.2 + 3)
  detailGeoms.push(driveway)

  // Yard fence
  const fenceH = 1.2
  const fenceT = 0.15
  
  const fenceFront = new THREE.BoxGeometry(w, fenceH, fenceT)
  fenceFront.translate(0, fenceH / 2, d / 2)
  detailGeoms.push(fenceFront)
  
  const fenceBack = new THREE.BoxGeometry(w, fenceH, fenceT)
  fenceBack.translate(0, fenceH / 2, -d / 2)
  detailGeoms.push(fenceBack)
  
  const fenceLeft = new THREE.BoxGeometry(fenceT, fenceH, d)
  fenceLeft.translate(-w / 2, fenceH / 2, 0)
  detailGeoms.push(fenceLeft)
  
  const fenceRight = new THREE.BoxGeometry(fenceT, fenceH, d)
  fenceRight.translate(w / 2, fenceH / 2, 0)
  detailGeoms.push(fenceRight)

  return {
    body: mergeBufferGeometries(geoms),
    details: mergeBufferGeometries(detailGeoms),
  }
}

/**
 * 5. Industrial Warehouse / Logistics Center
 * Corrugated metal hangar with multiple loading dock bay doors.
 */
export function createWarehouseGeometry(w: number, d: number, h: number): BuildingArchetypeGeometries {
  const geoms: THREE.BufferGeometry[] = []
  const detailGeoms: THREE.BufferGeometry[] = []

  // Main warehouse shed
  const body = new THREE.BoxGeometry(w, h, d)
  body.translate(0, h / 2, 0)
  geoms.push(body)

  // Loading docks along the front
  const numDocks = Math.max(2, Math.floor(w / 12))
  const dockW = 5.0
  const dockH = 4.2
  const spacing = w / (numDocks + 1)

  for (let i = 1; i <= numDocks; i++) {
    const x = -w / 2 + i * spacing
    // Dock frame
    const dockFrame = new THREE.BoxGeometry(dockW, dockH, 0.6)
    dockFrame.translate(x, dockH / 2, d / 2 + 0.3)
    detailGeoms.push(dockFrame)
  }

  // Rooftop ventilation turbines
  for (let v = -w * 0.3; v <= w * 0.3; v += w * 0.3) {
    const vent = new THREE.CylinderGeometry(1.2, 1.2, 2.0, 8)
    vent.translate(v, h + 1.0, 0)
    detailGeoms.push(vent)
  }

  return {
    body: mergeBufferGeometries(geoms),
    details: mergeBufferGeometries(detailGeoms),
  }
}

/**
 * 6. Manufacturing Factory with Smokestacks & Chemical Tanks
 */
export function createFactoryGeometry(w: number, d: number, h: number): BuildingArchetypeGeometries {
  const geoms: THREE.BufferGeometry[] = []
  const detailGeoms: THREE.BufferGeometry[] = []

  // Factory main floor
  const body = new THREE.BoxGeometry(w * 0.8, h * 0.75, d * 0.8)
  body.translate(-w * 0.08, (h * 0.75) / 2, 0)
  geoms.push(body)

  // Twin tall industrial smokestacks
  const stackH = h * 1.4
  const stack1 = new THREE.CylinderGeometry(1.2, 1.8, stackH, 12)
  stack1.translate(w * 0.32, stackH / 2, -d * 0.25)
  detailGeoms.push(stack1)

  const stack2 = new THREE.CylinderGeometry(1.2, 1.8, stackH, 12)
  stack2.translate(w * 0.32, stackH / 2, d * 0.25)
  detailGeoms.push(stack2)

  // Cylindrical chemical/storage tank
  const tank = new THREE.CylinderGeometry(w * 0.16, w * 0.16, h * 0.6, 16)
  tank.translate(-w * 0.28, (h * 0.6) / 2, d * 0.3)
  detailGeoms.push(tank)

  return {
    body: mergeBufferGeometries(geoms),
    details: mergeBufferGeometries(detailGeoms),
  }
}

/**
 * 7. Hospital / Medical Center
 * Multi-wing complex with ambulance emergency awning and rooftop helipad.
 */
export function createHospitalGeometry(w: number, d: number, h: number): BuildingArchetypeGeometries {
  const geoms: THREE.BufferGeometry[] = []
  const detailGeoms: THREE.BufferGeometry[] = []

  // Central ward tower
  const centerBox = new THREE.BoxGeometry(w * 0.6, h, d * 0.6)
  centerBox.translate(0, h / 2, 0)
  geoms.push(centerBox)

  // East & West clinical wings
  const wingH = h * 0.55
  const leftWing = new THREE.BoxGeometry(w * 0.35, wingH, d * 0.5)
  leftWing.translate(-w * 0.35, wingH / 2, 0)
  geoms.push(leftWing)

  const rightWing = new THREE.BoxGeometry(w * 0.35, wingH, d * 0.5)
  rightWing.translate(w * 0.35, wingH / 2, 0)
  geoms.push(rightWing)

  // Emergency ambulance drop-off canopy
  const canopy = new THREE.BoxGeometry(w * 0.45, 0.4, 6.0)
  canopy.translate(0, 4.0, d * 0.3 + 3.0)
  detailGeoms.push(canopy)

  // Rooftop Helipad
  const pad = new THREE.CylinderGeometry(w * 0.22, w * 0.22, 0.5, 16)
  pad.translate(0, h + 0.25, 0)
  detailGeoms.push(pad)

  return {
    body: mergeBufferGeometries(geoms),
    details: mergeBufferGeometries(detailGeoms),
  }
}

/**
 * 8. School / University Educational Hall
 * Classical civic institution with central clock tower and entrance portico.
 */
export function createSchoolGeometry(w: number, d: number, h: number): BuildingArchetypeGeometries {
  const geoms: THREE.BufferGeometry[] = []
  const detailGeoms: THREE.BufferGeometry[] = []

  // Main education wings
  const mainH = Math.min(h, 16)
  const body = new THREE.BoxGeometry(w, mainH, d * 0.75)
  body.translate(0, mainH / 2, 0)
  geoms.push(body)

  // Central Clock Tower
  const towerW = Math.min(w * 0.28, 10)
  const towerH = mainH + 12
  const tower = new THREE.BoxGeometry(towerW, towerH, towerW)
  tower.translate(0, towerH / 2, d * 0.15)
  geoms.push(tower)

  // Tower pyramidal spire
  const spire = new THREE.ConeGeometry(towerW * 0.75, 6, 4)
  spire.rotateY(Math.PI / 4)
  spire.translate(0, towerH + 3, d * 0.15)
  detailGeoms.push(spire)

  // Classical entrance colonnade / portico
  const portico = new THREE.BoxGeometry(towerW + 2, 1.0, 4)
  portico.translate(0, 4.5, d * 0.75 / 2 + 2)
  detailGeoms.push(portico)

  return {
    body: mergeBufferGeometries(geoms),
    details: mergeBufferGeometries(detailGeoms),
  }
}

/**
 * 9. Developing / Construction Site
 * Steel skeleton frame, concrete core shaft, yellow tower crane with jib, scaffolding.
 */
export function createConstructionSiteGeometry(w: number, d: number, h: number): BuildingArchetypeGeometries {
  const geoms: THREE.BufferGeometry[] = []
  const craneGeoms: THREE.BufferGeometry[] = []

  // Central elevator concrete core
  const coreH = h * 0.85
  const core = new THREE.BoxGeometry(w * 0.35, coreH, d * 0.35)
  core.translate(0, coreH / 2, 0)
  geoms.push(core)

  // Partially completed floor slabs (steel/concrete floors)
  const completedFloors = Math.max(2, Math.floor(h / 4.5))
  for (let f = 1; f < completedFloors; f++) {
    const floorSlab = new THREE.BoxGeometry(w * 0.85, 0.5, d * 0.85)
    floorSlab.translate(0, f * 4.5, 0)
    geoms.push(floorSlab)
  }

  // Tower Crane
  // Mast (vertical lattice tower)
  const mastH = h + 15
  const mast = new THREE.BoxGeometry(1.4, mastH, 1.4)
  mast.translate(w * 0.25, mastH / 2, d * 0.25)
  craneGeoms.push(mast)

  // Horizontal crane jib (arm)
  const jibL = w * 0.95
  const jib = new THREE.BoxGeometry(jibL, 1.0, 1.0)
  jib.translate(w * 0.25 - jibL * 0.25, mastH - 0.5, d * 0.25)
  craneGeoms.push(jib)

  // Crane counterweight
  const weight = new THREE.BoxGeometry(3.0, 2.0, 1.8)
  weight.translate(w * 0.25 + jibL * 0.32, mastH - 0.5, d * 0.25)
  craneGeoms.push(weight)

  return {
    body: mergeBufferGeometries(geoms),
    spireOrCrane: mergeBufferGeometries(craneGeoms),
  }
}

/**
 * 10. Commercial Retail Strip
 * Low-rise shops with prominent display windows, stepped parapets, and canvas awning.
 */
export function createCommercialRetailGeometry(w: number, d: number, h: number): BuildingArchetypeGeometries {
  const geoms: THREE.BufferGeometry[] = []
  const detailGeoms: THREE.BufferGeometry[] = []

  // Main low-rise body (1-3 floors)
  const shopH = Math.min(h, 12)
  const body = new THREE.BoxGeometry(w, shopH, d)
  body.translate(0, shopH / 2, 0)
  geoms.push(body)

  // Stepped decorative parapet top
  const parapet = new THREE.BoxGeometry(w + 0.8, 1.4, d + 0.8)
  parapet.translate(0, shopH + 0.7, 0)
  detailGeoms.push(parapet)

  // Canvas awning overhang (front face)
  const awningH = shopH * 0.3
  const awning = new THREE.BoxGeometry(w * 0.85, 0.4, 3.0)
  awning.translate(0, awningH, d / 2 + 1.5)
  detailGeoms.push(awning)

  // Display window sill / cornice detail
  const sill = new THREE.BoxGeometry(w * 0.9, 0.5, 0.6)
  sill.translate(0, 3.5, d / 2 + 0.3)
  detailGeoms.push(sill)

  return {
    body: mergeBufferGeometries(geoms),
    details: mergeBufferGeometries(detailGeoms),
  }
}

/**
 * 11. Government / Civic Building
 * Classical style with column portico, triangular pediment, and dome accent.
 */
export function createGovernmentGeometry(w: number, d: number, h: number): BuildingArchetypeGeometries {
  const geoms: THREE.BufferGeometry[] = []
  const detailGeoms: THREE.BufferGeometry[] = []

  const govH = Math.max(h, 16)

  // Main body
  const body = new THREE.BoxGeometry(w, govH, d)
  body.translate(0, govH / 2, 0)
  geoms.push(body)

  // Entrance colonnade (row of columns across the front)
  const numCols = Math.max(3, Math.floor(w / 6))
  const colSpacing = w / (numCols + 1)
  const colH = govH * 0.6
  for (let i = 1; i <= numCols; i++) {
    const col = new THREE.CylinderGeometry(0.9, 1.1, colH, 8)
    col.translate(-w / 2 + i * colSpacing, colH / 2, d / 2 + 0.5)
    detailGeoms.push(col)
  }

  // Triangular pediment above columns
  const pediment = new THREE.ConeGeometry(w * 0.55, 5.0, 3)
  pediment.rotateY(Math.PI / 6)
  pediment.translate(0, govH * 0.6 + 2.5, d / 2 + 0.5)
  detailGeoms.push(pediment)

  // Small dome on roof
  const dome = new THREE.SphereGeometry(Math.min(w, d) * 0.18, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2)
  dome.translate(0, govH + 0.5, 0)
  detailGeoms.push(dome)

  return {
    body: mergeBufferGeometries(geoms),
    details: mergeBufferGeometries(detailGeoms),
  }
}

/**
 * 12. Transit Hub / Station
 * Wide low canopied structure with platform canopy, ticket halls, and clock tower.
 */
export function createTransitHubGeometry(w: number, d: number, h: number): BuildingArchetypeGeometries {
  const geoms: THREE.BufferGeometry[] = []
  const detailGeoms: THREE.BufferGeometry[] = []

  const hubH = Math.min(h, 14)

  // Main terminal hall body
  const hall = new THREE.BoxGeometry(w, hubH, d * 0.7)
  hall.translate(0, hubH / 2, 0)
  geoms.push(hall)

  // Wide canopy / concourse roof
  const canopy = new THREE.BoxGeometry(w * 1.1, 1.5, d * 0.4)
  canopy.translate(0, hubH + 0.75, d * 0.55)
  detailGeoms.push(canopy)

  // Clock / signal tower
  const towerH = hubH * 1.5
  const tower = new THREE.BoxGeometry(3.0, towerH, 3.0)
  tower.translate(w * 0.38, towerH / 2, 0)
  detailGeoms.push(tower)

  // Platform shelter shed
  const platform = new THREE.BoxGeometry(w * 0.8, 0.5, d * 0.3)
  platform.translate(0, 4.0, -d * 0.5)
  detailGeoms.push(platform)

  return {
    body: mergeBufferGeometries(geoms),
    details: mergeBufferGeometries(detailGeoms),
  }
}

/**
 * 13. Park Pavilion / Recreation Structure
 * Open-air pavilion with decorative roof, pillars, and surrounding terrace.
 */
export function createParkPavilionGeometry(w: number, d: number, h: number): BuildingArchetypeGeometries {
  const geoms: THREE.BufferGeometry[] = []
  const detailGeoms: THREE.BufferGeometry[] = []

  const pavH = Math.min(h, 8)

  // Low terrace base
  const base = new THREE.BoxGeometry(w * 1.1, 0.8, d * 1.1)
  base.translate(0, 0.4, 0)
  geoms.push(base)

  // Central pavilion room
  const pavBody = new THREE.BoxGeometry(w * 0.7, pavH, d * 0.7)
  pavBody.translate(0, 0.8 + pavH / 2, 0)
  geoms.push(pavBody)

  // Decorative hip roof
  const roof = new THREE.ConeGeometry(Math.max(w, d) * 0.55, 4.5, 4)
  roof.rotateY(Math.PI / 4)
  roof.translate(0, 0.8 + pavH + 2.25, 0)
  detailGeoms.push(roof)

  // Corner columns
  const corners = [
    [-w * 0.42, w * 0.42],
    [-d * 0.42, d * 0.42],
  ]
  const colH = pavH
  for (let xi = 0; xi < 2; xi++) {
    for (let zi = 0; zi < 2; zi++) {
      const pillar = new THREE.CylinderGeometry(0.6, 0.7, colH, 8)
      pillar.translate(corners[0][xi], 0.8 + colH / 2, corners[1][zi])
      detailGeoms.push(pillar)
    }
  }

  return {
    body: mergeBufferGeometries(geoms),
    details: mergeBufferGeometries(detailGeoms),
  }
}


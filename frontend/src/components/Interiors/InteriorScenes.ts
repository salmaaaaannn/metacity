import * as THREE from 'three'

/**
 * METACITY — Modular 3D Architectural Interior Environments
 * Generates detailed rooms for: OFFICE, HOSPITAL, SCHOOL, SHOP, HOME.
 */

// Materials for interiors
const matFloorWood = new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.6, metalness: 0.05 })
const matFloorTile = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, roughness: 0.3, metalness: 0.1 })
const matFloorHospital = new THREE.MeshStandardMaterial({ color: 0xb0bec5, roughness: 0.4, metalness: 0.1 })
const matWallLight = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.85, metalness: 0.05 })
const matWallGlass = new THREE.MeshStandardMaterial({ color: 0x81d4fa, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.45 })
const matDeskWood = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.65, metalness: 0.05 })
const matMetal = new THREE.MeshStandardMaterial({ color: 0x455a64, roughness: 0.3, metalness: 0.85 })
const matScreenGlow = new THREE.MeshStandardMaterial({ color: 0x29b6f6, emissive: 0x0288d1, emissiveIntensity: 0.8, roughness: 0.2 })
const matHeartbeatScreen = new THREE.MeshStandardMaterial({ color: 0x00e676, emissive: 0x00c853, emissiveIntensity: 0.9, roughness: 0.2 })
const matChalkboard = new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.9, metalness: 0.02 })
const matSofaFabric = new THREE.MeshStandardMaterial({ color: 0x3f51b5, roughness: 0.85, metalness: 0.05 })
const matBedFabric = new THREE.MeshStandardMaterial({ color: 0xe0f7fa, roughness: 0.8, metalness: 0.05 })
const matCeilingLight = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff9c4, emissiveIntensity: 1.2 })

/**
 * 1. OFFICE INTERIOR
 * Reception desk, workstations with dual monitors, glass meeting room, water cooler, office plants.
 */
export function createOfficeInterior(): THREE.Group {
  const g = new THREE.Group()

  // Room Shell (20m x 6m x 16m)
  const floor = new THREE.Mesh(new THREE.BoxGeometry(20, 0.4, 16), matFloorTile)
  floor.position.y = -0.2
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(20, 6, 0.4), matWallLight)
  backWall.position.set(0, 3, -8)
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 6, 16), matWallLight)
  leftWall.position.set(-10, 3, 0)
  g.add(floor, backWall, leftWall)

  // Reception Desk
  const recDesk = new THREE.Mesh(new THREE.BoxGeometry(5, 1.2, 1.8), matDeskWood)
  recDesk.position.set(-4, 0.6, 4)
  const recMonitor = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.1), matScreenGlow)
  recMonitor.position.set(-4, 1.5, 3.8)
  g.add(recDesk, recMonitor)

  // Workstation Desks (Open Plan)
  for (let row = -1; row <= 1; row++) {
    const desk = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.8, 1.6), matDeskWood)
    desk.position.set(3, 0.4, row * 3.5)
    // 2 Monitors per desk
    const mon1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.08), matScreenGlow)
    mon1.position.set(2, 1.1, row * 3.5 - 0.2)
    const mon2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.08), matScreenGlow)
    mon2.position.set(4, 1.1, row * 3.5 - 0.2)
    // Office chairs
    const chair = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 0.8), matMetal)
    chair.position.set(3, 0.45, row * 3.5 + 1.2)
    g.add(desk, mon1, mon2, chair)
  }

  // Glass Conference Meeting Room
  const glassWall1 = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 0.2), matWallGlass)
  glassWall1.position.set(-5, 2.5, -3)
  const confTable = new THREE.Mesh(new THREE.BoxGeometry(5, 0.85, 2.4), matDeskWood)
  confTable.position.set(-5, 0.42, -5.5)
  g.add(glassWall1, confTable)

  // Water cooler
  const cooler = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.4, 12), matMetal)
  cooler.position.set(8.5, 0.7, -6)
  g.add(cooler)

  // Overhead LED Troffers
  for (let x = -6; x <= 6; x += 4) {
    for (let z = -5; z <= 5; z += 5) {
      const light = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.8), matCeilingLight)
      light.position.set(x, 5.8, z)
      g.add(light)
    }
  }

  return g
}

/**
 * 2. HOSPITAL INTERIOR
 * Reception triage, patient hospital beds with privacy curtains, telemetry monitors, IV stands.
 */
export function createHospitalInterior(): THREE.Group {
  const g = new THREE.Group()

  // Room Shell (22m x 6m x 16m)
  const floor = new THREE.Mesh(new THREE.BoxGeometry(22, 0.4, 16), matFloorHospital)
  floor.position.y = -0.2
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(22, 6, 0.4), matWallLight)
  backWall.position.set(0, 3, -8)
  g.add(floor, backWall)

  // Nurse Station Counter
  const station = new THREE.Mesh(new THREE.BoxGeometry(7, 1.2, 2.2), matWallLight)
  station.position.set(-6, 0.6, 4)
  const stationTop = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.1, 2.4), matFloorTile)
  stationTop.position.set(-6, 1.25, 4)
  g.add(station, stationTop)

  // 3 Patient Hospital Beds
  for (let i = 0; i < 3; i++) {
    const z = -5 + i * 4.5
    // Bed Frame
    const bed = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.7, 4.5), matMetal)
    bed.position.set(5, 0.35, z)
    // Mattress & Pillow
    const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.4, 4.2), matBedFabric)
    mattress.position.set(5, 0.8, z)
    const pillow = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.25, 0.9), matWallLight)
    pillow.position.set(5, 1.1, z - 1.5)
    // Vital signs monitor
    const monitor = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.2), matHeartbeatScreen)
    monitor.position.set(2.8, 1.8, z - 1.5)
    // IV Drip stand
    const iv = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.4, 8), matMetal)
    iv.position.set(2.8, 1.2, z)
    g.add(bed, mattress, pillow, monitor, iv)
  }

  return g
}

/**
 * 3. SCHOOL CLASSROOM INTERIOR
 * Teacher chalkboard, teacher desk, student desks, classroom clocks, windows.
 */
export function createSchoolInterior(): THREE.Group {
  const g = new THREE.Group()

  // Room Shell (18m x 5.5m x 15m)
  const floor = new THREE.Mesh(new THREE.BoxGeometry(18, 0.4, 15), matFloorWood)
  floor.position.y = -0.2
  const frontWall = new THREE.Mesh(new THREE.BoxGeometry(18, 5.5, 0.4), matWallLight)
  frontWall.position.set(0, 2.75, -7.5)
  g.add(floor, frontWall)

  // Large Green Chalkboard
  const board = new THREE.Mesh(new THREE.BoxGeometry(10, 2.4, 0.1), matChalkboard)
  board.position.set(0, 2.6, -7.2)
  const frame = new THREE.Mesh(new THREE.BoxGeometry(10.2, 2.6, 0.05), matDeskWood)
  frame.position.set(0, 2.6, -7.25)
  g.add(board, frame)

  // Teacher Desk
  const teacherDesk = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.9, 1.8), matDeskWood)
  teacherDesk.position.set(4, 0.45, -4.5)
  const teacherLaptop = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.05), matScreenGlow)
  teacherLaptop.position.set(4, 1.1, -4.5)
  g.add(teacherDesk, teacherLaptop)

  // Rows of Student Desks
  for (let r = 0; r < 3; r++) {
    for (let c = -2; c <= 2; c++) {
      const z = -1 + r * 3.0
      const x = c * 2.8
      const sDesk = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 1.1), matDeskWood)
      sDesk.position.set(x, 0.4, z)
      const sChair = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.7), matMetal)
      sChair.position.set(x, 0.4, z + 0.9)
      g.add(sDesk, sChair)
    }
  }

  return g
}

/**
 * 4. RETAIL SHOP / SUPERMARKET INTERIOR
 * Grocery aisles, stocked merchandise shelves, checkout counter with register.
 */
export function createShopInterior(): THREE.Group {
  const g = new THREE.Group()

  // Room Shell (20m x 5.5m x 16m)
  const floor = new THREE.Mesh(new THREE.BoxGeometry(20, 0.4, 16), matFloorTile)
  floor.position.y = -0.2
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(20, 5.5, 0.4), matWallLight)
  backWall.position.set(0, 2.75, -8)
  g.add(floor, backWall)

  // 3 Shelf Aisles
  for (let a = -1; a <= 1; a++) {
    const x = a * 5
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.2, 3.2, 10), matMetal)
    shelf.position.set(x, 1.6, -1)
    // Products
    const prod = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.4, 9.8), matSofaFabric)
    prod.position.set(x, 1.2, -1)
    g.add(shelf, prod)
  }

  // Checkout Counter
  const checkout = new THREE.Mesh(new THREE.BoxGeometry(5.5, 1.1, 1.6), matFloorTile)
  checkout.position.set(0, 0.55, 6)
  const register = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.6), matScreenGlow)
  register.position.set(1.5, 1.35, 6)
  g.add(checkout, register)

  return g
}

/**
 * 5. RESIDENTIAL HOME / APARTMENT INTERIOR
 * Living room sofa, coffee table, widescreen TV, kitchen counter with stools, bedroom bed.
 */
export function createHomeInterior(): THREE.Group {
  const g = new THREE.Group()

  // Room Shell (16m x 4.5m x 14m)
  const floor = new THREE.Mesh(new THREE.BoxGeometry(16, 0.4, 14), matFloorWood)
  floor.position.y = -0.2
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(16, 4.5, 0.4), matWallLight)
  backWall.position.set(0, 2.25, -7)
  g.add(floor, backWall)

  // Living Room Area
  // Widescreen TV mounted on wall
  const tv = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.0, 0.15), matMetal)
  tv.position.set(-3.5, 2.2, -6.8)
  const screen = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.8, 0.05), matScreenGlow)
  screen.position.set(-3.5, 2.2, -6.7)

  // Comfortable Sofa
  const sofa = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.9, 1.8), matSofaFabric)
  sofa.position.set(-3.5, 0.45, -2)
  const coffeeTable = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.45, 1.2), matDeskWood)
  coffeeTable.position.set(-3.5, 0.22, -4.2)
  g.add(tv, screen, sofa, coffeeTable)

  // Kitchen Island Counter
  const kitchen = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.1, 1.6), matFloorTile)
  kitchen.position.set(4.5, 0.55, -4.5)
  g.add(kitchen)

  // Bedroom Bed
  const bed = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.8, 4.2), matBedFabric)
  bed.position.set(4.5, 0.4, 3.5)
  g.add(bed)

  return g
}

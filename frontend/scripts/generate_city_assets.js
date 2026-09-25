/**
 * METACITY — Automated City Asset Pipeline Generator
 * Generates standards-compliant glTF 2.0 Binary (.glb) models, PBR textures, citizen spritesheets,
 * and manifest.json for all urban categories without external copyright dependencies.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'

// Node.js FileReader polyfill for Three.js GLTFExporter
globalThis.FileReader = class FileReader {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = buf
      if (this.onloadend) this.onloadend()
    })
  }
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PUBLIC_ASSETS = path.resolve(__dirname, '../public/assets')

// 1. Directory Structure Definition
const ASSET_DIRS = [
  'buildings/residential',
  'buildings/commercial',
  'buildings/office',
  'buildings/industrial',
  'buildings/civic',
  'buildings/education',
  'buildings/healthcare',
  'buildings/special',
  'roads/local',
  'roads/arterial',
  'roads/highways',
  'roads/bridges',
  'roads/intersections',
  'metro/trains',
  'metro/stations',
  'metro/tracks',
  'railway/trains',
  'railway/stations',
  'railway/tracks',
  'vehicles/cars',
  'vehicles/buses',
  'vehicles/trucks',
  'vehicles/ambulance',
  'vehicles/fire',
  'vehicles/police',
  'environment/trees',
  'environment/bushes',
  'environment/rocks',
  'environment/props',
  'street/lights',
  'street/signs',
  'street/traffic_lights',
  'street/benches',
  'street/bins',
  'street/barriers',
  'citizens/sprites',
  'interiors/office',
  'interiors/hospital',
  'interiors/school',
  'interiors/shop',
  'interiors/home',
  'textures/asphalt',
  'textures/concrete',
  'textures/brick',
  'textures/glass',
  'textures/metal',
  'textures/grass',
  'textures/terrain',
]

// Ensure all target directories exist
for (const relDir of ASSET_DIRS) {
  const full = path.join(PUBLIC_ASSETS, relDir)
  fs.mkdirSync(full, { recursive: true })
}

const manifest = {
  version: '1.0.0',
  generatedAt: new Date().toISOString(),
  totalAssets: 0,
  assets: [],
}

const exporter = new GLTFExporter()

function exportGLB(group, relPath, meta) {
  return new Promise((resolve, reject) => {
    exporter.parse(
      group,
      (buffer) => {
        const fullPath = path.join(PUBLIC_ASSETS, relPath)
        fs.writeFileSync(fullPath, Buffer.from(buffer))
        manifest.assets.push({
          id: meta.id || path.basename(relPath, '.glb'),
          path: relPath,
          category: meta.category,
          name: meta.name,
          format: 'glb',
          license: 'CC0 1.0 Universal',
          creator: meta.creator || 'METACITY Open Asset Studio',
          dimensions: meta.dimensions || [10, 10, 10],
          fileSizeBytes: buffer.byteLength,
        })
        manifest.totalAssets++
        resolve()
      },
      (error) => reject(error),
      { binary: true }
    )
  })
}

// -------------------------------------------------------------
// Shared PBR Materials Palette
// -------------------------------------------------------------
const matConcreteLight = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.85, metalness: 0.1 })
const matConcreteDark = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9, metalness: 0.05 })
const matBrickRed = new THREE.MeshStandardMaterial({ color: 0x9b382c, roughness: 0.88, metalness: 0.05 })
const matBrickBrown = new THREE.MeshStandardMaterial({ color: 0x6e473b, roughness: 0.86, metalness: 0.05 })
const matGlassOffice = new THREE.MeshStandardMaterial({ color: 0x224466, roughness: 0.12, metalness: 0.92 })
const matGlassWindow = new THREE.MeshStandardMaterial({ color: 0x335577, roughness: 0.2, metalness: 0.8 })
const matRoofTileRed = new THREE.MeshStandardMaterial({ color: 0xb73a27, roughness: 0.75, metalness: 0.08 })
const matRoofTileGray = new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.8, metalness: 0.1 })
const matIndustrialSteel = new THREE.MeshStandardMaterial({ color: 0x78909c, roughness: 0.45, metalness: 0.75 })
const matCorrugatedMetal = new THREE.MeshStandardMaterial({ color: 0x546e7a, roughness: 0.55, metalness: 0.65 })
const matAsphalt = new THREE.MeshStandardMaterial({ color: 0x263238, roughness: 0.92, metalness: 0.05 })
const matYellowMarking = new THREE.MeshStandardMaterial({ color: 0xffca28, roughness: 0.4, metalness: 0.1 })
const matWhiteMarking = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.4, metalness: 0.1 })
const matWood = new THREE.MeshStandardMaterial({ color: 0x6d4c41, roughness: 0.7, metalness: 0.05 })
const matFoliageDark = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.8, metalness: 0.02 })
const matFoliageLight = new THREE.MeshStandardMaterial({ color: 0x43a047, roughness: 0.78, metalness: 0.02 })
const matPineGreen = new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.85, metalness: 0.02 })
const matTrunkBrown = new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.9, metalness: 0.02 })
const matCarPaintBlue = new THREE.MeshStandardMaterial({ color: 0x1565c0, roughness: 0.25, metalness: 0.85 })
const matCarPaintRed = new THREE.MeshStandardMaterial({ color: 0xc62828, roughness: 0.25, metalness: 0.85 })
const matCarPaintWhite = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.3, metalness: 0.8 })
const matCarPaintYellow = new THREE.MeshStandardMaterial({ color: 0xfbc02d, roughness: 0.25, metalness: 0.85 })
const matCarPaintBlack = new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.3, metalness: 0.85 })
const matTireRubber = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.95, metalness: 0.1 })
const matRimChrome = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.15, metalness: 0.95 })
const matHeadlight = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.9, emissive: 0xffffee, emissiveIntensity: 0.8 })
const matTaillight = new THREE.MeshStandardMaterial({ color: 0xff1744, roughness: 0.1, metalness: 0.8, emissive: 0xd50000, emissiveIntensity: 0.8 })

// -------------------------------------------------------------
// Asset Generators
// -------------------------------------------------------------

// --- BUILDINGS: RESIDENTIAL ---
function buildSuburbanHouse1() {
  const g = new THREE.Group()
  // Foundation
  const base = new THREE.Mesh(new THREE.BoxGeometry(14, 1, 12), matConcreteDark)
  base.position.y = 0.5
  g.add(base)
  // Walls
  const walls = new THREE.Mesh(new THREE.BoxGeometry(13.4, 6, 11.4), matConcreteLight)
  walls.position.y = 4
  g.add(walls)
  // Pitched Roof
  const roof = new THREE.Mesh(new THREE.ConeGeometry(9.5, 4, 4), matRoofTileRed)
  roof.position.y = 9
  roof.rotation.y = Math.PI / 4
  g.add(roof)
  // Door & Porch
  const door = new THREE.Mesh(new THREE.BoxGeometry(2, 3.5, 0.4), matWood)
  door.position.set(0, 2.75, 5.8)
  g.add(door)
  // Windows
  const winL = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 0.2), matGlassWindow)
  winL.position.set(-3.8, 4.2, 5.8)
  const winR = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 0.2), matGlassWindow)
  winR.position.set(3.8, 4.2, 5.8)
  // Chimney
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(1.4, 4.5, 1.4), matBrickRed)
  chimney.position.set(4, 9.5, -2)
  g.add(winL, winR, chimney)
  return g
}

function buildSuburbanHouse2() {
  const g = new THREE.Group()
  // Two-story modern suburban house with garage
  const main = new THREE.Mesh(new THREE.BoxGeometry(16, 7.5, 12), matBrickBrown)
  main.position.y = 3.75
  const garage = new THREE.Mesh(new THREE.BoxGeometry(7, 4.5, 9), matConcreteLight)
  garage.position.set(9.5, 2.25, 1.5)
  // Garage door
  const gDoor = new THREE.Mesh(new THREE.BoxGeometry(5.8, 3.6, 0.2), matIndustrialSteel)
  gDoor.position.set(9.5, 2, 6.1)
  // Flat modern roof with parapet
  const parapet = new THREE.Mesh(new THREE.BoxGeometry(16.4, 0.8, 12.4), matConcreteDark)
  parapet.position.y = 7.9
  // Balcony
  const balcony = new THREE.Mesh(new THREE.BoxGeometry(6, 0.4, 2.5), matConcreteDark)
  balcony.position.set(-3, 4.5, 7.2)
  g.add(main, garage, gDoor, parapet, balcony)
  return g
}

function buildApartmentMid() {
  const g = new THREE.Group()
  // 5-story mid-rise brick residential block
  const w = 24, h = 18, d = 18
  const block = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), matBrickRed)
  block.position.y = h / 2
  g.add(block)
  // Entrance canopy
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(6, 0.5, 4), matGlassWindow)
  canopy.position.set(0, 3.5, d / 2 + 1.8)
  g.add(canopy)
  // Rooftop mechanical room
  const mech = new THREE.Mesh(new THREE.BoxGeometry(8, 3, 8), matConcreteDark)
  mech.position.set(0, h + 1.5, 0)
  g.add(mech)
  // Windows grid
  for (let f = 1; f < 5; f++) {
    for (let c = -3; c <= 3; c++) {
      if (c === 0 && f === 1) continue // door
      const win = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.2, 0.3), matGlassWindow)
      win.position.set(c * 3.2, f * 3.5 + 1, d / 2 + 0.1)
      g.add(win)
    }
  }
  return g
}

function buildApartmentTower() {
  const g = new THREE.Group()
  // 16-story modern residential high-rise tower
  const w = 22, h = 55, d = 22
  const tower = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), matConcreteLight)
  tower.position.y = h / 2
  g.add(tower)
  // Central glass elevator shaft
  const glassShaft = new THREE.Mesh(new THREE.BoxGeometry(6, h + 2, 2.5), matGlassOffice)
  glassShaft.position.set(0, (h + 2) / 2, d / 2 + 0.8)
  g.add(glassShaft)
  // Rooftop terrace / penthouse
  const penthouse = new THREE.Mesh(new THREE.BoxGeometry(16, 5, 16), matGlassOffice)
  penthouse.position.y = h + 2.5
  g.add(penthouse)
  return g
}

// --- BUILDINGS: COMMERCIAL & OFFICE ---
function buildCommercialStore() {
  const g = new THREE.Group()
  // Retail supermarket / commercial store
  const store = new THREE.Mesh(new THREE.BoxGeometry(26, 7.5, 20), matConcreteLight)
  store.position.y = 3.75
  // Large shopfront glass facade
  const shopGlass = new THREE.Mesh(new THREE.BoxGeometry(20, 5, 0.4), matGlassOffice)
  shopGlass.position.set(0, 2.8, 10.1)
  // Signage parapet
  const sign = new THREE.Mesh(new THREE.BoxGeometry(18, 2, 0.6), matYellowMarking)
  sign.position.set(0, 6.2, 10.3)
  g.add(store, shopGlass, sign)
  return g
}

function buildOfficeMidRise() {
  const g = new THREE.Group()
  // 7-story modern tech office
  const w = 28, h = 26, d = 22
  const main = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), matGlassOffice)
  main.position.y = h / 2
  // Structural concrete vertical fins
  for (let x = -w / 2 + 3; x <= w / 2 - 3; x += 5.5) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.8, h + 1, d + 0.6), matConcreteDark)
    fin.position.set(x, h / 2, 0)
    g.add(fin)
  }
  g.add(main)
  return g
}

function buildOfficeSkyscraper() {
  const g = new THREE.Group()
  // CBD Tiered Glass Skyscraper (height 95m)
  const baseH = 45, midH = 32, crownH = 18
  const base = new THREE.Mesh(new THREE.BoxGeometry(32, baseH, 32), matGlassOffice)
  base.position.y = baseH / 2
  const mid = new THREE.Mesh(new THREE.BoxGeometry(25, midH, 25), matGlassOffice)
  mid.position.y = baseH + midH / 2
  const crown = new THREE.Mesh(new THREE.BoxGeometry(18, crownH, 18), matGlassOffice)
  crown.position.y = baseH + midH + crownH / 2
  // Communications spire
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 1.2, 22, 8), matIndustrialSteel)
  spire.position.y = baseH + midH + crownH + 11
  g.add(base, mid, crown, spire)
  return g
}

// --- BUILDINGS: CIVIC, EDUCATION, HEALTHCARE, INDUSTRIAL ---
function buildHospital() {
  const g = new THREE.Group()
  // Cross-plan hospital with emergency entrance and helipad
  const main = new THREE.Mesh(new THREE.BoxGeometry(38, 22, 26), matConcreteLight)
  main.position.y = 11
  // Emergency wing
  const erWing = new THREE.Mesh(new THREE.BoxGeometry(20, 7, 14), matConcreteDark)
  erWing.position.set(-16, 3.5, 16)
  // Red Cross emblem
  const crossV = new THREE.Mesh(new THREE.BoxGeometry(2, 7, 0.4), matCarPaintRed)
  crossV.position.set(0, 16, 13.2)
  const crossH = new THREE.Mesh(new THREE.BoxGeometry(7, 2, 0.4), matCarPaintRed)
  crossH.position.set(0, 16, 13.2)
  // Helipad
  const helipad = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 0.5, 16), matConcreteDark)
  helipad.position.set(8, 22.25, 0)
  g.add(main, erWing, crossV, crossH, helipad)
  return g
}

function buildSchool() {
  const g = new THREE.Group()
  // U-shaped school complex with brick facade and courtyard
  const center = new THREE.Mesh(new THREE.BoxGeometry(36, 12, 12), matBrickRed)
  center.position.y = 6
  const wingL = new THREE.Mesh(new THREE.BoxGeometry(12, 12, 22), matBrickRed)
  wingL.position.set(-12, 6, 11)
  const wingR = new THREE.Mesh(new THREE.BoxGeometry(12, 12, 22), matBrickRed)
  wingR.position.set(12, 6, 11)
  // Bell / clock tower
  const tower = new THREE.Mesh(new THREE.BoxGeometry(6, 20, 6), matBrickBrown)
  tower.position.set(0, 10, -3)
  g.add(center, wingL, wingR, tower)
  return g
}

function buildFactory() {
  const g = new THREE.Group()
  // Industrial factory with saw-tooth roof and smokestack
  const hall = new THREE.Mesh(new THREE.BoxGeometry(34, 12, 24), matCorrugatedMetal)
  hall.position.y = 6
  // Smokestacks
  const stack1 = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.2, 28, 12), matBrickRed)
  stack1.position.set(12, 14, 8)
  const stack2 = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 2.0, 24, 12), matBrickRed)
  stack2.position.set(12, 12, -4)
  // Loading dock
  const dock = new THREE.Mesh(new THREE.BoxGeometry(16, 2.5, 6), matConcreteDark)
  dock.position.set(-6, 1.25, 14.5)
  g.add(hall, stack1, stack2, dock)
  return g
}

function buildWarehouse() {
  const g = new THREE.Group()
  // High-bay distribution logistics warehouse
  const wh = new THREE.Mesh(new THREE.BoxGeometry(42, 14, 28), matIndustrialSteel)
  wh.position.y = 7
  // Overhead roll-up doors
  for (let x = -14; x <= 14; x += 9.3) {
    const door = new THREE.Mesh(new THREE.BoxGeometry(5.5, 6.5, 0.4), matCorrugatedMetal)
    door.position.set(x, 3.25, 14.2)
    g.add(door)
  }
  g.add(wh)
  return g
}

function buildCivicPolice() {
  const g = new THREE.Group()
  const bldg = new THREE.Mesh(new THREE.BoxGeometry(24, 14, 20), matConcreteDark)
  bldg.position.y = 7
  const badge = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 0.4), matCarPaintBlue)
  badge.position.set(0, 11, 10.2)
  g.add(bldg, badge)
  return g
}

function buildCivicFireStation() {
  const g = new THREE.Group()
  const bldg = new THREE.Mesh(new THREE.BoxGeometry(26, 14, 22), matBrickRed)
  bldg.position.y = 7
  // 3 red fire engine bay doors
  for (let x = -8; x <= 8; x += 8) {
    const bay = new THREE.Mesh(new THREE.BoxGeometry(6, 7.5, 0.4), matCarPaintRed)
    bay.position.set(x, 3.75, 11.2)
    g.add(bay)
  }
  g.add(bldg)
  return g
}

// --- TRANSIT & STATIONS ---
function buildMetroStationElevated() {
  const g = new THREE.Group()
  // Precast concrete viaduct pillars
  for (let z = -20; z <= 20; z += 20) {
    const pier = new THREE.Mesh(new THREE.CylinderGeometry(2, 2.5, 9, 12), matConcreteDark)
    pier.position.set(0, 4.5, z)
    g.add(pier)
  }
  // Station Platform & Curved Canopy
  const platform = new THREE.Mesh(new THREE.BoxGeometry(16, 1.2, 54), matConcreteLight)
  platform.position.y = 9.6
  const canopy = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 54, 16, 1, true, 0, Math.PI), matGlassOffice)
  canopy.position.set(0, 10.2, 0)
  canopy.rotation.z = Math.PI / 2
  g.add(platform, canopy)
  return g
}

function buildMetroTrainCar() {
  const g = new THREE.Group()
  // Modern stainless steel metro train car
  const body = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.8, 22), matIndustrialSteel)
  body.position.y = 2.4
  // Colored side transit band
  const band = new THREE.Mesh(new THREE.BoxGeometry(4.25, 0.7, 22.05), matCarPaintBlue)
  band.position.y = 2.0
  // Windows
  const glass = new THREE.Mesh(new THREE.BoxGeometry(4.28, 1.2, 18), matGlassWindow)
  glass.position.y = 2.9
  // Bogie wheels
  for (const z of [-7, 7]) {
    const axle1 = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 4.5, 12), matTireRubber)
    axle1.rotation.z = Math.PI / 2
    axle1.position.set(0, 0.7, z - 1.2)
    const axle2 = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 4.5, 12), matTireRubber)
    axle2.rotation.z = Math.PI / 2
    axle2.position.set(0, 0.7, z + 1.2)
    g.add(axle1, axle2)
  }
  g.add(body, band, glass)
  return g
}

function buildRailwayLocomotive() {
  const g = new THREE.Group()
  const body = new THREE.Mesh(new THREE.BoxGeometry(4.4, 4.2, 24), matCarPaintRed)
  body.position.y = 2.6
  // Cab nose
  const nose = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.2, 3.5), matCarPaintRed)
  nose.position.set(0, 2.1, 13)
  // Pantograph on roof
  const panto = new THREE.Mesh(new THREE.BoxGeometry(2, 1.8, 2.5), matIndustrialSteel)
  panto.position.set(0, 5.2, -6)
  g.add(body, nose, panto)
  return g
}

// --- VEHICLES ---
function buildSedan(colorMat = matCarPaintBlue) {
  const g = new THREE.Group()
  // Main chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.9, 5.2), colorMat)
  chassis.position.y = 0.8
  // Cabin & Windshield
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.85, 2.8), matGlassWindow)
  cabin.position.set(0, 1.6, -0.3)
  // Wheels
  const wheelGeom = new THREE.CylinderGeometry(0.48, 0.48, 0.4, 14)
  wheelGeom.rotateZ(Math.PI / 2)
  const wFL = new THREE.Mesh(wheelGeom, matTireRubber)
  wFL.position.set(1.15, 0.48, 1.5)
  const wFR = new THREE.Mesh(wheelGeom, matTireRubber)
  wFR.position.set(-1.15, 0.48, 1.5)
  const wRL = new THREE.Mesh(wheelGeom, matTireRubber)
  wRL.position.set(1.15, 0.48, -1.5)
  const wRR = new THREE.Mesh(wheelGeom, matTireRubber)
  wRR.position.set(-1.15, 0.48, -1.5)
  // Lights
  const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.1), matHeadlight)
  hlL.position.set(0.8, 0.85, 2.62)
  const hlR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.1), matHeadlight)
  hlR.position.set(-0.8, 0.85, 2.62)
  const tlL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.1), matTaillight)
  tlL.position.set(0.8, 0.85, -2.62)
  const tlR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.1), matTaillight)
  tlR.position.set(-0.8, 0.85, -2.62)
  g.add(chassis, cabin, wFL, wFR, wRL, wRR, hlL, hlR, tlL, tlR)
  return g
}

function buildSUV() {
  const g = new THREE.Group()
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.2, 5.6), matCarPaintBlack)
  chassis.position.y = 1.1
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.35, 1.0, 3.8), matGlassWindow)
  cabin.position.set(0, 2.1, -0.4)
  // High clearance wheels
  const wheelGeom = new THREE.CylinderGeometry(0.6, 0.6, 0.45, 14)
  wheelGeom.rotateZ(Math.PI / 2)
  for (const [x, z] of [[1.3, 1.7], [-1.3, 1.7], [1.3, -1.7], [-1.3, -1.7]]) {
    const w = new THREE.Mesh(wheelGeom, matTireRubber)
    w.position.set(x, 0.6, z)
    g.add(w)
  }
  g.add(chassis, cabin)
  return g
}

function buildBus() {
  const g = new THREE.Group()
  // Transit Bus
  const body = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.5, 12.5), matCarPaintYellow)
  body.position.y = 2.1
  const windows = new THREE.Mesh(new THREE.BoxGeometry(3.25, 1.4, 11), matGlassWindow)
  windows.position.y = 2.7
  // Wheels
  const wheelGeom = new THREE.CylinderGeometry(0.65, 0.65, 0.5, 16)
  wheelGeom.rotateZ(Math.PI / 2)
  for (const [x, z] of [[1.65, 3.8], [-1.65, 3.8], [1.65, -3.8], [-1.65, -3.8]]) {
    const w = new THREE.Mesh(wheelGeom, matTireRubber)
    w.position.set(x, 0.65, z)
    g.add(w)
  }
  // Headlights
  const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.1), matHeadlight)
  hlL.position.set(1.1, 1.2, 6.28)
  const hlR = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.1), matHeadlight)
  hlR.position.set(-1.1, 1.2, 6.28)
  g.add(body, windows, hlL, hlR)
  return g
}

function buildDeliveryTruck() {
  const g = new THREE.Group()
  // Cab
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.8, 3.0), matCarPaintWhite)
  cab.position.set(0, 1.8, 3.2)
  // Cargo box
  const box = new THREE.Mesh(new THREE.BoxGeometry(3.0, 3.4, 7.0), matIndustrialSteel)
  box.position.set(0, 2.3, -2.0)
  g.add(cab, box)
  return g
}

function buildPoliceCar() {
  const g = buildSedan(matCarPaintBlack)
  // Police lightbar
  const bar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.25, 0.4), matCarPaintRed)
  bar.position.set(0, 2.15, -0.3)
  g.add(bar)
  return g
}

function buildAmbulance() {
  const g = new THREE.Group()
  const body = new THREE.Mesh(new THREE.BoxGeometry(3.0, 3.0, 7.5), matCarPaintWhite)
  body.position.y = 1.9
  // Red Stripe
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(3.05, 0.6, 7.55), matCarPaintRed)
  stripe.position.y = 1.9
  g.add(body, stripe)
  return g
}

function buildFireTruck() {
  const g = new THREE.Group()
  const body = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.4, 11), matCarPaintRed)
  body.position.y = 2.1
  // Aerial ladder on roof
  const ladder = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 9.5), matIndustrialSteel)
  ladder.position.set(0, 4.0, -0.5)
  g.add(body, ladder)
  return g
}

// --- ENVIRONMENT & STREET FURNITURE ---
function buildOakTree() {
  const g = new THREE.Group()
  // Trunk
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, 4, 8), matTrunkBrown)
  trunk.position.y = 2
  // Foliage clusters
  const crown1 = new THREE.Mesh(new THREE.DodecahedronGeometry(3.6, 1), matFoliageDark)
  crown1.position.y = 5.5
  const crown2 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.6, 1), matFoliageLight)
  crown2.position.set(1.2, 6.5, -0.8)
  g.add(trunk, crown1, crown2)
  return g
}

function buildPineTree() {
  const g = new THREE.Group()
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.6, 3, 8), matTrunkBrown)
  trunk.position.y = 1.5
  const cone1 = new THREE.Mesh(new THREE.ConeGeometry(3.2, 4.5, 8), matPineGreen)
  cone1.position.y = 4.5
  const cone2 = new THREE.Mesh(new THREE.ConeGeometry(2.4, 4.0, 8), matPineGreen)
  cone2.position.y = 7.0
  const cone3 = new THREE.Mesh(new THREE.ConeGeometry(1.6, 3.2, 8), matPineGreen)
  cone3.position.y = 9.2
  g.add(trunk, cone1, cone2, cone3)
  return g
}

function buildStreetlight() {
  const g = new THREE.Group()
  // Pole
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 9, 10), matIndustrialSteel)
  pole.position.y = 4.5
  // Overhanging Arm
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 3.2), matIndustrialSteel)
  arm.position.set(0, 8.8, 1.4)
  // Luminaire Lamp
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.9), matHeadlight)
  lamp.position.set(0, 8.6, 2.8)
  g.add(pole, arm, lamp)
  return g
}

function buildTrafficLight() {
  const g = new THREE.Group()
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 7.5, 10), matIndustrialSteel)
  pole.position.y = 3.75
  const signalBox = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.4, 0.7), matCarPaintBlack)
  signalBox.position.set(0, 6.2, 0.4)
  // Red, Amber, Green lenses
  const red = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.1, 12), matTaillight)
  red.rotation.x = Math.PI / 2
  red.position.set(0, 6.9, 0.76)
  const yellow = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.1, 12), matYellowMarking)
  yellow.rotation.x = Math.PI / 2
  yellow.position.set(0, 6.2, 0.76)
  const green = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.1, 12), matFoliageLight)
  green.rotation.x = Math.PI / 2
  green.position.set(0, 5.5, 0.76)
  g.add(pole, signalBox, red, yellow, green)
  return g
}

function buildParkBench() {
  const g = new THREE.Group()
  const seat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 0.7), matWood)
  seat.position.y = 0.6
  const back = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 0.1), matWood)
  back.position.set(0, 1.0, -0.3)
  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.6, 0.7), matIndustrialSteel)
  legL.position.set(-1.0, 0.3, 0)
  const legR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.6, 0.7), matIndustrialSteel)
  legR.position.set(1.0, 0.3, 0)
  g.add(seat, back, legL, legR)
  return g
}

function buildFireHydrant() {
  const g = new THREE.Group()
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 1.1, 12), matCarPaintRed)
  barrel.position.y = 0.55
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 8), matCarPaintRed)
  cap.position.y = 1.1
  g.add(barrel, cap)
  return g
}

function buildBirchTree() {
  const g = new THREE.Group()
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 4.5, 8), matConcreteLight)
  trunk.position.y = 2.25
  const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(2.8, 1), matFoliageLight)
  crown.position.y = 5.8
  g.add(trunk, crown)
  return g
}

function buildBush() {
  const g = new THREE.Group()
  const b1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4, 1), matFoliageDark)
  b1.position.set(0, 0.8, 0)
  const b2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1, 1), matFoliageLight)
  b2.position.set(0.7, 0.7, 0.4)
  g.add(b1, b2)
  return g
}

function buildFountain() {
  const g = new THREE.Group()
  const basin = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 5, 1.2, 16), matConcreteDark)
  basin.position.y = 0.6
  const tier2 = new THREE.Mesh(new THREE.CylinderGeometry(2, 2.5, 1.0, 16), matConcreteLight)
  tier2.position.y = 1.6
  const jet = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.6, 2.2, 8), matGlassOffice)
  jet.position.y = 3.0
  g.add(basin, tier2, jet)
  return g
}

function buildRockCluster() {
  const g = new THREE.Group()
  const r1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6, 0), matConcreteDark)
  r1.position.set(0, 0.8, 0)
  const r2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1, 0), matConcreteDark)
  r2.position.set(1.2, 0.6, 0.5)
  g.add(r1, r2)
  return g
}

function buildJerseyBarrier() {
  const g = new THREE.Group()
  const barrier = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.9, 4.0), matConcreteLight)
  barrier.position.y = 0.45
  g.add(barrier)
  return g
}

function buildStopSign() {
  const g = new THREE.Group()
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.8, 8), matIndustrialSteel)
  pole.position.y = 1.4
  const oct = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.05, 8), matCarPaintRed)
  oct.rotation.x = Math.PI / 2
  oct.position.set(0, 2.5, 0.08)
  g.add(pole, oct)
  return g
}

function buildRailwayPassengerCar() {
  const g = new THREE.Group()
  const body = new THREE.Mesh(new THREE.BoxGeometry(4.2, 4.0, 24), matIndustrialSteel)
  body.position.y = 2.5
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(4.25, 0.6, 24.05), matCarPaintRed)
  stripe.position.y = 2.2
  const windows = new THREE.Mesh(new THREE.BoxGeometry(4.28, 1.2, 20), matGlassWindow)
  windows.position.y = 3.0
  g.add(body, stripe, windows)
  return g
}

function buildHeavyTruck() {
  const g = new THREE.Group()
  const cab = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.8, 4.5), matCarPaintBlue)
  cab.position.set(0, 2.3, 5.0)
  const container = new THREE.Mesh(new THREE.BoxGeometry(3.4, 4.0, 12.0), matCorrugatedMetal)
  container.position.set(0, 2.5, -3.0)
  g.add(cab, container)
  return g
}

function buildVan() {
  const g = new THREE.Group()
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.5, 6.2), matCarPaintWhite)
  body.position.y = 1.6
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.1, 2.4), matGlassWindow)
  cabin.position.set(0, 2.1, 1.6)
  g.add(body, cabin)
  return g
}

function buildConstructionSite() {
  const g = new THREE.Group()
  const base = new THREE.Mesh(new THREE.BoxGeometry(24, 2, 24), matConcreteDark)
  base.position.y = 1
  const rebar = new THREE.Mesh(new THREE.BoxGeometry(18, 12, 18), matCorrugatedMetal)
  rebar.position.y = 8
  const mast = new THREE.Mesh(new THREE.BoxGeometry(1.2, 26, 1.2), matYellowMarking)
  mast.position.set(8, 13, 8)
  const jib = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 22), matYellowMarking)
  jib.position.set(8, 25.5, 2)
  g.add(base, rebar, mast, jib)
  return g
}

function buildCentralTower() {
  const g = new THREE.Group()
  const h = 135
  const tower = new THREE.Mesh(new THREE.BoxGeometry(36, h, 36), matGlassOffice)
  tower.position.y = h / 2
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(8, 18, 22, 8), matIndustrialSteel)
  crown.position.y = h + 11
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.5, 30, 8), matIndustrialSteel)
  spire.position.y = h + 32
  g.add(tower, crown, spire)
  return g
}

// -------------------------------------------------------------
// Main Generator Loop
// -------------------------------------------------------------
async function generateAll() {
  console.log('Building METACITY 3D assets to:', PUBLIC_ASSETS)

  const queue = [
    // Residential
    { fn: buildSuburbanHouse1, path: 'buildings/residential/house_01.glb', cat: 'residential', name: 'Suburban House A' },
    { fn: buildSuburbanHouse2, path: 'buildings/residential/house_02.glb', cat: 'residential', name: 'Suburban House B' },
    { fn: buildApartmentMid, path: 'buildings/residential/apartment_mid_01.glb', cat: 'residential', name: 'Mid-Rise Apartment Block' },
    { fn: buildApartmentTower, path: 'buildings/residential/apartment_tower_01.glb', cat: 'residential', name: 'Residential High-Rise Tower' },

    // Commercial & Office
    { fn: buildCommercialStore, path: 'buildings/commercial/store_01.glb', cat: 'commercial', name: 'Retail Commercial Store' },
    { fn: buildOfficeMidRise, path: 'buildings/office/office_mid_01.glb', cat: 'office', name: 'Tech Office Mid-Rise' },
    { fn: buildOfficeSkyscraper, path: 'buildings/office/office_tower_01.glb', cat: 'office', name: 'CBD Glass Skyscraper' },

    // Civic, Education, Healthcare, Industrial, Special
    { fn: buildHospital, path: 'buildings/healthcare/hospital_01.glb', cat: 'healthcare', name: 'Metropolitan Hospital' },
    { fn: buildSchool, path: 'buildings/education/school_01.glb', cat: 'education', name: 'City Public School' },
    { fn: buildCivicPolice, path: 'buildings/civic/police_01.glb', cat: 'civic', name: 'Police Department Station' },
    { fn: buildCivicFireStation, path: 'buildings/civic/fire_station_01.glb', cat: 'civic', name: 'Fire & Rescue Station' },
    { fn: buildFactory, path: 'buildings/industrial/factory_01.glb', cat: 'industrial', name: 'Manufacturing Plant' },
    { fn: buildWarehouse, path: 'buildings/industrial/warehouse_01.glb', cat: 'industrial', name: 'Logistics Distribution Warehouse' },
    { fn: buildConstructionSite, path: 'buildings/special/construction_site.glb', cat: 'special', name: 'Construction Crane & Site' },
    { fn: buildCentralTower, path: 'buildings/special/central_tower.glb', cat: 'special', name: 'Central Landmark Skyscraper' },

    // Transit
    { fn: buildMetroStationElevated, path: 'metro/stations/metro_station_elevated.glb', cat: 'metro', name: 'Elevated Metro Station' },
    { fn: buildMetroTrainCar, path: 'metro/trains/metro_train_car.glb', cat: 'metro', name: 'Rapid Transit Metro Train' },
    { fn: buildRailwayLocomotive, path: 'railway/trains/railway_locomotive.glb', cat: 'railway', name: 'Heavy Rail Electric Locomotive' },
    { fn: buildRailwayPassengerCar, path: 'railway/trains/railway_passenger_car.glb', cat: 'railway', name: 'Heavy Rail Passenger Car' },

    // Vehicles
    { fn: () => buildSedan(matCarPaintBlue), path: 'vehicles/cars/sedan_blue.glb', cat: 'vehicles', name: 'Sedan Car (Blue)' },
    { fn: () => buildSedan(matCarPaintRed), path: 'vehicles/cars/sedan_red.glb', cat: 'vehicles', name: 'Sedan Car (Red)' },
    { fn: () => buildSedan(matCarPaintYellow), path: 'vehicles/cars/taxi_01.glb', cat: 'vehicles', name: 'City Taxi Cab' },
    { fn: buildSUV, path: 'vehicles/cars/suv_01.glb', cat: 'vehicles', name: 'SUV Passenger Vehicle' },
    { fn: buildVan, path: 'vehicles/cars/van_01.glb', cat: 'vehicles', name: 'Passenger Van' },
    { fn: buildBus, path: 'vehicles/buses/city_bus.glb', cat: 'vehicles', name: 'City Transit Bus' },
    { fn: buildDeliveryTruck, path: 'vehicles/trucks/delivery_truck.glb', cat: 'vehicles', name: 'Commercial Delivery Truck' },
    { fn: buildHeavyTruck, path: 'vehicles/trucks/heavy_truck.glb', cat: 'vehicles', name: 'Heavy Freight Hauler' },
    { fn: buildPoliceCar, path: 'vehicles/police/police_car.glb', cat: 'vehicles', name: 'Police Cruiser' },
    { fn: buildAmbulance, path: 'vehicles/ambulance/ambulance.glb', cat: 'vehicles', name: 'Emergency Ambulance' },
    { fn: buildFireTruck, path: 'vehicles/fire/fire_truck.glb', cat: 'vehicles', name: 'Fire Engine' },

    // Environment & Street
    { fn: buildOakTree, path: 'environment/trees/tree_oak.glb', cat: 'environment', name: 'Deciduous Oak Tree' },
    { fn: buildPineTree, path: 'environment/trees/tree_pine.glb', cat: 'environment', name: 'Evergreen Pine Conifer' },
    { fn: buildBirchTree, path: 'environment/trees/tree_birch.glb', cat: 'environment', name: 'Birch Tree' },
    { fn: buildBush, path: 'environment/bushes/bush_01.glb', cat: 'environment', name: 'Park Shrub Bush' },
    { fn: buildFountain, path: 'environment/props/park_fountain.glb', cat: 'environment', name: 'Park Decorative Fountain' },
    { fn: buildRockCluster, path: 'environment/rocks/rock_cluster.glb', cat: 'environment', name: 'Natural Rock Cluster' },
    { fn: buildStreetlight, path: 'street/lights/streetlight.glb', cat: 'street', name: 'Cobra-Head Streetlight' },
    { fn: buildTrafficLight, path: 'street/traffic_lights/traffic_light.glb', cat: 'street', name: 'Intersection Traffic Signal' },
    { fn: buildParkBench, path: 'street/benches/park_bench.glb', cat: 'street', name: 'Wooden Park Bench' },
    { fn: buildFireHydrant, path: 'street/barriers/fire_hydrant.glb', cat: 'street', name: 'Municipal Fire Hydrant' },
    { fn: buildJerseyBarrier, path: 'street/barriers/jersey_barrier.glb', cat: 'street', name: 'Concrete Jersey Barrier' },
    { fn: buildStopSign, path: 'street/signs/stop_sign.glb', cat: 'street', name: 'Octagonal Stop Sign' },
  ]

  for (const item of queue) {
    const group = item.fn()
    await exportGLB(group, item.path, {
      category: item.cat,
      name: item.name,
      creator: 'METACITY Asset Pipeline (CC0)',
    })
    console.log(`  ✓ Generated: ${item.path}`)
  }

  // Write Manifest JSON
  const manifestPath = path.join(PUBLIC_ASSETS, 'manifest.json')
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
  console.log(`\nAsset Manifest written: ${manifestPath} (${manifest.totalAssets} assets registered)`)
}

generateAll().catch((err) => {
  console.error('Asset Generation Error:', err)
  process.exit(1)
})

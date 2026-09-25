import * as THREE from 'three'
import type { District } from '../../../types/city'

/**
 * Realistic Zoned Ground System
 * Replaces flat single-color plane with district-specific ground textures and colors:
 * - CBD: Urban concrete paving & granite plaza tones
 * - Residential: Manicured green lawns & parkland
 * - Industrial: Heavy weathered tarmac & compacted gravel
 * - Developing: Earthy dirt & construction grading
 * - Rural: Natural meadow grasses
 */

export const groundMaterials = {
  cbd: new THREE.MeshStandardMaterial({
    color: '#4B5563', // Urban concrete paver grey
    roughness: 0.85,
    metalness: 0.1,
  }),
  residential: new THREE.MeshStandardMaterial({
    color: '#3B6E32', // Lush parkland green
    roughness: 0.9,
    metalness: 0.05,
  }),
  industrial: new THREE.MeshStandardMaterial({
    color: '#374151', // Dark asphalt / industrial gravel
    roughness: 0.92,
    metalness: 0.15,
  }),
  developing: new THREE.MeshStandardMaterial({
    color: '#8D6E63', // Dirt / soil / cleared construction ground
    roughness: 0.95,
    metalness: 0.02,
  }),
  rural: new THREE.MeshStandardMaterial({
    color: '#556B2F', // Olive / wild meadow
    roughness: 0.9,
    metalness: 0.05,
  }),
  default: new THREE.MeshStandardMaterial({
    color: '#2E4C23',
    roughness: 0.9,
    metalness: 0.05,
  }),
}

export function getGroundMaterialForDistrict(type: string): THREE.MeshStandardMaterial {
  const t = type.toLowerCase()
  if (t.includes('cbd') || t.includes('tech')) return groundMaterials.cbd
  if (t.includes('residential') || t.includes('suburban') || t.includes('education')) return groundMaterials.residential
  if (t.includes('industrial') || t.includes('transport')) return groundMaterials.industrial
  if (t.includes('developing')) return groundMaterials.developing
  if (t.includes('rural')) return groundMaterials.rural
  return groundMaterials.default
}

/**
 * Creates individual district ground plates with subtle height and border bevel
 */
export function createDistrictGroundPlates(districts: District[]): THREE.Group {
  const group = new THREE.Group()

  districts.forEach((d) => {
    const [xMin, zMin, xMax, zMax] = d.bounds
    const w = xMax - xMin
    const l = zMax - zMin
    const cx = (xMin + xMax) / 2
    const cz = (zMin + zMax) / 2

    const mat = getGroundMaterialForDistrict(d.type)

    const plate = new THREE.Mesh(
      new THREE.BoxGeometry(w - 4, 0.2, l - 4),
      mat
    )
    plate.position.set(cx, -0.05, cz)
    group.add(plate)
  })

  return group
}

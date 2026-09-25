/**
 * METACITY — GLTF Asset Cache & Loader
 * High-performance shared caching layer for Three.js GLB assets.
 * Ensures zero redundant network fetches and zero WebGL crashes.
 */

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { logMissingAsset } from './AssetRegistry'

const loader = new GLTFLoader()

// In-memory cache of loaded GLTF scenes and geometries
const sceneCache: Map<string, THREE.Group> = new Map()
const promiseCache: Map<string, Promise<THREE.Group>> = new Map()

// Fallback geometry and material
const fallbackGeometry = new THREE.BoxGeometry(10, 15, 10)
const fallbackMaterial = new THREE.MeshStandardMaterial({
  color: 0x90a4ae,
  roughness: 0.8,
  metalness: 0.1,
})

/**
 * Loads a GLB model from path and caches the resulting THREE.Group
 */
export async function loadGLTFModel(url: string, category: string = 'general', objectId?: string): Promise<THREE.Group> {
  if (sceneCache.has(url)) {
    return sceneCache.get(url)!.clone()
  }

  if (promiseCache.has(url)) {
    const loaded = await promiseCache.get(url)!
    return loaded.clone()
  }

  const loadPromise = new Promise<THREE.Group>((resolve) => {
    loader.load(
      url,
      (gltf) => {
        const group = gltf.scene || new THREE.Group()
        // Ensure shadows and proper material setup
        group.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })
        sceneCache.set(url, group)
        resolve(group)
      },
      undefined,
      (err) => {
        logMissingAsset(url, category, objectId)
        // Graceful fallback group
        const fallback = new THREE.Group()
        const mesh = new THREE.Mesh(fallbackGeometry, fallbackMaterial)
        mesh.position.y = 7.5
        fallback.add(mesh)
        sceneCache.set(url, fallback)
        resolve(fallback)
      }
    )
  })

  promiseCache.set(url, loadPromise)
  const result = await loadPromise
  return result.clone()
}

/**
 * Synchronous get for cached models (returns undefined if not yet loaded)
 */
export function getCachedModelSync(url: string): THREE.Group | undefined {
  const cached = sceneCache.get(url)
  return cached ? cached.clone() : undefined
}

/**
 * Preload high-priority city assets
 */
export function preloadCoreAssets(): void {
  const corePaths = [
    '/assets/buildings/residential/house_01.glb',
    '/assets/buildings/residential/apartment_mid_01.glb',
    '/assets/buildings/residential/apartment_tower_01.glb',
    '/assets/buildings/office/office_mid_01.glb',
    '/assets/buildings/office/office_tower_01.glb',
    '/assets/buildings/commercial/store_01.glb',
    '/assets/buildings/healthcare/hospital_01.glb',
    '/assets/buildings/education/school_01.glb',
    '/assets/buildings/industrial/factory_01.glb',
    '/assets/buildings/industrial/warehouse_01.glb',
    '/assets/environment/trees/tree_oak.glb',
    '/assets/environment/trees/tree_pine.glb',
    '/assets/street/lights/streetlight.glb',
    '/assets/street/traffic_lights/traffic_light.glb',
    '/assets/vehicles/cars/sedan_blue.glb',
    '/assets/vehicles/buses/city_bus.glb',
  ]

  corePaths.forEach((p) => {
    loadGLTFModel(p).catch(() => {})
  })
}

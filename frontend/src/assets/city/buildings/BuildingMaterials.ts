import * as THREE from 'three'

/**
 * Procedural PBR Texture Atlases & Materials for Buildings
 * Provides realistic brick, concrete, glass curtain-wall, corrugated metal, and day/night illuminated windows.
 */

// Procedural Canvas Texture Cache to prevent memory leaks and redundant GPU uploads
const textureCache: Record<string, THREE.CanvasTexture> = {}

function createProceduralTexture(
  key: string,
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D) => void
): THREE.CanvasTexture {
  if (textureCache[key]) return textureCache[key]

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (ctx) {
    draw(ctx)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  textureCache[key] = texture
  return texture
}

/**
 * Window Facade Texture: Generates a realistic grid of office/apartment windows.
 * At night, a subset of windows are illuminated with warm incandescent or cool white fluorescent light.
 */
export function getWindowFacadeTexture(isNight: boolean, density: number = 8): THREE.CanvasTexture {
  const key = `window_facade_${isNight ? 'night' : 'day'}_${density}`
  return createProceduralTexture(key, 256, 256, (ctx) => {
    // Concrete / Metal facade base
    ctx.fillStyle = '#1A1D20'
    ctx.fillRect(0, 0, 256, 256)

    const cols = density
    const rows = density
    const w = 256 / cols
    const h = 256 / rows
    const padX = w * 0.18
    const padY = h * 0.18

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * w + padX
        const y = r * h + padY
        const winW = w - padX * 2
        const winH = h - padY * 2

        // Dark window frame
        ctx.fillStyle = '#0F1113'
        ctx.fillRect(x - 1, y - 1, winW + 2, winH + 2)

        if (isNight) {
          // Night illumination: ~55% of windows randomly turned on
          const hash = Math.sin(r * 12.9898 + c * 78.233) * 43758.5453
          const rand = hash - Math.floor(hash)
          if (rand > 0.45) {
            // Warm interior incandescent or cool office light
            ctx.fillStyle = rand > 0.8 ? '#FFF2B2' : (rand > 0.65 ? '#FFCC80' : '#FFE082')
            ctx.fillRect(x, y, winW, winH)
            // Interior blind / curtain shadow
            if (rand > 0.75) {
              ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
              ctx.fillRect(x, y, winW, winH * 0.4)
            }
          } else {
            // Dark window reflection
            ctx.fillStyle = '#0B131A'
            ctx.fillRect(x, y, winW, winH)
          }
        } else {
          // Daytime glass reflection gradient
          const grad = ctx.createLinearGradient(x, y, x + winW, y + winH)
          grad.addColorStop(0, '#537895')
          grad.addColorStop(0.5, '#2D4456')
          grad.addColorStop(1, '#1A2934')
          ctx.fillStyle = grad
          ctx.fillRect(x, y, winW, winH)
        }
      }
    }
  })
}

/**
 * Brick Texture: Procedural running bond brick pattern for medium-density residential & historic zones.
 */
export function getBrickTexture(): THREE.CanvasTexture {
  return createProceduralTexture('brick_pattern', 256, 256, (ctx) => {
    // Mortar
    ctx.fillStyle = '#B0A89C'
    ctx.fillRect(0, 0, 256, 256)

    const brickH = 16
    const brickW = 32
    for (let y = 0; y < 256; y += brickH) {
      const isOffset = (y / brickH) % 2 === 1
      const offsetX = isOffset ? brickW / 2 : 0
      for (let x = -brickW; x < 256 + brickW; x += brickW) {
        // Subtle brick color variation
        const shade = Math.floor(130 + Math.random() * 40)
        ctx.fillStyle = `rgb(${shade + 30}, ${Math.floor(shade * 0.5)}, ${Math.floor(shade * 0.4)})`
        ctx.fillRect(x + offsetX + 1, y + 1, brickW - 2, brickH - 2)
      }
    }
  })
}

/**
 * Concrete Panel Texture: Prefab concrete joints with subtle weathering.
 */
export function getConcreteTexture(): THREE.CanvasTexture {
  return createProceduralTexture('concrete_panel', 256, 256, (ctx) => {
    ctx.fillStyle = '#8C9298'
    ctx.fillRect(0, 0, 256, 256)

    // Subtle noise
    for (let i = 0; i < 600; i++) {
      const nx = Math.random() * 256
      const ny = Math.random() * 256
      const col = Math.random() > 0.5 ? 160 : 110
      ctx.fillStyle = `rgba(${col}, ${col}, ${col}, 0.15)`
      ctx.fillRect(nx, ny, 2, 2)
    }

    // Expansion joint seams
    ctx.strokeStyle = '#5A5F64'
    ctx.lineWidth = 2
    ctx.strokeRect(4, 4, 124, 124)
    ctx.strokeRect(132, 4, 120, 124)
    ctx.strokeRect(4, 132, 124, 120)
    ctx.strokeRect(132, 132, 120, 120)
  })
}

/**
 * Corrugated Metal Texture: Used for industrial warehouses and factory roofing.
 */
export function getCorrugatedMetalTexture(): THREE.CanvasTexture {
  return createProceduralTexture('corrugated_metal', 128, 128, (ctx) => {
    ctx.fillStyle = '#607D8B'
    ctx.fillRect(0, 0, 128, 128)

    const stripeW = 8
    for (let x = 0; x < 128; x += stripeW) {
      const grad = ctx.createLinearGradient(x, 0, x + stripeW, 0)
      grad.addColorStop(0, '#78909C')
      grad.addColorStop(0.5, '#455A64')
      grad.addColorStop(1, '#37474F')
      ctx.fillStyle = grad
      ctx.fillRect(x, 0, stripeW, 128)
    }
  })
}

/**
 * Material Catalog
 */
export function getBuildingMaterials(isNight: boolean) {
  const windowTex = getWindowFacadeTexture(isNight, 8)
  const brickTex = getBrickTexture()
  const concreteTex = getConcreteTexture()
  const metalTex = getCorrugatedMetalTexture()

  return {
    // Glass & Modern Office Curtains
    glassOffice: new THREE.MeshStandardMaterial({
      map: windowTex,
      color: isNight ? '#222831' : '#394E5E',
      roughness: 0.08,
      metalness: 0.92,
      emissive: isNight ? new THREE.Color('#FFE082') : new THREE.Color('#000000'),
      emissiveIntensity: isNight ? 0.6 : 0.0,
    }),

    // High-rise Residential
    residentialHigh: new THREE.MeshStandardMaterial({
      map: windowTex,
      color: '#E0E0E0',
      roughness: 0.6,
      metalness: 0.2,
      emissive: isNight ? new THREE.Color('#FFD54F') : new THREE.Color('#000000'),
      emissiveIntensity: isNight ? 0.35 : 0.0,
    }),

    // Brick Mid-rise & Townhouses
    brick: new THREE.MeshStandardMaterial({
      map: brickTex,
      roughness: 0.85,
      metalness: 0.05,
    }),

    // Architectural Concrete
    concrete: new THREE.MeshStandardMaterial({
      map: concreteTex,
      color: '#CFD8DC',
      roughness: 0.75,
      metalness: 0.1,
    }),

    // Industrial Corrugated Steel
    industrialMetal: new THREE.MeshStandardMaterial({
      map: metalTex,
      roughness: 0.45,
      metalness: 0.75,
    }),

    // Modern Dark Trim / Window Frames / Roof Mechanicals
    darkTrim: new THREE.MeshStandardMaterial({
      color: '#263238',
      roughness: 0.5,
      metalness: 0.5,
    }),

    // Roof Gravel / Bitumen
    roofGravel: new THREE.MeshStandardMaterial({
      color: '#424242',
      roughness: 0.95,
      metalness: 0.05,
    }),

    // Construction Scaffold Yellow
    scaffoldYellow: new THREE.MeshStandardMaterial({
      color: '#FBC02D',
      roughness: 0.4,
      metalness: 0.6,
    }),

    // Red Brick / Spanish Tile Roofs for Suburban Houses
    roofTile: new THREE.MeshStandardMaterial({
      color: '#A04020',
      roughness: 0.7,
      metalness: 0.1,
    }),
  }
}

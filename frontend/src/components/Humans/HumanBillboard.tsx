import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { CitizenPosition } from '../../types/city'
import { hashString } from '../../assets/AssetRegistry'

// Cached procedural canvas textures to prevent regenerating textures on every render
const textureCache: Record<string, THREE.CanvasTexture> = {}

const SKIN_TONES = ['#F5D0A9', '#E0AC69', '#D2A078', '#C68642', '#8D5524']
const HAIR_COLORS = ['#1A1A1A', '#4A2E18', '#6D4C41', '#B55221', '#D4AC0D', '#ECEFF1']

function createDetailedHumanTexture(
  spriteType: string,
  frame: number,
  direction: 'front' | 'back' | 'side',
  citizenId: string
): THREE.CanvasTexture {
  const hash = hashString(citizenId)
  const skinColor = SKIN_TONES[hash % SKIN_TONES.length]
  const hairColor = HAIR_COLORS[(hash >> 2) % HAIR_COLORS.length]
  const key = `${spriteType}_${frame}_${direction}_${skinColor}_${hairColor}`

  if (textureCache[key]) return textureCache[key]

  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 96
  const ctx = canvas.getContext('2d')!

  ctx.clearRect(0, 0, 64, 96)

  // Color schemes per sprite category
  let topColor = '#1E88E5'
  let pantsColor = '#263238'
  let hatColor: string | null = null
  let accessory: string | null = null

  const st = (spriteType || 'professional').toLowerCase()

  if (st.includes('child')) {
    topColor = '#FF5722'
    pantsColor = '#00BCD4'
  } else if (st.includes('student')) {
    topColor = '#9C27B0'
    pantsColor = '#37474F'
    accessory = 'backpack'
  } else if (st.includes('industrial') || st.includes('factory')) {
    topColor = '#E65100' // High-vis dark orange
    pantsColor = '#1A237E' // Sturdy denim
    hatColor = '#FFD600' // Yellow hardhat
    accessory = 'toolbelt'
  } else if (st.includes('worker') || st.includes('construction')) {
    topColor = '#FF9800'
    pantsColor = '#37474F'
    hatColor = '#FFFFFF'
  } else if (st.includes('service')) {
    topColor = '#00897B' // Teal uniform / apron
    pantsColor = '#212121'
    hatColor = '#004D40'
  } else if (st.includes('business') || st.includes('owner')) {
    topColor = '#212121' // Premium black suit
    pantsColor = '#1A1A1A'
    accessory = 'briefcase'
  } else if (st.includes('elderly')) {
    topColor = '#78909C'
    pantsColor = '#455A64'
    accessory = 'cane'
  } else {
    // Professional
    topColor = '#1565C0' // Navy business attire
    pantsColor = '#102027'
    accessory = 'briefcase'
  }

  // Ground shadow ellipse
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'
  ctx.beginPath()
  ctx.ellipse(32, 90, 14, 5, 0, 0, Math.PI * 2)
  ctx.fill()

  // Leg animation cycle offset
  const legOffset = frame % 2 === 0 ? -5 : 5

  // Legs & Pants
  ctx.fillStyle = pantsColor
  ctx.fillRect(24 + (direction === 'side' ? legOffset : 0), 60, 6, 26)
  ctx.fillRect(34 - (direction === 'side' ? legOffset : 0), 60, 6, 26)

  // Shoes
  ctx.fillStyle = '#111'
  ctx.fillRect(23 + (direction === 'side' ? legOffset : 0), 84, 8, 5)
  ctx.fillRect(33 - (direction === 'side' ? legOffset : 0), 84, 8, 5)

  // Torso / Shirt / Suit
  ctx.fillStyle = topColor
  ctx.fillRect(22, 36, 20, 26)

  // High-vis reflective stripe for workers
  if (st.includes('worker') || st.includes('industrial')) {
    ctx.fillStyle = '#EEFF41'
    ctx.fillRect(22, 44, 20, 3)
    ctx.fillRect(22, 52, 20, 3)
  }

  // Toolbelt
  if (accessory === 'toolbelt') {
    ctx.fillStyle = '#5D4037'
    ctx.fillRect(21, 58, 22, 4)
  }

  // Arms
  ctx.fillStyle = topColor
  ctx.fillRect(17, 38, 5, 18)
  ctx.fillRect(42, 38, 5, 18)

  // Hands
  ctx.fillStyle = skinColor
  ctx.fillRect(17, 56, 5, 5)
  ctx.fillRect(42, 56, 5, 5)

  // Neck & Head
  ctx.fillStyle = skinColor
  ctx.fillRect(29, 30, 6, 6)
  ctx.beginPath()
  ctx.arc(32, 22, 10, 0, Math.PI * 2)
  ctx.fill()

  // Hair
  ctx.fillStyle = hairColor
  ctx.beginPath()
  ctx.arc(32, 18, 10, Math.PI, Math.PI * 2)
  ctx.fill()

  if (direction !== 'back') {
    // Eyes
    ctx.fillStyle = '#222'
    ctx.fillRect(29, 20, 2, 2)
    ctx.fillRect(33, 20, 2, 2)
  }

  // Hat / Hardhat
  if (hatColor) {
    ctx.fillStyle = hatColor
    ctx.fillRect(20, 10, 24, 7)
    ctx.fillRect(23, 6, 18, 5)
  }

  // Accessories (Briefcase / Cane / Backpack)
  if (accessory === 'briefcase') {
    ctx.fillStyle = '#5D4037'
    ctx.fillRect(45, 54, 8, 10)
  } else if (accessory === 'cane') {
    ctx.strokeStyle = '#8D6E63'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(45, 50)
    ctx.lineTo(47, 88)
    ctx.stroke()
  } else if (accessory === 'backpack' && direction === 'back') {
    ctx.fillStyle = '#D32F2F'
    ctx.fillRect(24, 40, 16, 18)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.magFilter = THREE.NearestFilter
  texture.minFilter = THREE.NearestFilter
  textureCache[key] = texture
  return texture
}

interface HumanBillboardProps {
  citizen: CitizenPosition
  isSelected: boolean
  onClick: (id: string) => void
}

export function HumanBillboard({ citizen, isSelected, onClick }: HumanBillboardProps) {
  const spriteRef = useRef<THREE.Sprite>(null)
  const animFrame = useRef(0)

  // Determine direction relative to movement
  const facing = citizen.facing ?? 0
  let direction: 'front' | 'back' | 'side' = 'front'
  if (Math.abs(facing) < 0.7) direction = 'front'
  else if (Math.abs(facing) > 2.3) direction = 'back'
  else direction = 'side'

  // Animate walking frames when moving
  useFrame(({ clock }) => {
    if (citizen.state === 'WALKING' || citizen.state === 'COMMUTING') {
      animFrame.current = Math.floor(clock.getElapsedTime() * 6) % 4
    } else {
      animFrame.current = 0
    }
  })

  const texture = useMemo(() => {
    return createDetailedHumanTexture(
      citizen.spriteType || 'professional',
      animFrame.current,
      direction,
      citizen.id
    )
  }, [citizen.spriteType, animFrame.current, direction, citizen.id])

  return (
    <group position={[citizen.x, 2.5, citizen.z]}>
      {/* Selection indicator ring on ground */}
      {isSelected && (
        <mesh position={[0, -2.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.5, 3.2, 24]} />
          <meshBasicMaterial color="#3B82F6" side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Human Billboard Sprite */}
      <sprite
        ref={spriteRef}
        scale={[4.5, 6.5, 1]}
        onClick={(e) => {
          e.stopPropagation()
          onClick(citizen.id)
        }}
      >
        <spriteMaterial map={texture} transparent alphaTest={0.1} />
      </sprite>
    </group>
  )
}

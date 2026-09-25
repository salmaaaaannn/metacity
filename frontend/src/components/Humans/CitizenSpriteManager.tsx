import React, { useMemo, useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSimulationStore, selectCitizens } from '../../store/simulationStore'

/**
 * Citizen state → color mapping
 * Encodes citizen FSM state as billboard color for instant visual recognition.
 */
const STATE_COLORS: Record<string, THREE.Color> = {
  AT_HOME: new THREE.Color('#4FC3F7'),       // Sky blue — resting
  SLEEPING: new THREE.Color('#1565C0'),       // Dark blue — sleeping
  COMMUTING: new THREE.Color('#FFB300'),     // Amber — on the move
  DRIVING: new THREE.Color('#FF8F00'),       // Orange — driving
  WORKING: new THREE.Color('#66BB6A'),       // Green — productive
  AT_WORK: new THREE.Color('#43A047'),       // Dark green — at workplace
  SHOPPING: new THREE.Color('#AB47BC'),      // Purple — commercial
  LEISURE: new THREE.Color('#26C6DA'),       // Cyan — recreation
  IN_TRANSIT: new THREE.Color('#FFA726'),    // Light orange — transit
  EVACUATING: new THREE.Color('#EF5350'),    // Red — emergency
  SHELTERING: new THREE.Color('#B71C1C'),    // Dark red — disaster shelter
  SICK: new THREE.Color('#8D6E63'),          // Brown — unwell
  DEFAULT: new THREE.Color('#90A4AE'),       // Grey — unknown
}

function getStateColor(state?: string): THREE.Color {
  if (!state) return STATE_COLORS.DEFAULT
  return STATE_COLORS[state.toUpperCase()] ?? STATE_COLORS.DEFAULT
}

// Shared geometry for all citizen sprites — small upright quad billboard
const CITIZEN_GEOMETRY = new THREE.PlaneGeometry(5, 8)
CITIZEN_GEOMETRY.translate(0, 4, 0)   // offset up so feet are at y=0

// Max simultaneous visible citizens
const MAX_CITIZENS = 2000

/**
 * CitizenSpriteManager — InstancedMesh batch renderer for all citizens.
 *
 * Performance strategy:
 * - Single InstancedMesh draw call for ALL citizens (2000+)
 * - Each instance position and color updated per-frame via matrix / color arrays
 * - Camera-distance culling keeps visible set within MAX_CITIZENS
 * - Selected citizen rendered as separate highlighted billboard (single mesh)
 */
export function CitizenSpriteManager() {
  const citizens = useSimulationStore(selectCitizens)
  const selectedCitizenId = useSimulationStore((s) => s.selectedCitizenId)
  const setSelectedCitizen = useSimulationStore((s) => s.setSelectedCitizen)
  const camera = useThree((s) => s.camera)

  const instancedRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Per-instance material with vertex colors
  const material = useMemo(() => new THREE.MeshBasicMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
  }), [])

  // Build culled visible citizen list sorted by camera distance
  const visibleCitizens = useMemo(() => {
    const camX = camera.position.x
    const camZ = camera.position.z
    const maxDistSq = 3500 * 3500

    const filtered = citizens.filter((c) => {
      if (c.id === selectedCitizenId) return false  // rendered separately
      const dx = c.x - camX
      const dz = c.z - camZ
      return dx * dx + dz * dz < maxDistSq
    })

    // Limit to MAX_CITIZENS for performance
    return filtered.slice(0, MAX_CITIZENS)
  }, [citizens, selectedCitizenId, camera.position.x, camera.position.z])

  const selectedCitizen = useMemo(
    () => citizens.find((c) => c.id === selectedCitizenId),
    [citizens, selectedCitizenId]
  )

  // Update instance matrices and colors every frame
  useFrame(({ camera: cam }) => {
    const mesh = instancedRef.current
    if (!mesh) return

    const count = visibleCitizens.length
    mesh.count = count

    for (let i = 0; i < count; i++) {
      const c = visibleCitizens[i]

      // Billboard: always face camera on Y axis
      dummy.position.set(c.x, 0, c.z)
      dummy.lookAt(cam.position.x, dummy.position.y, cam.position.z)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)

      // Set per-instance color
      const col = getStateColor(c.state)
      mesh.setColorAt(i, col)
    }

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  })

  return (
    <group name="citizen_layer">
      {/* Instanced citizen sprites */}
      <instancedMesh
        ref={instancedRef}
        args={[CITIZEN_GEOMETRY, material, MAX_CITIZENS]}
        frustumCulled={false}
        onClick={(e) => {
          // Find which instance was clicked
          if (e.instanceId !== undefined && visibleCitizens[e.instanceId]) {
            e.stopPropagation()
            setSelectedCitizen(visibleCitizens[e.instanceId].id)
          }
        }}
      />

      {/* Selected citizen: separate highlighted mesh */}
      {selectedCitizen && (
        <group position={[selectedCitizen.x, 0, selectedCitizen.z]}>
          {/* Highlight ring on ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}>
            <ringGeometry args={[4, 6, 20]} />
            <meshBasicMaterial color="#00E5FF" transparent opacity={0.8} side={THREE.DoubleSide} />
          </mesh>
          {/* Tall highlight sprite */}
          <mesh position={[0, 4, 0]}>
            <planeGeometry args={[6, 10]} />
            <meshBasicMaterial color="#00E5FF" transparent opacity={0.9} side={THREE.DoubleSide} />
          </mesh>
          {/* Point light for glow effect */}
          <pointLight color="#00E5FF" intensity={3} distance={40} />
        </group>
      )}
    </group>
  )
}

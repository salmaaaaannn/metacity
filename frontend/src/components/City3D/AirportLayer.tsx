import React, { useMemo } from 'react'
import * as THREE from 'three'

/**
 * AirportLayer
 * Procedural 3D airport complex at northeast edge of city (x:6000–7800, z:200–2200).
 *
 * Includes:
 * - Terminal building (wide low glass+concrete structure)
 * - Control tower (tall slim with glass cab)
 * - 2 Hangars (large arch-roof structures)
 * - Runway slabs (concrete with centerline markings)
 * - Taxiways
 * - Apron (aircraft parking area)
 * - 6 Parked aircraft (fuselage + wings)
 * - Parking lot grid
 */

// Shared materials
const RUNWAY_MATERIAL = new THREE.MeshStandardMaterial({
  color: '#2C2C2C',
  roughness: 0.95,
  metalness: 0.05,
})

const TAXIWAY_MATERIAL = new THREE.MeshStandardMaterial({
  color: '#3D3D3D',
  roughness: 0.9,
  metalness: 0.05,
})

const TERMINAL_BODY_MATERIAL = new THREE.MeshStandardMaterial({
  color: '#B0BEC5',
  roughness: 0.6,
  metalness: 0.15,
})

const TERMINAL_GLASS_MATERIAL = new THREE.MeshStandardMaterial({
  color: '#4FC3F7',
  roughness: 0.1,
  metalness: 0.8,
  transparent: true,
  opacity: 0.7,
})

const TOWER_MATERIAL = new THREE.MeshStandardMaterial({
  color: '#ECEFF1',
  roughness: 0.5,
  metalness: 0.2,
})

const HANGAR_MATERIAL = new THREE.MeshStandardMaterial({
  color: '#607D8B',
  roughness: 0.7,
  metalness: 0.35,
})

const AIRCRAFT_BODY_MATERIAL = new THREE.MeshStandardMaterial({
  color: '#E8EAF6',
  roughness: 0.3,
  metalness: 0.5,
})

const AIRCRAFT_WING_MATERIAL = new THREE.MeshStandardMaterial({
  color: '#CFD8DC',
  roughness: 0.35,
  metalness: 0.45,
})

const MARKING_MATERIAL = new THREE.MeshBasicMaterial({ color: '#FFFFFF' })
const YELLOW_MARKING = new THREE.MeshBasicMaterial({ color: '#FFD600' })

/**
 * Single parked aircraft — fuselage + swept wings + tail + engines
 */
function ParkedAircraft({ x, z, rotY = 0 }: { x: number; z: number; rotY?: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      {/* Fuselage */}
      <mesh material={AIRCRAFT_BODY_MATERIAL} position={[0, 4, 0]}>
        <cylinderGeometry args={[2.8, 2.8, 50, 12]} />
      </mesh>
      {/* Nose cone */}
      <mesh material={AIRCRAFT_BODY_MATERIAL} position={[0, 4, -26]}>
        <coneGeometry args={[2.8, 8, 12]} />
      </mesh>
      {/* Tail section */}
      <mesh material={AIRCRAFT_BODY_MATERIAL} position={[0, 4, 24]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[1.2, 2.8, 12, 8]} />
      </mesh>

      {/* Main wings (left + right) */}
      <mesh material={AIRCRAFT_WING_MATERIAL} position={[-22, 3, 2]}>
        <boxGeometry args={[40, 0.6, 14]} />
      </mesh>
      <mesh material={AIRCRAFT_WING_MATERIAL} position={[22, 3, 2]}>
        <boxGeometry args={[40, 0.6, 14]} />
      </mesh>

      {/* Vertical stabilizer */}
      <mesh material={AIRCRAFT_BODY_MATERIAL} position={[0, 12, 22]}>
        <boxGeometry args={[0.8, 14, 8]} />
      </mesh>
      {/* Horizontal stabilizers */}
      <mesh material={AIRCRAFT_WING_MATERIAL} position={[-8, 9, 22]}>
        <boxGeometry args={[15, 0.5, 6]} />
      </mesh>
      <mesh material={AIRCRAFT_WING_MATERIAL} position={[8, 9, 22]}>
        <boxGeometry args={[15, 0.5, 6]} />
      </mesh>

      {/* Engines (under wings) */}
      {[[-14, -4], [14, -4]].map(([ex, idx]) => (
        <mesh key={idx} material={HANGAR_MATERIAL} position={[ex, 1.5, 0]}>
          <cylinderGeometry args={[2, 2.2, 8, 10]} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * Terminal building with jetway piers
 */
function TerminalBuilding() {
  return (
    <group position={[7000, 0, 1200]}>
      {/* Main terminal hall */}
      <mesh material={TERMINAL_BODY_MATERIAL} position={[0, 10, 0]} castShadow receiveShadow>
        <boxGeometry args={[350, 20, 80]} />
      </mesh>
      {/* Glass curtain wall (front facade) */}
      <mesh material={TERMINAL_GLASS_MATERIAL} position={[0, 10, -41]}>
        <boxGeometry args={[340, 18, 2]} />
      </mesh>
      {/* Roof canopy overhang */}
      <mesh material={TERMINAL_BODY_MATERIAL} position={[0, 21, -55]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[350, 1.5, 30]} />
      </mesh>
      {/* Concourse wings (pier A and B) */}
      {[-120, 120].map((ox, i) => (
        <group key={i} position={[ox, 0, -60]}>
          <mesh material={TERMINAL_BODY_MATERIAL} position={[0, 8, -50]} castShadow receiveShadow>
            <boxGeometry args={[40, 16, 100]} />
          </mesh>
          {/* Jetway bridges */}
          {[-30, 0, 30].map((jz, j) => (
            <mesh key={j} material={TOWER_MATERIAL} position={[0, 5, -90 + jz]}>
              <boxGeometry args={[3, 6, 25]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

/**
 * Control tower: slim shaft + glass observation cab
 */
function ControlTower() {
  return (
    <group position={[7400, 0, 1000]}>
      {/* Shaft */}
      <mesh material={TOWER_MATERIAL} position={[0, 40, 0]} castShadow>
        <cylinderGeometry args={[4, 6, 80, 12]} />
      </mesh>
      {/* Observation cab (glass octagon) */}
      <mesh material={TERMINAL_GLASS_MATERIAL} position={[0, 83, 0]}>
        <cylinderGeometry args={[9, 7, 8, 8]} />
      </mesh>
      {/* Radar mast */}
      <mesh material={HANGAR_MATERIAL} position={[0, 92, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 12, 8]} />
      </mesh>
      {/* Radar dish */}
      <mesh material={HANGAR_MATERIAL} position={[0, 100, 0]}>
        <boxGeometry args={[8, 1, 5]} />
      </mesh>
    </group>
  )
}

/**
 * Hangar: wide arch-roof structure
 */
function Hangar({ x, z, width = 120, depth = 80 }: { x: number; z: number; width?: number; depth?: number }) {
  return (
    <group position={[x, 0, z]}>
      {/* Side walls */}
      <mesh material={HANGAR_MATERIAL} position={[-width / 2 + 4, 15, 0]} castShadow receiveShadow>
        <boxGeometry args={[8, 30, depth]} />
      </mesh>
      <mesh material={HANGAR_MATERIAL} position={[width / 2 - 4, 15, 0]} castShadow receiveShadow>
        <boxGeometry args={[8, 30, depth]} />
      </mesh>
      {/* Rear wall */}
      <mesh material={HANGAR_MATERIAL} position={[0, 15, depth / 2 - 4]}>
        <boxGeometry args={[width, 30, 8]} />
      </mesh>
      {/* Arched roof — approximated as cylinders */}
      <mesh material={HANGAR_MATERIAL} position={[0, 30, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[width / 2, width / 2, depth, 20, 1, true, 0, Math.PI]} />
      </mesh>
    </group>
  )
}

/**
 * AirportLayer — mounts all airport structures
 */
export function AirportLayer() {
  return (
    <group name="airport_layer">
      {/* Ground apron — large concrete slab */}
      <mesh
        material={new THREE.MeshStandardMaterial({ color: '#3A3A3A', roughness: 0.92, metalness: 0.02 })}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[7000, 0.1, 1000]}
        receiveShadow
      >
        <planeGeometry args={[2200, 2000]} />
      </mesh>

      {/* Main runway slab */}
      <mesh material={RUNWAY_MATERIAL} rotation={[-Math.PI / 2, 0, 0]} position={[6900, 0.15, 800]} receiveShadow>
        <planeGeometry args={[1800, 60]} />
      </mesh>
      {/* Main runway centerline markings */}
      {Array.from({ length: 16 }, (_, i) => (
        <mesh key={i} material={MARKING_MATERIAL} rotation={[-Math.PI / 2, 0, 0]} position={[6000 + i * 112, 0.25, 800]}>
          <planeGeometry args={[40, 3]} />
        </mesh>
      ))}

      {/* Secondary runway slab */}
      <mesh material={RUNWAY_MATERIAL} rotation={[-Math.PI / 2, 0, 0]} position={[6900, 0.15, 1600]} receiveShadow>
        <planeGeometry args={[1400, 45]} />
      </mesh>
      {/* Secondary runway centerline */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} material={MARKING_MATERIAL} rotation={[-Math.PI / 2, 0, 0]} position={[6200 + i * 116, 0.25, 1600]}>
          <planeGeometry args={[35, 2.5]} />
        </mesh>
      ))}

      {/* Taxiways (yellow centerline) */}
      <mesh material={TAXIWAY_MATERIAL} rotation={[-Math.PI / 2, 0, 0]} position={[7000, 0.12, 1000]}>
        <planeGeometry args={[30, 400]} />
      </mesh>
      <mesh material={YELLOW_MARKING} rotation={[-Math.PI / 2, 0, 0]} position={[7000, 0.2, 1000]}>
        <planeGeometry args={[1.5, 400]} />
      </mesh>

      {/* Terminal */}
      <TerminalBuilding />

      {/* Control tower */}
      <ControlTower />

      {/* Hangars */}
      <Hangar x={6800} z={600} width={120} depth={80} />
      <Hangar x={7200} z={600} width={100} depth={70} />

      {/* Parked aircraft at terminal gates */}
      <ParkedAircraft x={6880} z={1100} rotY={Math.PI / 2} />
      <ParkedAircraft x={6880} z={1220} rotY={Math.PI / 2} />
      <ParkedAircraft x={7120} z={1100} rotY={-Math.PI / 2} />
      <ParkedAircraft x={7120} z={1220} rotY={-Math.PI / 2} />
      <ParkedAircraft x={6900} z={850} rotY={0} />
      <ParkedAircraft x={7100} z={850} rotY={0} />

      {/* Airport perimeter fence — thin posts */}
      {Array.from({ length: 22 }, (_, i) => (
        <mesh key={i} material={TOWER_MATERIAL} position={[6000 + i * 90, 2, 200]}>
          <boxGeometry args={[0.5, 4, 0.5]} />
        </mesh>
      ))}

      {/* Runway approach lights */}
      {[-20, -10, 0, 10, 20].map((ox, i) => (
        <group key={i}>
          <mesh position={[5980 + ox * 4, 1, 800]}>
            <sphereGeometry args={[0.6, 6, 6]} />
            <meshBasicMaterial color="#FF4444" />
          </mesh>
          <pointLight position={[5980 + ox * 4, 4, 800]} color="#FF4444" intensity={1.5} distance={30} />
        </group>
      ))}

      {/* Runway end lights (green threshold) */}
      {[-25, -15, -5, 5, 15, 25].map((ox, i) => (
        <group key={i}>
          <mesh position={[6010 + ox * 2, 1, 800]}>
            <sphereGeometry args={[0.6, 6, 6]} />
            <meshBasicMaterial color="#00FF00" />
          </mesh>
          <pointLight position={[6010 + ox * 2, 3, 800]} color="#00FF00" intensity={1} distance={20} />
        </group>
      ))}

      {/* Control tower beacon */}
      <pointLight position={[7400, 100, 1000]} color="#FF0000" intensity={5} distance={500} />
    </group>
  )
}

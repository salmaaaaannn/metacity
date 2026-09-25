import { useThree, useFrame } from '@react-three/fiber'
import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useSimulationStore, selectCitizens } from '../../store/simulationStore'

/**
 * Enhanced Camera Controller
 * Strictly separated mouse interactions:
 * - Left Click: Object selection & infrastructure placement (no accidental panning)
 * - Middle Mouse (or Shift + Left Mouse): Screen-oriented ground plane panning
 * - Right Mouse: Full 3D Orbit (Azimuth & Elevation / Polar angle)
 * - Scroll Wheel: Strictly zooms distance clamped between [100m, 4500m]
 * - Keyboard (WASD / Arrows): Screen-relative camera panning
 * - Follow-Citizen: Smooth dynamic interpolation
 * - Street-Level View: Pedestrian eye-level inspection
 */
export function CameraController() {
  const { camera, gl } = useThree()
  const target = useRef(new THREE.Vector3(4000, 0, 4000))
  const distance = useRef(1400)
  const orbitAzimuth = useRef(Math.PI / 4) // 45 deg isometric default
  const orbitPolar = useRef(THREE.MathUtils.degToRad(38)) // 38 deg elevation angle

  const dragMode = useRef<'none' | 'pan' | 'orbit'>('none')
  const prevMouse = useRef({ x: 0, y: 0 })

  const isFollowingCitizen = useSimulationStore((s) => s.isFollowingCitizen)
  const selectedCitizenId = useSimulationStore((s) => s.selectedCitizenId)
  const streetViewMode = useSimulationStore((s) => s.streetViewMode)
  const citizens = useSimulationStore(selectCitizens)

  // Keyboard navigation
  const keys = useRef<{ [key: string]: boolean }>({})

  useEffect(() => {
    // Initial camera position
    const initX = target.current.x + distance.current * Math.cos(orbitPolar.current) * Math.sin(orbitAzimuth.current)
    const initY = target.current.y + distance.current * Math.sin(orbitPolar.current)
    const initZ = target.current.z + distance.current * Math.cos(orbitPolar.current) * Math.cos(orbitAzimuth.current)
    camera.position.set(initX, initY, initZ)
    camera.lookAt(target.current)

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events if typing in an input
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') return
      keys.current[e.key.toLowerCase()] = true
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false
    }

    const handlePointerDown = (e: PointerEvent) => {
      // Middle Click (1) OR Shift+Left Click (0) -> Pan
      if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
        dragMode.current = 'pan'
        prevMouse.current = { x: e.clientX, y: e.clientY }
      } else if (e.button === 2) {
        // Right Click (2) -> Orbit
        dragMode.current = 'orbit'
        prevMouse.current = { x: e.clientX, y: e.clientY }
      } else {
        // Plain Left Click -> Selection / placement; do not drag camera
        dragMode.current = 'none'
      }
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (dragMode.current === 'none') return

      const dx = e.clientX - prevMouse.current.x
      const dy = e.clientY - prevMouse.current.y
      prevMouse.current = { x: e.clientX, y: e.clientY }

      const sinAz = Math.sin(orbitAzimuth.current)
      const cosAz = Math.cos(orbitAzimuth.current)

      if (dragMode.current === 'pan') {
        // Screen-oriented ground panning:
        // dx translates along camera right vector
        // dy translates along camera forward vector (on XZ plane)
        const factor = streetViewMode ? 0.08 : distance.current * 0.0012
        const rightX = cosAz
        const rightZ = -sinAz
        const forwardX = -sinAz
        const forwardZ = -cosAz

        target.current.x += (-dx * rightX + dy * forwardX) * factor
        target.current.z += (-dx * rightZ + dy * forwardZ) * factor

        // Clamp to city boundaries
        target.current.x = Math.max(100, Math.min(7900, target.current.x))
        target.current.z = Math.max(100, Math.min(7900, target.current.z))
      } else if (dragMode.current === 'orbit') {
        // Orbit rotation: dx rotates azimuth, dy rotates polar elevation
        orbitAzimuth.current -= dx * 0.004
        orbitPolar.current = Math.max(
          THREE.MathUtils.degToRad(15),
          Math.min(THREE.MathUtils.degToRad(75), orbitPolar.current + dy * 0.004)
        )
      }
    }

    const handlePointerUp = () => {
      dragMode.current = 'none'
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (!streetViewMode) {
        // Strict zoom scaling without affecting target or orbit angles
        const zoomDelta = e.deltaY * (distance.current * 0.0015 + 0.35)
        distance.current = Math.max(100, Math.min(4500, distance.current + zoomDelta))
      }
    }

    const handleContextMenu = (e: MouseEvent) => {
      // Prevent browser context menu when right-click orbiting
      e.preventDefault()
    }

    const handleMinimapNavigate = (e: Event) => {
      const { x, z } = (e as CustomEvent<{ x: number; z: number }>).detail
      target.current.x = Math.max(100, Math.min(7900, x))
      target.current.z = Math.max(100, Math.min(7900, z))
      // Zoom out slightly to show the destination in context
      distance.current = Math.max(distance.current, 600)
    }

    const dom = gl.domElement
    dom.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    dom.addEventListener('wheel', handleWheel, { passive: false })
    dom.addEventListener('contextmenu', handleContextMenu)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('minimap-navigate', handleMinimapNavigate)

    return () => {
      dom.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      dom.removeEventListener('wheel', handleWheel)
      dom.removeEventListener('contextmenu', handleContextMenu)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('minimap-navigate', handleMinimapNavigate)
    }
  }, [camera, gl, streetViewMode])


  useFrame((_, delta) => {
    const sinAz = Math.sin(orbitAzimuth.current)
    const cosAz = Math.cos(orbitAzimuth.current)

    // 1. Follow Citizen tracking mode
    if (isFollowingCitizen && selectedCitizenId) {
      const citizen = citizens.find((c) => c.id === selectedCitizenId)
      if (citizen) {
        const targetPos = new THREE.Vector3(citizen.x, 2, citizen.z)
        target.current.lerp(targetPos, delta * 5)
        if (!streetViewMode) {
          distance.current = THREE.MathUtils.lerp(distance.current, 180, delta * 3)
        }
      }
    } else {
      // Screen-relative keyboard navigation
      const panSpeed = (streetViewMode ? 40 : distance.current * 1.1) * delta
      const rightX = cosAz
      const rightZ = -sinAz
      const forwardX = -sinAz
      const forwardZ = -cosAz

      let moveX = 0
      let moveZ = 0

      if (keys.current['w'] || keys.current['arrowup']) {
        moveX += forwardX * panSpeed
        moveZ += forwardZ * panSpeed
      }
      if (keys.current['s'] || keys.current['arrowdown']) {
        moveX -= forwardX * panSpeed
        moveZ -= forwardZ * panSpeed
      }
      if (keys.current['a'] || keys.current['arrowleft']) {
        moveX -= rightX * panSpeed
        moveZ -= rightZ * panSpeed
      }
      if (keys.current['d'] || keys.current['arrowright']) {
        moveX += rightX * panSpeed
        moveZ += rightZ * panSpeed
      }

      if (moveX !== 0 || moveZ !== 0) {
        target.current.x = Math.max(100, Math.min(7900, target.current.x + moveX))
        target.current.z = Math.max(100, Math.min(7900, target.current.z + moveZ))
      }
    }

    // 2. Position camera based on mode
    if (streetViewMode) {
      // Ground-level pedestrian view (height = 2.5m, offset behind target)
      const streetPos = new THREE.Vector3(
        target.current.x + 12 * sinAz,
        2.5,
        target.current.z + 12 * cosAz
      )
      camera.position.lerp(streetPos, delta * 8)
      camera.lookAt(target.current.x, 2.0, target.current.z)
    } else {
      // Spherical coordinate isometric / RTS view
      const desiredPos = new THREE.Vector3(
        target.current.x + distance.current * Math.cos(orbitPolar.current) * sinAz,
        target.current.y + distance.current * Math.sin(orbitPolar.current),
        target.current.z + distance.current * Math.cos(orbitPolar.current) * cosAz
      )
      camera.position.lerp(desiredPos, delta * 7)
      camera.lookAt(target.current)
    }
  })

  return null
}

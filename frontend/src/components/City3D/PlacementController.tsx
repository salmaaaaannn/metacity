import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useThree, ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { useSimulationStore } from '../../store/simulationStore'
import { cityApi } from '../../api/cityApi'

export function PlacementController() {
  const plannerMode = useSimulationStore((s) => s.plannerMode)
  const selectedTool = useSimulationStore((s) => s.selectedTool)
  const setPlacementGhost = useSimulationStore((s) => s.setPlacementGhost)
  const addInfrastructureItem = useSimulationStore((s) => s.addInfrastructureItem)
  const setCityState = useSimulationStore((s) => s.setCityState)
  const cityState = useSimulationStore((s) => s.cityState)

  const [startPoint, setStartPoint] = useState<[number, number] | null>(null)
  const lastValidatedPos = useRef<string>('')
  const isConstructing = useRef(false)

  const isLinear = ['road', 'highway', 'bridge', 'metro_line'].includes(selectedTool)

  // Reset startPoint if tool changes or plannerMode toggles
  useEffect(() => {
    setStartPoint(null)
    setPlacementGhost(null)
  }, [selectedTool, plannerMode, setPlacementGhost])

  // Keybind to cancel placement (Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setStartPoint(null)
        setPlacementGhost(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setPlacementGhost])

  const snap = (val: number) => {
    const snapped = Math.round(val / 50) * 50
    return Math.max(100, Math.min(7900, snapped))
  }

  const handlePointerMove = useCallback(
    async (e: ThreeEvent<PointerEvent>) => {
      if (!plannerMode || selectedTool === 'select' || selectedTool === 'inspect') return
      e.stopPropagation()

      const snapX = snap(e.point.x)
      const snapZ = snap(e.point.z)

      const posKey = isLinear && startPoint
        ? `${startPoint[0]},${startPoint[1]}->${snapX},${snapZ}`
        : `${snapX},${snapZ}`

      if (posKey === lastValidatedPos.current) return
      lastValidatedPos.current = posKey

      if (isLinear && startPoint) {
        // Linear item with start point established
        const valRes = await cityApi.validatePlacement(selectedTool, startPoint[0], startPoint[1], snapX, snapZ)
        setPlacementGhost({
          x: startPoint[0],
          z: startPoint[1],
          endX: snapX,
          endZ: snapZ,
          valid: valRes.valid,
          reason: valRes.reason,
          validationData: valRes,
        })
      } else {
        // Point item or initial linear click preview
        const valRes = await cityApi.validatePlacement(selectedTool, snapX, snapZ)
        setPlacementGhost({
          x: snapX,
          z: snapZ,
          valid: valRes.valid,
          reason: valRes.reason,
          validationData: valRes,
        })
      }
    },
    [plannerMode, selectedTool, isLinear, startPoint, setPlacementGhost]
  )

  const handlePointerDown = useCallback(
    async (e: ThreeEvent<PointerEvent>) => {
      if (!plannerMode || selectedTool === 'select' || selectedTool === 'inspect') return
      e.stopPropagation()

      // Right click cancels
      if (e.button === 2) {
        setStartPoint(null)
        setPlacementGhost(null)
        return
      }

      if (e.button !== 0 || isConstructing.current) return

      const snapX = snap(e.point.x)
      const snapZ = snap(e.point.z)

      if (isLinear) {
        if (!startPoint) {
          // First click: anchor start
          setStartPoint([snapX, snapZ])
          return
        }

        // Second click: build segment
        if (startPoint[0] === snapX && startPoint[1] === snapZ) return // same point

        isConstructing.current = true
        try {
          const res = await cityApi.constructInfrastructure(
            selectedTool,
            startPoint[0],
            startPoint[1],
            `${selectedTool.toUpperCase()} Segment`,
            snapX,
            snapZ
          )

          if (res.success && res.item) {
            addInfrastructureItem(res.item)
            if (cityState && res.remainingBalance !== undefined) {
              setCityState({
                ...cityState,
                budget: {
                  ...cityState.budget,
                  balance: res.remainingBalance,
                },
              })
            }
          } else {
            console.warn('[Placement] Construction rejected:', res.reason)
          }
        } finally {
          isConstructing.current = false
          setStartPoint(null)
          setPlacementGhost(null)
        }
      } else {
        // Point item: immediate construction
        isConstructing.current = true
        try {
          const res = await cityApi.constructInfrastructure(
            selectedTool,
            snapX,
            snapZ,
            `${selectedTool.replace('_', ' ').toUpperCase()}`
          )

          if (res.success && res.item) {
            addInfrastructureItem(res.item)
            if (cityState && res.remainingBalance !== undefined) {
              setCityState({
                ...cityState,
                budget: {
                  ...cityState.budget,
                  balance: res.remainingBalance,
                },
              })
            }
          } else {
            console.warn('[Placement] Construction rejected:', res.reason)
          }
        } finally {
          isConstructing.current = false
          setPlacementGhost(null)
        }
      }
    },
    [plannerMode, selectedTool, isLinear, startPoint, addInfrastructureItem, cityState, setCityState, setPlacementGhost]
  )

  if (!plannerMode || selectedTool === 'select') return null

  return (
    <mesh
      position={[4000, 0.05, 4000]}
      rotation={[-Math.PI / 2, 0, 0]}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      visible={false}
    >
      <planeGeometry args={[10000, 10000]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  )
}

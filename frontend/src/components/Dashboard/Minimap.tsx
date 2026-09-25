import React, { useRef, useEffect, useCallback } from 'react'
import { useSimulationStore, selectDistricts, selectRoads, selectTransitLines } from '../../store/simulationStore'

const MAP_SIZE = 220  // px
const CITY_SIZE = 8000  // m

// District type → minimap color
const DISTRICT_COLORS: Record<string, string> = {
  cbd: '#1976D2',
  residential_high: '#2E7D32',
  residential_med: '#388E3C',
  residential_low: '#66BB6A',
  industrial: '#E65100',
  education: '#1565C0',
  tech: '#0097A7',
  developing: '#8D6E63',
  transport: '#546E7A',
  suburban: '#A5D6A7',
  riverfront: '#29B6F6',
  rural: '#8BC34A',
  commercial: '#F57F17',
  government: '#4A148C',
  default: '#78909C',
}

// Transit line type → minimap color
const TRANSIT_COLORS: Record<string, string> = {
  metro: '#FF1744',
  railway: '#FF6D00',
  bus: '#00B0FF',
  default: '#FFFFFF',
}

/**
 * Minimap
 * Canvas-drawn city overview:
 * - District colored ground zones
 * - Road network as grey lines
 * - Transit lines as colored lines
 * - River as blue band (x ≈ 4900–5100)
 * - Camera frustum indicator
 * Click → teleport camera to that world position
 */
export function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const districts = useSimulationStore(selectDistricts)
  const roads = useSimulationStore(selectRoads)
  const transitLines = useSimulationStore(selectTransitLines)
  const disasters = useSimulationStore((s) => s.disasters)

  // Convert world coords [0, 8000] → minimap px [0, MAP_SIZE]
  const toMap = (worldVal: number) => (worldVal / CITY_SIZE) * MAP_SIZE

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, MAP_SIZE, MAP_SIZE)

    // Background — dark city ground
    ctx.fillStyle = '#0F172A'
    ctx.fillRect(0, 0, MAP_SIZE, MAP_SIZE)

    // Districts
    for (const d of districts) {
      if (!d.bounds) continue
      const [x0, z0, x1, z1] = d.bounds
      const px = toMap(x0)
      const pz = toMap(z0)
      const pw = toMap(x1 - x0)
      const ph = toMap(z1 - z0)
      ctx.fillStyle = DISTRICT_COLORS[d.type] ?? DISTRICT_COLORS.default
      ctx.globalAlpha = 0.4
      ctx.fillRect(px, pz, pw, ph)
      ctx.globalAlpha = 1
    }

    // River band
    ctx.fillStyle = '#0EA5E9'
    ctx.globalAlpha = 0.5
    ctx.fillRect(toMap(4900), 0, toMap(200), MAP_SIZE)
    ctx.globalAlpha = 1

    // Roads — thin grey lines
    ctx.strokeStyle = '#475569'
    ctx.lineWidth = 0.5
    for (const r of roads) {
      ctx.beginPath()
      ctx.moveTo(toMap(r.startX), toMap(r.startZ))
      ctx.lineTo(toMap(r.endX), toMap(r.endZ))
      ctx.stroke()
    }

    // Transit lines — colored
    for (const line of transitLines) {
      if (!line.route || line.route.length < 2) continue
      const color = TRANSIT_COLORS[line.type] ?? TRANSIT_COLORS.default
      ctx.strokeStyle = color
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(toMap(line.route[0][0]), toMap(line.route[0][1]))
      for (let i = 1; i < line.route.length; i++) {
        ctx.lineTo(toMap(line.route[i][0]), toMap(line.route[i][1]))
      }
      ctx.stroke()

      // Station dots
      ctx.fillStyle = color
      for (const station of line.stations) {
        ctx.beginPath()
        ctx.arc(toMap(station.x), toMap(station.z), 1.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Disaster zones — pulsing overlay circles
    const incidents = disasters?.incidents ?? []
    for (const inc of incidents) {
      if (!inc.epicenter_x || !inc.epicenter_z) continue
      const cx = toMap(inc.epicenter_x)
      const cz = toMap(inc.epicenter_z)
      const r = toMap(inc.radius ?? 1000) * 0.5
      const color = inc.disaster_type === 'FLOOD' ? '#38BDF8'
        : inc.disaster_type === 'FIRE' ? '#F97316'
        : inc.disaster_type === 'EARTHQUAKE' ? '#EAB308'
        : '#EF4444'
      ctx.strokeStyle = color
      ctx.lineWidth = 1.5
      ctx.globalAlpha = 0.7
      ctx.beginPath()
      ctx.arc(cx, cz, r, 0, Math.PI * 2)
      ctx.stroke()
      ctx.globalAlpha = 0.15
      ctx.fillStyle = color
      ctx.fill()
      ctx.globalAlpha = 1
    }

    // Border
    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, MAP_SIZE, MAP_SIZE)

    // Labels: district names for large districts
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.font = '7px monospace'
    for (const d of districts) {
      if (!d.bounds) continue
      const [x0, z0, x1, z1] = d.bounds
      if ((x1 - x0) < 1200 && (z1 - z0) < 1200) continue  // only label large districts
      const cx = toMap((x0 + x1) / 2)
      const cz = toMap((z0 + z1) / 2)
      ctx.fillText(d.name.substring(0, 10), cx - 18, cz + 3)
    }
  }, [districts, roads, transitLines, disasters])

  useEffect(() => {
    draw()
  }, [draw])

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mapX = e.clientX - rect.left
    const mapZ = e.clientY - rect.top
    const worldX = (mapX / MAP_SIZE) * CITY_SIZE
    const worldZ = (mapZ / MAP_SIZE) * CITY_SIZE

    // Dispatch a custom event that CameraController can listen for
    window.dispatchEvent(new CustomEvent('minimap-navigate', { detail: { x: worldX, z: worldZ } }))
  }, [])

  return (
    <div
      className="absolute bottom-16 right-4 z-30 rounded-xl overflow-hidden border border-slate-700/60 shadow-2xl bg-slate-950/90 backdrop-blur-md"
      style={{ width: MAP_SIZE, height: MAP_SIZE }}
    >
      {/* Header bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-2 py-0.5 bg-black/50 z-10">
        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">MAP</span>
        <span className="text-[8px] text-slate-500 font-mono">8km × 8km</span>
      </div>

      <canvas
        ref={canvasRef}
        width={MAP_SIZE}
        height={MAP_SIZE}
        onClick={handleClick}
        className="cursor-crosshair"
        style={{ display: 'block' }}
      />

      {/* Legend */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 px-2 py-0.5 bg-black/50">
        <div className="flex items-center gap-1">
          <div className="w-2 h-0.5 bg-red-400 rounded" />
          <span className="text-[7px] text-slate-400">Metro</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-0.5 bg-orange-400 rounded" />
          <span className="text-[7px] text-slate-400">Rail</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          <span className="text-[7px] text-slate-400">River</span>
        </div>
      </div>
    </div>
  )
}

import type { SimulationDelta } from '../types/city'

const WS_BASE_URL = (import.meta.env.VITE_WS_URL as string) || 'ws://localhost:8000'

export type WebSocketStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'STOPPED'

/**
 * Robust, StrictMode-safe Singleton WebSocket Client
 * Features:
 * - Single authoritative connection instance
 * - Handshake-safe cleanup (prevents 'closed before established' browser warnings)
 * - Exponential backoff reconnection (1s -> 2s -> 4s -> 8s -> 16s -> 30s)
 * - Safe error handling that never crashes React
 * - Controlled diagnostic logging
 */
export class SimulationWebSocket {
  private ws: WebSocket | null = null
  private runId: string = 'default'
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private shouldReconnect: boolean = true
  private status: WebSocketStatus = 'DISCONNECTED'

  private currentBackoffMs: number = 1000
  private readonly minBackoffMs: number = 1000
  private readonly maxBackoffMs: number = 30000

  private onDeltaCallback?: (delta: SimulationDelta) => void
  private onConnectCallback?: () => void
  private onDisconnectCallback?: () => void
  private onStatusChangeCallback?: (status: WebSocketStatus) => void

  getStatus(): WebSocketStatus {
    return this.status
  }

  private _setStatus(status: WebSocketStatus): void {
    if (this.status !== status) {
      this.status = status
      if (this.onStatusChangeCallback) {
        this.onStatusChangeCallback(status)
      }
    }
  }

  connect(
    runId: string = 'default',
    onDelta: (delta: SimulationDelta) => void,
    onConnect: () => void,
    onDisconnect: () => void,
    onStatusChange?: (status: WebSocketStatus) => void
  ): void {
    this.runId = runId
    this.onDeltaCallback = onDelta
    this.onConnectCallback = onConnect
    this.onDisconnectCallback = onDisconnect
    this.onStatusChangeCallback = onStatusChange
    this.shouldReconnect = true

    // If an existing socket is already open or connecting to this runId, preserve it (React StrictMode resilience)
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      if (this.ws.readyState === WebSocket.OPEN && this.onConnectCallback) {
        this.onConnectCallback()
      }
      return
    }

    this._initSocket()
  }

  private _initSocket(): void {
    // Cancel any pending reconnect timers
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    // Safely cleanup previous socket if any
    this._cleanupCurrentSocket()

    const url = `${WS_BASE_URL}/ws/simulation/${this.runId}`
    console.log(`[WS] connecting to ${url}`)
    this._setStatus('CONNECTING')

    try {
      const socket = new WebSocket(url)
      this.ws = socket

      socket.onopen = () => {
        // Guard against race conditions if disconnect was called in between
        if (this.ws !== socket || !this.shouldReconnect) {
          try {
            socket.close(1000, 'Superseded')
          } catch {
            // ignore
          }
          return
        }

        console.log('[WS] connected')
        this.currentBackoffMs = this.minBackoffMs
        this._setStatus('CONNECTED')
        if (this.onConnectCallback) {
          this.onConnectCallback()
        }
      }

      socket.onmessage = (event) => {
        if (this.ws !== socket) return
        try {
          const data = JSON.parse(event.data)
          if (data && this.onDeltaCallback) {
            this.onDeltaCallback(data as SimulationDelta)
          }
        } catch {
          // Ignore invalid packet without throwing
        }
      }

      socket.onclose = (event) => {
        if (this.ws !== socket) return
        console.log(`[WS] disconnected (code: ${event.code})`)
        this._setStatus('DISCONNECTED')
        if (this.onDisconnectCallback) {
          this.onDisconnectCallback()
        }

        if (this.shouldReconnect) {
          this._scheduleReconnect()
        }
      }

      socket.onerror = () => {
        if (this.ws !== socket) return
        // Do not force-close here if still connecting; browser will fire onclose cleanly
      }
    } catch {
      this._setStatus('DISCONNECTED')
      if (this.shouldReconnect) {
        this._scheduleReconnect()
      }
    }
  }

  private _cleanupCurrentSocket(): void {
    if (!this.ws) return

    const oldSocket = this.ws
    this.ws = null

    // Detach all callbacks to prevent stale event triggers
    oldSocket.onopen = null
    oldSocket.onmessage = null
    oldSocket.onerror = null
    oldSocket.onclose = null

    if (oldSocket.readyState === WebSocket.OPEN) {
      try {
        oldSocket.close(1000, 'Normal closure')
      } catch {
        // ignore
      }
    } else if (oldSocket.readyState === WebSocket.CONNECTING) {
      // If still handshake connecting, attach a one-time onopen closer to avoid browser warnings
      oldSocket.onopen = () => {
        try {
          oldSocket.close(1000, 'Closed after connection')
        } catch {
          // ignore
        }
      }
    }
  }

  private _scheduleReconnect(): void {
    if (!this.shouldReconnect) return
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    const delay = this.currentBackoffMs
    this.currentBackoffMs = Math.min(this.currentBackoffMs * 2, this.maxBackoffMs)
    console.log(`[WS] reconnecting in ${delay}ms...`)
    this._setStatus('RECONNECTING')

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      if (this.shouldReconnect) {
        this._initSocket()
      }
    }, delay)
  }

  disconnect(): void {
    console.log('[WS] intentional disconnect')
    this.shouldReconnect = false
    this._setStatus('STOPPED')

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    this._cleanupCurrentSocket()
  }

  sendControl(action: string, speed?: number): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ action, speed }))
      } catch {
        // Non-blocking
      }
    }
  }
}

export const simulationWs = new SimulationWebSocket()

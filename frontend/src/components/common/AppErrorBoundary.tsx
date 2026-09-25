import React, { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallbackTitle?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[AppErrorBoundary] Captured UI error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 m-2 bg-red-950/80 border border-red-500/40 rounded-lg text-white text-xs backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-red-300">
              ⚠️ {this.props.fallbackTitle || 'A component error occurred'}
            </span>
            <button
              onClick={this.handleReset}
              className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[11px]"
            >
              Retry
            </button>
          </div>
          <p className="text-gray-300 font-mono text-[10px] break-all">
            {this.state.error?.message || 'Unknown error'}
          </p>
        </div>
      )
    }

    return this.props.children
  }
}

import React, { useState } from 'react'
import { useSimulationStore } from '../../store/simulationStore'
import { cityApi } from '../../api/cityApi'

const PRESET_QUESTIONS = [
  'Which district has the highest flood vulnerability?',
  'Where are the forecasted peak traffic bottlenecks?',
  'What is the current municipal treasury balance and net monthly burn?',
  'Are power grid reserves sufficient under extreme summer cooling load?',
]

export function AskMetacityAI() {
  const isOpen = useSimulationStore((s) => s.showAskAIModal)
  const setIsOpen = useSimulationStore((s) => s.setShowAskAIModal)

  const [question, setQuestion] = useState<string>('')
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; metrics?: Record<string, any>; confidence?: number }>>([
    {
      sender: 'ai',
      text: 'Welcome to METACITY Grounded Intelligence. Ask any question regarding city performance, zoning dynamics, disaster risks, or infrastructure bottlenecks.',
    }
  ])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  if (!isOpen) return null

  const handleAsk = async (queryText: string) => {
    const q = queryText.trim()
    if (!q) return
    setQuestion('')
    setMessages((prev) => [...prev, { sender: 'user', text: q }])
    setIsLoading(true)

    try {
      const res = await cityApi.queryAI(q)
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res.answer,
          metrics: res.grounded_metrics,
          confidence: res.confidence,
        }
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Unable to query simulation engine. Please verify the backend connection.',
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl text-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center space-x-2.5">
            <span className="text-xl">💬</span>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Ask METACITY Intelligence
              </h3>
              <p className="text-[11px] text-slate-400">
                Grounded natural language answers strictly bound to real simulation parameters
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Message Stream */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1 custom-scrollbar">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-xl p-3 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'bg-slate-950/90 border border-slate-800 text-slate-200'
                }`}
              >
                <p>{m.text}</p>

                {/* Grounded Evidence Metrics Chips */}
                {m.metrics && Object.keys(m.metrics).length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800 flex flex-wrap gap-1.5 font-mono text-[10px]">
                    <span className="text-slate-400">Simulation Evidence:</span>
                    {Object.entries(m.metrics).map(([k, v]) => (
                      <span
                        key={k}
                        className="bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700 text-cyan-300"
                      >
                        {k}: <strong>{String(v)}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 text-xs text-indigo-400 italic">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              <span>Querying simulation models and computing metrics...</span>
            </div>
          )}
        </div>

        {/* Preset Prompt Suggestions */}
        <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800/80 flex flex-wrap gap-1.5">
          {PRESET_QUESTIONS.map((pq) => (
            <button
              key={pq}
              onClick={() => handleAsk(pq)}
              className="text-[10px] bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-full px-2.5 py-1 text-slate-300 hover:text-white transition"
            >
              {pq}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleAsk(question)
          }}
          className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about METACITY..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

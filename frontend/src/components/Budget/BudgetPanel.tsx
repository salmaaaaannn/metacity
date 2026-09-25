import React, { useEffect, useState } from 'react'
import { useSimulationStore } from '../../store/simulationStore'
import { cityApi } from '../../api/cityApi'
import type { BudgetTransaction } from '../../types/city'

export function BudgetPanel() {
  const showBudgetPanel = useSimulationStore((s) => s.showBudgetPanel)
  const toggleBudgetPanel = useSimulationStore((s) => s.toggleBudgetPanel)
  const budget = useSimulationStore((s) => s.cityState?.budget)
  const infrastructureList = useSimulationStore((s) => s.infrastructureList)
  const [transactions, setTransactions] = useState<BudgetTransaction[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'ledger' | 'assets'>('overview')

  useEffect(() => {
    if (showBudgetPanel) {
      cityApi.getBudgetTransactions().then((txs) => {
        setTransactions(txs)
      })
    }
  }, [showBudgetPanel])

  if (!showBudgetPanel || !budget) return null

  const isProfitable = budget.netMonthly >= 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900/95 border border-white/15 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col text-white max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">💰</span>
            <div>
              <h2 className="text-base font-bold tracking-wide">MUNICIPAL TREASURY & BUDGET</h2>
              <span className="text-xs text-gray-400">Authoritative Fiscal Balance & Dynamic Maintenance Ledger</span>
            </div>
          </div>
          <button
            onClick={toggleBudgetPanel}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-white/10 bg-black/20 px-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 border-b-2 transition ${
              activeTab === 'overview' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Fiscal Overview
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`py-3 px-4 border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'ledger' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <span>Transaction Ledger</span>
            {transactions.length > 0 && (
              <span className="bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded-full text-[10px]">
                {transactions.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`py-3 px-4 border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'assets' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <span>Asset Maintenance</span>
            <span className="bg-white/10 text-gray-300 px-1.5 py-0.2 rounded-full text-[10px]">
              {infrastructureList.length}
            </span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="text-xs text-gray-400 mb-1">Total Treasury Balance</div>
                  <div className="text-2xl font-black text-green-400 font-mono">
                    {(budget.balance / 1_000_000).toFixed(2)}M {budget.currency}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">Starting capital: 50.00M MC</div>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="text-xs text-gray-400 mb-1">Net Monthly Flow</div>
                  <div className={`text-2xl font-black font-mono ${isProfitable ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isProfitable ? '+' : ''}{(budget.netMonthly / 1_000).toFixed(1)}k {budget.currency}/mo
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">
                    {isProfitable ? 'Surplus generating reserves' : 'Deficit drawing on treasury'}
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="text-xs text-gray-400 mb-1">Monthly Revenue / Expenses</div>
                  <div className="text-sm font-bold text-white flex justify-between mt-1">
                    <span className="text-emerald-400">+{(budget.income.total / 1_000).toFixed(0)}k MC</span>
                    <span className="text-red-400">-{(budget.expenses.total / 1_000).toFixed(0)}k MC</span>
                  </div>
                  <div className="w-full h-1.5 bg-red-900/50 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full"
                      style={{
                        width: `${Math.min(100, (budget.income.total / (budget.expenses.total || 1)) * 50)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Revenue Breakdown */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2.5 text-xs">
                  <div className="font-bold text-sm text-emerald-400 flex justify-between border-b border-white/10 pb-2">
                    <span>Revenue Sources</span>
                    <span className="font-mono">+{(budget.income.total / 1000).toFixed(0)}k MC</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Property Tax</span>
                    <span className="font-mono text-white">{(budget.income.propertyTax / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Business Tax</span>
                    <span className="font-mono text-white">{(budget.income.businessTax / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Transit Fares (Bus + Metro)</span>
                    <span className="font-mono text-blue-300 font-semibold">{(budget.income.transportFares / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Industrial Tax</span>
                    <span className="font-mono text-white">{(budget.income.industrialTax / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Service Fees</span>
                    <span className="font-mono text-white">{(budget.income.serviceFees / 1000).toFixed(0)}k</span>
                  </div>
                </div>

                {/* Expenses Breakdown */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2.5 text-xs">
                  <div className="font-bold text-sm text-red-400 flex justify-between border-b border-white/10 pb-2">
                    <span>Maintenance & Operations</span>
                    <span className="font-mono">-{(budget.expenses.total / 1000).toFixed(0)}k MC</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Metro System Operations</span>
                    <span className="font-mono text-white">{(budget.expenses.metroOperation / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Bus Fleet Operations</span>
                    <span className="font-mono text-white">{(budget.expenses.busOperation / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Roads & Highways Maintenance</span>
                    <span className="font-mono text-white">{((budget.expenses.roadMaintenance + budget.expenses.highwayMaintenance) / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Bridges & Crossings</span>
                    <span className="font-mono text-white">{(budget.expenses.bridgeMaintenance / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Hospitals & Healthcare</span>
                    <span className="font-mono text-white">{(budget.expenses.hospitalOperation / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Schools & Education</span>
                    <span className="font-mono text-white">{(budget.expenses.schoolOperation / 1000).toFixed(0)}k</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Ledger Tab */}
          {activeTab === 'ledger' && (
            <div className="space-y-3">
              <div className="text-xs text-gray-400">
                Authoritative transaction ledger recording all infrastructure investments, demolitions, and operational cash flows.
              </div>
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs">No capital transactions recorded yet.</div>
              ) : (
                <div className="border border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-black/50 border-b border-white/10 text-gray-400 uppercase text-[10px] tracking-wider">
                        <th className="p-2.5">Time</th>
                        <th className="p-2.5">Description</th>
                        <th className="p-2.5">Category</th>
                        <th className="p-2.5 text-right">Amount</th>
                        <th className="p-2.5 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-white/5">
                          <td className="p-2.5 text-gray-400 font-mono text-[11px]">
                            {new Date(tx.timestamp * 1000).toLocaleTimeString()}
                          </td>
                          <td className="p-2.5 font-semibold text-gray-200">{tx.description}</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-gray-300 uppercase">
                              {tx.category}
                            </span>
                          </td>
                          <td className={`p-2.5 text-right font-mono font-bold ${tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {tx.amount >= 0 ? '+' : ''}{(tx.amount / 1000).toFixed(0)}k MC
                          </td>
                          <td className="p-2.5 text-right font-mono text-gray-300">
                            {(tx.balanceAfter / 1_000_000).toFixed(2)}M MC
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Assets Tab */}
          {activeTab === 'assets' && (
            <div className="space-y-3">
              <div className="text-xs text-gray-400">
                Live registry of dynamically constructed infrastructure and recurring monthly maintenance commitments.
              </div>
              {infrastructureList.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs">
                  No user-built infrastructure yet. Use the Left Toolbar in Planner Mode to build roads, transit, and facilities.
                </div>
              ) : (
                <div className="border border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-black/50 border-b border-white/10 text-gray-400 uppercase text-[10px] tracking-wider">
                        <th className="p-2.5">Facility Name</th>
                        <th className="p-2.5">Type</th>
                        <th className="p-2.5">Capacity</th>
                        <th className="p-2.5">Condition</th>
                        <th className="p-2.5 text-right">Maintenance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {infrastructureList.map((item) => (
                        <tr key={item.id} className="hover:bg-white/5">
                          <td className="p-2.5 font-semibold text-white">{item.name}</td>
                          <td className="p-2.5 capitalize text-gray-300">{item.itemType.replace('_', ' ')}</td>
                          <td className="p-2.5 font-mono text-gray-300">{item.capacity.toLocaleString()}</td>
                          <td className="p-2.5 text-emerald-400 font-mono">
                            {Math.round((item.condition ?? 1.0) * 100)}%
                          </td>
                          <td className="p-2.5 text-right font-mono text-red-300 font-semibold">
                            {Math.round(item.monthlyMaintenance).toLocaleString()} MC/mo
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

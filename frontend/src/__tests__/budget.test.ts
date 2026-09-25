import { describe, it, expect } from 'vitest'
import { MOCK_CITY_STATE } from '../api/cityApi'

describe('Budget Calculations', () => {
  it('correctly calculates total income from components', () => {
    const income = MOCK_CITY_STATE.budget.income
    const sum =
      income.propertyTax +
      income.businessTax +
      income.transportFares +
      income.serviceFees +
      income.industrialTax
    expect(sum).toBe(income.total)
    expect(income.total).toBeGreaterThan(0)
  })

  it('correctly calculates total expenses and net monthly balance', () => {
    const { income, expenses, netMonthly } = MOCK_CITY_STATE.budget
    const sumExpenses =
      expenses.roadMaintenance +
      expenses.highwayMaintenance +
      expenses.bridgeMaintenance +
      expenses.metroOperation +
      expenses.busOperation +
      expenses.hospitalOperation +
      expenses.schoolOperation +
      expenses.policeOperation +
      expenses.fireOperation +
      expenses.utilities +
      expenses.wasteMaintenance

    expect(sumExpenses).toBe(expenses.total)
    expect(netMonthly).toBe(income.total - expenses.total)
  })
})
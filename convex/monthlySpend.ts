import { query } from './_generated/server'
import { v } from 'convex/values'

function getMonthRange(month: string) {
  const [yearText, monthText] = month.split('-')
  const year = Number(yearText)
  const monthIndex = Number(monthText)

  if (!Number.isInteger(year) || !Number.isInteger(monthIndex)) {
    throw new Error('month must use YYYY-MM format')
  }

  const startDate = `${yearText}-${monthText}-01`
  const endDate = new Date(Date.UTC(year, monthIndex, 0))
    .toISOString()
    .slice(0, 10)

  return { startDate, endDate }
}

function isInCurrency(currency: string, selectedCurrency?: string) {
  return !selectedCurrency || currency === selectedCurrency
}

function getDebtPlannedPayment(debt: {
  balance: number
  payments: number
  remainingInstallments?: number
  minimumPayment?: number
  targetPayment?: number
}) {
  if (typeof debt.targetPayment === 'number' && debt.targetPayment > 0) {
    return debt.targetPayment
  }

  if (typeof debt.minimumPayment === 'number' && debt.minimumPayment > 0) {
    return debt.minimumPayment
  }

  return debt.balance / Math.max(1, debt.remainingInstallments ?? debt.payments)
}

function isRecurringActiveInMonth(
  recurringPayment: { startDate: string; endDate?: string },
  startDate: string,
  endDate: string,
) {
  return (
    recurringPayment.startDate <= endDate &&
    (!recurringPayment.endDate || recurringPayment.endDate >= startDate)
  )
}

export const getMonthlySpendSummary = query({
  args: {
    userId: v.id('users'),
    month: v.string(),
    currency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { startDate, endDate } = getMonthRange(args.month)

    const debts = await ctx.db
      .query('debts')
      .withIndex('by_userId_and_status', (q) =>
        q.eq('userId', args.userId).eq('status', 'active'),
      )
      .take(250)

    const recurringPayments = await ctx.db
      .query('recurringPayments')
      .withIndex('by_userId_and_status', (q) =>
        q.eq('userId', args.userId).eq('status', 'active'),
      )
      .take(250)

    const expenses = await ctx.db
      .query('expenses')
      .withIndex('by_userId_and_spentAt', (q) =>
        q
          .eq('userId', args.userId)
          .gte('spentAt', startDate)
          .lte('spentAt', endDate),
      )
      .take(500)

    const debtItems = debts.filter((debt) =>
      isInCurrency(debt.currency, args.currency),
    )
    const recurringItems = recurringPayments.filter(
      (payment) =>
        isInCurrency(payment.currency, args.currency) &&
        isRecurringActiveInMonth(payment, startDate, endDate),
    )
    const expenseItems = expenses.filter((expense) =>
      isInCurrency(expense.currency, args.currency),
    )

    const plannedDebtPayments = debtItems.reduce(
      (sum, debt) => sum + getDebtPlannedPayment(debt),
      0,
    )
    const plannedRecurringPayments = recurringItems.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    )
    const actualExpenses = expenseItems.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    )

    const byCurrencyMap = new Map<
      string,
      {
        plannedDebtPayments: number
        plannedRecurringPayments: number
        actualExpenses: number
      }
    >()

    for (const debt of debtItems) {
      const current = byCurrencyMap.get(debt.currency) ?? {
        plannedDebtPayments: 0,
        plannedRecurringPayments: 0,
        actualExpenses: 0,
      }
      current.plannedDebtPayments += getDebtPlannedPayment(debt)
      byCurrencyMap.set(debt.currency, current)
    }

    for (const payment of recurringItems) {
      const current = byCurrencyMap.get(payment.currency) ?? {
        plannedDebtPayments: 0,
        plannedRecurringPayments: 0,
        actualExpenses: 0,
      }
      current.plannedRecurringPayments += payment.amount
      byCurrencyMap.set(payment.currency, current)
    }

    for (const expense of expenseItems) {
      const current = byCurrencyMap.get(expense.currency) ?? {
        plannedDebtPayments: 0,
        plannedRecurringPayments: 0,
        actualExpenses: 0,
      }
      current.actualExpenses += expense.amount
      byCurrencyMap.set(expense.currency, current)
    }

    return {
      month: args.month,
      plannedDebtPayments,
      plannedRecurringPayments,
      actualExpenses,
      totalMonthlySpend:
        plannedDebtPayments + plannedRecurringPayments + actualExpenses,
      byCurrency: [...byCurrencyMap.entries()]
        .map(([currency, totals]) => ({
          currency,
          ...totals,
          totalMonthlySpend:
            totals.plannedDebtPayments +
            totals.plannedRecurringPayments +
            totals.actualExpenses,
        }))
        .sort((left, right) => left.currency.localeCompare(right.currency)),
      upcomingDebts: debtItems
        .filter((debt) => debt.dueDate >= startDate && debt.dueDate <= endDate)
        .sort((left, right) => left.dueDate.localeCompare(right.dueDate))
        .slice(0, 10),
      upcomingRecurringPayments: recurringItems
        .sort((left, right) => left.dueDay - right.dueDay)
        .slice(0, 10),
    }
  },
})

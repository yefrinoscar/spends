import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    currency: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_email', ['email'])
    .index('by_createdAt', ['createdAt']),

  debts: defineTable({
    userId: v.id('users'),
    name: v.string(),
    lender: v.string(),
    type: v.union(
      v.literal('Credit card'),
      v.literal('Loan'),
      v.literal('Mortgage'),
      v.literal('Other'),
    ),
    currency: v.string(),
    balance: v.number(),
    rate: v.number(),
    payments: v.number(),
    paymentMode: v.optional(
      v.union(v.literal('installments'), v.literal('revolving')),
    ),
    remainingInstallments: v.optional(v.number()),
    minimumPayment: v.optional(v.number()),
    targetPayment: v.optional(v.number()),
    dueDay: v.optional(v.number()),
    dueDate: v.string(),
    status: v.union(v.literal('active'), v.literal('closed')),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_userId', ['userId'])
    .index('by_userId_and_status', ['userId', 'status'])
    .index('by_userId_and_currency', ['userId', 'currency'])
    .index('by_userId_and_dueDate', ['userId', 'dueDate'])
    .index('by_userId_and_status_and_dueDate', ['userId', 'status', 'dueDate']),

  recurringPayments: defineTable({
    userId: v.id('users'),
    name: v.string(),
    category: v.string(),
    currency: v.string(),
    amount: v.number(),
    cadence: v.union(v.literal('monthly')),
    dueDay: v.number(),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    status: v.union(
      v.literal('active'),
      v.literal('paused'),
      v.literal('cancelled'),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_userId', ['userId'])
    .index('by_userId_and_status', ['userId', 'status'])
    .index('by_userId_and_dueDay', ['userId', 'dueDay'])
    .index('by_userId_and_status_and_dueDay', ['userId', 'status', 'dueDay']),

  expenses: defineTable({
    userId: v.id('users'),
    amount: v.number(),
    currency: v.string(),
    category: v.string(),
    description: v.string(),
    merchant: v.optional(v.string()),
    spentAt: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_userId', ['userId'])
    .index('by_userId_and_spentAt', ['userId', 'spentAt'])
    .index('by_userId_and_category', ['userId', 'category'])
    .index('by_userId_and_currency', ['userId', 'currency']),
})

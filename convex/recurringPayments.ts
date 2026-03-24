import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

const recurringStatus = v.union(
  v.literal('active'),
  v.literal('paused'),
  v.literal('cancelled'),
)

export const listByUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('recurringPayments')
      .withIndex('by_userId_and_dueDay', (q) => q.eq('userId', args.userId))
      .take(100)
  },
})

export const create = mutation({
  args: {
    userId: v.id('users'),
    name: v.string(),
    category: v.string(),
    currency: v.string(),
    amount: v.number(),
    dueDay: v.number(),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    status: v.optional(recurringStatus),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    return await ctx.db.insert('recurringPayments', {
      ...args,
      cadence: 'monthly',
      status: args.status ?? 'active',
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const update = mutation({
  args: {
    id: v.id('recurringPayments'),
    name: v.optional(v.string()),
    category: v.optional(v.string()),
    currency: v.optional(v.string()),
    amount: v.optional(v.number()),
    dueDay: v.optional(v.number()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    status: v.optional(recurringStatus),
  },
  handler: async (ctx, args) => {
    const { id, ...value } = args
    await ctx.db.patch(id, {
      ...value,
      updatedAt: Date.now(),
    })
  },
})

export const remove = mutation({
  args: { id: v.id('recurringPayments') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})

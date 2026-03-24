import { query, mutation } from './_generated/server'
import { v } from 'convex/values'

export const listByUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('expenses')
      .withIndex('by_userId_and_spentAt', (q) => q.eq('userId', args.userId))
      .order('desc')
      .take(100)
  },
})

export const listByDateRange = query({
  args: {
    userId: v.id('users'),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('expenses')
      .withIndex('by_userId_and_spentAt', (q) =>
        q
          .eq('userId', args.userId)
          .gte('spentAt', args.startDate)
          .lte('spentAt', args.endDate),
      )
      .take(250)
  },
})

export const create = mutation({
  args: {
    userId: v.id('users'),
    amount: v.number(),
    currency: v.string(),
    description: v.string(),
    category: v.string(),
    merchant: v.optional(v.string()),
    spentAt: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const expenseId = await ctx.db.insert('expenses', {
      ...args,
      createdAt: now,
      updatedAt: now,
    })
    return expenseId
  },
})

export const update = mutation({
  args: {
    id: v.id('expenses'),
    amount: v.optional(v.number()),
    currency: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    merchant: v.optional(v.string()),
    spentAt: v.optional(v.string()),
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
  args: { id: v.id('expenses') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})

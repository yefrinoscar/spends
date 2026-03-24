import { query, mutation } from './_generated/server'
import { v } from 'convex/values'

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .unique()
  },
})

export const create = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    currency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const userId = await ctx.db.insert('users', {
      email: args.email,
      name: args.name,
      currency: args.currency,
      createdAt: now,
      updatedAt: now,
    })
    return userId
  },
})

export const update = mutation({
  args: {
    id: v.id('users'),
    name: v.optional(v.string()),
    currency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      name: args.name,
      currency: args.currency,
      updatedAt: Date.now(),
    })
  },
})

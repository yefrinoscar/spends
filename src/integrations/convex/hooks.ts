// Convex React Query integration hooks
// These wrappers make it easy to use Convex with TanStack Query

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useConvex } from 'convex/react'

// Define the API type since we can't import the generated api during dev
// This will be replaced with the actual generated api when running convex dev
const api = {
  users: {
    getByEmail: 'users:getByEmail' as const,
    create: 'users:create' as const,
  },
  expenses: {
    listByUser: 'expenses:listByUser' as const,
    create: 'expenses:create' as const,
  },
  monthlySpend: {
    getMonthlySpendSummary: 'monthlySpend:getMonthlySpendSummary' as const,
  },
} as const

// Example: Get user by email
export function useUser(email: string | undefined) {
  const convex = useConvex()

  return useQuery({
    queryKey: ['user', email],
    queryFn: () => convex.query(api.users.getByEmail as any, { email: email! }),
    enabled: !!email,
  })
}

// Example: Get expenses for user
export function useExpenses(userId: string | undefined) {
  const convex = useConvex()

  return useQuery({
    queryKey: ['expenses', userId],
    queryFn: () => convex.query(api.expenses.listByUser as any, { userId }),
    enabled: !!userId,
  })
}

// Example: Create expense mutation
export function useCreateExpense() {
  const convex = useConvex()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      userId: string
      amount: number
      currency: string
      description: string
      category: string
      merchant?: string
      spentAt: string
    }) => convex.mutation(api.expenses.create as any, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    },
  })
}

export function useMonthlySpendSummary(
  userId: string | undefined,
  month: string | undefined,
  currency?: string,
) {
  const convex = useConvex()

  return useQuery({
    queryKey: ['monthly-spend', userId, month, currency],
    queryFn: () =>
      convex.query(api.monthlySpend.getMonthlySpendSummary as any, {
        userId,
        month,
        currency,
      }),
    enabled: !!userId && !!month,
  })
}

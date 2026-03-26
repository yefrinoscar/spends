import type { Debt } from '@/lib/finance'

export interface DebtDraft {
  name: string
  lender: string
  type: Debt['type']
  currency: string
  balance: string
  rate: string
  payments: string
  dueDate: string
}

export type DebtDraftField = keyof DebtDraft

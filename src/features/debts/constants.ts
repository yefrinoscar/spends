import type { Debt } from '@/lib/finance'

export const INSTALLMENT_TIMELINE_LIMIT = 18
export const MAX_INSTALLMENT_OPTIONS = 60

export const INSTALLMENT_COUNT_OPTIONS = Array.from(
  { length: MAX_INSTALLMENT_OPTIONS },
  (_, index) => index + 1,
)

export const DEBT_TYPE_OPTIONS: Debt['type'][] = [
  'Credit card',
  'Loan',
  'Mortgage',
  'Other',
]

import type { Debt } from '@/lib/finance'

export function getDebtInstallmentState(debt: Debt) {
  const plans = debt.installmentPlans ?? []
  const activePlan =
    debt.activePlan ?? plans.find((plan) => plan.status === 'active') ?? null
  const fallbackTotalInstallments = Math.max(1, Math.round(debt.payments || 1))
  const totalInstallments =
    activePlan?.installmentsTotal ?? fallbackTotalInstallments
  const fallbackRemainingInstallments = Math.max(
    0,
    Math.min(
      totalInstallments,
      Math.round(debt.remainingInstallments ?? totalInstallments),
    ),
  )
  const fallbackPaidCount = Math.max(
    0,
    totalInstallments - fallbackRemainingInstallments,
  )
  const nextInstallmentNumber = Math.min(
    totalInstallments + 1,
    activePlan?.nextInstallmentNumber ?? fallbackPaidCount + 1,
  )
  const planVersion = activePlan?.version ?? debt.currentPlanVersion ?? 1
  const payments = (debt.installmentPayments ?? [])
    .filter((payment) => payment.planVersion === planVersion)
    .sort(
      (left, right) =>
        left.installmentNumber - right.installmentNumber ||
        left.paidAt.localeCompare(right.paidAt),
    )
  const paidCount = Math.max(fallbackPaidCount, payments.length)
  const remainingInstallments = Math.max(0, totalInstallments - paidCount)

  return {
    activePlan,
    totalDebt: debt.originalBalance ?? debt.balance,
    totalInstallments,
    paidCount,
    remainingInstallments,
    nextInstallmentNumber,
  }
}

export function getDebtPlanHistory(debt: Debt) {
  const payments = debt.installmentPayments ?? []

  return (debt.installmentPlans ?? [])
    .slice()
    .sort((left, right) => left.version - right.version)
    .map((plan) => ({
      ...plan,
      payments: payments
        .filter((payment) => payment.planVersion === plan.version)
        .sort(
          (left, right) =>
            left.installmentNumber - right.installmentNumber ||
            left.paidAt.localeCompare(right.paidAt),
        ),
    }))
}

export function getDebtPaymentTimeline(debt: Debt) {
  return getDebtPlanHistory(debt)
    .flatMap((plan) =>
      plan.payments.map((payment) => ({
        ...payment,
        planVersion: plan.version,
      })),
    )
    .sort(
      (left, right) =>
        left.planVersion - right.planVersion ||
        left.installmentNumber - right.installmentNumber ||
        left.paidAt.localeCompare(right.paidAt),
    )
}

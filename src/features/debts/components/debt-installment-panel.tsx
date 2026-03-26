import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/finance'
import type { Debt } from '@/lib/finance'
import { INSTALLMENT_TIMELINE_LIMIT } from '../constants'
import {
  getDebtInstallmentState,
  getDebtPaymentTimeline,
} from '../utils/debt-installments'

export function DebtInstallmentPanel({
  debt,
  busy,
  onPayNext,
}: {
  debt: Debt
  busy?: boolean
  onPayNext: (debtId: string) => void
}) {
  const {
    activePlan,
    nextInstallmentNumber,
    paidCount,
    remainingInstallments,
    totalDebt,
    totalInstallments,
  } = getDebtInstallmentState(debt)
  const timeline = getDebtPaymentTimeline(debt)
  const visibleTimeline = timeline.slice(-INSTALLMENT_TIMELINE_LIMIT)
  const hiddenTimelineCount = Math.max(
    timeline.length - visibleTimeline.length,
    0,
  )
  const canPayNext =
    debt.status !== 'closed' && nextInstallmentNumber <= totalInstallments

  return (
    <section className="border-t border-border pt-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground-faint">
            Installment plan
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {activePlan
              ? `Plan v${activePlan.version}`
              : 'Installment timeline'}
          </p>
        </div>
        {canPayNext ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() => onPayNext(debt.id)}
          >
            Pay #{nextInstallmentNumber}
          </Button>
        ) : (
          <span className="text-[11px] font-semibold text-success">
            {debt.status === 'closed' ? 'Debt paid' : 'No pending installment'}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border pb-3 text-xs">
        <div className="flex items-baseline gap-2">
          <span className="uppercase tracking-[0.12em] text-foreground-faint">
            Original
          </span>
          <span className="font-mono text-sm text-muted-foreground">
            {formatCurrency(totalDebt, debt.currency)}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="uppercase tracking-[0.12em] text-foreground-faint">
            Pending
          </span>
          <span className="font-mono text-sm text-foreground">
            {formatCurrency(debt.balance, debt.currency)}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="uppercase tracking-[0.12em] text-foreground-faint">
            Progress
          </span>
          <span className="text-foreground">
            {paidCount}/{totalInstallments} installments
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="uppercase tracking-[0.12em] text-foreground-faint">
            Remaining
          </span>
          <span className="text-foreground">
            {remainingInstallments} installments
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground-faint">
          Paid installments
        </p>
        {visibleTimeline.length ? (
          <div className="relative mt-3 border-l border-[color-mix(in_srgb,var(--foreground)_16%,transparent)] pl-4">
            <div className="space-y-4">
              {visibleTimeline.map((payment) => (
                <div
                  key={`${payment.planVersion}-${payment.installmentNumber}-${payment.paidAt}`}
                  className="relative"
                >
                  <span className="absolute -left-[1.15rem] top-1.5 h-2.5 w-2.5 rounded-full bg-success" />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Installment #{payment.installmentNumber}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Plan v{payment.planVersion} ·{' '}
                        {format(
                          new Date(`${payment.paidAt}T00:00:00`),
                          'dd MMM yyyy',
                        )}
                      </p>
                    </div>
                    <span className="font-mono text-sm text-foreground">
                      {formatCurrency(payment.amountPaid, debt.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            No paid installments yet. Your first payment will appear here.
          </p>
        )}
        {hiddenTimelineCount ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Showing the latest {visibleTimeline.length} paid installments.
          </p>
        ) : null}
      </div>
    </section>
  )
}

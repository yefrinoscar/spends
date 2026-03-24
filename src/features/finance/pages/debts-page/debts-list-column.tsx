import { useMemo, useState } from 'react'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { AnimatedCurrencyValue } from '@/features/finance/shared'
import type { FinanceActions } from '@/features/finance/shared'
import { DebtForm } from '@/features/finance/forms'
import { formatCurrency } from '@/lib/finance'
import type { Debt } from '@/lib/finance'

interface DebtsListColumnProps {
  debts: Debt[]
  defaultCurrency: string
  actions: FinanceActions
}

export function DebtsListColumn({
  debts,
  defaultCurrency,
  actions,
}: DebtsListColumnProps) {
  const [showNewDebt, setShowNewDebt] = useState(false)
  const [editingDebtId, setEditingDebtId] = useState<string | null>(null)

  const debtScope = useMemo(() => {
    const debtsInDefaultCurrency = debts.filter(
      (debt) => debt.currency === defaultCurrency,
    )

    return debtsInDefaultCurrency.length ? debtsInDefaultCurrency : debts
  }, [debts, defaultCurrency])

  const monthlyPlanRowsByDebtId = useMemo(() => {
    const map = new Map<string, Array<{ key: string; payment: number }>>()

    debtScope.forEach((debt) => {
      const plannedInstallments = Math.max(1, Math.round(debt.payments || 1))
      const installmentPayment = debt.balance / plannedInstallments
      const rows: Array<{ key: string; payment: number }> = []

      for (let i = 0; i < plannedInstallments; i++) {
        rows.push({
          key: `planned-${debt.id}-${i}`,
          payment: installmentPayment,
        })
      }

      if (rows.length > 0) {
        map.set(debt.id, rows)
      }
    })

    return map
  }, [debtScope])

  const editingDebt = debts.find((debt) => debt.id === editingDebtId) ?? null

  function openNewDebtForm() {
    setEditingDebtId(null)
    setShowNewDebt(true)
  }

  function openEditDebtForm(debtId: string) {
    setEditingDebtId(debtId)
    setShowNewDebt(true)
  }

  function closeDebtForm() {
    setShowNewDebt(false)
    setEditingDebtId(null)
  }
  return (
    <div className="flex flex-col rounded-[1.1rem] border border-[var(--border)] bg-[var(--panel)] p-3 sm:p-3.5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="eyebrow">Debts</p>
          <h2 className="mt-1 text-base font-semibold tracking-tight text-[var(--foreground)]">
            Debt details
          </h2>
        </div>
        <Button
          size="sm"
          variant={showNewDebt ? 'outline' : 'secondary'}
          onClick={showNewDebt ? closeDebtForm : openNewDebtForm}
        >
          {showNewDebt ? 'Close' : 'New'}
        </Button>
      </div>

      {debtScope.length ? (
        <div className="space-y-2">
          {debtScope.map((debt) => {
            const installmentRows = monthlyPlanRowsByDebtId.get(debt.id) ?? []
            const actualInstallments = installmentRows.length
            const plannedInstallments = Math.max(
              1,
              Math.round(debt.payments || 1),
            )

            const dueDateObj = new Date(debt.dueDate + 'T00:00:00')
            const dueMonth = dueDateObj
              .toLocaleString('en', { month: 'short' })
              .toUpperCase()
            const dueDay = dueDateObj.getDate()

            return (
              <div
                key={debt.id}
                className="cursor-pointer rounded-lg bg-[var(--surface-muted)] p-2.5 transition-colors hover:bg-[var(--panel-elevated)]"
                onClick={() => openEditDebtForm(debt.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openEditDebtForm(debt.id)
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-start gap-3 mb-2">
                  <div className="flex min-w-[44px] flex-col items-center justify-center rounded-lg border border-[var(--border)] bg-[color-mix(in_srgb,var(--warning)_16%,var(--panel))] px-2 py-1.5">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-[var(--warning)]">
                      {dueMonth}
                    </span>
                    <span className="text-lg font-bold leading-tight text-[var(--foreground)]">
                      {dueDay}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-base font-medium text-[var(--foreground)] truncate outline-none border-none focus:outline-none focus:ring-0 focus:border-none"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={async (e) => {
                        const newName =
                          e.currentTarget.textContent?.trim() || debt.name
                        if (newName !== debt.name) {
                          await actions.updateDebt({
                            id: debt.id,
                            value: { ...debt, name: newName },
                          })
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          e.currentTarget.blur()
                        }
                      }}
                      style={{ outline: 'none', border: 'none' }}
                    >
                      {debt.name}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-[var(--foreground-faint)]">
                      <span>
                        {debt.lender} · {debt.type}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className="h-6 w-6"
                        size="icon"
                        variant="ghost"
                        onClick={(event) => event.stopPropagation()}
                        onPointerDown={(event) => event.stopPropagation()}
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <DropdownMenuItem
                        onClick={(event) => {
                          event.stopPropagation()
                          openEditDebtForm(debt.id)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit debt
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(event) => {
                          event.stopPropagation()
                          void actions.removeItem({
                            kind: 'debts',
                            id: debt.id,
                          })
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete debt
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="ml-[56px] mb-2 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--foreground-soft)]">
                      Balance
                    </span>
                    <AnimatedCurrencyValue
                      className="font-mono text-[var(--foreground)]"
                      currency={debt.currency}
                      value={debt.balance}
                    />
                  </div>
                </div>
                <div className="ml-[56px] border-t border-[var(--border)] pt-2">
                  <p className="mb-2 text-sm font-semibold tracking-tight text-[var(--foreground-soft)]">
                    Installments ({actualInstallments} payments)
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {installmentRows.length ? (
                      installmentRows.map((row, index) => (
                        <div
                          key={row.key}
                          className="inline-flex items-center gap-1 rounded-md bg-[color-mix(in_srgb,var(--warning)_20%,transparent)] px-2 py-1 text-xs font-semibold text-[var(--warning)]"
                        >
                          {index + 1}/{actualInstallments}{' '}
                          {formatCurrency(row.payment, debt.currency)}
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-[var(--foreground-soft)]">
                        {plannedInstallments} planned installments
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-lg border-dashed p-4 text-center text-base text-[var(--foreground-soft)] opacity-50">
          No debts yet. Click New to add one.
        </div>
      )}

      <Sheet
        open={showNewDebt}
        onOpenChange={(open) => !open && closeDebtForm()}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          {editingDebt ? (
            <div className="space-y-3">
              <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                {editingDebt.name}
              </h1>
              <div className="mt-6">
                <DebtForm
                  busy={actions.isWorking}
                  defaultCurrency={defaultCurrency}
                  initialValue={editingDebt}
                  submitLabel="Save changes"
                  onCancel={closeDebtForm}
                  onSubmit={async (value) => {
                    await actions.updateDebt({
                      id: editingDebt.id,
                      value,
                    })
                    closeDebtForm()
                  }}
                />
              </div>
            </div>
          ) : (
            <>
              <SheetHeader>
                <SheetTitle>New debt</SheetTitle>
                <SheetDescription>
                  Add a new debt with amount, interest, and payment schedule.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <DebtForm
                  busy={actions.isWorking}
                  defaultCurrency={defaultCurrency}
                  initialValue={null}
                  submitLabel="Add debt"
                  onCancel={closeDebtForm}
                  onSubmit={async (value) => {
                    await actions.createItem({ kind: 'debts', value })
                    closeDebtForm()
                  }}
                />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

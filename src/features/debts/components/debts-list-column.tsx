import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { FinanceActions } from '@/features/finance/shared'
import type { Debt } from '@/lib/finance'
import { useDebtsListColumn } from '../hooks/use-debts-list-column'
import { debtToDraft } from '../utils/debt-draft'
import { DebtEditor } from './debt-editor'
import { DebtInstallmentPanel } from './debt-installment-panel'
import { DebtListItem } from './debt-list-item'

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
  const {
    closeCreateDebtForm,
    closeEditDebtForm,
    commitEditField,
    createInitialDraft,
    debtScope,
    editingDebt,
    editingDebtId,
    openCreateDebtForm,
    openEditDebtForm,
    payNextInstallment,
    removeDebt,
    showCreateDebt,
    submitCreateDebt,
  } = useDebtsListColumn({
    actions,
    debts,
    defaultCurrency,
  })

  return (
    <div className="inline-block w-[320px] align-top rounded-[1.1rem] border border-border bg-card p-3 sm:p-3.5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="eyebrow">Debts</p>
          <h2 className="mt-1 text-base font-semibold tracking-tight text-foreground">
            Debt details
          </h2>
        </div>
        <button
          type="button"
          className="inline-flex h-8 items-center justify-center rounded-md border border-border px-3 text-sm font-medium transition hover:bg-muted"
          onClick={showCreateDebt ? closeCreateDebtForm : openCreateDebtForm}
        >
          {showCreateDebt ? 'Close' : 'New'}
        </button>
      </div>

      {debtScope.length ? (
        <div className="space-y-2">
          {debtScope.map((debt) => (
            <DebtListItem
              key={debt.id}
              debt={debt}
              onOpenEdit={openEditDebtForm}
              onPayNext={payNextInstallment}
              onRemove={removeDebt}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border-dashed p-4 text-center text-base text-muted-foreground opacity-50">
          No debts yet. Click New to add one.
        </div>
      )}

      {editingDebt ? (
        <Dialog
          open={Boolean(editingDebtId)}
          onOpenChange={(open) => !open && closeEditDebtForm()}
        >
          <DialogContent className="max-h-[92vh] overflow-y-auto p-5 sm:p-6">
            <DialogHeader className="sr-only">
              <DialogTitle>Edit debt</DialogTitle>
              <DialogDescription>
                Update the debt title, lender, amount, and schedule.
              </DialogDescription>
            </DialogHeader>
            <DebtEditor
              busy={actions.isWorking}
              initialDraft={debtToDraft(editingDebt)}
              mode="edit"
              onFieldCommit={commitEditField}
            />
            <div className="mt-4">
              <DebtInstallmentPanel
                busy={actions.isWorking}
                debt={editingDebt}
                onPayNext={payNextInstallment}
              />
            </div>
          </DialogContent>
        </Dialog>
      ) : null}

      <Dialog
        open={showCreateDebt}
        onOpenChange={(open) => !open && closeCreateDebtForm()}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto p-5 sm:p-6">
          <DialogHeader className="sr-only">
            <DialogTitle>New debt</DialogTitle>
            <DialogDescription>
              Add a new debt with amount, interest, and payment schedule.
            </DialogDescription>
          </DialogHeader>
          <DebtEditor
            busy={actions.isWorking}
            initialDraft={createInitialDraft}
            mode="create"
            onCancel={closeCreateDebtForm}
            onSubmit={submitCreateDebt}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

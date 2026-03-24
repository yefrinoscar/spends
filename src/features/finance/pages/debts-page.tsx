import { FinancePageState } from '@/features/finance/shared'
import type { FinanceActions } from '@/features/finance/shared'
import type { DashboardData } from '@/lib/finance'
import { DebtsListColumn } from './debts-page/debts-list-column'
import { RecurringPaymentsColumn } from './debts-page/recurring-payments-column'
import { DebtsSummaryColumn } from './debts-page/debts-summary-column'

export function DebtsPage() {
  return (
    <FinancePageState>
      {(data, actions) => <DebtsView actions={actions} data={data} />}
    </FinancePageState>
  )
}

function DebtsView({
  data,
  actions,
}: {
  data: DashboardData
  actions: FinanceActions
}) {
  const defaultCurrency = data.settings.currency

  return (
    <main className="page-wrap flex flex-1 flex-col pb-4 pt-16 px-4">
      <section className="grid items-start gap-3 xl:grid-cols-3">
        <DebtsListColumn
          debts={data.debts}
          defaultCurrency={defaultCurrency}
          actions={actions}
        />

        <RecurringPaymentsColumn
          recurringPayments={data.recurringPayments}
          defaultCurrency={defaultCurrency}
          actions={actions}
        />

        <DebtsSummaryColumn
          debts={data.debts}
          recurringPayments={data.recurringPayments}
          defaultCurrency={defaultCurrency}
          actions={actions}
        />
      </section>
    </main>
  )
}

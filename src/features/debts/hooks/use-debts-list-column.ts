import { useCallback, useMemo, useState } from 'react'
import type { FinanceActions } from '@/features/finance/shared'
import { parseMoney } from '@/features/finance/shared'
import type { Debt } from '@/lib/finance'
import type { DebtDraft, DebtDraftField } from '../types'
import {
  createEmptyDebtDraft,
  draftToDebtValue,
  hasDebtDraftChanged,
  normalizeDebtDraftForUpdate,
} from '../utils/debt-draft'
import { getDebtInstallmentState } from '../utils/debt-installments'

export function useDebtsListColumn({
  actions,
  debts,
  defaultCurrency,
}: {
  actions: FinanceActions
  debts: Debt[]
  defaultCurrency: string
}) {
  const [showCreateDebt, setShowCreateDebt] = useState(false)
  const [editingDebtId, setEditingDebtId] = useState<string | null>(null)
  const [createInitialDraft, setCreateInitialDraft] = useState<DebtDraft>(() =>
    createEmptyDebtDraft(defaultCurrency),
  )

  const debtScope = useMemo(() => {
    const debtsInDefaultCurrency = debts.filter(
      (debt) => debt.currency === defaultCurrency,
    )

    return debtsInDefaultCurrency.length ? debtsInDefaultCurrency : debts
  }, [debts, defaultCurrency])

  const editingDebt = debts.find((debt) => debt.id === editingDebtId) ?? null

  const openCreateDebtForm = useCallback(() => {
    setCreateInitialDraft(createEmptyDebtDraft(defaultCurrency))
    setShowCreateDebt(true)
  }, [defaultCurrency])

  const openEditDebtForm = useCallback((debtId: string) => {
    setEditingDebtId(debtId)
  }, [])

  const closeCreateDebtForm = useCallback(() => {
    setShowCreateDebt(false)
  }, [])

  const closeEditDebtForm = useCallback(() => {
    setEditingDebtId(null)
  }, [])

  const removeDebt = useCallback(
    (debtId: string) => {
      void actions.removeItem({
        kind: 'debts',
        id: debtId,
      })
    },
    [actions],
  )

  const payNextInstallment = useCallback(
    async (debtId: string) => {
      await actions.payDebtInstallment({ debtId })
    },
    [actions],
  )

  const commitEditField = useCallback(
    async (field: DebtDraftField, _value: string, nextDraft: DebtDraft) => {
      if (!editingDebt) {
        return
      }

      const normalizedDraft = normalizeDebtDraftForUpdate(
        nextDraft,
        editingDebt,
      )

      if (!hasDebtDraftChanged(normalizedDraft, editingDebt, defaultCurrency)) {
        return
      }

      const currentPlanState = getDebtInstallmentState(editingDebt)
      const nextPayments = Math.max(
        1,
        Math.round(parseMoney(normalizedDraft.payments) || 1),
      )

      if (
        field === 'payments' &&
        nextPayments !== currentPlanState.totalInstallments &&
        currentPlanState.paidCount > 0
      ) {
        await actions.restructureDebtInstallments({
          debtId: editingDebt.id,
          payments: nextPayments,
        })
        return
      }

      await actions.updateDebt({
        id: editingDebt.id,
        value: {
          ...editingDebt,
          ...draftToDebtValue(normalizedDraft, defaultCurrency),
        },
      })
    },
    [actions, defaultCurrency, editingDebt],
  )

  const submitCreateDebt = useCallback(
    async (draft: DebtDraft) => {
      const value = draftToDebtValue(draft, defaultCurrency)

      if (!value.name.trim()) {
        return
      }

      await actions.createItem({ kind: 'debts', value })
      closeCreateDebtForm()
    },
    [actions, closeCreateDebtForm, defaultCurrency],
  )

  return {
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
  }
}

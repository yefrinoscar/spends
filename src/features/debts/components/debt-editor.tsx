import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { BadgeDollarSign, CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Select } from '@/components/ui/select'
import { DEBT_TYPE_OPTIONS, INSTALLMENT_COUNT_OPTIONS } from '../constants'
import type { DebtDraft, DebtDraftField } from '../types'
import { formatAmountInputValue, getCurrencySymbol } from '../utils/debt-draft'

export function DebtEditor({
  initialDraft,
  busy,
  mode,
  onCancel,
  onFieldCommit,
  onSubmit,
}: {
  initialDraft: DebtDraft
  busy?: boolean
  mode: 'create' | 'edit'
  onCancel?: () => void
  onFieldCommit?: (
    field: DebtDraftField,
    value: string,
    nextDraft: DebtDraft,
  ) => void | Promise<void>
  onSubmit?: (draft: DebtDraft) => void | Promise<void>
}) {
  const [draft, setDraft] = useState(initialDraft)
  const draftRef = useRef(initialDraft)

  useEffect(() => {
    draftRef.current = initialDraft
    setDraft(initialDraft)
  }, [initialDraft])

  const updateDraft = useCallback((field: DebtDraftField, value: string) => {
    setDraft((current) => {
      const nextDraft = { ...current, [field]: value }
      draftRef.current = nextDraft
      return nextDraft
    })
  }, [])

  const commitDraftField = useCallback(
    (field: DebtDraftField, value: string) => {
      const nextDraft = { ...draftRef.current, [field]: value }
      draftRef.current = nextDraft
      setDraft(nextDraft)
      void onFieldCommit?.(field, value, nextDraft)
    },
    [onFieldCommit],
  )

  return (
    <div className="space-y-4">
      <div>
        <input
          type="text"
          placeholder="Debt title"
          className="w-full bg-transparent text-2xl font-semibold tracking-tight text-foreground outline-none placeholder:text-foreground-faint"
          value={draft.name}
          onChange={(event) => updateDraft('name', event.currentTarget.value)}
          onBlur={(event) =>
            commitDraftField('name', event.currentTarget.value)
          }
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.currentTarget.blur()
            }
          }}
        />

        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs uppercase tracking-[0.12em] text-foreground-faint">
            Lender
          </span>
          <input
            type="text"
            placeholder="Lender"
            className="min-w-[170px] bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-foreground-faint"
            value={draft.lender}
            onChange={(event) =>
              updateDraft('lender', event.currentTarget.value)
            }
            onBlur={(event) =>
              commitDraftField('lender', event.currentTarget.value)
            }
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.currentTarget.blur()
              }
            }}
          />
        </div>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-xl font-semibold text-foreground">
          {getCurrencySymbol(draft.currency || 'USD')}
        </span>
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          placeholder="0.00"
          className="flex-1 bg-transparent text-xl font-semibold text-foreground outline-none placeholder:text-foreground-faint [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          value={draft.balance}
          onChange={(event) =>
            updateDraft('balance', event.currentTarget.value)
          }
          onBlur={(event) => {
            commitDraftField(
              'balance',
              formatAmountInputValue(event.currentTarget.value),
            )
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.currentTarget.blur()
            }
          }}
        />
      </div>

      <div className="space-y-3 pt-3">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-foreground-faint">
          Quick edit
        </p>
        <DebtQuickEditControls
          currency={draft.currency}
          dueDate={draft.dueDate}
          payments={draft.payments}
          type={draft.type}
          onCommit={commitDraftField}
          onUpdate={updateDraft}
        />
      </div>

      {mode === 'create' ? (
        <div className="flex items-center justify-end gap-2 pt-3">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={busy || !draft.name.trim()}
            onClick={() => {
              void onSubmit?.(draft)
            }}
          >
            Add debt
          </Button>
        </div>
      ) : null}
    </div>
  )
}

const chipClassName =
  'inline-flex items-center rounded-full border border-border bg-card px-1 py-0.5 text-xs transition-colors hover:border-[color-mix(in_srgb,var(--warning)_35%,var(--border))] hover:bg-[color-mix(in_srgb,var(--warning)_10%,transparent)]'

const DebtQuickEditControls = memo(function DebtQuickEditControls({
  currency,
  dueDate,
  payments,
  type,
  onCommit,
  onUpdate,
}: {
  currency: string
  dueDate: string
  payments: string
  type: string
  onCommit: (field: DebtDraftField, value: string) => void
  onUpdate: (field: DebtDraftField, value: string) => void
}) {
  const [showDueDatePicker, setShowDueDatePicker] = useState(false)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className={chipClassName}>
        <Select
          className="h-7 min-w-[138px] border-0 bg-transparent px-2 py-0 pr-7 text-xs font-semibold shadow-none"
          value={type}
          onChange={(event) => onCommit('type', event.currentTarget.value)}
        >
          {DEBT_TYPE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </div>

      <div className={chipClassName}>
        <Select
          className="h-7 min-w-[148px] border-0 bg-transparent px-2 py-0 pr-7 text-xs font-semibold shadow-none"
          value={payments}
          onChange={(event) => onCommit('payments', event.currentTarget.value)}
        >
          {INSTALLMENT_COUNT_OPTIONS.map((installments) => (
            <option key={installments} value={installments}>
              {installments} installments
            </option>
          ))}
        </Select>
      </div>

      <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1.5 text-xs transition-colors hover:border-[color-mix(in_srgb,var(--warning)_35%,var(--border))] hover:bg-[color-mix(in_srgb,var(--warning)_10%,transparent)]">
        <BadgeDollarSign className="h-3.5 w-3.5 shrink-0 text-foreground-faint" />
        <input
          type="text"
          placeholder="USD"
          maxLength={3}
          className="w-9 bg-transparent text-xs font-semibold uppercase text-foreground outline-none placeholder:text-foreground-faint"
          value={currency}
          onChange={(event) => onUpdate('currency', event.currentTarget.value)}
          onBlur={(event) => onCommit('currency', event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.currentTarget.blur()
            }
          }}
        />
      </div>

      <Popover open={showDueDatePicker} onOpenChange={setShowDueDatePicker}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-[color-mix(in_srgb,var(--warning)_35%,var(--border))] hover:bg-[color-mix(in_srgb,var(--warning)_10%,transparent)]"
          >
            <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-foreground-faint" />
            {dueDate
              ? format(new Date(dueDate + 'T00:00:00'), 'dd MMM')
              : 'Pick date'}
          </button>
        </PopoverTrigger>
        {showDueDatePicker ? (
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dueDate ? new Date(dueDate + 'T00:00:00') : undefined}
              onSelect={(date) => {
                if (!date) {
                  return
                }

                onCommit('dueDate', format(date, 'yyyy-MM-dd'))
                setShowDueDatePicker(false)
              }}
              initialFocus
            />
          </PopoverContent>
        ) : null}
      </Popover>
    </div>
  )
})

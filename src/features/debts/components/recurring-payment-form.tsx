import { Calendar as CalendarIcon, Plus } from 'lucide-react'
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Select } from '@/components/ui/select'
import { Field, parseMoney } from '@/features/finance/shared'
import type { RecurringPayment, RecurringPaymentStatus } from '@/lib/finance'

export function RecurringPaymentForm({
  onSubmit,
  busy,
  defaultCurrency,
  initialValue = null,
  submitLabel = 'Save recurring payment',
  onCancel,
}: {
  onSubmit: (
    value: Omit<RecurringPayment, 'id' | 'createdAt'>,
  ) => Promise<unknown>
  busy: boolean
  defaultCurrency: string
  initialValue?: RecurringPayment | null
  submitLabel?: string
  onCancel?: () => void
}) {
  const [form, setForm] = useState({
    name: '',
    category: '',
    currency: defaultCurrency,
    amount: '',
    dueDay: '1',
    startDate: undefined as Date | undefined,
    status: 'active' as RecurringPaymentStatus,
  })
  const isLegacyPaused = initialValue?.status === 'paused'

  useEffect(() => {
    if (!initialValue) {
      setForm({
        name: '',
        category: '',
        currency: defaultCurrency,
        amount: '',
        dueDay: '1',
        startDate: undefined,
        status: 'active',
      })

      return
    }

    setForm((current) => ({
      ...current,
      name: initialValue.name,
      category: initialValue.category,
      currency: initialValue.currency,
      amount: String(initialValue.amount),
      dueDay: String(initialValue.dueDay),
      startDate: initialValue.startDate
        ? new Date(initialValue.startDate + 'T00:00:00')
        : undefined,
      status: initialValue.status === 'paused' ? 'active' : initialValue.status,
    }))
  }, [defaultCurrency, initialValue])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.name.trim()) {
      return
    }

    await onSubmit({
      name: form.name.trim(),
      category: form.category.trim() || 'Subscription',
      currency: form.currency,
      amount: parseMoney(form.amount),
      dueDay: Math.max(
        1,
        Math.min(31, Math.round(parseMoney(form.dueDay) || 1)),
      ),
      startDate: form.startDate
        ? form.startDate.toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      status: form.status,
    })

    if (!initialValue) {
      setForm({
        name: '',
        category: '',
        currency: defaultCurrency,
        amount: '',
        dueDay: '1',
        startDate: undefined,
        status: 'active',
      })
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Field htmlFor="recurring-name" label="Name">
        <Input
          id="recurring-name"
          value={form.name}
          onChange={(event) =>
            setForm((current) => ({ ...current, name: event.target.value }))
          }
          placeholder="Netflix subscription"
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field htmlFor="recurring-category" label="Category">
          <Input
            id="recurring-category"
            value={form.category}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                category: event.target.value,
              }))
            }
            placeholder="Subscription, Rent, etc."
          />
        </Field>
        <Field htmlFor="recurring-currency" label="Currency">
          <Select
            id="recurring-currency"
            value={form.currency}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                currency: event.target.value,
              }))
            }
          >
            <option value="USD">USD</option>
            <option value="PEN">PEN</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="MXN">MXN</option>
            <option value="COP">COP</option>
          </Select>
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field htmlFor="recurring-amount" label="Amount">
          <Input
            id="recurring-amount"
            inputMode="decimal"
            type="number"
            step="0.01"
            value={form.amount}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                amount: event.target.value,
              }))
            }
            placeholder="0"
          />
        </Field>
        <Field htmlFor="recurring-day" label="Due day of month">
          <Input
            id="recurring-day"
            type="number"
            min="1"
            max="31"
            value={form.dueDay}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                dueDay: event.target.value,
              }))
            }
            placeholder="1"
          />
        </Field>
      </div>

      <div className="space-y-2">
        <Label>Start date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
              data-empty={!form.startDate}
            >
              <CalendarIcon className="h-4 w-4" />
              {form.startDate
                ? format(form.startDate, 'PPP')
                : 'Pick start date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={form.startDate}
              onSelect={(date) =>
                setForm((current) => ({ ...current, startDate: date }))
              }
              captionLayout="dropdown"
              fromYear={2018}
              toYear={2035}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {initialValue ? (
        <Field htmlFor="recurring-status" label="Status">
          <Select
            id="recurring-status"
            value={form.status}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                status: event.target.value as RecurringPaymentStatus,
              }))
            }
          >
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
          </Select>
          {isLegacyPaused ? (
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Paused is now treated as a legacy state. Save this payment as
              active or cancelled.
            </p>
          ) : null}
        </Field>
      ) : null}

      <div className="flex gap-2">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
          >
            Cancel
          </Button>
        ) : null}
        <Button className="flex-1" disabled={busy} type="submit">
          <Plus className="h-4 w-4" />
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

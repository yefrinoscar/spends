import { Plus } from 'lucide-react'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Field, parseMoney } from '@/features/finance/shared'
import type { Income, IncomeFrequency } from '@/lib/finance'

export function IncomeForm({
  onSubmit,
  busy,
}: {
  onSubmit: (value: Omit<Income, 'id' | 'createdAt'>) => Promise<unknown>
  busy: boolean
}) {
  const [form, setForm] = useState({
    name: '',
    source: '',
    amount: '',
    frequency: 'Monthly' as IncomeFrequency,
    nextDate: '',
  })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.name.trim()) {
      return
    }

    await onSubmit({
      name: form.name.trim(),
      source: form.source.trim() || 'Personal source',
      amount: parseMoney(form.amount),
      frequency: form.frequency,
      nextDate: form.nextDate || new Date().toISOString().slice(0, 10),
    })

    setForm({
      name: '',
      source: '',
      amount: '',
      frequency: 'Monthly',
      nextDate: '',
    })
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Field htmlFor="income-name" label="Name">
        <Input
          id="income-name"
          value={form.name}
          onChange={(event) =>
            setForm((current) => ({ ...current, name: event.target.value }))
          }
          placeholder="Salary"
        />
      </Field>
      <Field htmlFor="income-source" label="Source">
        <Input
          id="income-source"
          value={form.source}
          onChange={(event) =>
            setForm((current) => ({ ...current, source: event.target.value }))
          }
          placeholder="Company or client"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field htmlFor="income-amount" label="Amount">
          <Input
            id="income-amount"
            type="number"
            value={form.amount}
            onChange={(event) =>
              setForm((current) => ({ ...current, amount: event.target.value }))
            }
            placeholder="0"
          />
        </Field>
        <Field htmlFor="income-frequency" label="Frequency">
          <Select
            id="income-frequency"
            value={form.frequency}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                frequency: event.target.value as IncomeFrequency,
              }))
            }
          >
            <option>Weekly</option>
            <option>Biweekly</option>
            <option>Monthly</option>
            <option>Quarterly</option>
            <option>Yearly</option>
            <option>One-time</option>
          </Select>
        </Field>
      </div>
      <Field htmlFor="income-date" label="Next date">
        <Input
          id="income-date"
          type="date"
          value={form.nextDate}
          onChange={(event) =>
            setForm((current) => ({ ...current, nextDate: event.target.value }))
          }
        />
      </Field>
      <Button className="w-full" disabled={busy} type="submit">
        <Plus className="h-4 w-4" />
        Add income
      </Button>
    </form>
  )
}

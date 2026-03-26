import { Plus } from 'lucide-react'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Field, parseMoney } from '@/features/finance/shared'
import type { Investment, InvestmentType } from '@/lib/finance'

export function InvestmentForm({
  onSubmit,
  busy,
}: {
  onSubmit: (value: Omit<Investment, 'id' | 'createdAt'>) => Promise<unknown>
  busy: boolean
}) {
  const [form, setForm] = useState({
    name: '',
    account: '',
    type: 'ETF' as InvestmentType,
    currentValue: '',
    monthlyContribution: '',
    changePct: '',
  })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.name.trim()) {
      return
    }

    await onSubmit({
      name: form.name.trim(),
      account: form.account.trim() || 'Personal account',
      type: form.type,
      currentValue: parseMoney(form.currentValue),
      monthlyContribution: parseMoney(form.monthlyContribution),
      changePct: parseMoney(form.changePct),
    })

    setForm({
      name: '',
      account: '',
      type: 'ETF',
      currentValue: '',
      monthlyContribution: '',
      changePct: '',
    })
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Field htmlFor="investment-name" label="Name">
        <Input
          id="investment-name"
          value={form.name}
          onChange={(event) =>
            setForm((current) => ({ ...current, name: event.target.value }))
          }
          placeholder="Core ETF basket"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field htmlFor="investment-account" label="Account">
          <Input
            id="investment-account"
            value={form.account}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                account: event.target.value,
              }))
            }
            placeholder="Brokerage"
          />
        </Field>
        <Field htmlFor="investment-type" label="Type">
          <Select
            id="investment-type"
            value={form.type}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                type: event.target.value as InvestmentType,
              }))
            }
          >
            <option>ETF</option>
            <option>Retirement</option>
            <option>Crypto</option>
            <option>Brokerage</option>
            <option>Cash</option>
          </Select>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field htmlFor="investment-value" label="Current value">
          <Input
            id="investment-value"
            type="number"
            value={form.currentValue}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                currentValue: event.target.value,
              }))
            }
            placeholder="0"
          />
        </Field>
        <Field htmlFor="investment-monthly" label="Monthly contribution">
          <Input
            id="investment-monthly"
            type="number"
            value={form.monthlyContribution}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                monthlyContribution: event.target.value,
              }))
            }
            placeholder="0"
          />
        </Field>
      </div>
      <Field htmlFor="investment-change" label="Change %">
        <Input
          id="investment-change"
          type="number"
          step="0.1"
          value={form.changePct}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              changePct: event.target.value,
            }))
          }
          placeholder="0"
        />
      </Field>
      <Button className="w-full" disabled={busy} type="submit">
        <Plus className="h-4 w-4" />
        Add investment
      </Button>
    </form>
  )
}

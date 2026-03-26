import { Plus } from 'lucide-react'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Field, parseMoney } from '@/features/finance/shared'
import type { Goal, GoalType } from '@/lib/finance'

export function GoalForm({
  onSubmit,
  busy,
}: {
  onSubmit: (value: Omit<Goal, 'id' | 'createdAt'>) => Promise<unknown>
  busy: boolean
}) {
  const [form, setForm] = useState({
    name: '',
    type: 'Emergency' as GoalType,
    target: '',
    current: '',
    deadline: '',
  })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.name.trim()) {
      return
    }

    await onSubmit({
      name: form.name.trim(),
      type: form.type,
      target: parseMoney(form.target),
      current: parseMoney(form.current),
      deadline: form.deadline || new Date().toISOString().slice(0, 10),
    })

    setForm({
      name: '',
      type: 'Emergency',
      target: '',
      current: '',
      deadline: '',
    })
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Field htmlFor="goal-name" label="Name">
        <Input
          id="goal-name"
          value={form.name}
          onChange={(event) =>
            setForm((current) => ({ ...current, name: event.target.value }))
          }
          placeholder="Emergency fund"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field htmlFor="goal-type" label="Type">
          <Select
            id="goal-type"
            value={form.type}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                type: event.target.value as GoalType,
              }))
            }
          >
            <option>Emergency</option>
            <option>Debt payoff</option>
            <option>Investment</option>
            <option>Income</option>
          </Select>
        </Field>
        <Field htmlFor="goal-deadline" label="Deadline">
          <Input
            id="goal-deadline"
            type="date"
            value={form.deadline}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                deadline: event.target.value,
              }))
            }
          />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field htmlFor="goal-target" label="Target">
          <Input
            id="goal-target"
            type="number"
            value={form.target}
            onChange={(event) =>
              setForm((current) => ({ ...current, target: event.target.value }))
            }
            placeholder="0"
          />
        </Field>
        <Field htmlFor="goal-current" label="Current">
          <Input
            id="goal-current"
            type="number"
            value={form.current}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                current: event.target.value,
              }))
            }
            placeholder="0"
          />
        </Field>
      </div>
      <Button className="w-full" disabled={busy} type="submit">
        <Plus className="h-4 w-4" />
        Add goal
      </Button>
    </form>
  )
}

import { Link } from '@tanstack/react-router'
import {
  ArrowDownToLine,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Coins,
  Landmark,
  MoreVertical,
  Pencil,
  PiggyBank,
  Plus,
  ShieldCheck,
  Target,
  TrendingUp,
  Trash2,
  WalletCards,
} from 'lucide-react'
import type { FormEvent, ReactNode } from 'react'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  formatPercent,
  getAverageInvestmentChange,
  getDebtMonthlyPayment,
  getAverageRate,
  getDashboardSummary,
  getDebtMonthlyPlan,
  getDebtMonthlyTotalsByCurrency,
  getDebtProjection,
  getMonthlyIncomeAmount,
  getRecentEntries,
  getSoonestDate,
  isSeedDataActive,
  useFinanceActions,
  useFinanceDashboard,
} from '@/lib/finance'
import type {
  DashboardData,
  Debt,
  DebtProjectionPoint,
  DebtType,
  Goal,
  GoalType,
  Income,
  IncomeFrequency,
  Investment,
  InvestmentType,
} from '@/lib/finance'

type FinanceActions = ReturnType<typeof useFinanceActions>

type DebtPlanTableRow = {
  key: string
  monthLabel: string
  debtId: string
  debtName: string
  payment: number
  interest: number
  endingBalance: number
  monthTotalPayment: number
  installmentNumber: number
  installmentTotal: number
}

function useHydrated() {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  return hydrated
}

function FinancePageState({
  children,
}: {
  children: (data: DashboardData, actions: FinanceActions) => ReactNode
}) {
  const hydrated = useHydrated()
  const dashboardQuery = useFinanceDashboard(hydrated)
  const actions = useFinanceActions()

  if (!hydrated || dashboardQuery.isPending) {
    return <LoadingState />
  }

  if (dashboardQuery.isError) {
    return (
      <main className="page-wrap px-4 pb-16 pt-10">
        <Card>
          <CardHeader>
            <CardTitle>Could not load your desk</CardTitle>
            <CardDescription>
              Refresh the page to try again. Your browser storage might be
              blocked.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    )
  }

  return <>{children(dashboardQuery.data, actions)}</>
}

function LoadingState() {
  return (
    <main className="page-wrap px-4 pb-16 pt-10">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-32 rounded-md bg-[var(--panel)]" />
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_300px]">
          <div className="h-[320px] rounded-[1.5rem] border border-[var(--border)] bg-[var(--panel)]" />
          <div className="h-[320px] rounded-[1.5rem] border border-[var(--border)] bg-[var(--panel)]" />
        </div>
        <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-14 rounded-xl bg-[var(--surface-muted)]"
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

function PageIntro({
  eyebrow,
  title,
  description,
  meta,
}: {
  eyebrow: string
  title: string
  description: string
  meta: { label: string; value: string }[]
}) {
  return (
    <section className="relative overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--panel)] px-6 py-6 sm:px-8 sm:py-8">
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--border-strong),transparent)]" />
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-[2.35rem]">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--foreground-soft)] sm:text-[15px]">
            {description}
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3 xl:min-w-[22rem]">
          {meta.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-3"
            >
              <p className="eyebrow text-[var(--foreground-faint)]">
                {item.label}
              </p>
              <p className="mt-1.5 text-sm font-semibold tracking-tight text-[var(--foreground)] sm:text-[15px]">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function MetricCard({
  title,
  value,
  note,
  icon: Icon,
}: {
  title: string
  value: string
  note: string
  icon: typeof WalletCards
}) {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow text-[var(--foreground-faint)]">{title}</p>
          <div className="grid h-10 w-10 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground)]">
            <Icon className="h-4.5 w-4.5" />
          </div>
        </div>
        <div>
          <p className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-[1.85rem]">
            {value}
          </p>
          <p className="mt-1.5 text-sm leading-6 text-[var(--foreground-soft)]">
            {note}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function SectionTitle({
  title,
  description,
  badge,
}: {
  title: string
  description: string
  badge?: string
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-6 text-[var(--foreground-soft)]">
          {description}
        </p>
      </div>
      {badge ? <Badge>{badge}</Badge> : null}
    </div>
  )
}

function EmptyRow({ message, colSpan }: { message: string; colSpan: number }) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className="py-12 text-center text-sm text-[var(--foreground-soft)]"
      >
        {message}
      </TableCell>
    </TableRow>
  )
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
}

function currencyVariant(kind: 'Debt' | 'Income' | 'Investment' | 'Goal') {
  switch (kind) {
    case 'Income':
    case 'Investment':
      return 'success'
    case 'Goal':
      return 'default'
    case 'Debt':
      return 'warning'
  }
}

function parseMoney(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function sortByDateAscending<T>(items: T[], getter: (item: T) => string) {
  return [...items].sort(
    (left, right) => +new Date(getter(left)) - +new Date(getter(right)),
  )
}

function buildLinePath(
  points: { x: number; y: number }[],
  closeToBaseline = false,
  baseline = 0,
) {
  if (!points.length) {
    return ''
  }

  const firstPoint = points[0]
  const path = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')

  if (!closeToBaseline) {
    return path
  }

  const lastPoint = points[points.length - 1]

  return `${path} L ${lastPoint.x} ${baseline} L ${firstPoint.x} ${baseline} Z`
}

function getProjectionMarkers(points: DebtProjectionPoint[]) {
  if (!points.length) {
    return []
  }

  const markerIndexes = new Set([
    0,
    Math.floor((points.length - 1) / 2),
    points.length - 1,
  ])

  return [...markerIndexes].map((index) => points[index]).filter(Boolean)
}

function DebtProjectionChart({
  points,
  currency,
}: {
  points: DebtProjectionPoint[]
  currency: string
}) {
  const [activeIndex, setActiveIndex] = useState(points.length - 1)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setActiveIndex(Math.max(points.length - 1, 0))
  }, [points.length])

  if (!points.length) {
    return (
      <div className="flex h-[80px] items-center justify-center rounded-2xl border border-dashed border-[var(--border)] text-sm text-[var(--foreground-soft)]">
        Add a debt to see the payoff curve.
      </div>
    )
  }

  const width = 700
  const height = 80
  const paddingX = 10
  const paddingTop = 12
  const paddingBottom = 26
  const maxBalance = Math.max(...points.map((point) => point.balance), 1)
  const stepX =
    points.length > 1 ? (width - paddingX * 2) / (points.length - 1) : 0
  const chartPoints = points.map((point, index) => {
    const ratio = point.balance / maxBalance

    return {
      ...point,
      x: paddingX + index * stepX,
      y: paddingTop + (1 - ratio) * (height - paddingTop - paddingBottom),
    }
  })
  const areaPath = buildLinePath(chartPoints, true, height - paddingBottom)
  const linePath = buildLinePath(chartPoints)
  const markers = getProjectionMarkers(points)
  const safeActiveIndex = Math.min(activeIndex, chartPoints.length - 1)
  const activePoint =
    chartPoints[safeActiveIndex] ?? chartPoints[chartPoints.length - 1]
  const firstBalance = points[0].balance
  const lastBalance = points[points.length - 1].balance

  function setIndexFromClientX(clientX: number) {
    const overlay = overlayRef.current

    if (!overlay || chartPoints.length < 2) {
      return
    }

    const rect = overlay.getBoundingClientRect()
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1)
    const nextIndex = Math.round(ratio * (chartPoints.length - 1))
    setActiveIndex(nextIndex)
  }

  return (
    <div>
      <div className="mb-3">
        <p className="text-xs uppercase tracking-[0.12em] text-[var(--foreground-faint)]">
          {activePoint.monthIndex === 0 ? 'Now' : activePoint.label}
        </p>
        <p className="mt-1 font-mono text-lg text-[var(--foreground)]">
          {formatCurrency(activePoint.balance, currency)}
        </p>
      </div>
      <div className="mb-3 flex items-center justify-between gap-4 text-xs text-[var(--foreground-faint)]">
        <span>{formatCurrency(firstBalance, currency)}</span>
        <span>{formatCurrency(lastBalance, currency)}</span>
      </div>
      <div
        ref={overlayRef}
        className="relative"
        onMouseMove={(event) => setIndexFromClientX(event.clientX)}
        onTouchMove={(event) => setIndexFromClientX(event.touches[0].clientX)}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-[80px] w-full"
          role="img"
        >
          <path
            d={`M ${paddingX} ${height - paddingBottom} H ${width - paddingX}`}
            className="stroke-violet-500"
            strokeOpacity="0.3"
          />
          <path d={areaPath} className="fill-violet-500" fillOpacity="0.15" />
          <path
            d={linePath}
            fill="none"
            className="stroke-violet-500"
            strokeWidth="2.5"
          />
          <path
            d={`M ${activePoint.x} ${paddingTop} V ${height - paddingBottom}`}
            className="stroke-violet-300"
            strokeOpacity="0.4"
            strokeDasharray="4 6"
          />
          <circle
            cx={activePoint.x}
            cy={activePoint.y}
            className="fill-violet-400"
            r="4.5"
          />
        </svg>
        <div
          className="absolute inset-0 grid"
          style={{
            gridTemplateColumns: `repeat(${chartPoints.length}, minmax(0, 1fr))`,
          }}
        >
          {chartPoints.map((point, index) => (
            <button
              key={`${point.monthIndex}-${point.label}`}
              type="button"
              className="h-full w-full cursor-crosshair bg-transparent"
              aria-label={`Projection ${point.label} ${formatCurrency(point.balance, currency)}`}
              onFocus={() => setActiveIndex(index)}
              onMouseEnter={() => setActiveIndex(index)}
            />
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-4 text-xs uppercase tracking-[0.12em] text-[var(--foreground-faint)]">
        {markers.map((point) => (
          <span key={`${point.monthIndex}-${point.label}`}>
            {point.monthIndex === 0 ? 'Now' : point.label}
          </span>
        ))}
      </div>
    </div>
  )
}

type RecurringPayment = {
  id: string
  name: string
  category: string
  amount: number
  currency: string
  dueDay: number
  createdAt: string
}

function RecurringPaymentForm({
  onSubmit,
  busy,
  defaultCurrency,
}: {
  onSubmit: (value: Omit<RecurringPayment, 'id' | 'createdAt'>) => Promise<unknown>
  busy: boolean
  defaultCurrency: string
}) {
  const [form, setForm] = useState({
    name: '',
    category: '',
    currency: defaultCurrency,
    amount: '',
    dueDay: '1',
  })

  useEffect(() => {
    setForm((current) => ({
      ...current,
      currency: defaultCurrency,
    }))
  }, [defaultCurrency])

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
      dueDay: Math.max(1, Math.min(31, Math.round(parseMoney(form.dueDay) || 1))),
    })

    setForm({
      name: '',
      category: '',
      currency: defaultCurrency,
      amount: '',
      dueDay: '1',
    })
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
              setForm((current) => ({ ...current, category: event.target.value }))
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
      <Button className="w-full" disabled={busy} type="submit">
        <Plus className="h-4 w-4" />
        Add recurring payment
      </Button>
    </form>
  )
}

function DebtForm({
  onSubmit,
  busy,
  submitLabel = 'Add debt',
  initialValue = null,
  onCancel,
  defaultCurrency,
}: {
  onSubmit: (value: Omit<Debt, 'id' | 'createdAt'>) => Promise<unknown>
  busy: boolean
  submitLabel?: string
  initialValue?: Debt | null
  onCancel?: () => void
  defaultCurrency: string
}) {
  const [form, setForm] = useState({
    name: '',
    lender: '',
    type: 'Credit card' as DebtType,
    currency: defaultCurrency,
    balance: '',
    rate: '',
    payments: '1',
    dueDate: '',
  })

  useEffect(() => {
    if (!initialValue) {
      setForm({
        name: '',
        lender: '',
        type: 'Credit card',
        currency: defaultCurrency,
        balance: '',
        rate: '',
        payments: '1',
        dueDate: '',
      })

      return
    }

    setForm({
      name: initialValue.name,
      lender: initialValue.lender,
      type: initialValue.type,
      currency: initialValue.currency,
      balance: String(initialValue.balance),
      rate: String(initialValue.rate),
      payments: String(initialValue.payments ?? 1),
      dueDate: initialValue.dueDate,
    })
  }, [defaultCurrency, initialValue])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.name.trim()) {
      return
    }

    await onSubmit({
      name: form.name.trim(),
      lender: form.lender.trim() || 'Personal ledger',
      type: form.type,
      currency: form.currency,
      balance: parseMoney(form.balance),
      rate: parseMoney(form.rate),
      payments: Math.max(1, Math.round(parseMoney(form.payments) || 1)),
      dueDate: form.dueDate || new Date().toISOString().slice(0, 10),
    })

    if (!initialValue) {
      setForm({
        name: '',
        lender: '',
        type: 'Credit card',
        currency: defaultCurrency,
        balance: '',
        rate: '',
        payments: '1',
        dueDate: '',
      })
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Field htmlFor="debt-name" label="Name">
        <Input
          id="debt-name"
          value={form.name}
          onChange={(event) =>
            setForm((current) => ({ ...current, name: event.target.value }))
          }
          placeholder="Mastercard balance"
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field htmlFor="debt-lender" label="Lender">
          <Input
            id="debt-lender"
            value={form.lender}
            onChange={(event) =>
              setForm((current) => ({ ...current, lender: event.target.value }))
            }
            placeholder="Bank or person"
          />
        </Field>
        <Field htmlFor="debt-type" label="Type">
          <Select
            id="debt-type"
            value={form.type}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                type: event.target.value as DebtType,
              }))
            }
          >
            <option>Credit card</option>
            <option>Loan</option>
            <option>Mortgage</option>
            <option>Other</option>
          </Select>
        </Field>
        <Field htmlFor="debt-currency" label="Currency">
          <Select
            id="debt-currency"
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
        <Field htmlFor="debt-balance" label="Balance">
          <Input
            id="debt-balance"
            inputMode="decimal"
            type="number"
            value={form.balance}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                balance: event.target.value,
              }))
            }
            placeholder="0"
          />
        </Field>
        <Field htmlFor="debt-rate" label="APR %">
          <Input
            id="debt-rate"
            inputMode="decimal"
            type="number"
            step="0.1"
            value={form.rate}
            onChange={(event) =>
              setForm((current) => ({ ...current, rate: event.target.value }))
            }
            placeholder="0"
          />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field htmlFor="debt-payments" label="Installments">
          <Input
            id="debt-payments"
            type="number"
            min="1"
            value={form.payments}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                payments: event.target.value,
              }))
            }
            placeholder="1"
          />
        </Field>
        <Field htmlFor="debt-due" label="Due date">
          <Input
            id="debt-due"
            type="date"
            value={form.dueDate}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                dueDate: event.target.value,
              }))
            }
          />
        </Field>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button className="w-full sm:w-auto" disabled={busy} type="submit">
          <Plus className="h-4 w-4" />
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button
            className="w-full sm:w-auto"
            disabled={busy}
            type="button"
            variant="ghost"
            onClick={onCancel}
          >
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  )
}

function IncomeForm({
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

function InvestmentForm({
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

function GoalForm({
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

function QuickLinkCard({
  title,
  href,
  value,
  note,
  summary,
}: {
  title: string
  href: string
  value: string
  note: string
  summary: string
}) {
  return (
    <Card className="h-full">
      <CardHeader className="border-b-0 pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm leading-6 text-[var(--foreground-soft)]">
          {note}
        </p>
        <Separator className="my-4" />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs tracking-[0.12em] uppercase text-[var(--foreground-faint)]">
            {summary}
          </p>
          <Link
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--foreground)] no-underline"
            to={href}
          >
            Open
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export function OverviewPage() {
  return (
    <FinancePageState>
      {(data) => <OverviewView data={data} />}
    </FinancePageState>
  )
}

function OverviewView({ data }: { data: DashboardData }) {
  const summary = useMemo(() => getDashboardSummary(data), [data])
  const recent = useMemo(() => getRecentEntries(data), [data])
  const hasDemoData = isSeedDataActive(data)
  const debtMonthlyTotals = useMemo(
    () => getDebtMonthlyTotalsByCurrency(data.debts),
    [data.debts],
  )
  const sortedDebts = useMemo(
    () => sortByDateAscending(data.debts, (item) => item.dueDate),
    [data.debts],
  )
  const sortedIncomes = useMemo(
    () => sortByDateAscending(data.incomes, (item) => item.nextDate),
    [data.incomes],
  )
  const sortedGoals = useMemo(
    () => sortByDateAscending(data.goals, (item) => item.deadline),
    [data.goals],
  )
  const currency = data.settings.currency
  const totalOpenLanes =
    data.debts.length +
    data.incomes.length +
    data.investments.length +
    data.goals.length

  const nextDebt = sortedDebts.at(0)
  const nextIncome = sortedIncomes.at(0)
  const nextGoal = sortedGoals.at(0)

  return (
    <main className="page-wrap px-4 pb-16 pt-10">
      <PageIntro
        eyebrow="Overview"
        title="Overview"
        description={
          hasDemoData
            ? 'Demo data loaded. Replace it with your own numbers.'
            : 'Your current numbers.'
        }
        meta={[
          { label: 'Updated', value: formatDate(data.settings.lastUpdated) },
          { label: 'Open lanes', value: `${totalOpenLanes}` },
          { label: 'Currency', value: data.settings.currency },
        ]}
      />

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Net position"
          value={formatCurrency(summary.netPosition, currency)}
          note={`${formatCompactCurrency(summary.totalInvestments, currency)} invested vs. ${formatCompactCurrency(summary.totalDebt, currency)} owed.`}
          icon={WalletCards}
        />
        <MetricCard
          title="Monthly inflow"
          value={formatCurrency(summary.monthlyIncome, currency)}
          note={`${data.incomes.length} income lanes feeding the month.`}
          icon={ArrowDownToLine}
        />
        <MetricCard
          title="Debt load"
          value={formatCurrency(summary.totalDebt, currency)}
          note={`Total principal and interest to be paid.`}
          icon={Landmark}
        />
        <MetricCard
          title="Goal pace"
          value={`${summary.goalProgress.toFixed(0)}%`}
          note={`${formatCurrency(summary.totalGoalCurrent, currency)} collected across active goals.`}
          icon={Target}
        />
      </section>

      {debtMonthlyTotals.length ? (
        <section className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-xs text-[var(--foreground-soft)]">
          <span className="mr-2 uppercase tracking-[0.12em] text-[var(--foreground-faint)]">
            Monthly debt payments:
          </span>
          {debtMonthlyTotals
            .map(
              (item) =>
                `${item.currency} ${formatCurrency(item.total, item.currency)}`,
            )
            .join(' · ')}
        </section>
      ) : null}

      <section className="mt-6 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <SectionTitle
              title="Next up"
              description="The three checkpoints that matter most right now."
              badge="Desk rhythm"
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow text-[var(--foreground-faint)]">
                    Next debt due
                  </p>
                  <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
                    {nextDebt ? nextDebt.name : 'No debts yet'}
                  </p>
                  <p className="mt-1 text-sm text-[var(--foreground-soft)]">
                    {nextDebt
                      ? `${nextDebt.lender} · ${formatDate(nextDebt.dueDate)}`
                      : 'Add a balance to start tracking it here.'}
                  </p>
                </div>
                <p className="font-mono text-sm text-[var(--foreground)]">
                  {nextDebt ? formatCurrency(nextDebt.balance, currency) : '--'}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow text-[var(--foreground-faint)]">
                    Next income landing
                  </p>
                  <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
                    {nextIncome ? nextIncome.name : 'No incomes yet'}
                  </p>
                  <p className="mt-1 text-sm text-[var(--foreground-soft)]">
                    {nextIncome
                      ? `${nextIncome.source} · ${formatDate(nextIncome.nextDate)}`
                      : 'Add an income lane to see the next arrival.'}
                  </p>
                </div>
                <p className="font-mono text-sm text-[var(--foreground)]">
                  {nextIncome
                    ? formatCurrency(nextIncome.amount, currency)
                    : '--'}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow text-[var(--foreground-faint)]">
                    Closest goal checkpoint
                  </p>
                  <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
                    {nextGoal ? nextGoal.name : 'No goals yet'}
                  </p>
                  <p className="mt-1 text-sm text-[var(--foreground-soft)]">
                    {nextGoal
                      ? `${nextGoal.type} · ${formatDate(nextGoal.deadline)}`
                      : 'Set a target to bring the next milestone into view.'}
                  </p>
                </div>
                <p className="font-mono text-sm text-[var(--foreground)]">
                  {nextGoal
                    ? formatCurrency(
                      Math.max(nextGoal.target - nextGoal.current, 0),
                      currency,
                    )
                    : '--'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <SectionTitle
              title="Goal progress"
              description="Quiet progress bars instead of noisy charts."
              badge={`${data.goals.length} goals`}
            />
          </CardHeader>
          <CardContent className="space-y-4">
            {data.goals.length ? (
              data.goals.map((goal) => {
                const progress =
                  goal.target > 0 ? (goal.current / goal.target) * 100 : 0

                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <div>
                        <p className="font-medium text-[var(--foreground)]">
                          {goal.name}
                        </p>
                        <p className="text-[var(--foreground-soft)]">
                          {formatCurrency(goal.current, currency)} of{' '}
                          {formatCurrency(goal.target, currency)}
                        </p>
                      </div>
                      <span className="font-mono text-[var(--foreground)]">
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )
              })
            ) : (
              <p className="text-sm leading-6 text-[var(--foreground-soft)]">
                Add your first goal to start tracking progress here.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <QuickLinkCard
          title="Debts"
          href="/debts"
          value={formatCompactCurrency(summary.totalDebt, currency)}
          note={`${data.debts.length} balances to pay off.`}
          summary={
            nextDebt
              ? `Next due ${formatDate(nextDebt.dueDate)}`
              : 'No balances yet'
          }
        />
        <QuickLinkCard
          title="Incomes"
          href="/incomes"
          value={formatCompactCurrency(summary.monthlyIncome, currency)}
          note={`${data.incomes.length} lanes converted into a monthly view.`}
          summary={
            nextIncome
              ? `Next landing ${formatDate(nextIncome.nextDate)}`
              : 'No income yet'
          }
        />
        <QuickLinkCard
          title="Investments"
          href="/investments"
          value={formatCompactCurrency(summary.totalInvestments, currency)}
          note={`${data.investments.length} positions with ${formatCurrency(summary.monthlyInvesting, currency)} added every month.`}
          summary={`${formatPercent(getAverageInvestmentChange(data.investments))} average change`}
        />
        <QuickLinkCard
          title="Goals"
          href="/goals"
          value={formatCompactCurrency(
            summary.totalGoalTarget - summary.totalGoalCurrent,
            currency,
          )}
          note={`${data.goals.length} active targets still needing attention.`}
          summary={
            nextGoal
              ? `Closest ${formatDate(nextGoal.deadline)}`
              : 'No targets yet'
          }
        />
      </section>

      <section className="mt-6">
        <Card>
          <CardHeader>
            <SectionTitle
              title="Recent entries"
              description="Newest balances, incomes, investments, and goals across the desk."
              badge="Latest six"
            />
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Kind</TableHead>
                  <TableHead>Meta</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.length ? (
                  recent.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-[var(--foreground)]">
                            {item.label}
                          </p>
                          <p className="text-xs text-[var(--foreground-faint)]">
                            Added {formatDate(item.createdAt)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={currencyVariant(item.kind)}>
                          {item.kind}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[var(--foreground-soft)]">
                        {item.meta}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(item.amount, currency)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <EmptyRow
                    colSpan={4}
                    message="Your recent entries will show up here."
                  />
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

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
  const [showNewDebt, setShowNewDebt] = useState(false)
  const [editingDebtId, setEditingDebtId] = useState<string | null>(null)
  const [expandedDebtIds, setExpandedDebtIds] = useState<string[]>([])
  const [currencyView, setCurrencyView] = useState(defaultCurrency)
  const [monthlyBudgetInput, setMonthlyBudgetInput] = useState('')
  const [showPaymentSheet, setShowPaymentSheet] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
  })
  const hasDemoData = isSeedDataActive(data)
  const debts = useMemo(
    () => sortByDateAscending(data.debts, (item) => item.dueDate),
    [data.debts],
  )
  const debtCurrencies = useMemo(() => {
    const values = new Set(debts.map((debt) => debt.currency))
    values.add(defaultCurrency)
    return [...values].sort((left, right) => left.localeCompare(right))
  }, [debts, defaultCurrency])
  const debtScope = useMemo(
    () => debts.filter((debt) => debt.currency === currencyView),
    [currencyView, debts],
  )
  const totalBalance = debtScope.reduce((sum, debt) => sum + debt.balance, 0)
  const averageRate = getAverageRate(debtScope)
  const nextDue = getSoonestDate(debtScope.map((debt) => debt.dueDate))
  const monthlyDebtPayment = debtScope.reduce(
    (sum, debt) => sum + getDebtMonthlyPayment(debt.balance, debt.payments),
    0,
  )
  const monthlyBudget = Math.max(
    parseMoney(monthlyBudgetInput),
    monthlyDebtPayment,
  )
  const projection = useMemo(() => getDebtProjection(debtScope), [debtScope])
  const monthlyPlan = useMemo(
    () => getDebtMonthlyPlan(debtScope, monthlyBudget),
    [debtScope, monthlyBudget],
  )
  const monthlyPlanPreview = useMemo(
    () => monthlyPlan.slice(0, 18),
    [monthlyPlan],
  )
  const installmentTotalsByDebtId = useMemo(
    () =>
      new Map(
        debtScope.map((debt) => [
          debt.id,
          Math.max(1, Math.round(debt.payments || 1)),
        ]),
      ),
    [debtScope],
  )
  const monthlyPlanTableRows = useMemo<DebtPlanTableRow[]>(() => {
    const paidInstallmentsByDebtId = new Map<string, number>()

    return monthlyPlanPreview.flatMap((row) =>
      row.debts.map((debt) => {
        const paidInstallments =
          (paidInstallmentsByDebtId.get(debt.id) ?? 0) + 1

        paidInstallmentsByDebtId.set(debt.id, paidInstallments)

        const installmentTotal =
          installmentTotalsByDebtId.get(debt.id) ?? paidInstallments

        return {
          key: `${row.monthIndex}-${debt.id}`,
          monthLabel: row.label,
          debtId: debt.id,
          debtName: debt.name,
          payment: debt.payment,
          interest: debt.interest,
          endingBalance: debt.endingBalance,
          monthTotalPayment: row.totalPayment,
          installmentNumber: Math.min(paidInstallments, installmentTotal),
          installmentTotal,
        }
      }),
    )
  }, [installmentTotalsByDebtId, monthlyPlanPreview])
  const monthlyPlanRowsByDebtId = useMemo(() => {
    const map = new Map<string, DebtPlanTableRow[]>()

    debtScope.forEach((debt) => {
      const plannedInstallments = Math.max(1, Math.round(debt.payments || 1))
      const installmentPayment = debt.balance / plannedInstallments
      const rows: DebtPlanTableRow[] = []

      // Create installments based on planned number, not actual payment plan
      for (let i = 0; i < plannedInstallments; i++) {
        rows.push({
          key: `planned-${debt.id}-${i}`,
          monthLabel: `Month ${i + 1}`,
          debtId: debt.id,
          debtName: debt.name,
          payment: installmentPayment,
          interest: 0, // Simplified for display
          endingBalance: debt.balance - (installmentPayment * (i + 1)),
          monthTotalPayment: installmentPayment,
          installmentNumber: i + 1,
          installmentTotal: plannedInstallments,
        })
      }

      if (rows.length > 0) {
        map.set(debt.id, rows)
      }
    })

    return map
  }, [debtScope])
  const monthsToZero =
    monthlyPlan.length > 1 && monthlyPlan.at(-1)?.endingBalance === 0
      ? monthlyPlan.length
      : null
  const editingDebt = debts.find((debt) => debt.id === editingDebtId) ?? null

  useEffect(() => {
    if (!debtCurrencies.includes(currencyView)) {
      setCurrencyView(debtCurrencies[0] ?? defaultCurrency)
    }
  }, [currencyView, debtCurrencies, defaultCurrency])

  useEffect(() => {
    setMonthlyBudgetInput(String(monthlyDebtPayment || 0))
  }, [currencyView, monthlyDebtPayment])

  useEffect(() => {
    setExpandedDebtIds((current) =>
      current.filter((debtId) => debtScope.some((debt) => debt.id === debtId)),
    )
  }, [debtScope])

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

  function toggleDebtDetails(debtId: string) {
    setExpandedDebtIds((current) =>
      current.includes(debtId)
        ? current.filter((item) => item !== debtId)
        : [...current, debtId],
    )
  }

  return (
    <main className="page-wrap flex min-h-0 flex-1 flex-col pb-4 pt-6">
      <section className="grid min-h-0 flex-1 gap-3 overflow-hidden xl:grid-cols-3">
        {/* Column 1: Debt Table */}
        <div className="flex min-h-0 flex-col rounded-[1.1rem] border border-[var(--border)] bg-[var(--panel)] p-3 sm:p-3.5">
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
            <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
              {debtScope.map((debt) => {
                const monthlyPayment = getDebtMonthlyPayment(
                  debt.balance,
                  debt.payments,
                )
                const installmentRows =
                  monthlyPlanRowsByDebtId.get(debt.id) ?? []
                const actualInstallments = installmentRows.length
                const plannedInstallments = Math.max(1, Math.round(debt.payments || 1))

                return (
                  <div
                    key={debt.id}
                    className="rounded-lg bg-[var(--surface-muted)] p-2.5"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[var(--foreground)] truncate">
                          {debt.name}
                        </p>
                        <p className="text-[10px] text-[var(--foreground-faint)] mt-0.5">
                          {debt.lender} · {debt.type}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            className="h-6 w-6"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDebtForm(debt.id)}>
                            <Pencil className="h-4 w-4" />
                            Edit debt
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              void actions.removeItem({
                                kind: 'debts',
                                id: debt.id,
                              })
                            }
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete debt
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="space-y-1.5 text-[11px] mb-2">
                      <div className="flex justify-between">
                        <span className="text-[var(--foreground-soft)]">Balance</span>
                        <span className="font-mono text-[var(--foreground)]">
                          {formatCurrency(debt.balance, debt.currency)}
                        </span>
                      </div>
                    </div>
                    <div className="border-t border-[var(--border)] pt-2">
                      <p className="text-[9px] uppercase tracking-wider text-[var(--foreground-faint)] mb-1.5">
                        Installments ({actualInstallments} payments)
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {installmentRows.length ? (
                          installmentRows.map((row, index) => (
                            <div
                              key={row.key}
                              className="inline-flex items-center gap-1 rounded bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-medium text-violet-600"
                            >
                              {index + 1}/{actualInstallments} {formatCurrency(row.payment, currencyView)}
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
            <div className="rounded-lg border-dashed p-4 text-center text-sm text-[var(--foreground-soft)] opacity-50">
              No debts in {currencyView}. Click New to add one.
            </div>
          )}
        </div>

        {/* Column 2: Recurring Payments */}
        <div className="flex min-h-0 flex-col rounded-[1.1rem] border border-[var(--border)] bg-[var(--panel)] p-3 sm:p-3.5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <p className="eyebrow">Recurring Payments</p>
              <h2 className="mt-1 text-base font-semibold tracking-tight text-[var(--foreground)]">
                Monthly subscriptions
              </h2>
            </div>
            <Sheet open={showPaymentSheet} onOpenChange={setShowPaymentSheet}>
              <SheetTrigger asChild>
                <Button size="sm" variant="secondary">
                  New
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Record Monthly Payment</SheetTitle>
                  <SheetDescription>
                    Add a payment entry for this month to track your debt progress.
                  </SheetDescription>
                </SheetHeader>
                <form
                  className="mt-6 space-y-5"
                  onSubmit={async (event) => {
                    event.preventDefault()

                    if (!paymentForm.description.trim() || !paymentForm.amount) {
                      return
                    }

                    // Here you can handle the payment submission
                    console.log('Payment submitted:', {
                      description: paymentForm.description.trim(),
                      amount: parseMoney(paymentForm.amount),
                      date: paymentForm.date,
                      currency: currencyView,
                    })

                    setShowPaymentSheet(false)
                    setPaymentForm({
                      description: '',
                      amount: '',
                      date: new Date().toISOString().slice(0, 10),
                    })
                  }}
                >
                  <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                    <p className="text-xs uppercase tracking-[0.12em] text-[var(--foreground-faint)]">
                      Currency
                    </p>
                    <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">
                      {currencyView}
                    </p>
                  </div>

                  <Field htmlFor="payment-description" label="Payment Description">
                    <Input
                      id="payment-description"
                      value={paymentForm.description}
                      onChange={(event) =>
                        setPaymentForm((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                      placeholder="Rent, Netflix, Gym membership"
                      required
                    />
                  </Field>

                  <Field htmlFor="payment-amount" label={`Amount (${currencyView})`}>
                    <Input
                      id="payment-amount"
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0.01"
                      value={paymentForm.amount}
                      onChange={(event) =>
                        setPaymentForm((current) => ({
                          ...current,
                          amount: event.target.value,
                        }))
                      }
                      placeholder="0.00"
                      required
                    />
                  </Field>

                  <Field htmlFor="payment-category" label="Category">
                    <Input
                      id="payment-category"
                      value={paymentForm.date}
                      onChange={(event) =>
                        setPaymentForm((current) => ({
                          ...current,
                          date: event.target.value,
                        }))
                      }
                      placeholder="Subscription, Rent, Utilities"
                    />
                  </Field>

                  <Separator />

                  <SheetFooter className="gap-2">
                    <SheetClose asChild>
                      <Button type="button" variant="outline" className="flex-1">
                        Cancel
                      </Button>
                    </SheetClose>
                    <Button type="submit" className="flex-1">
                      <Plus className="h-4 w-4" />
                      Save
                    </Button>
                  </SheetFooter>
                </form>
              </SheetContent>
            </Sheet>
          </div>

          {data.recurringPayments.length ? (
            <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
              {data.recurringPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="rounded-lg bg-[var(--surface-muted)] p-2.5"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">
                        {payment.name}
                      </p>
                      <p className="text-[10px] text-[var(--foreground-faint)] mt-0.5">
                        {payment.category} · Due day {payment.dueDay}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-sm text-[var(--foreground)] whitespace-nowrap">
                        {formatCurrency(payment.amount, payment.currency)}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            className="h-6 w-6"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Pencil className="h-4 w-4" />
                            Edit payment
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                            Delete payment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="rounded-lg bg-[var(--surface-muted)] p-3">
                <p className="text-xs text-[var(--foreground-faint)]">No recurring payments added yet.</p>
                <p className="mt-1 text-xs text-[var(--foreground-soft)]">Click New to register your subscriptions and monthly bills.</p>
              </div>
            </div>
          )}

        </div>

        {/* Column 3: Summary */}
        <div className="flex min-h-0 flex-col rounded-[1.1rem] border border-[var(--border)] bg-[var(--panel)] p-3 sm:p-3.5">
          <div className="mb-3">
            <p className="eyebrow">Summary</p>
            <h2 className="mt-1 text-base font-semibold tracking-tight text-[var(--foreground)]">
              Complete overview
            </h2>
          </div>

          <DebtProjectionChart currency={currencyView} points={projection} />

          <div className="mt-3 space-y-3">
            <div className="rounded-lg bg-[var(--surface-muted)] p-2.5">
              <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--foreground-faint)] mb-2">
                Monthly Payments
              </p>
              <div className="space-y-1.5 text-xs">
                {debtScope.length ? (
                  debtScope.map((debt) => {
                    const monthlyPayment = getDebtMonthlyPayment(
                      debt.balance,
                      debt.payments,
                    )
                    return (
                      <div key={debt.id} className="flex justify-between">
                        <span className="text-[var(--foreground-soft)] truncate mr-2">
                          {debt.name}
                        </span>
                        <span className="font-mono text-violet-600 whitespace-nowrap">
                          {formatCurrency(monthlyPayment, debt.currency)}
                        </span>
                      </div>
                    )
                  })
                ) : (
                  <div className="flex justify-between">
                    <span className="text-[var(--foreground-soft)]">No debts</span>
                    <span className="font-mono text-[var(--foreground)]">--</span>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-[var(--surface-muted)] p-2.5">
              <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--foreground-faint)] mb-2">
                Recurring Payments Detail
              </p>
              <div className="space-y-1.5 text-xs">
                {data.recurringPayments.length ? (
                  data.recurringPayments.map((payment) => (
                    <div key={payment.id} className="flex justify-between">
                      <span className="text-[var(--foreground-soft)] truncate mr-2">
                        {payment.name}
                      </span>
                      <span className="font-mono text-emerald-600 whitespace-nowrap">
                        {formatCurrency(payment.amount, payment.currency)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-between">
                    <span className="text-[var(--foreground-soft)]">No recurring payments</span>
                    <span className="font-mono text-[var(--foreground)]">--</span>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-[var(--surface-muted)] p-2.5">
              <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--foreground-faint)] mb-2">
                Combined Overview
              </p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--foreground-soft)]">All debts</span>
                  <span className="font-mono text-[var(--foreground)]">
                    {formatCurrency(totalBalance, currencyView)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--foreground-soft)]">All recurring</span>
                  <span className="font-mono text-[var(--foreground)]">
                    {formatCurrency(
                      data.recurringPayments.reduce((sum, p) => sum + p.amount, 0),
                      currencyView
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[var(--border)] pt-1.5 mt-1.5 font-semibold">
                  <span className="text-[var(--foreground)]">Combined monthly</span>
                  <span className="font-mono text-violet-600">
                    {formatCurrency(
                      monthlyDebtPayment + data.recurringPayments.reduce((sum, p) => sum + p.amount, 0),
                      currencyView
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Sheet open={showNewDebt} onOpenChange={(open) => !open && closeDebtForm()}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>
              {editingDebt ? 'Edit Debt' : 'Add New Debt'}
            </SheetTitle>
            <SheetDescription>
              {editingDebt
                ? 'Update your debt information and payment details.'
                : 'Enter your debt details to start tracking payments and payoff timeline.'}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <DebtForm
              busy={actions.isWorking}
              defaultCurrency={currencyView}
              initialValue={editingDebt}
              submitLabel={editingDebt ? 'Update debt' : 'Save debt'}
              onCancel={closeDebtForm}
              onSubmit={async (value) => {
                if (editingDebt) {
                  await actions.updateDebt({ id: editingDebt.id, value })
                } else {
                  await actions.createItem({ kind: 'debts', value })
                }

                closeDebtForm()
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

    </main>
  )
}

export function IncomesPage() {
  return (
    <FinancePageState>
      {(data, actions) => <IncomesView actions={actions} data={data} />}
    </FinancePageState>
  )
}

function IncomesView({
  data,
  actions,
}: {
  data: DashboardData
  actions: FinanceActions
}) {
  const currency = data.settings.currency
  const incomes = useMemo(
    () => sortByDateAscending(data.incomes, (item) => item.nextDate),
    [data.incomes],
  )
  const monthlyTotal = incomes.reduce(
    (sum, income) => sum + getMonthlyIncomeAmount(income),
    0,
  )
  const recurringCount = incomes.filter(
    (income) => income.frequency !== 'One-time',
  ).length
  const nextDate = getSoonestDate(incomes.map((income) => income.nextDate))

  return (
    <main className="page-wrap px-4 pb-16 pt-10">
      <PageIntro
        eyebrow="Incomes"
        title="Income"
        description="Incoming money and monthly equivalents."
        meta={[
          { label: 'Lanes', value: `${incomes.length}` },
          { label: 'Recurring', value: `${recurringCount}` },
          {
            label: 'Next arrival',
            value: nextDate ? formatDate(nextDate) : '--',
          },
        ]}
      />

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Monthly equivalent"
          value={formatCurrency(monthlyTotal, currency)}
          note="Every income lane translated into a comparable monthly figure."
          icon={CircleDollarSign}
        />
        <MetricCard
          title="Largest lane"
          value={
            incomes.length
              ? formatCurrency(
                Math.max(...incomes.map((income) => income.amount)),
                currency,
              )
              : '--'
          }
          note="The highest single payout currently on file."
          icon={ArrowDownToLine}
        />
        <MetricCard
          title="Next arrival"
          value={nextDate ? formatDate(nextDate) : '--'}
          note="The soonest scheduled payout on the board."
          icon={CalendarClock}
        />
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
        <Card>
          <CardHeader>
            <SectionTitle
              title="Income lanes"
              description="Sorted by next arrival so the calendar stays easy to scan."
              badge={`${incomes.length} rows`}
            />
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Income</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Monthly view</TableHead>
                  <TableHead>Next date</TableHead>
                  <TableHead className="text-right">&nbsp;</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomes.length ? (
                  incomes.map((income) => (
                    <TableRow key={income.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-[var(--foreground)]">
                            {income.name}
                          </p>
                          <p className="text-xs text-[var(--foreground-faint)]">
                            {income.source}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="success">{income.frequency}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(income.amount, currency)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(
                          getMonthlyIncomeAmount(income),
                          currency,
                        )}
                      </TableCell>
                      <TableCell>{formatDate(income.nextDate)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          className="h-8 w-8"
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            void actions.removeItem({
                              kind: 'incomes',
                              id: income.id,
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <EmptyRow
                    colSpan={6}
                    message="Add your first income lane to see it here."
                  />
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add income</CardTitle>
              <CardDescription>
                Recurring or one-time, as long as it lands here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IncomeForm
                busy={actions.isWorking}
                onSubmit={(value) =>
                  actions.createItem({ kind: 'incomes', value })
                }
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Why monthly view?</CardTitle>
              <CardDescription>
                It keeps weekly, quarterly, and yearly income on the same page
                without extra math.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-[var(--foreground-soft)]">
              <p>
                Use short labels for each lane, and store the real source in the
                second field.
              </p>
              <p>
                Quarterly and yearly payments still matter; this just makes them
                comparable.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}

export function InvestmentsPage() {
  return (
    <FinancePageState>
      {(data, actions) => <InvestmentsView actions={actions} data={data} />}
    </FinancePageState>
  )
}

function InvestmentsView({
  data,
  actions,
}: {
  data: DashboardData
  actions: FinanceActions
}) {
  const currency = data.settings.currency
  const investments = useMemo(
    () =>
      [...data.investments].sort(
        (left, right) => right.currentValue - left.currentValue,
      ),
    [data.investments],
  )
  const totalValue = investments.reduce(
    (sum, item) => sum + item.currentValue,
    0,
  )
  const monthlyContribution = investments.reduce(
    (sum, item) => sum + item.monthlyContribution,
    0,
  )
  const averageChange = getAverageInvestmentChange(investments)

  return (
    <main className="page-wrap px-4 pb-16 pt-10">
      <PageIntro
        eyebrow="Investments"
        title="Investments"
        description="Value, monthly contributions, and change."
        meta={[
          { label: 'Positions', value: `${investments.length}` },
          {
            label: 'Monthly adds',
            value: formatCurrency(monthlyContribution, currency),
          },
          { label: 'Average change', value: formatPercent(averageChange) },
        ]}
      />

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Portfolio value"
          value={formatCurrency(totalValue, currency)}
          note="Current value across every investment lane."
          icon={TrendingUp}
        />
        <MetricCard
          title="Monthly contribution"
          value={formatCurrency(monthlyContribution, currency)}
          note="What you are feeding into the long game every month."
          icon={PiggyBank}
        />
        <MetricCard
          title="Average move"
          value={formatPercent(averageChange)}
          note="Simple average of change percentages stored for each position."
          icon={Coins}
        />
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
        <Card>
          <CardHeader>
            <SectionTitle
              title="Investment lanes"
              description="Largest values surface first, so the biggest holdings stay visible."
              badge={`${investments.length} rows`}
            />
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Investment</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">Monthly</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                  <TableHead className="text-right">&nbsp;</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investments.length ? (
                  investments.map((investment) => (
                    <TableRow key={investment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-[var(--foreground)]">
                            {investment.name}
                          </p>
                          <p className="text-xs text-[var(--foreground-faint)]">
                            {investment.account}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="success">{investment.type}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(investment.currentValue, currency)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(
                          investment.monthlyContribution,
                          currency,
                        )}
                      </TableCell>
                      <TableCell
                        className={`text-right font-mono ${investment.changePct >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}
                      >
                        {formatPercent(investment.changePct)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          className="h-8 w-8"
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            void actions.removeItem({
                              kind: 'investments',
                              id: investment.id,
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <EmptyRow
                    colSpan={6}
                    message="Add your first investment lane to start the board."
                  />
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add investment</CardTitle>
              <CardDescription>
                A simple lane for value, contribution, and a rough change
                number.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvestmentForm
                busy={actions.isWorking}
                onSubmit={(value) =>
                  actions.createItem({ kind: 'investments', value })
                }
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Keep it lightweight</CardTitle>
              <CardDescription>
                This is a dashboard, not a market terminal. Only store what
                helps you decide.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-[var(--foreground-soft)]">
              <p>
                Use one row per bucket or account, not every holding if that
                feels noisy.
              </p>
              <p>
                Track contribution pace here and detailed allocations elsewhere
                if needed.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}

export function GoalsPage() {
  return (
    <FinancePageState>
      {(data, actions) => <GoalsView actions={actions} data={data} />}
    </FinancePageState>
  )
}

function GoalsView({
  data,
  actions,
}: {
  data: DashboardData
  actions: FinanceActions
}) {
  const currency = data.settings.currency
  const goals = useMemo(
    () => sortByDateAscending(data.goals, (item) => item.deadline),
    [data.goals],
  )
  const funded = goals.reduce((sum, goal) => sum + goal.current, 0)
  const target = goals.reduce((sum, goal) => sum + goal.target, 0)
  const remaining = Math.max(target - funded, 0)
  const closestDeadline = getSoonestDate(goals.map((goal) => goal.deadline))

  return (
    <main className="page-wrap px-4 pb-16 pt-10">
      <PageIntro
        eyebrow="Goals"
        title="Goals"
        description="Targets, progress, and deadlines."
        meta={[
          { label: 'Targets', value: `${goals.length}` },
          { label: 'Funded', value: formatCurrency(funded, currency) },
          {
            label: 'Closest',
            value: closestDeadline ? formatDate(closestDeadline) : '--',
          },
        ]}
      />

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Funded so far"
          value={formatCurrency(funded, currency)}
          note="What is already sitting inside the active goal pool."
          icon={ShieldCheck}
        />
        <MetricCard
          title="Still needed"
          value={formatCurrency(remaining, currency)}
          note="The remaining gap across every active target."
          icon={Target}
        />
        <MetricCard
          title="Closest deadline"
          value={closestDeadline ? formatDate(closestDeadline) : '--'}
          note="The nearest goal checkpoint on the calendar."
          icon={CalendarClock}
        />
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
        <Card>
          <CardHeader>
            <SectionTitle
              title="Active targets"
              description="Sorted by deadline so soonest targets stay closest to eye level."
              badge={`${goals.length} rows`}
            />
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.length ? (
              goals.map((goal) => {
                const progress =
                  goal.target > 0 ? (goal.current / goal.target) * 100 : 0

                return (
                  <div
                    key={goal.id}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-[var(--foreground)]">
                            {goal.name}
                          </p>
                          <Badge>{goal.type}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-[var(--foreground-soft)]">
                          Due {formatDate(goal.deadline)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 sm:justify-end">
                        <span className="font-mono text-sm text-[var(--foreground)]">
                          {formatCurrency(goal.current, currency)} /{' '}
                          {formatCurrency(goal.target, currency)}
                        </span>
                        <Button
                          className="h-8 w-8"
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            void actions.removeItem({
                              kind: 'goals',
                              id: goal.id,
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <Progress value={progress} />
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.12em] text-[var(--foreground-faint)]">
                        <span>{progress.toFixed(0)}% funded</span>
                        <span>
                          {formatCurrency(
                            Math.max(goal.target - goal.current, 0),
                            currency,
                          )}{' '}
                          left
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-10 text-center text-sm text-[var(--foreground-soft)]">
                Add a goal to start tracking its progress here.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add goal</CardTitle>
              <CardDescription>
                Name the target, set the number, and give it a date so it stays
                real.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GoalForm
                busy={actions.isWorking}
                onSubmit={(value) =>
                  actions.createItem({ kind: 'goals', value })
                }
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>One useful habit</CardTitle>
              <CardDescription>
                Keep goal names outcome-based. If you can read the row and
                instantly know the win, it is working.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-[var(--foreground-soft)]">
              <p>
                Use separate goals for emergency cash, debt payoff, and
                investing milestones.
              </p>
              <p>
                Let deadline order create urgency instead of adding more
                notifications.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}

export function SettingsPage() {
  return (
    <FinancePageState>
      {(data, actions) => <SettingsView actions={actions} data={data} />}
    </FinancePageState>
  )
}

function SettingsView({
  data,
  actions,
}: {
  data: DashboardData
  actions: FinanceActions
}) {
  const [selectedCurrency, setSelectedCurrency] = useState(
    data.settings.currency,
  )

  useEffect(() => {
    setSelectedCurrency(data.settings.currency)
  }, [data.settings.currency])

  const summary = getDashboardSummary(data)

  return (
    <main className="page-wrap px-4 pb-16 pt-10">
      <PageIntro
        eyebrow="Settings"
        title="Settings"
        description="Currency and data controls."
        meta={[
          { label: 'Storage', value: 'Browser only' },
          { label: 'Currency', value: data.settings.currency },
          { label: 'Updated', value: formatDate(data.settings.lastUpdated) },
        ]}
      />

      <section className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Currency</CardTitle>
            <CardDescription>
              Change how the desk displays money amounts. Existing values stay
              the same; only the formatting changes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <Field htmlFor="currency" label="Display currency">
                <Select
                  id="currency"
                  value={selectedCurrency}
                  onChange={(event) => setSelectedCurrency(event.target.value)}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="MXN">MXN</option>
                  <option value="COP">COP</option>
                  <option value="PEN">PEN</option>
                </Select>
              </Field>
              <Button
                disabled={
                  actions.isWorking ||
                  selectedCurrency === data.settings.currency
                }
                onClick={() =>
                  void actions.updateSettings({ currency: selectedCurrency })
                }
              >
                Save currency
              </Button>
            </div>
            <Separator />
            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard
                title="Net position"
                value={formatCurrency(summary.netPosition, selectedCurrency)}
                note="Same data, reformatted with the current display currency."
                icon={WalletCards}
              />
              <MetricCard
                title="Debt total"
                value={formatCurrency(summary.totalDebt, selectedCurrency)}
                note="Good for a quick check before changing the desk further."
                icon={Landmark}
              />
              <MetricCard
                title="Goal pool"
                value={formatCurrency(
                  summary.totalGoalCurrent,
                  selectedCurrency,
                )}
                note="How much already sits inside your active targets."
                icon={Target}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Desk controls</CardTitle>
              <CardDescription>
                Reset back to the seeded example or clear everything and start
                from zero.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                disabled={actions.isWorking}
                variant="secondary"
                onClick={() => void actions.resetDemoData()}
              >
                Reset demo data
              </Button>
              <Button
                className="w-full"
                disabled={actions.isWorking}
                variant="destructive"
                onClick={() => void actions.clearDashboard(selectedCurrency)}
              >
                Clear all data
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current snapshot</CardTitle>
              <CardDescription>
                A quick count of what is living on the desk right now.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-[var(--foreground-soft)] sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
                <p className="eyebrow text-[var(--foreground-faint)]">Debts</p>
                <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
                  {data.debts.length}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
                <p className="eyebrow text-[var(--foreground-faint)]">
                  Incomes
                </p>
                <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
                  {data.incomes.length}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
                <p className="eyebrow text-[var(--foreground-faint)]">
                  Investments
                </p>
                <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
                  {data.investments.length}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
                <p className="eyebrow text-[var(--foreground-faint)]">Goals</p>
                <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
                  {data.goals.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}

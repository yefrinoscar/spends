import { createFileRoute } from '@tanstack/react-router'
import { IncomesPage } from '@/components/finance-pages'

export const Route = createFileRoute('/incomes')({ component: IncomesPage })

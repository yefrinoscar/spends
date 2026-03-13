import { createFileRoute } from '@tanstack/react-router'
import { DebtsPage } from '@/components/finance-pages'

export const Route = createFileRoute('/debts')({ component: DebtsPage })

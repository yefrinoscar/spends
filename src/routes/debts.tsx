import { createFileRoute } from '@tanstack/react-router'
import { DebtsPage } from '@/features/debts/debts-page'

export const Route = createFileRoute('/debts')({ component: DebtsPage })

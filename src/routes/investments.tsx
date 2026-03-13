import { createFileRoute } from '@tanstack/react-router'
import { InvestmentsPage } from '@/components/finance-pages'

export const Route = createFileRoute('/investments')({ component: InvestmentsPage })

import { createFileRoute } from '@tanstack/react-router'
import { InvestmentsPage } from '@/features/investments/investments-page'

export const Route = createFileRoute('/investments')({
  component: InvestmentsPage,
})

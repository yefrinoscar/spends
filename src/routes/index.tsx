import { createFileRoute } from '@tanstack/react-router'
import { OverviewPage } from '@/components/finance-pages'

export const Route = createFileRoute('/')({ component: OverviewPage })

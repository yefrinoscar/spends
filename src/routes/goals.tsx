import { createFileRoute } from '@tanstack/react-router'
import { GoalsPage } from '@/components/finance-pages'

export const Route = createFileRoute('/goals')({ component: GoalsPage })

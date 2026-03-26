import { createFileRoute } from '@tanstack/react-router'
import { SettingsPage } from '@/features/configuration/settings-page'

export const Route = createFileRoute('/settings')({ component: SettingsPage })

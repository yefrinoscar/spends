import type { ReactNode } from 'react'
import { ConvexProvider, ConvexReactClient } from 'convex/react'

// Convex client - will use CONVEX_URL environment variable
// In development, set CONVEX_URL in .env.local
// In production, set it in your deployment platform
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL || '')

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode
}) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>
}

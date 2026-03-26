import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  useRouterState,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { useEffect } from 'react'
import Header from '../components/Header'
import {
  DASHBOARD_SETTINGS_CHANGE_EVENT,
  getStoredDashboardSettings,
} from '../lib/finance'

import TanStackQueryProvider from '../integrations/tanstack-query/root-provider'
import { ConvexClientProvider } from '../integrations/convex'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Trytracker',
      },
    ],
    links: [
      {
        rel: 'icon',
        type: 'image/svg+xml',
        sizes: 'any',
        href: '/favicon.svg?v=3',
      },
      {
        rel: 'shortcut icon',
        type: 'image/svg+xml',
        href: '/favicon.svg?v=3',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const showDevtools = import.meta.env.DEV
  const initialSettings =
    typeof window === 'undefined' ? null : getStoredDashboardSettings()

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-motion={initialSettings?.motion ?? 'full'}
      data-theme={initialSettings?.theme ?? 'dark'}
    >
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere]">
        <TanStackQueryProvider>
          <ConvexClientProvider>
            <DashboardAppearanceSync />
            <div className="mx-auto flex min-h-screen w-full max-w-[1320px] flex-col lg:px-4">
              <div className="relative flex min-h-0 flex-1 flex-col">
                <Header />
                <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:pl-[236px] lg:pt-10">
                  <div
                    key={pathname}
                    className="shell-route-enter flex min-h-0 flex-1 flex-col"
                  >
                    {children}
                  </div>
                </div>
              </div>
            </div>
            {showDevtools ? (
              <TanStackDevtools
                config={{
                  position: 'bottom-right',
                }}
                plugins={[
                  {
                    name: 'Tanstack Router',
                    render: <TanStackRouterDevtoolsPanel />,
                  },
                  TanStackQueryDevtools,
                ]}
              />
            ) : null}
          </ConvexClientProvider>
        </TanStackQueryProvider>
        <Scripts />
      </body>
    </html>
  )
}

function DashboardAppearanceSync() {
  useEffect(() => {
    const syncAppearance = () => {
      const settings = getStoredDashboardSettings()
      document.documentElement.dataset.theme = settings.theme
      document.documentElement.dataset.motion = settings.motion
    }

    syncAppearance()

    window.addEventListener(DASHBOARD_SETTINGS_CHANGE_EVENT, syncAppearance)
    window.addEventListener('storage', syncAppearance)

    return () => {
      window.removeEventListener(
        DASHBOARD_SETTINGS_CHANGE_EVENT,
        syncAppearance,
      )
      window.removeEventListener('storage', syncAppearance)
    }
  }, [])

  return null
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export type NavItem = {
  href: string
  label: string
  icon?: 'dashboard' | 'inbox'
  count?: number
  hot?: boolean
  exact?: boolean
}
export type NavGroup = { label?: string; items: NavItem[] }

const icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="9" rx="2" />
      <rect x="14" y="3" width="7" height="5" rx="2" />
      <rect x="14" y="12" width="7" height="9" rx="2" />
      <rect x="3" y="16" width="7" height="5" rx="2" />
    </svg>
  ),
  inbox: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z" />
    </svg>
  ),
}

/** Sidebar links; the current section is a solid orchid pill. */
export function NavLinks({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname() ?? ''
  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href || pathname === `${item.href}/` : pathname.startsWith(item.href)

  return (
    <nav aria-label="Admin sections" className="ms-navgroups">
      {groups.map((g, gi) => (
        <div className="ms-navgrp" key={g.label ?? gi}>
          {g.label && <span className="ms-navlbl">{g.label}</span>}
          {g.items.map((item) => {
            const on = isActive(item)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={on ? 'ms-nb on' : 'ms-nb'}
                aria-current={on ? 'page' : undefined}
                prefetch={false}
              >
                {item.icon && icons[item.icon]}
                {item.label}
                {typeof item.count === 'number' && (
                  <span className={item.hot ? 'cnt hot' : 'cnt'}>{item.count}</span>
                )}
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}

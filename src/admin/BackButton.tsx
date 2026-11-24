'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

const A = '/admin'
const STACK_KEY = 'ms-admin-history'
const BACK_KEY = 'ms-admin-going-back'

/** Admin pages visited in this tab, oldest first (sessionStorage, so it resets per tab). */
const readStack = (): string[] => {
  try {
    const v = JSON.parse(sessionStorage.getItem(STACK_KEY) ?? '[]')
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}
const writeStack = (stack: string[]) => {
  try {
    sessionStorage.setItem(STACK_KEY, JSON.stringify(stack.slice(-50)))
  } catch {
    /* private mode: Back falls back to the parent page */
  }
}

/** One level up: a document → its list, a list or global → the dashboard. */
export const parentOf = (path: string) => {
  const doc = path.match(/^\/admin\/collections\/[^/]+(?=\/)/)
  return doc ? doc[0] : A
}

/** Pages that are not part of the browsing history (login, logout, …). */
const skip = (path: string) => /^\/admin\/(login|logout|forgot|reset|create-first-user|verify)/.test(path)

/**
 * "← Back" in the admin top bar: returns to the previously opened admin page in this tab,
 * or one level up when there is none. Hidden on the dashboard when there is nowhere to go back to.
 */
export function BackButton() {
  const pathname = usePathname() ?? A
  const router = useRouter()

  // Record each admin page as it is opened. Going back pops instead of pushing.
  useEffect(() => {
    if (skip(pathname)) return
    let goingBack = false
    try {
      goingBack = sessionStorage.getItem(BACK_KEY) === '1'
      sessionStorage.removeItem(BACK_KEY)
    } catch {
      /* ignore */
    }
    const stack = readStack()
    if (goingBack) {
      while (stack.length && stack[stack.length - 1] !== pathname) stack.pop()
      if (!stack.length) stack.push(pathname)
    } else if (stack[stack.length - 1] !== pathname) {
      stack.push(pathname)
    }
    writeStack(stack)
  }, [pathname])

  if (skip(pathname) || pathname === A || pathname === `${A}/`) return null

  const goBack = () => {
    const stack = readStack()
    if (stack[stack.length - 1] === pathname) stack.pop()
    const previous = stack[stack.length - 1]
    try {
      sessionStorage.setItem(BACK_KEY, '1')
    } catch {
      /* ignore */
    }
    if (!previous) writeStack([])
    router.push(previous ?? parentOf(pathname))
  }

  return (
    <button className="ms-pill ms-back" type="button" onClick={goBack} aria-label="Go back to the previous page">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </svg>
      Back
    </button>
  )
}

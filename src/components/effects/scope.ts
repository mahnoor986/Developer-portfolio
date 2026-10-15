/**
 * Tracks everything an effect sets up (listeners, frames, timers, observers) so it can
 * all be torn down when the React component unmounts.
 */
export function createScope() {
  let alive = true
  const cleanups: (() => void)[] = []
  // Pending frames/timeouts only (removed as they fire), so per-frame loops don't grow a list.
  const frames = new Set<number>()
  const timers = new Set<ReturnType<typeof setTimeout>>()

  return {
    get alive() {
      return alive
    },
    on<T extends EventTarget>(
      target: T,
      type: string,
      fn: (e: any) => void, // eslint-disable-line @typescript-eslint/no-explicit-any
      opts?: AddEventListenerOptions | boolean,
    ) {
      target.addEventListener(type, fn, opts)
      cleanups.push(() => target.removeEventListener(type, fn, opts))
    },
    /** requestAnimationFrame that never fires after dispose. */
    raf(fn: (t: number) => void) {
      const id = requestAnimationFrame((t) => {
        frames.delete(id)
        if (alive) fn(t)
      })
      frames.add(id)
      return id
    },
    timeout(fn: () => void, ms: number) {
      const id = setTimeout(() => {
        timers.delete(id)
        if (alive) fn()
      }, ms)
      timers.add(id)
      return id
    },
    interval(fn: () => void, ms: number) {
      const id = setInterval(fn, ms)
      cleanups.push(() => clearInterval(id))
    },
    observe(el: Element, cb: IntersectionObserverCallback, opts?: IntersectionObserverInit) {
      if (!('IntersectionObserver' in window)) return
      const io = new IntersectionObserver(cb, opts)
      io.observe(el)
      cleanups.push(() => io.disconnect())
    },
    add(fn: () => void) {
      cleanups.push(fn)
    },
    dispose() {
      alive = false
      frames.forEach((id) => cancelAnimationFrame(id))
      timers.forEach((id) => clearTimeout(id))
      frames.clear()
      timers.clear()
      for (const fn of cleanups.reverse()) {
        try {
          fn()
        } catch {
          /* keep tearing down */
        }
      }
      cleanups.length = 0
    },
  }
}

export type Scope = ReturnType<typeof createScope>

import { toast } from '@payloadcms/ui'

type UndoableDelete = {
  label: string
  remove: () => void
  undo: () => void
  commit: () => Promise<void>
}

/** Keep the row recoverable for the toast duration before making its delete permanent. */
export function showUndoableDelete({ label, remove, undo, commit }: UndoableDelete) {
  let cancelled = false
  let finalized = false
  const timer = setTimeout(() => {
    if (cancelled) return
    finalized = true
    void commit().catch((error: unknown) => {
      undo()
      toast.error(error instanceof Error ? error.message : `Could not delete ${label}.`)
    })
  }, 5000)

  remove()
  const toastID = toast.success(`${label} deleted.`, {
    duration: 5000,
    action: {
      label: 'Undo',
      onClick: () => {
        if (cancelled || finalized) return
        cancelled = true
        clearTimeout(timer)
        toast.dismiss(toastID)
        undo()
      },
    },
  })
}

export { toast }

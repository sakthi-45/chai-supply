import { useState, useRef, useCallback } from 'react'

export function useToast() {
  const [toast, setToast] = useState('')
  const timerRef = useRef(null)

  const notify = useCallback((message) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    setToast(message)
    timerRef.current = setTimeout(() => {
      setToast('')
      timerRef.current = null
    }, 2600)
  }, [])

  return { toast, notify }
}

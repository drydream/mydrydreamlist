'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { IDLE_TIMEOUT_MS } from '@/lib/session'

// The 'session' key stores the timestamp of last activity.
// Missing or older than IDLE_TIMEOUT_MS → not logged in.
const LS_KEY = 'session'

export function SessionGuard() {
  const router       = useRouter()
  const lastWriteRef = useRef(0)

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY)

    // No session or idle-expired → go to login
    if (!stored || Date.now() - Number(stored) > IDLE_TIMEOUT_MS) {
      localStorage.removeItem(LS_KEY)
      router.push('/')
      return
    }

    // Stamp activity on mount
    const now = Date.now()
    localStorage.setItem(LS_KEY, String(now))
    lastWriteRef.current = now

    // Update timestamp on any user interaction (throttled to once/min)
    function touch() {
      const t = Date.now()
      if (t - lastWriteRef.current > 60_000) {
        localStorage.setItem(LS_KEY, String(t))
        lastWriteRef.current = t
      }
    }

    window.addEventListener('click',      touch, { passive: true })
    window.addEventListener('keydown',    touch, { passive: true })
    window.addEventListener('touchstart', touch, { passive: true })

    // Check every minute — catches idle while the app stays open
    const checkInterval = setInterval(() => {
      const s = localStorage.getItem(LS_KEY)
      if (!s || Date.now() - Number(s) > IDLE_TIMEOUT_MS) {
        localStorage.removeItem(LS_KEY)
        router.push('/')
      }
    }, 60_000)

    return () => {
      clearInterval(checkInterval)
      window.removeEventListener('click',      touch)
      window.removeEventListener('keydown',    touch)
      window.removeEventListener('touchstart', touch)
    }
  }, [router])

  return null
}

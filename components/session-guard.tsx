'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { logout } from '@/lib/actions/auth'
import { IDLE_TIMEOUT_MS } from '@/lib/session'

const LS_KEY = 'lastActive'

export function SessionGuard() {
  const router = useRouter()
  const lastWriteRef = useRef(0)

  useEffect(() => {
    // Check if already idle-expired before doing anything
    const lastActive = localStorage.getItem(LS_KEY)
    if (lastActive && Date.now() - Number(lastActive) > IDLE_TIMEOUT_MS) {
      localStorage.removeItem(LS_KEY)
      logout().then(() => router.push('/'))
      return
    }

    // Stamp activity now
    const now = Date.now()
    localStorage.setItem(LS_KEY, String(now))
    lastWriteRef.current = now

    // Update lastActive on any user interaction (throttled to once/min)
    function touch() {
      const t = Date.now()
      if (t - lastWriteRef.current > 60_000) {
        localStorage.setItem(LS_KEY, String(t))
        lastWriteRef.current = t
      }
    }

    window.addEventListener('click', touch, { passive: true })
    window.addEventListener('keydown', touch, { passive: true })
    window.addEventListener('touchstart', touch, { passive: true })

    // Periodic idle check — catches the case where the app is open but inactive
    const checkInterval = setInterval(() => {
      const last = localStorage.getItem(LS_KEY)
      if (last && Date.now() - Number(last) > IDLE_TIMEOUT_MS) {
        localStorage.removeItem(LS_KEY)
        logout().then(() => router.push('/'))
      }
    }, 60_000)

    return () => {
      clearInterval(checkInterval)
      window.removeEventListener('click', touch)
      window.removeEventListener('keydown', touch)
      window.removeEventListener('touchstart', touch)
    }
  }, [router])

  return null
}

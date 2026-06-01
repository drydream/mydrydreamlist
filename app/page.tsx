'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { verifyPassword } from '@/lib/actions/auth'

export default function LandingPage() {
  const [password, setPassword]       = useState('')
  const [error,    setError]          = useState('')
  const [isPending, startTransition]  = useTransition()
  const router                        = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      const result = await verifyPassword(password)
      if (result?.error) {
        setError(result.error)
      } else {
        localStorage.setItem('session', String(Date.now()))
        router.push('/home')
      }
    })
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-zinc-100 text-center">myDryDrEaMlist</h1>
        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-3"
        >
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
            className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-md px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-md py-2 text-sm font-medium transition-colors"
          >
            {isPending ? 'Entering…' : 'Enter'}
          </button>
        </form>
      </div>
    </main>
  )
}

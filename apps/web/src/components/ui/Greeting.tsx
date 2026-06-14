'use client'
import { useMemo } from 'react'

export function Greeting({ username, streak }: { username: string; streak: number }) {
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    if (hour < 21) return 'Good evening'
    return 'Good night'
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-black text-white">
        {greeting}, <span className="text-ember">{username}</span> 👋
      </h1>
      <p className="text-mist mt-1">
        {streak > 0
          ? `${streak}-day streak going. Keep the momentum.`
          : 'Your next story starts today.'}
      </p>
    </div>
  )
}

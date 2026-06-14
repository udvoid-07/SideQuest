'use client'
import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteAccount } from '@/app/actions'

export function DeleteAccountButton() {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Permanently delete your account and all quest data? This cannot be undone.')) return
    setLoading(true)
    await deleteAccount()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all text-left disabled:opacity-50"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
      Delete Account &amp; All Data
    </button>
  )
}

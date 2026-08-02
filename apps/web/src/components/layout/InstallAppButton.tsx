'use client'
import { Download } from 'lucide-react'
import { useInstallPrompt } from '@/lib/use-install-prompt'

export function InstallAppButton() {
  const { canInstall, promptInstall } = useInstallPrompt()
  if (!canInstall) return null

  return (
    <button
      onClick={promptInstall}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ash hover:text-white hover:bg-white/5 transition-all w-full"
    >
      <Download size={18} />
      Install App
    </button>
  )
}

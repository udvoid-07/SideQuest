import type { Metadata, Viewport } from 'next'
import './globals.css'
import { CookieConsent } from '@/components/ui/CookieConsent'

export const metadata: Metadata = {
  title: {
    default: 'SideQuest — Real Life, Levelled Up',
    template: '%s | SideQuest',
  },
  description:
    'Stop saving adventures for someday. SideQuest gives you daily real-world challenges tailored to your personality, location, and vibe — and rewards you for completing them.',
  keywords: ['sidequest', 'challenges', 'gamification', 'adventures', 'experiences'],
  openGraph: {
    title: 'SideQuest — Real Life, Levelled Up',
    description: 'Daily real-world quests. Real XP. Real stories.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#321847',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        {children}
        <CookieConsent />
      </body>
    </html>
  )
}

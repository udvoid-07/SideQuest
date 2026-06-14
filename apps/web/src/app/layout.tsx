import type { Metadata, Viewport } from 'next'
import './globals.css'
import { CookieConsent } from '@/components/ui/CookieConsent'
import { SplashScreen } from '@/components/SplashScreen'

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
  themeColor: '#1C1109',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Preload Orbitron so splash screen has no font-swap lag */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=block"
        />
      </head>
      <body>
        <SplashScreen />
        {children}
        <CookieConsent />
      </body>
    </html>
  )
}

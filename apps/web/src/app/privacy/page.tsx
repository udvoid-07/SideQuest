import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'

export const metadata = { title: 'Privacy Policy' }

export default function PrivacyPolicy() {
  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-16">
        <h1 className="text-4xl font-black text-white mb-2">Privacy Policy</h1>
        <p className="text-ash text-sm mb-10">Effective date: June 2025 · Governed by Indian IT Act 2000 & DPDP Act 2023</p>

        {[
          {
            title: '1. What We Collect',
            body: `When you create a SideQuest account, we collect: your name, email address, age, gender, city, personality type, fitness level, and budget preference. When you use the app, we collect: quests you've started, completed, or declined, your XP and streak history, and device push notification tokens (mobile only).`,
          },
          {
            title: '2. Why We Collect It',
            body: `Your profile data is used exclusively to personalise quest recommendations. We do not sell, share, or rent your personal information to any third party. Usage data (completed quests, XP) exists only to power the gamification layer of the app.`,
          },
          {
            title: '3. Data Storage',
            body: `All data is stored on Supabase (hosted on AWS infrastructure in Mumbai region). Authentication is handled by Supabase Auth. Passwords are hashed using bcrypt and never stored in plaintext. We do not store payment information.`,
          },
          {
            title: '4. Cookies & Local Storage',
            body: `SideQuest uses session cookies (HttpOnly, Secure) for authentication. We also use localStorage to store your cookie consent preference. We do not use advertising or tracking cookies.`,
          },
          {
            title: '5. Location Data',
            body: `The app does not continuously track your location. When you view a quest with nearby location suggestions, your city (stored in your profile) is used to search for relevant places via Google Places API. No GPS coordinates are stored on our servers.`,
          },
          {
            title: '6. Your Rights',
            body: `Under the Indian DPDP Act 2023 and applicable laws, you have the right to: access your data, correct inaccurate data, delete your account and all associated data, and withdraw consent. To exercise any of these rights, use the account deletion option in your Profile page or email us.`,
          },
          {
            title: '7. Account Deletion',
            body: `You can permanently delete your account from the Profile page. Deletion removes all personal data, quest history, XP, streaks, and preferences from our systems within 30 days. This action is irreversible.`,
          },
          {
            title: '8. Children',
            body: `SideQuest requires users to be at least 13 years old. We do not knowingly collect data from children under 13. If you believe a child under 13 has created an account, contact us immediately.`,
          },
          {
            title: '9. Changes to This Policy',
            body: `We may update this policy. Significant changes will be communicated via email. Continued use of the app constitutes acceptance of the updated policy.`,
          },
          {
            title: '10. Contact',
            body: `For privacy concerns, data requests, or account deletion: Email — privacy@sidequest.app`,
          },
        ].map(s => (
          <section key={s.title} className="mb-8">
            <h2 className="text-lg font-bold text-white mb-2">{s.title}</h2>
            <p className="text-mist text-sm leading-relaxed">{s.body}</p>
          </section>
        ))}

        <div className="pt-8 border-t border-white/10 text-center">
          <Link href="/" className="text-ember hover:underline text-sm">← Back to SideQuest</Link>
        </div>
      </div>
    </>
  )
}

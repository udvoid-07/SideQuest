import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'

export const metadata = { title: 'Terms of Service' }

export default function TermsOfService() {
  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-16">
        <h1 className="text-4xl font-black text-white mb-2">Terms of Service</h1>
        <p className="text-ash text-sm mb-10">Effective date: June 2025 · Governed by the laws of India</p>

        {[
          {
            title: '1. Acceptance',
            body: `By creating an account, you agree to these Terms. If you do not agree, do not use SideQuest. Users must be at least 13 years old.`,
          },
          {
            title: '2. What SideQuest Is',
            body: `SideQuest is a personal experience suggestion platform. All quests are voluntary suggestions for entertainment and personal growth only. We are not a fitness instructor, therapist, travel agent, or event organiser. Nothing on this platform constitutes professional advice of any kind.`,
          },
          {
            title: '3. Voluntary Participation',
            body: `All quest activities are entirely optional. You choose whether to attempt any quest. SideQuest is not responsible for any actions you take in connection with quests, including physical activities, financial expenditures, social interactions, or travel.`,
          },
          {
            title: '4. User Responsibilities',
            body: `You are solely responsible for your safety during any quest activity. You agree to exercise your own judgement, comply with all applicable laws, obtain appropriate permissions and clearances, and not engage in any activity that is illegal, dangerous beyond normal risk, or harmful to others.`,
          },
          {
            title: '5. Limitation of Liability',
            body: `To the maximum extent permitted by applicable Indian law, SideQuest and its founders shall not be liable for any injury, loss, damage, expense, or claim arising from participation in any suggested quest activity. This includes, but is not limited to, personal injury, property damage, or financial loss.`,
          },
          {
            title: '6. Prohibited Conduct',
            body: `You may not: attempt to manipulate the XP or level system through exploits, create accounts for the purpose of abuse or spam, use automated tools to interact with the platform, or impersonate other users.`,
          },
          {
            title: '7. Intellectual Property',
            body: `All quest content, design, and code is owned by SideQuest. You may not reproduce, distribute, or create derivative works without written permission.`,
          },
          {
            title: '8. Termination',
            body: `We may suspend or terminate accounts that violate these Terms. You may delete your account at any time from your Profile page.`,
          },
          {
            title: '9. Governing Law',
            body: `These Terms are governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Tamil Nadu, India.`,
          },
          {
            title: '10. Contact',
            body: `For questions about these Terms: tools@stratschool.org`,
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

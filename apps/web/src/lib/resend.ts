interface SendEmailArgs {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailArgs): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const from   = process.env.RESEND_FROM_EMAIL
  if (!apiKey || !from) throw new Error('Resend is not configured')

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Resend send failed (${res.status}): ${body}`)
  }
}

export function signupOtpEmail(otp: string): { subject: string; html: string } {
  return {
    subject: '🧭 Your first quest: verify your email',
    html: `
<div style="background:#0A0705;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:440px;margin:0 auto;">

    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:52px;height:52px;line-height:52px;border-radius:16px;background:linear-gradient(135deg,#E8663D 0%,#C84D28 100%);font-size:24px;">🧭</div>
      <div style="color:#ffffff;font-size:18px;font-weight:900;letter-spacing:-0.5px;margin-top:10px;">
        Side<span style="color:#E8663D;">Quest</span>
      </div>
    </div>

    <div style="background:linear-gradient(160deg,#1C1109 0%,#2A1A0E 100%);border:1px solid rgba(255,210,170,0.12);border-radius:20px;padding:32px 28px;text-align:center;">

      <div style="display:inline-block;background:rgba(52,211,153,0.12);border:1px solid rgba(52,211,153,0.3);border-radius:8px;padding:4px 12px;font-size:11px;font-weight:700;color:#34D399;letter-spacing:0.5px;margin-bottom:16px;">
        NEW QUEST · ACCOUNT VERIFICATION
      </div>

      <h1 style="color:#ffffff;font-size:21px;font-weight:800;margin:0 0 8px;line-height:1.3;">
        One code stands between<br/>you and your first quest
      </h1>
      <p style="color:#D4B09A;font-size:14px;margin:0 0 26px;line-height:1.5;">
        Enter this code in SideQuest to verify it's really you, Adventurer.
      </p>

      <div style="background:rgba(232,102,61,0.08);border:1.5px solid rgba(232,102,61,0.35);border-radius:14px;padding:22px;margin-bottom:22px;">
        <div style="color:#9C7A52;font-size:10px;text-transform:uppercase;letter-spacing:2px;font-weight:700;margin-bottom:10px;">
          Verification Code
        </div>
        <div style="color:#F5A623;font-size:38px;font-weight:900;letter-spacing:10px;font-family:'Courier New',monospace;">
          ${otp}
        </div>
      </div>

      <p style="color:#9C7A52;font-size:12px;margin:0 0 4px;line-height:1.6;">
        ⏱️ Expires in 5 minutes — quests don't wait forever.
      </p>
      <p style="color:#9C7A52;font-size:12px;margin:0;line-height:1.6;">
        Didn't try to sign up? Safely ignore this — no account will be created.
      </p>
    </div>

    <p style="text-align:center;color:#9C7A52;font-size:11px;margin-top:20px;opacity:0.8;">
      SideQuest · Real Life, Levelled Up
    </p>
  </div>
</div>
    `.trim(),
  }
}

// Vercel Cron sends "Authorization: Bearer $CRON_SECRET" automatically when
// CRON_SECRET is set as a project env var — this just verifies that header.
export function isAuthorizedCronRequest(req: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return req.headers.get('authorization') === `Bearer ${secret}`
}

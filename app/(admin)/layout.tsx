import { requireAdmin } from '@/lib/auth/session'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAdmin().catch(() => {
    redirect('/auth/login?callbackUrl=/admin')
  })

  return <>{children}</>
}

import { requireVendor } from '@/lib/auth/session'
import { redirect } from 'next/navigation'

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireVendor().catch(() => {
    redirect('/auth/login?callbackUrl=/vendor')
  })

  return <>{children}</>
}

import { requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { VendorInviteForm } from '@/components/admin/vendor-invite-form'
import { VendorInviteList } from '@/components/admin/vendor-invite-list'
import { VendorList } from '@/components/admin/vendor-list'

export default async function AdminVendorsPage() {
  await requireAdmin()

  // Get vendor counts
  const vendorCounts = await db.vendor.groupBy({
    by: ['status'],
    _count: true,
  })

  const stats = {
    pending: vendorCounts.find((v) => v.status === 'PENDING_REVIEW')?._count || 0,
    approved: vendorCounts.find((v) => v.status === 'APPROVED')?._count || 0,
    suspended: vendorCounts.find((v) => v.status === 'SUSPENDED')?._count || 0,
    rejected: vendorCounts.find((v) => v.status === 'REJECTED')?._count || 0,
  }

  // Get pending invites count
  const pendingInvites = await db.vendorInvite.count({
    where: {
      status: 'PENDING',
      expiresAt: {
        gte: new Date(),
      },
    },
  })

  return (
    <div className="min-h-screen bg-muted/50">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Vendor Management</h1>
              <p className="text-sm text-muted-foreground">Invite and manage vendors</p>
            </div>
            <Button asChild variant="outline">
              <a href="/admin">← Back to Dashboard</a>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Review</CardDescription>
              <CardTitle className="text-3xl">{stats.pending}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Approved</CardDescription>
              <CardTitle className="text-3xl">{stats.approved}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Suspended</CardDescription>
              <CardTitle className="text-3xl">{stats.suspended}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Rejected</CardDescription>
              <CardTitle className="text-3xl">{stats.rejected}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Invites</CardDescription>
              <CardTitle className="text-3xl">{pendingInvites}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Invite Form */}
        <Card>
          <CardHeader>
            <CardTitle>Invite New Vendor</CardTitle>
            <CardDescription>
              Send an invitation email with a unique signup link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VendorInviteForm />
          </CardContent>
        </Card>

        {/* Invites List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Invitations</CardTitle>
            <CardDescription>
              Manage pending, used, and expired invitations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VendorInviteList />
          </CardContent>
        </Card>

        {/* Vendors List */}
        <Card>
          <CardHeader>
            <CardTitle>Vendors</CardTitle>
            <CardDescription>
              Approve, suspend, or manage vendor accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VendorList />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

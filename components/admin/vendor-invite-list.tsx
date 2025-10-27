'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

type Invite = {
  id: string
  email: string
  status: 'PENDING' | 'USED' | 'EXPIRED' | 'REVOKED'
  expiresAt: string
  usedAt: string | null
  revokedAt: string | null
  createdAt: string
}

export function VendorInviteList() {
  const [invites, setInvites] = useState<Invite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'USED' | 'EXPIRED' | 'REVOKED'>('all')

  const fetchInvites = async () => {
    try {
      const url =
        filter === 'all'
          ? '/api/admin/vendors/invite'
          : `/api/admin/vendors/invite?status=${filter}`
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setInvites(data.data.invites)
      }
    } catch (error) {
      console.error('Failed to fetch invites:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInvites()
  }, [filter])

  const handleResend = async (id: string) => {
    if (!confirm('Resend invitation? This will create a new invite link.')) return

    try {
      const response = await fetch(`/api/admin/vendors/invite/${id}`, {
        method: 'POST',
      })

      if (response.ok) {
        alert('Invitation resent successfully!')
        fetchInvites()
      } else {
        alert('Failed to resend invitation')
      }
    } catch (error) {
      alert('Failed to resend invitation')
    }
  }

  const handleRevoke = async (id: string) => {
    if (!confirm('Revoke this invitation? This cannot be undone.')) return

    try {
      const response = await fetch(`/api/admin/vendors/invite/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('Invitation revoked successfully!')
        fetchInvites()
      } else {
        alert('Failed to revoke invitation')
      }
    } catch (error) {
      alert('Failed to revoke invitation')
    }
  }

  const getStatusBadge = (status: Invite['status']) => {
    const styles = {
      PENDING: 'bg-blue-100 text-blue-800',
      USED: 'bg-green-100 text-green-800',
      EXPIRED: 'bg-gray-100 text-gray-800',
      REVOKED: 'bg-red-100 text-red-800',
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {status}
      </span>
    )
  }

  if (isLoading) {
    return <div className="text-center py-4">Loading invitations...</div>
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'PENDING', 'USED', 'EXPIRED', 'REVOKED'] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status === 'all' ? 'All' : status}
          </Button>
        ))}
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 text-sm font-medium">Email</th>
              <th className="text-left p-3 text-sm font-medium">Status</th>
              <th className="text-left p-3 text-sm font-medium">Expires</th>
              <th className="text-left p-3 text-sm font-medium">Created</th>
              <th className="text-right p-3 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {invites.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-8 text-muted-foreground">
                  No invitations found
                </td>
              </tr>
            ) : (
              invites.map((invite) => (
                <tr key={invite.id} className="hover:bg-muted/50">
                  <td className="p-3 text-sm">{invite.email}</td>
                  <td className="p-3 text-sm">{getStatusBadge(invite.status)}</td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {formatDate(invite.expiresAt)}
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {formatDate(invite.createdAt)}
                  </td>
                  <td className="p-3 text-sm text-right space-x-2">
                    {(invite.status === 'PENDING' || invite.status === 'EXPIRED') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResend(invite.id)}
                      >
                        Resend
                      </Button>
                    )}
                    {invite.status === 'PENDING' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRevoke(invite.id)}
                      >
                        Revoke
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

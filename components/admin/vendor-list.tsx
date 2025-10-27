'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

type Vendor = {
  id: string
  businessName: string
  contactEmail: string
  status: 'PENDING_REVIEW' | 'APPROVED' | 'SUSPENDED' | 'REJECTED'
  createdAt: string
  approvedAt: string | null
}

export function VendorList() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchVendors()
  }, [])

  const fetchVendors = async () => {
    try {
      const response = await fetch('/api/admin/vendors')
      const data = await response.json()

      if (data.success) {
        setVendors(data.data.vendors || [])
      }
    } catch (error) {
      console.error('Failed to fetch vendors:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: Vendor['status']) => {
    const styles = {
      PENDING_REVIEW: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      SUSPENDED: 'bg-red-100 text-red-800',
      REJECTED: 'bg-gray-100 text-gray-800',
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {status.replace('_', ' ')}
      </span>
    )
  }

  if (isLoading) {
    return <div className="text-center py-4">Loading vendors...</div>
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="text-left p-3 text-sm font-medium">Business Name</th>
            <th className="text-left p-3 text-sm font-medium">Email</th>
            <th className="text-left p-3 text-sm font-medium">Status</th>
            <th className="text-left p-3 text-sm font-medium">Joined</th>
            <th className="text-right p-3 text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {vendors.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center p-8 text-muted-foreground">
                No vendors yet. Send some invitations to get started!
              </td>
            </tr>
          ) : (
            vendors.map((vendor) => (
              <tr key={vendor.id} className="hover:bg-muted/50">
                <td className="p-3 text-sm font-medium">{vendor.businessName}</td>
                <td className="p-3 text-sm text-muted-foreground">{vendor.contactEmail}</td>
                <td className="p-3 text-sm">{getStatusBadge(vendor.status)}</td>
                <td className="p-3 text-sm text-muted-foreground">
                  {formatDate(vendor.createdAt)}
                </td>
                <td className="p-3 text-sm text-right">
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
